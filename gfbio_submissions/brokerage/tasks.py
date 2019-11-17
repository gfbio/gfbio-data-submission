# -*- coding: utf-8 -*-
import logging

import celery
from celery import Task
from django.core.mail import mail_admins
from django.db import transaction
from django.db.utils import IntegrityError
from django.utils.encoding import smart_text
from requests import ConnectionError, Response

from gfbio_submissions.brokerage.configuration.settings import ENA, ENA_PANGAEA, \
    PANGAEA_ISSUE_VIEW_URL, SUBMISSION_COMMENT_TEMPLATE, JIRA_FALLBACK_USERNAME, \
    JIRA_FALLBACK_EMAIL
from gfbio_submissions.brokerage.exceptions import TransferServerError, \
    TransferClientError
from gfbio_submissions.brokerage.utils.csv import \
    check_for_molecular_content
from gfbio_submissions.brokerage.utils.gfbio import get_gfbio_helpdesk_username
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import jira_error_auto_retry, \
    get_submission_and_site_configuration, raise_transfer_server_exceptions, \
    retry_no_ticket_available_exception
from gfbio_submissions.submission_ui.configuration.settings import HOSTING_SITE
from gfbio_submissions.users.models import User
from .configuration.settings import BASE_HOST_NAME, \
    SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from .models import BrokerObject, \
    AuditableTextData, RequestLog, AdditionalReference, TaskProgressReport, \
    Submission, SiteConfiguration
from .utils.ena import prepare_ena_data, \
    store_ena_data_as_auditable_text_data, send_submission_to_ena, \
    parse_ena_submission_response
from .utils.pangaea import pull_pangaea_dois
from .utils.submission_transfer import SubmissionTransferHandler

logger = logging.getLogger(__name__)


# abstract base class for tasks ------------------------------------------------

class SubmissionTask(Task):
    abstract = True

    # also existing
    #   - on_bound

    # TODO: consider a report for every def here OR refactor taskreport to
    #  keep track in one report. Keep in mind to resume chains from a certain
    #  point, add a DB clean up task to remove from database

    # logger.info('SubmissionTask | instanced ')

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        logger.info('tasks.py | SubmissionTask | on_retry | task_id={0} | '
                    'name={1}'.format(task_id, self.name))
        # TODO: capture this idea of reporting to sentry
        # sentrycli.captureException(exc)
        TaskProgressReport.objects.update_report_on_exception(
            'RETRY', exc, task_id, args, kwargs, einfo)
        super(SubmissionTask, self).on_retry(exc, task_id, args, kwargs, einfo)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.info('tasks.py | SubmissionTask | on_failure | task_id={0} | '
                    'name={1}| args={2} | kwargs={3} | einfo={4} | '
                    ''.format(task_id, self.name, args, kwargs, einfo))
        TaskProgressReport.objects.update_report_on_exception(
            'FAILURE', exc, task_id, args, kwargs, einfo)
        super(SubmissionTask, self).on_failure(exc, task_id, args, kwargs,
                                               einfo)

    def on_success(self, retval, task_id, args, kwargs):
        logger.info('tasks.py | SubmissionTask | on_success | task_id={0} | '
                    'name={1} | retval={2}'.format(task_id, self.name, retval))
        TaskProgressReport.objects.update_report_on_success(
            retval, task_id, args, kwargs)
        super(SubmissionTask, self).on_success(retval, task_id, args, kwargs)

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        logger.info('tasks.py | SubmissionTask | after_return | task_id={0} | '
                    'name={1} | args={2} | kwargs={3} | einfo={4} | '
                    'retval={5}'.format(task_id, self.name, args, kwargs, einfo,
                                        retval))
        TaskProgressReport.objects.update_report_after_return(status, task_id)
        super(SubmissionTask, self).after_return(
            status, retval, task_id, args, kwargs, einfo)


# common tasks -----------------------------------------------------------------

# TODO: re-consider if needed when workflow is clear
@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.check_for_molecular_content_in_submission_task',
)
def check_for_molecular_content_in_submission_task(self, submission_id=None):
    logger.info(
        msg='check_for_molecular_content_in_submission_task. get submission'
            ' with pk={}.'.format(submission_id))
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    logger.info(
        msg='check_for_molecular_content_in_submission_task. '
            'process submission={}.'.format(submission.broker_submission_id))

    molecular_data_available, errors = check_for_molecular_content(submission)
    logger.info(
        msg='check_for_molecular_content_in_submission_task. '
            'valid molecular data available={0}'
            ''.format(molecular_data_available)
    )
    return {
        'molecular_data_available': molecular_data_available,
        'errors': errors,
    }


@celery.task(base=SubmissionTask, bind=True,
             name='tasks.trigger_submission_transfer', )
def trigger_submission_transfer(self, previous_task_result=None,
                                submission_id=None):
    logger.info(
        msg='trigger_submission_transfer. get submission with pk={}.'.format(
            submission_id)
    )
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    transfer_handler = SubmissionTransferHandler(
        submission_id=submission.pk,
        target_archive=submission.target
    )
    transfer_handler.initiate_submission_process(
        release=submission.release,
    )


@celery.task(base=SubmissionTask, bind=True,
             name='tasks.trigger_submission_transfer_for_updates', )
def trigger_submission_transfer_for_updates(self, previous_task_result=None,
                                            broker_submission_id=None):
    logger.info(
        msg='trigger_submission_transfer_for_updates. get submission_id with broker_submission_id={}.'.format(
            broker_submission_id)
    )
    submission_id = Submission.objects.get_open_submission_id_for_bsi(
        broker_submission_id=broker_submission_id)
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    transfer_handler = SubmissionTransferHandler(
        submission_id=submission.pk,
        target_archive=submission.target
    )
    transfer_handler.initiate_submission_process(
        release=submission.release,
        update=True,
    )


# TODO: on_hold check is in this form obsolete, if target is ENA etc
#   submission to ena is triggered without prior creation of BOs and XML
@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.check_on_hold_status_task',
)
def check_on_hold_status_task(self, previous_task_result=None,
                              submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if site_configuration.release_submissions:
        logger.info(
            msg='check_on_hold_status_task. submission pk={0}. '
                'site_config pk={1}. site_configuration.release_submissions'
                '={2}. execute submission.'
                ''.format(submission_id, site_configuration.pk,
                          site_configuration.release_submissions))
        transfer_handler = SubmissionTransferHandler(
            submission_id=submission.pk,
            target_archive=submission.target
        )
        transfer_handler.execute()
    else:
        # email admins, then do smth. to trigger chain once ok
        logger.info(
            msg='check_on_hold_status_task. submission pk={0}. '
                'site_config pk={1}. site_configuration.release_submissions'
                '={2}. send mail to admins.'
                ''.format(submission_id, site_configuration.pk,
                          site_configuration.release_submissions))
        # TODO: refactor to method in task_utils, and use templates/constants
        mail_admins(
            subject='Submission needs approval. Site "{0}". Submission {1}'
                    ''.format(site_configuration.title,
                              submission.broker_submission_id),
            message='Submission {0}.\nFollow this Link: {1}'.format(
                submission.broker_submission_id,
                '{0}/api/submissions/{1}/'.format(
                    BASE_HOST_NAME,
                    submission.broker_submission_id))
        )


# NEW PREP WORKFLOW BO CREATION AND SOID CREATION ------------------------------

@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.create_broker_objects_from_submission_data_task',
)
def create_broker_objects_from_submission_data_task(
        self,
        previous_task_result=None,
        submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    try:
        with transaction.atomic():
            submission.brokerobject_set.all().delete()
            BrokerObject.objects.add_submission_data(submission)
    except IntegrityError as e:
        logger.error(
            'create_broker_objects_from_submission_data_task IntegrityError in "create_broker_objects_from'
            '_submission_data_task": {}'.format(e))


# ENA submission transfer tasks ------------------------------------------------

@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.delete_related_auditable_textdata_task',
)
def delete_related_auditable_textdata_task(self, prev_task_result=None,
                                           submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    with transaction.atomic():
        submission.auditabletextdata_set.all().delete()


@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.prepare_ena_submission_data_task',
)
def prepare_ena_submission_data_task(self, prev_task_result=None,
                                     submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if len(submission.brokerobject_set.all()) > 0:
        with transaction.atomic():
            submission.auditabletextdata_set.all().delete()
        ena_submission_data = prepare_ena_data(submission=submission)
        store_ena_data_as_auditable_text_data(submission=submission,
                                              data=ena_submission_data)
        # TODO: this will become obsolete once, data is taken from AuditableTextData ....
        return ena_submission_data
    else:
        logger.info(
            msg='prepare_ena_submission_data_task. no brokerobjects. '
                'return={0} '
                'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                           submission_id)
        )
        return TaskProgressReport.CANCELLED


# TODO: result of this task is input for next task
@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.transfer_data_to_ena_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def transfer_data_to_ena_task(self, prepare_result=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    ena_submission_data = AuditableTextData.objects.assemble_ena_submission_data(
        submission=submission)
    if ena_submission_data == {}:
        return TaskProgressReport.CANCELLED
    try:
        response, request_id = send_submission_to_ena(submission,
                                                      site_configuration.ena_server,
                                                      ena_submission_data,
                                                      )
        res = raise_transfer_server_exceptions(
            response=response,
            task=self,
            broker_submission_id=submission.broker_submission_id,
            max_retries=SUBMISSION_MAX_RETRIES)
    except ConnectionError as e:
        logger.error(
            msg='connection_error {}.url={} title={}'.format(
                e,
                site_configuration.ena_server.url,
                site_configuration.ena_server.title)
        )
        response = Response()
    return str(request_id), response.status_code, smart_text(
        response.content)


# TODO: this one relies on prevoius task: transfer_data_to_ena_task
@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.process_ena_response_task',
)
def process_ena_response_task(self, transfer_result=None, submission_id=None,
                              close_submission_on_success=True):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if transfer_result == TaskProgressReport.CANCELLED or submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    request_id, response_status_code, response_content = transfer_result

    parsed = parse_ena_submission_response(response_content)
    success = True if parsed.get('success', False) == 'true' else False
    if success:
        BrokerObject.objects.append_pids_from_ena_response(parsed)
        if close_submission_on_success:
            submission.status = Submission.CLOSED
        submission.save()
        return True
    else:
        submission.status = Submission.ERROR
        outgoing_request = RequestLog.objects.get(request_id=request_id)
        outgoing_request.request_details['parsed_ena_response'] = parsed
        outgoing_request.save()
        submission.save()
        logger.error(
            msg='process_ena_response_task. ena reported error(s) '
                'for submisison={}. refer to RequestLog={}'.format(
                submission.broker_submission_id,
                outgoing_request.request_id)
        )
        return False


# Pangea submission transfer tasks ---------------------------------------------

@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.create_pangaea_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def create_pangaea_issue_task(self, prev=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    jira_client = JiraClient(
        resource=site_configuration.pangaea_jira_server,
        token_resource=site_configuration.pangaea_token_server)
    jira_client.create_pangaea_issue(site_config=site_configuration,
                                     submission=submission)
    jira_error_auto_retry(jira_client=jira_client, task=self,
                          broker_submission_id=submission.broker_submission_id)
    if jira_client.issue:
        submission.additionalreference_set.create(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key=jira_client.issue.key,
            primary=True
        )
        return {
            'issue_key': jira_client.issue.key,
        }


# TODO: this one relies on prevoius task: create_pangaea_issue_task
# TODO: this task relies on additional kwargs, as returned from task above
@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.add_accession_to_pangaea_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_accession_to_pangaea_issue_task(self, kwargs=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    if 'issue_key' in kwargs.keys():

        # TODO: manager method to get panagea issue without needing pre-chain result
        ticket_key = kwargs.get('issue_key', 'None')
        study_pid = submission.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.filter(
            pid_type='PRJ').first()
        if study_pid:
            jira_client = JiraClient(
                resource=site_configuration.pangaea_jira_server,
                token_resource=site_configuration.pangaea_token_server)
            jira_client.add_comment(
                key_or_issue=ticket_key,
                text='ENA Accession No. of study {}. broker_submission_id: '
                     '{0}. {1}'.format(study_pid.pid,
                                       submission.broker_submission_id))

            return jira_error_auto_retry(jira_client=jira_client, task=self,
                                         broker_submission_id=submission.broker_submission_id)
    else:
        return TaskProgressReport.CANCELLED


# TODO: this one relies on prevoius task: attach_to_pangaea_issue_task
# TODO: this task relies on additional kwargs, as returned from task above
@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.attach_to_pangaea_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def attach_to_pangaea_issue_task(self, kwargs={}, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    if 'issue_key' in kwargs.keys():

        issue_key = kwargs.get('issue_key', 'None')
        jira_client = JiraClient(
            resource=site_configuration.pangaea_jira_server,
            token_resource=site_configuration.pangaea_token_server
        )
        jira_client.attach_to_pangaea_issue(key=issue_key,
                                            submission=submission)
        jira_error_auto_retry(jira_client=jira_client, task=self,
                              broker_submission_id=submission.broker_submission_id)
        return {'issue_key': issue_key}

    else:
        return TaskProgressReport.CANCELLED


@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.check_for_pangaea_doi_task',
)
def check_for_pangaea_doi_task(self, resource_credential_id=None):
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=check_for_pangaea_doi_task)
    # TODO: move this to top and check there are submissiont to fetch doi for, if not no request for login token is needed
    submissions = \
        Submission.objects.get_submitted_submissions_containing_reference(
            reference_type=AdditionalReference.PANGAEA_JIRA_TICKET
        )
    logger.info(
        msg='check_for_pangaea_doi_task. pulling pangaea dois for {} '
            'submissions'.format(len(submissions)))
    # TODO: in general suboptimal to fetch sc for every submission in set, but neeeded, reconsider to refactor
    #   schedule in database etc.
    for sub in submissions:
        site_config = SiteConfiguration.objects.get_site_configuration(
            site=sub.site
        )
        jira_client = JiraClient(resource=site_config.helpdesk_server,
                                 token_resource=site_config.pangaea_token_server)
        pull_pangaea_dois(sub, jira_client)


# HELPDESK TASKS --------------------------------------------------------------


@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.get_gfbio_helpdesk_username_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def get_gfbio_helpdesk_username_task(self, prev_task_result=None,
                                     submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.info(
            'tasks.py | get_gfbio_helpdesk_username_task | return TaskProgressReport.CANCELLED')
        return TaskProgressReport.CANCELLED

    # result = {}
    user_name = JIRA_FALLBACK_USERNAME
    user_email = JIRA_FALLBACK_EMAIL
    user_full_name = ''
    # result['name'] = user_name
    result = {
        'jira_user_name': user_name,
        'email': user_email,
        'full_name': user_full_name
    }
    # submitting user is site specific. e.g. local django user id = 1 is
    # different from silva user id = 1
    if len(submission.submitting_user) == 0:
        logger.info(
            'tasks.py | get_gfbio_helpdesk_username_task | '
            'len(submission.submitting_user) == 0 | return {0}'.format(result))
        return result

    # 'local_site' includes sso, local users, social accounts
    # (which have local shadow accounts)
    if submission.site.username == HOSTING_SITE:
        try:
            logger.info(
                'tasks.py | get_gfbio_helpdesk_username_task | try getting a local user | submission={1} | submitting_user={1}'.format(
                    submission.broker_submission_id, submission.submitting_user)
            )
            # FIXME: tricky if submitting user is a numerical id from another
            #  system, worst case would be an accidental match with a local user
            # works only based on the assumption that this is actually a
            # local user
            user = User.objects.get(pk=int(submission.submitting_user))
            user_name = user.goesternid if user.goesternid else user.username
            user_email = user.email
            result['email'] = user_email
            user_full_name = user.name
            result['full_name'] = user_full_name
            logger.info(
                'tasks.py | get_gfbio_helpdesk_username_task | try get user | username={0} | goe_id={1}'.format(
                    user.username, user.goesternid))
        except ValueError as ve:
            logger.warning(
                'tasks.py | get_gfbio_helpdesk_username_task | '
                'submission_id={0} | ValueError with '
                'submission.submiting_user={1} | '
                '{2}'.format(submission_id, submission.submitting_user, ve))
        except User.DoesNotExist as e:
            logger.warning(
                'tasks.py | get_gfbio_helpdesk_username_task | '
                'submission_id={0} | No user with '
                'submission.submiting_user={1} | '
                '{2}'.format(submission_id, submission.submitting_user, e))
            logger.warning(
                'tasks.py | get_gfbio_helpdesk_username_task | '
                'submission_id={0} | Try getting user_email from previous task | user_name='
                '{1}'.format(submission_id, user_name))
    else:
        # TODO: add 'get_user_email method' specific to a site as a parameter to this task, otherwise no email resolution is possible
        user_name = submission.site.username
        # user_email = site_configuration.contact
        # result['email'] = user_email

    response = get_gfbio_helpdesk_username(user_name=user_name,
                                           email=user_email,
                                           fullname=user_full_name)
    logger.info(
        'tasks.py | get_gfbio_helpdesk_username_task | response status={0} | content={1}'.format(
            response.status_code, response.content))

    raise_transfer_server_exceptions(
        response=response,
        task=self,
        broker_submission_id=submission.broker_submission_id,
        max_retries=SUBMISSION_MAX_RETRIES
    )

    # in case of hosting site users, client or server errors 4xx/5xx will return
    # JIRA_FALLBACK_USERNAME but with user email & fullname
    if response.status_code == 200:
        result['jira_user_name'] = smart_text(response.content)

    logger.info(
        'tasks.py | get_gfbio_helpdesk_username_task |return={0}'.format(
            result))
    return result


@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.create_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def create_submission_issue_task(self, prev_task_result=None,
                                 submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    # TODO: test task without check for null, what happens when errors occur here, not caused inside a
    #  method called here

    # TODO: only needed for comment on ticket, thus remove
    # TODO: althouht filter for primary should deliver only on ticket, a dedicated manager method
    #   would be cleaner (no .first() on query set)
    # existing_tickets = submission.additionalreference_set.filter(
    #     Q(type=AdditionalReference.GFBIO_HELPDESK_TICKET) & Q(primary=True))

    jira_client = JiraClient(resource=site_configuration.helpdesk_server)
    jira_client.create_submission_issue(reporter=prev_task_result,
                                        site_config=site_configuration,
                                        submission=submission)

    jira_error_auto_retry(jira_client=jira_client, task=self,
                          broker_submission_id=submission.broker_submission_id)
    if jira_client.issue:
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key=jira_client.issue.key,
            primary=True
        )


@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.update_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def update_submission_issue_task(self, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    reference = submission.get_primary_helpdesk_reference()
    if reference:
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.update_submission_issue(
            key=reference.reference_key,
            site_config=site_configuration,
            submission=submission,
        )

        return jira_error_auto_retry(jira_client=jira_client, task=self,
                                     broker_submission_id=submission.broker_submission_id)
    else:
        return TaskProgressReport.CANCELLED
        # return retry_no_ticket_available_exception(
        #     task=self,
        #     broker_submission_id=submission.broker_submission_id,
        #     number_of_tickets=1 if reference else 0
        # )


# TODO: examine all tasks for redundant code and possible generalization e.g.:
# TODO: more generic like update above
@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.add_accession_to_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_accession_to_submission_issue_task(self, prev_task_result=None,
                                           submission_id=None,
                                           target_archive=None):
    # No submission will be returned if submission.status is error
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    # TODO: althouht filter for primary should deliver only on ticket, a dedicated manager method
    #   would be cleaner (no .first() on query set)
    # TODO: result is a list of GFbio helpdesk tickets wich are primary,
    #   tecnically len can only be 1, due to model.save ...
    # existing_tickets = submission.additionalreference_set.filter(
    #     Q(type=AdditionalReference.GFBIO_HELPDESK_TICKET) & Q(primary=True))
    reference = submission.get_primary_helpdesk_reference()

    # TODO: previous task is process_ena_response_task, if ena responded successfully
    #  and delievered accesstions, theses are appended as persistentidentifiers
    #  if all worked Pids shoul be in DB and process returns true
    # TODO: makes sense only for ENA or ENA_PANGAEA targets
    if reference and prev_task_result is True:
        if target_archive == ENA or target_archive == ENA_PANGAEA:
            study_pid = submission.brokerobject_set.filter(
                type='study'
            ).first().persistentidentifier_set.filter(
                pid_type='PRJ'
            ).first()

            jira_client = JiraClient(
                resource=site_configuration.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key,
                text='Submission to ENA has been successful. '
                     'Study is accessible via ENA Accession No. {0}. '
                     'broker_submission_id: {1}.'.format(study_pid.pid,
                                                         submission.broker_submission_id))
            return jira_error_auto_retry(jira_client=jira_client, task=self,
                                         broker_submission_id=submission.broker_submission_id)


@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.add_posted_comment_to_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_posted_comment_to_issue_task(self, prev_task_result=None,
                                     submission_id=None, comment='',
                                     user_values={}):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    if reference:
        comment_text = comment
        if 'username' in user_values.keys() and 'email' in user_values.keys():
            comment_text = SUBMISSION_COMMENT_TEMPLATE.format(
                user_values.get('username', ''),
                user_values.get('email', ''),
                comment)
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.add_comment(
            key_or_issue=reference.reference_key,
            text=comment_text)
        return jira_error_auto_retry(jira_client=jira_client, task=self,
                                     broker_submission_id=submission.broker_submission_id)
    else:
        logger.info(
            msg='add_posted_comment_to_issue_task no tickets found. '
                'submission_id={0} '.format(submission_id)
        )

        return retry_no_ticket_available_exception(
            task=self,
            broker_submission_id=submission.broker_submission_id,
            number_of_tickets=1 if reference else 0
        )


# FIXME: here problems while using new jirclient to attach, especiall while put submissionupload
@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.attach_to_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def attach_to_submission_issue_task(self, kwargs=None, submission_id=None,
                                    submission_upload_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    # TODO: if no ticket available, the reason may that this task is started independened of
    #  submission transfer chain that creates the ticket, so a proper retry has to be
    #  implemented
    if reference:
        submission_upload = submission.submissionupload_set.filter(
            attach_to_ticket=True).filter(pk=submission_upload_id).first()
        if submission_upload:

            # TODO: access media nginx https://stackoverflow.com/questions/8370658/how-to-serve-django-media-files-via-nginx
            jira_client = JiraClient(
                resource=site_configuration.helpdesk_server,
            )
            attachment = jira_client.add_attachment(
                key=reference.reference_key,
                file=submission_upload.file,
            )

            jira_error_auto_retry(jira_client=jira_client, task=self,
                                  broker_submission_id=submission.broker_submission_id)

            submission_upload.attachment_id = attachment.id
            submission_upload.save(ignore_attach_to_ticket=True)

            return True
        else:
            logger.info(
                msg='attach_to_submission_issue_task no SubmissionUpload'
                    ' found. submission_id={0} | submission_upload_id={1}'
                    ''.format(submission_id, submission_upload_id))
            return False
    else:
        logger.info(
            msg='attach_to_submission_issue_task no tickets found. '
                'submission_id={0} | submission_upload_id={1}'
                ''.format(submission_id, submission_upload_id))

        # apply_timebased_task_retry_policy(
        #     task=attach_to_submission_issue_task,
        #     submission=submission,
        #     no_of_tickets=1 if reference else 0
        #     # always 1 if available due to filter rules
        # )
        return retry_no_ticket_available_exception(
            task=self,
            broker_submission_id=submission.broker_submission_id,
            number_of_tickets=1 if reference else 0
        )

        # return False


@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.delete_submission_issue_attachment_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def delete_submission_issue_attachment_task(self, kwargs=None,
                                            submission_id=None,
                                            attachment_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    # TODO: temporary solution until workflow is fix,
    #   also needs manager method to prevent exceptions here
    # TODO: maybe attachment id is better than submission upload id, which may be delete
    #   when task executes
    # submission_upload = SubmissionUpload.objects.filter(
    #     pk=submission_upload_id).first()

    jira_client = JiraClient(
        resource=site_configuration.helpdesk_server,
    )
    jira_client.delete_attachment(attachment_id)
    return jira_error_auto_retry(jira_client=jira_client, task=self,
                                 broker_submission_id=submission.broker_submission_id)


# TODO: add tests ...
@celery.task(
    base=SubmissionTask, bind=True, name='tasks.add_pangaea_doi_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_pangaea_doi_task(self, prev_task_result=None,
                         pangaea_doi=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()
    if reference:
        jira_client = JiraClient(
            resource=site_configuration.helpdesk_server,
        )
        jira_client.add_comment(
            key_or_issue=reference.reference_key,
            text='Pangaea DOI: {0}. broker_submission_id: {1}'.format(
                pangaea_doi, submission.broker_submission_id)
        )
        return jira_error_auto_retry(jira_client=jira_client, task=self,
                                     broker_submission_id=submission.broker_submission_id)


@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.add_pangaealink_to_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_pangaealink_to_submission_issue_task(
        self,
        prev=None,
        submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    helpdesk_reference = submission.get_primary_helpdesk_reference()
    pangaea_reference = submission.get_primary_pangaea_reference()

    if helpdesk_reference and pangaea_reference:
        jira_client = JiraClient(
            resource=site_configuration.helpdesk_server)

        jira_client.add_comment(
            key_or_issue=helpdesk_reference.reference_key,
            text='[Pangaea Ticket {1}|{0}{1}]'.format(
                PANGAEA_ISSUE_VIEW_URL,
                pangaea_reference.reference_key)
        )
        return jira_error_auto_retry(jira_client=jira_client, task=self,
                                     broker_submission_id=submission.broker_submission_id)

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
    PANGAEA_ISSUE_VIEW_URL
from gfbio_submissions.brokerage.exceptions import TransferServerError, \
    TransferClientError
from gfbio_submissions.brokerage.utils.csv import \
    check_for_molecular_content
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import jira_error_auto_retry, \
    get_submission_and_site_configuration, raise_transfer_server_exceptions, \
    retry_no_ticket_available_exception
from gfbio_submissions.users.models import User
from .configuration.settings import BASE_HOST_NAME, \
    SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from .models import BrokerObject, \
    AuditableTextData, RequestLog, AdditionalReference, TaskProgressReport, \
    Submission, SiteConfiguration
from .utils.ena import prepare_ena_data, \
    store_ena_data_as_auditable_text_data, send_submission_to_ena, \
    parse_ena_submission_response
from .utils.gfbio import \
    gfbio_get_user_by_id
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


# TODO: refactor, them remove
# def apply_timebased_task_retry_policy(task, submission, no_of_tickets):
#     try:
#         raise_no_ticket_exception(no_of_tickets)
#     except SubmissionUpload.NoTicketAvailableError as e:
#         logger.warning(
#             msg='{} SubmissionUpload.NoTicketAvailableError {}'.format(
#                 task.name, e)
#         )
#         logger.info(
#             msg='{} SubmissionUpload.NoTicketAvailableError number_of_retries={}'
#                 ''.format(task.name, task.request.retries)
#         )
#         if task.request.retries == SUBMISSION_UPLOAD_MAX_RETRIES:
#             logger.info(
#                 msg='{} apply_timebased_task_retry_policy mail_admins max_retries={}'
#                     ''.format(task.name, SUBMISSION_UPLOAD_MAX_RETRIES)
#             )
#             mail_admins(
#                 subject='Failed "{}" for submission {}'.format(
#                     task.name, submission.broker_submission_id),
#                 message='Task {0} failed after {1} retries. refer to submission '
#                         'with broker_submission_id {2}. Error {3}'.format(
#                     task.name,
#                     task.request.retries,
#                     submission.broker_submission_id,
#                     e
#                 ),
#             )
#         else:
#             raise task.retry(
#                 exc=e,
#                 countdown=(
#                                       task.request.retries + 1) * SUBMISSION_UPLOAD_RETRY_DELAY,
#             )


# TODO: refactor/move to submission_transfer_handler
# def apply_default_task_retry_policy(response, task, submission):
#     try:
#         SubmissionTransferHandler.raise_response_exceptions(response)
#     except TransferServerError as e:
#         logger.warning(
#             msg='{} TransferServerError {}'.format(
#                 task.name, e)
#         )
#         logger.info(
#             msg='{} TransferServerError number_of_retries={}'
#                 ''.format(task.name, task.request.retries)
#         )
#         if task.request.retries == SUBMISSION_MAX_RETRIES:
#             logger.warning(
#                 msg='{} TransferServerError (mail_admins) max_retries={}'
#                     ''.format(task.name, SUBMISSION_MAX_RETRIES)
#             )
#             mail_admins(
#                 subject='Failed "{}" for submission {}'.format(
#                     task.name, submission.broker_submission_id),
#                 message='TransferServerError. refer to submission with broker_submission_id '
#                         '{} \nError:\n{}'.format(
#                     submission.broker_submission_id, e),
#             )
#         else:
#             logger.info(
#                 msg='{} TransferServerError retry after delay'
#                     ''.format(task.name)
#             )
#             # TODO: for testing 4.3
#             try:
#                 task.retry(
#                     exc=e,
#                     throw=False,
#                     countdown=(
#                                       task.request.retries + 1) * SUBMISSION_RETRY_DELAY,
#                 )
#             # TODO: for testing 4.3
#             except RuntimeError as re:
#                 print('\n\n RUNTIME ERROR RETRY ')
#                 pprint(re)
#
#     except TransferClientError as e:
#         logger.warning(
#             msg='{} TransferClientError {}'.format(
#                 task.name, e)
#         )
#         mail_admins(
#             subject='Failed "{}" for submission {}'.format(task.name,
#                                                            submission.broker_submission_id),
#             message='TransferClientError. refer to submission with broker_submission_id '
#                     '{} \nError:\n{}'.format(
#                 submission.broker_submission_id, e), )


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
        # print('RETURNED FROM RETRY ', res)
        # if res == TaskProgressReport.CANCELLED:
        #     return TaskProgressReport.CANCELLED
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


# HELP-DESK TASKS --------------------------------------------------------------

# FIXME/TODO: once only local users are used, even with social logins,
#  gfbio stuff is obsolete and getting userinformation need no extra task.
#  Thus remove this
@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.get_user_email_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def get_user_email_task(self, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    res = {
        'user_email': site_configuration.contact,
        'user_full_name': '',
        'first_name': '',
        'last_name': '',
    }
    if site_configuration.use_gfbio_services:
        response = gfbio_get_user_by_id(submission.submitting_user,
                                        site_configuration, submission)
        try:
            response_json = response.json()
            content = response_json if isinstance(response_json,
                                                  dict) else {}
            res['user_email'] = content.get('emailaddress',
                                            site_configuration.contact)
            res['user_full_name'] = content.get('fullname', '')
        except ValueError as e:
            logger.error(
                msg='get_user_email_task. load json response. '
                    'Value error: {}'.format(e))
    else:
        logger.info(
            msg='get_user_email_task submission_id={0} | '
                'use_gfbio_services={1} | get django user with '
                'user_id={2}'.format(submission_id,
                                     site_configuration.use_gfbio_services,
                                     submission.submitting_user))
        try:
            user = User.objects.get(pk=submission.submitting_user)
            res['user_email'] = user.email
            res['user_full_name'] = user.name
        except ValueError as e:
            logger.error(
                msg='get_user_email_task submission_id={0} | '
                    'value error. error: {1}'.format(submission_id, e))
        except User.DoesNotExist as e:
            logger.error(
                msg='get_user_email_task submission_id={0} | '
                    'user does not exist. error: {1}'.format(submission_id,
                                                             e))

    submission.submitting_user_common_information = '{0};{1}'.format(
        res['user_full_name'], res['user_email'])
    submission.save()
    return res


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
        # print(self.request.retries, ' error ',
        #       jira_client.error.response.status_code)
        # # TODO: - (A) 04.09.2019: with decorator containing
        # #  max_retries=SUBMISSION_MAX_RETRIES, autoretry_for=(SubmissionTransferHandler.TransferServerError,),
        # #   task retries 2x then in last retry 500er is thrown again (as expected) but no catched
        # #   no EAGAER based exectption
        # #   - (B) mit retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES+2}, 4x (expected)
        # #   - (C) all this can also be achieved vie try/except and .retry(exc=exc, max_retries=5)
        # #   - (D) IF max retries is is treated via if : EAGER-result.get() exception occurs
        # #   - (E) auto retry (decorator) vs. self.retry(countdown=3 ** self.request.retries, throw=False??)
        # #   - (F) manual self.retry with cathcing max retries error also produces eager error
        # #   - (G) Runtime error (res.get) occurs on every task execution/retry
        # #   - (H) When using auto-retry EAGER runtime error has to be catched where task is called
        # #   - ---------------------------------
        # #   - (I) using apply instead of apply_async in test makes it independent of EAGER...
        # #           (leave TRUE for tests with indirect async all like in .save() --> test settings constants .. )
        # #           (EAGAER False for tests that use apply and retry --> mock for single tests)
        # #           -> strategy 3 in : https://www.distributedpython.com/2018/05/01/unit-testing-celery-tasks/
        # #       since "apply: Execute this task locally, by blocking until the task returns."
        # #       -> for 500 error TPR outputs all overrides, resulting in stste RETRY after this (expected)
        # #       -> opens for autoretry implementation
        # #       -> consider logging in SubmissionTask methods (perhaps overide some more to add logging)
        # #       -> find a good place to capsule 500er retries and mail after 400er errors
        # #       -> merge with retry polices or remove them

# -*- coding: utf-8 -*-

import logging
from json import JSONDecodeError

import celery
from celery import Task
from django.core.mail import mail_admins
from django.db import transaction
from django.db.models import Q
from django.db.utils import IntegrityError
from django.utils.encoding import smart_text
from requests import ConnectionError, Response

from gfbio_submissions.brokerage.configuration.settings import ENA
from gfbio_submissions.brokerage.utils.gfbio import \
    gfbio_prepare_create_helpdesk_payload
from .configuration.settings import BASE_HOST_NAME, \
    PRIMARY_DATA_FILE_MAX_RETRIES, PRIMARY_DATA_FILE_DELAY, \
    SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY, PANGAEA_ISSUE_VIEW_URL
from .models import PrimaryDataFile, BrokerObject, \
    AuditableTextData, RequestLog, AdditionalReference, ResourceCredential, \
    TaskProgressReport, Submission
from .utils.ena import prepare_ena_data, \
    store_ena_data_as_auditable_text_data, send_submission_to_ena, \
    parse_ena_submission_response
from .utils.gfbio import \
    gfbio_helpdesk_comment_on_ticket, gfbio_helpdesk_create_ticket, \
    gfbio_get_user_by_id, gfbio_helpdesk_attach_file_to_ticket
from .utils.pangaea import request_pangaea_login_token, \
    parse_pangaea_login_token_response, create_pangaea_jira_ticket, \
    attach_file_to_pangaea_ticket, get_csv_from_samples, \
    comment_on_pangaea_ticket, pull_pangaea_dois
from .utils.submission_transfer import SubmissionTransferHandler

logger = logging.getLogger(__name__)


# abstract base class for tasks ------------------------------------------------

class SubmissionTask(Task):
    abstract = True

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        # TODO: capture this idea of reporting to sentry
        # sentrycli.captureException(exc)
        TaskProgressReport.objects.update_report_on_exception(
            'RETRY', exc, task_id, args, kwargs, einfo)
        super(SubmissionTask, self).on_retry(exc, task_id, args, kwargs, einfo)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        TaskProgressReport.objects.update_report_on_exception(
            'FAILURE', exc, task_id, args, kwargs, einfo)
        super(SubmissionTask, self).on_failure(exc, task_id, args, kwargs,
                                               einfo)

    def on_success(self, retval, task_id, args, kwargs):
        TaskProgressReport.objects.update_report_on_success(
            retval, task_id, args, kwargs)
        super(SubmissionTask, self).on_success(retval, task_id, args, kwargs)

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        TaskProgressReport.objects.update_report_after_return(status, task_id)
        super(SubmissionTask, self).after_return(
            status, retval, task_id, args, kwargs, einfo)


# common tasks -----------------------------------------------------------------

@celery.task(name='tasks.trigger_submission_transfer', base=SubmissionTask)
def trigger_submission_transfer(submission_id=None):
    logger.info(
        msg='trigger_submission_transfer. get submission with pk={}.'.format(
            submission_id)
    )
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id, task=trigger_submission_transfer
    )
    transfer_handler = SubmissionTransferHandler(
        submission_id=submission.pk,
        target_archive=submission.target
    )
    transfer_handler.initiate_submission_process(release=submission.release)


@celery.task(name='tasks.trigger_submission_transfer_for_updates',
             base=SubmissionTask)
def trigger_submission_transfer_for_updates(broker_submission_id=None):
    logger.info(
        msg='trigger_submission_transfer_for_updates. get submission_id with broker_submission_id={}.'.format(
            broker_submission_id)
    )
    submission_id = Submission.objects.get_submission_id_for_bsi(
        broker_submission_id=broker_submission_id)
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id,
        task=trigger_submission_transfer_for_updates
    )
    transfer_handler = SubmissionTransferHandler(
        submission_id=submission.pk,
        target_archive=submission.target
    )
    # TODO: update means no new ticket and gfbio-email !!!
    transfer_handler.initiate_submission_process(release=submission.release,
                                                 update=True)


@celery.task(name='tasks.check_on_hold_status_task', base=SubmissionTask)
def check_on_hold_status_task(previous_task_result=None, submission_id=None):
    logger.info(
        msg='check_on_hold_status_task. get submission with pk={}.'.format(
            submission_id)
    )
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=check_on_hold_status_task)
    if submission is not None and site_configuration is not None:
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
    else:
        return TaskProgressReport.CANCELLED


def apply_timebased_task_retry_policy(task, submission, no_of_tickets):
    try:
        PrimaryDataFile.raise_ticket_exeptions(no_of_tickets)
    except PrimaryDataFile.NoTicketAvailableError as e:
        logger.warning(
            msg='{} PrimaryDataFile.NoTicketAvailableError {}'.format(
                task.name, e)
        )
        logger.info(
            msg='{} PrimaryDataFile.NoTicketAvailableError number_of_retries={}'
                ''.format(task.name, task.request.retries)
        )
        if task.request.retries == PRIMARY_DATA_FILE_MAX_RETRIES:
            logger.info(
                msg='{} apply_timebased_task_retry_policy mail_admins max_retries={}'
                    ''.format(task.name, PRIMARY_DATA_FILE_MAX_RETRIES)
            )
            mail_admins(
                subject='Failed "{}" for submission {}'.format(
                    task.name, submission.broker_submission_id),
                message='Task {0} failed after {1} retries. refer to submission '
                        'with broker_submission_id {2}. Error {3}'.format(
                    task.name,
                    task.request.retries,
                    submission.broker_submission_id,
                    e
                ),
            )
        else:
            raise task.retry(
                exc=e,
                countdown=(task.request.retries + 1) * PRIMARY_DATA_FILE_DELAY,
            )


# TODO: refactor/move to submission_transfer_handler
def apply_default_task_retry_policy(response, task, submission):
    try:
        SubmissionTransferHandler.raise_response_exceptions(response)
    except SubmissionTransferHandler.TransferServerError as e:
        logger.warning(
            msg='{} SubmissionTransfer.TransferServerError {}'.format(
                task.name, e)
        )
        logger.info(
            msg='{} SubmissionTransfer.TransferServerError number_of_retries={}'
                ''.format(task.name, task.request.retries)
        )
        if task.request.retries == SUBMISSION_MAX_RETRIES:
            logger.info(
                msg='{} SubmissionTransfer.TransferServerError mail_admins max_retries={}'
                    ''.format(task.name, SUBMISSION_MAX_RETRIES)
            )
            mail_admins(
                subject='Failed "{}" for submission {}'.format(
                    task.name, submission.broker_submission_id),
                message='TransferServerError. refer to submission with broker_submission_id '
                        '{} \nError:\n{}'.format(
                    submission.broker_submission_id, e),
            )
        else:
            logger.info(
                msg='{} SubmissionTransfer.TransferServerError retry after delay'
                    ''.format(task.name)
            )
            raise task.retry(
                exc=e,
                countdown=(task.request.retries + 1) * SUBMISSION_RETRY_DELAY,
            )
    except SubmissionTransferHandler.TransferClientError as e:
        logger.warning(
            msg='{} SubmissionTransfer.TransferClientError {}'.format(
                task.name, e)
        )
        mail_admins(
            subject='Failed "{}" for submission {}'.format(task.name,
                                                           submission.broker_submission_id),
            message='TransferClientError. refer to submission with broker_submission_id '
                    '{} \nError:\n{}'.format(
                submission.broker_submission_id, e), )


# NEW PREP WORKFLOW BO CREATION AND SOID CREATION ------------------------------

@celery.task(name='tasks.create_broker_objects_from_submission_data_task',
             base=SubmissionTask)
def create_broker_objects_from_submission_data_task(
        previous_task_result=None,
        submission_id=None):
    logger.info(
        msg='create_broker_objects_from_submission_data_task '
            'previous_task_result={} | submission_id={}'.format(
            previous_task_result,
            submission_id)
    )
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id,
        task=create_broker_objects_from_submission_data_task)
    if submission is not None:
        try:
            with transaction.atomic():
                BrokerObject.objects.add_submission_data(submission)
        except IntegrityError as e:
            logger.error(
                'create_broker_objects_from_submission_data_task IntegrityError in "create_broker_objects_from'
                '_submission_data_task": {}'.format(e))
        logger.info(
            msg='create_broker_objects_from_submission_data_task finished '
                'submission_id={}'.format(submission.pk))
    else:
        return TaskProgressReport.CANCELLED


# ENA submission transfer tasks ------------------------------------------------

@celery.task(name='tasks.prepare_ena_submission_data_task',
             base=SubmissionTask)
def prepare_ena_submission_data_task(prev_task_result=None, submission_id=None):
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id,
        task=prepare_ena_submission_data_task)
    logger.info(
        msg='prepare_ena_submission_data_task. start prepare_ena_data '
            'previous_task_result={} | submission_id={}'.format(
            prev_task_result,
            submission_id)
    )
    if submission is not None:
        ena_submission_data = prepare_ena_data(submission=submission)
        logger.info(
            msg='prepare_ena_submission_data_task. finished prepare_ena_data '
                'submission_id={}'.format(submission_id)
        )
        logger.info('\n\nENA SUBMISSION DATA')
        logger.info('\n{}'.format(ena_submission_data))
        logger.info('\n\nENA SUBMISSION DATA\n\n')
        store_ena_data_as_auditable_text_data(submission=submission,
                                              data=ena_submission_data)
        # TODO: this will become obsolete once, data is taken from AuditableTextData ....
        return ena_submission_data
    else:
        return TaskProgressReport.CANCELLED


# TODO: add task for preparation of ena-data (this is currently included in send-to-ena)
# TODO: result of this task is input for next task
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.transfer_data_to_ena_task', base=SubmissionTask)
def transfer_data_to_ena_task(prepare_result=None, submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=transfer_data_to_ena_task)
    logger.info(
        msg='transfer_data_to_ena_task. start assemble_ena_submission_data '
            'previous_task_result={} | submission_id={}'.format(
            prepare_result,
            submission_id)
    )
    if submission is not None and site_configuration is not None:
        ena_submission_data = AuditableTextData.objects.assemble_ena_submission_data(
            submission=submission)
        logger.info('\nena_submission_data')
        logger.info('{}'.format(ena_submission_data))
        if ena_submission_data == {}:
            return TaskProgressReport.CANCELLED
        try:
            response, request_id = send_submission_to_ena(submission,
                                                          site_configuration.ena_server,
                                                          ena_submission_data,
                                                          )
            logger.info('\nresponse request id {}'.format(request_id))
            logger.info('\nresponse \n{}\n'.format(response))
            apply_default_task_retry_policy(
                response,
                transfer_data_to_ena_task,
                submission,
            )
            logger.info('\nafter retry policy')
        except ConnectionError as e:
            logger.error(
                msg='connection_error {}.url={} title={}'.format(
                    e,
                    site_configuration.ena_server.url,
                    site_configuration.ena_server.title)
            )
            response = Response()
        logger.info(
            '\nreturn from task {}\n{}\n{}\n'.format(str(request_id),
                                                     response.status_code,
                                                     response.content)
        )
        return str(request_id), response.status_code, smart_text(
            response.content)
    else:
        return TaskProgressReport.CANCELLED


# TODO: this one relies on prevoius task: transfer_data_to_ena_task
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.process_ena_response_task', base=SubmissionTask)
def process_ena_response_task(transfer_result=None, submission_id=None,
                              close_submission_on_success=True):
    logger.info(
        msg='process_ena_response_task. '
            'previous_task_result={} | submission_id={}'.format(
            transfer_result,
            submission_id)
    )
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id, task=process_ena_response_task
    )

    if transfer_result == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    request_id, response_status_code, response_content = transfer_result

    if submission is not None:
        parsed = parse_ena_submission_response(response_content)
        success = True if parsed.get('success', False) == 'true' else False
        if success:
            logger.info(
                msg='submission_transfer of submission "{}" to ENA was '
                    'successful'.format(submission.broker_submission_id)
            )
            logger.info(msg='append persisten-identifiers')
            BrokerObject.objects.append_pids_from_ena_response(parsed)
            logger.info(msg='set submission "{}" to status {}'.format(
                submission.broker_submission_id, Submission.CLOSED))
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
    else:
        return TaskProgressReport.CANCELLED


# Pangea submission transfer tasks ---------------------------------------------

# TODO: result of this task is input for next task
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.request_pangaea_login_token_task', base=SubmissionTask)
def request_pangaea_login_token_task(previous_task_result=None,
                                     submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=request_pangaea_login_token_task
    )
    if submission is not None and site_configuration is not None:
        response = request_pangaea_login_token(
            resource_credential=site_configuration.pangaea_server)
        apply_default_task_retry_policy(response,
                                        request_pangaea_login_token_task,
                                        submission)
        login_token = parse_pangaea_login_token_response(response)
        return login_token
    else:
        return 'CANCELLED'


# TODO: this one relies on prevoius task: request_pangaea_login_token_task
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.create_pangaea_jira_ticket_task', base=SubmissionTask)
def create_pangaea_jira_ticket_task(login_token=None, submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=create_pangaea_jira_ticket_task
    )
    if submission is not None and site_configuration is not None:
        response = create_pangaea_jira_ticket(login_token=login_token,
                                              site_configuration=site_configuration,
                                              submission=submission)
        apply_default_task_retry_policy(response,
                                        create_pangaea_jira_ticket_task,
                                        submission)
        try:
            # content = json.loads(response.content)
            content = response.json()
            ticket_key = content.get('key', 'no_key_available')
            with transaction.atomic():
                submission.additionalreference_set.create(
                    type=AdditionalReference.PANGAEA_JIRA_TICKET,
                    reference_key=ticket_key,
                    primary=True
                )
            return {
                'login_token': login_token,
                'ticket_key': ticket_key
            }
        except ValueError as e:
            logger.error(
                'ValueError. create_pangaea_jira_ticket_task. Error: {}'.format(
                    e))
            return None
    else:
        return TaskProgressReport.CANCELLED


# TODO: this one relies on prevoius task: create_pangaea_jira_ticket_task
# TODO: this task relies on additional kwargs, as returned from task above
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.attach_file_to_pangaea_ticket_task',
             base=SubmissionTask)
def attach_file_to_pangaea_ticket_task(kwargs=None, submission_id=None):
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id, task=attach_file_to_pangaea_ticket_task)
    if submission is not None:
        login_token = None
        ticket_key = None
        if isinstance(kwargs, dict):
            login_token = kwargs.get('login_token', None)
            ticket_key = kwargs.get('ticket_key', None)
        if login_token and ticket_key:
            csv_from_samples = get_csv_from_samples(submission)
            response = attach_file_to_pangaea_ticket(
                login_token=login_token,
                ticket_key=ticket_key,
                file_name='contextual_data.csv',
                content_string=csv_from_samples,
                submission=submission,
            )
            apply_default_task_retry_policy(response,
                                            attach_file_to_pangaea_ticket_task,
                                            submission)
            return {
                'login_token': login_token,
                'ticket_key': ticket_key
            }
        else:
            return None
    else:
        return TaskProgressReport.CANCELLED


# TODO: this one relies on prevoius task: attach_file_to_pangaea_ticket_task
# TODO: this task relies on additional kwargs, as returned from task above
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.comment_on_pangaea_ticket_task', base=SubmissionTask)
def comment_on_pangaea_ticket_task(kwargs=None, submission_id=None,
                                   comment_body=''):
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id, task=comment_on_pangaea_ticket_task)
    if submission is not None:
        login_token = None
        ticket_key = None
        if isinstance(kwargs, dict):
            login_token = kwargs.get('login_token', None)
            ticket_key = kwargs.get('ticket_key', None)
        if login_token and ticket_key:
            study_pid = submission.brokerobject_set.filter(
                type='study').first().persistentidentifier_set.filter(
                pid_type='PRJ').first()
            if study_pid:
                comment_body = 'ENA Accession No. of study {}. broker_submission_id: ' \
                               '{}. {}'.format(study_pid.pid,
                                               submission.broker_submission_id,
                                               comment_body)
                response = comment_on_pangaea_ticket(
                    login_token=login_token,
                    ticket_key=ticket_key,
                    comment_body=comment_body,
                    submission=submission,
                )
                apply_default_task_retry_policy(response,
                                                comment_on_pangaea_ticket_task,
                                                submission)
                return True
            else:
                logger.error(
                    msg='comment_on_pangaea_ticket_task. Cannot access PersistendIdentifier for study')
                return None
        else:
            return None
    else:
        return TaskProgressReport.CANCELLED


@celery.task(name='tasks.check_for_pangaea_doi_task', base=SubmissionTask)
def check_for_pangaea_doi_task(resource_credential_id=None):
    logger.info(
        msg='check_for_pangaea_doi_task resource_credential_id={}'.format(
            resource_credential_id))
    task_report, created = TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=check_for_pangaea_doi_task)
    # FIXME: there must be a better way to get a specific login to pangagea than querying db with an id !
    try:
        resource_cred = ResourceCredential.objects.get(
            pk=resource_credential_id)
    except ResourceCredential.DoesNotExist as e:
        logger.error(
            msg='check_for_pangaea_doi_task. Error getting object for '
                'resource_credential_id={}. {}'.format(resource_credential_id,
                                                       e))
        return None
    response = request_pangaea_login_token(resource_credential=resource_cred)
    try:
        SubmissionTransferHandler.raise_response_exceptions(response)
    except SubmissionTransferHandler.TransferError as e:
        logger.error(
            msg='check_for_pangaea_doi_task. Request login_token. '
                'General Transfer error: {}'.format(e))
        return None
    login_token = parse_pangaea_login_token_response(response)

    # TODO: move this to top and check there are submissiont to fetch doi for, if not no request for login token is needed
    submissions = Submission.objects.get_submitted_submissions_containing_reference(
        reference_type=AdditionalReference.PANGAEA_JIRA_TICKET)
    logger.info(
        msg='check_for_pangaea_doi_task. pulling pangaea dois for {} '
            'submissions'.format(len(submissions)))
    for sub in submissions:
        pull_pangaea_dois(sub, login_token)


# HELP-DESK TASKS --------------------------------------------------------------

@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.get_gfbio_user_email_task', base=SubmissionTask)
def get_gfbio_user_email_task(submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=get_gfbio_user_email_task)
    logger.info(
        msg='get_gfbio_user_email_task submission_id={0}'.format(submission_id)
    )
    res = {
        'user_email': site_configuration.contact,
        'user_full_name': '',
        'first_name': '',
        'last_name': '',
    }
    if submission is not None and site_configuration is not None:
        if site_configuration.use_gfbio_services:
            response = gfbio_get_user_by_id(submission.submitting_user,
                                            site_configuration, submission)
            try:
                # content = json.loads(response.content)
                response_json = response.json()
                content = response_json if isinstance(response_json,
                                                      dict) else {}
                res['user_email'] = content.get('emailaddress',
                                                site_configuration.contact)
                res['user_full_name'] = content.get('fullname', '')
                res['first_name'] = content.get('firstname', '')
                res['last_name'] = content.get('lastname', '')
                submission.submitting_user_common_information = '{0},{1};{2}'.format(
                    res['last_name'], res['first_name'], res['user_email'])
                submission.save()
            except ValueError as e:
                logger.error(
                    msg='get_gfbio_user_email_task. load json response. '
                        'Value error: {}'.format(e))
        return res
    else:
        return TaskProgressReport.CANCELLED


@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.create_helpdesk_ticket_task', base=SubmissionTask)
def create_helpdesk_ticket_task(prev_task_result=None, submission_id=None,
                                summary=None,
                                description=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=create_helpdesk_ticket_task)
    if submission is not None and site_configuration is not None:
        existing_tickets = submission.additionalreference_set.filter(
            Q(type=AdditionalReference.GFBIO_HELPDESK_TICKET) & Q(primary=True))
        logger.info(
            msg='create_helpdesk_ticket_task submission_id={} | summary={} | description={}'.format(
                submission_id, summary, description))
        if len(existing_tickets):
            response = gfbio_helpdesk_comment_on_ticket(
                site_config=site_configuration,
                ticket_key=existing_tickets.first().reference_key,
                comment_body='{}. {}'.format(summary, description),
                submission=submission,
            )
        else:
            data = gfbio_prepare_create_helpdesk_payload(
                reporter=prev_task_result,
                site_config=site_configuration,
                submission=submission)
            response = gfbio_helpdesk_create_ticket(
                site_config=site_configuration,
                submission=submission,
                data=data,
                reporter=prev_task_result
            )
            apply_default_task_retry_policy(response,
                                            create_helpdesk_ticket_task,
                                            submission)
            if not len(existing_tickets):
                try:
                    content = response.json()
                except JSONDecodeError as e:
                    logger.warning(
                        'create_helpdesk_ticket_task submission_id={0} JSONDecodeError={1}'.format(
                            submission_id, e))
                    content = {}
                submission.additionalreference_set.create(
                    type=AdditionalReference.GFBIO_HELPDESK_TICKET,
                    # reference_key=json.loads(response.content).get('key',
                    #                                                'no_key_available'),
                    reference_key=content.get('key', 'no_key_available'),
                    # reference_key=json.loads(response.content.decode('utf-8')).get(
                    #     'key', 'no_key_available'),
                    primary=True
                )

    else:
        return TaskProgressReport.CANCELLED


@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.comment_helpdesk_ticket_task', base=SubmissionTask)
def comment_helpdesk_ticket_task(prev_task_result=None, comment_body=None,
                                 submission_id=None, target_archive=None):
    logger.info(
        msg='comment_helpdesk_ticket_task submission_id={0} | '
            'prev_task_result={1} | '
            'comment_body={2} | '
            'target_archive={3}'.format(
            submission_id, prev_task_result, comment_body, target_archive)
    )

    # No submission will be returned if submission.status is error
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=comment_helpdesk_ticket_task,
        get_closed_submission=True)

    if submission is not None and site_configuration is not None:
        existing_tickets = submission.additionalreference_set.filter(
            Q(type=AdditionalReference.GFBIO_HELPDESK_TICKET) & Q(primary=True))
        if prev_task_result is True:
            if target_archive == ENA:
                study_pid = submission.brokerobject_set.filter(type='study'). \
                    first().persistentidentifier_set.filter(
                    pid_type='PRJ').first()
                comment_body = 'Submission to ENA has been successful. Study is accessible via ENA ' \
                               'Accession No. {}. broker_submission_id: {}.'.format(
                    study_pid.pid, submission.broker_submission_id)
            elif target_archive == Submission.PANGAEA:
                pass
            else:
                pass
        else:
            comment_body = 'Submission to {} returned error(s). ' \
                           'broker_submission_id: {}.'.format(target_archive,
                                                              submission.broker_submission_id)
        if len(existing_tickets):
            response = gfbio_helpdesk_comment_on_ticket(
                site_config=site_configuration,
                ticket_key=existing_tickets.first().reference_key,
                comment_body=comment_body,
                submission=submission,
            )
            apply_default_task_retry_policy(response,
                                            comment_helpdesk_ticket_task,
                                            submission)
    else:
        return TaskProgressReport.CANCELLED


@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.attach_file_to_helpdesk_ticket_task',
             base=SubmissionTask)
def attach_file_to_helpdesk_ticket_task(kwargs=None, submission_id=None):
    logger.info(
        msg='attach_file_to_helpdesk_ticket_task submission_id={} '.format(
            submission_id))
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=attach_file_to_helpdesk_ticket_task,
        get_closed_submission=True)
    if submission is not None and site_configuration is not None:
        existing_tickets = submission.additionalreference_set.filter(
            Q(type=AdditionalReference.GFBIO_HELPDESK_TICKET) & Q(primary=True))
        logger.info(
            msg='attach_file_to_helpdesk_ticket_task tickets found={0}'.format(
                existing_tickets))

        # TODO: if no ticket available, the reason may that this task is started independened of
        # submission transfer chain that creates the ticket, so a proper retry has to be
        # implemented
        if len(existing_tickets):
            # TODO: be more specific on PrimaryDataFile to retrieve, same for ticket above
            # pd = submission.primarydatafile_set.first()
            # pd = submission.submissionupload_set.get(pk=submission_upload_id)
            # TODO: extend to loop over all uploads with attach=True
            pd = submission.submissionupload_set.filter(attach_to_ticket=True).first()
            if pd:
                logger.info(
                    msg='attach_file_to_helpdesk_ticket_task PrimaryDataFile found {0} '.format(
                        pd))
                # TODO: access media nginx https://stackoverflow.com/questions/8370658/how-to-serve-django-media-files-via-nginx
                response = gfbio_helpdesk_attach_file_to_ticket(
                    site_config=site_configuration,
                    ticket_key=existing_tickets.first().reference_key,
                    file=pd.file,
                    submission=submission
                )
                logger.info(
                    msg='attach_file_to_helpdesk_ticket_task repsonse status={0} content={1}'.format(
                        response.status_code, response.content))
                apply_default_task_retry_policy(response,
                                                attach_file_to_helpdesk_ticket_task,
                                                submission)
                return True
            else:
                logger.info(
                    msg='attach_file_to_helpdesk_ticket_task no PrimaryDataFile found. submission_id={} '.format(
                        submission_id))
                return False
        else:
            logger.info(
                msg='attach_file_to_helpdesk_ticket_task no tickets found. submission_id={} '.format(
                    submission_id))
            apply_timebased_task_retry_policy(
                task=attach_file_to_helpdesk_ticket_task,
                submission=submission,
                no_of_tickets=len(existing_tickets),
            )
            return False
    else:
        return TaskProgressReport.CANCELLED


@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.generic_comment_helpdesk_ticket_task',
             base=SubmissionTask)
def generic_comment_helpdesk_ticket_task(prev_task_result=None,
                                         comment_body=None, submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=comment_helpdesk_ticket_task,
        get_closed_submission=True)
    if submission is not None and site_configuration is not None:
        existing_tickets = submission.additionalreference_set.filter(
            Q(type=AdditionalReference.GFBIO_HELPDESK_TICKET) & Q(primary=True))
        comment_body += ' broker_submisson_id: {}'.format(
            submission.broker_submission_id)
        if len(existing_tickets):
            response = gfbio_helpdesk_comment_on_ticket(
                site_config=site_configuration,
                ticket_key=existing_tickets.first().reference_key,
                comment_body=comment_body,
                submission=submission,
            )
            apply_default_task_retry_policy(response,
                                            generic_comment_helpdesk_ticket_task,
                                            submission)
    else:
        return TaskProgressReport.CANCELLED


# TODO: Discuss and Plan if/when/how use more of celerys buil-in retry stuff
#       vs. own implementation. Evaluate Celery 4.3.0
# TODO: Bug in celery https://github.com/celery/celery/issues/4661
#      https://github.com/celery/celery/issues/4898
# TODO: reminder: always_eager = True for local settings
# @celery.task(bind=True, max_retries=SUBMISSION_MAX_RETRIES,
#              name='tasks.add_pangaealink_to_helpdesk_ticket_task',
#              base=SubmissionTask
#              )
# def add_pangaealink_to_helpdesk_ticket_task(self, prev_task_result=None,
#                                             submission_id=None):
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.add_pangaealink_to_helpdesk_ticket_task',
             base=SubmissionTask
             )
def add_pangaealink_to_helpdesk_ticket_task(prev_task_result=None,
                                            submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id,
        task=add_pangaealink_to_helpdesk_ticket_task,
        get_closed_submission=True
    )
    if submission is not None and site_configuration is not None:

        existing_tickets = submission.additionalreference_set.filter(
            Q(type=AdditionalReference.GFBIO_HELPDESK_TICKET) & Q(primary=True))

        pangaea_tickets = submission.additionalreference_set.filter(
            Q(type=AdditionalReference.PANGAEA_JIRA_TICKET) & Q(primary=True))

        latest_ticket = pangaea_tickets.last()

        comment_body = '[Pangaea Ticket {1}|{0}{1}]'.format(
            PANGAEA_ISSUE_VIEW_URL,
            latest_ticket.reference_key)

        if len(existing_tickets):
            response = gfbio_helpdesk_comment_on_ticket(
                site_config=site_configuration,
                ticket_key=existing_tickets.first().reference_key,
                comment_body=comment_body,
                submission=submission,
            )

            apply_default_task_retry_policy(response,
                                            add_pangaealink_to_helpdesk_ticket_task,
                                            submission)
    else:
        return TaskProgressReport.CANCELLED

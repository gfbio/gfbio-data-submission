# -*- coding: utf-8 -*-
import logging

from django.core.mail import mail_admins
from django.utils.encoding import smart_text
from requests import Response
from gfbio_submissions.brokerage.configuration.settings import \
    TASK_FAIL_SUBJECT_TEMPLATE, TASK_FAIL_TEXT_TEMPLATE, SUBMISSION_MAX_RETRIES, \
    SUBMISSION_UPLOAD_MAX_RETRIES, SUBMISSION_UPLOAD_RETRY_DELAY
from gfbio_submissions.brokerage.exceptions import TransferInternalError, \
    raise_response_exceptions, TransferClientError, raise_no_ticket_exception, \
    NoTicketAvailableError
from gfbio_submissions.brokerage.models import TaskProgressReport, Submission, AuditableTextData
from gfbio_submissions.brokerage.utils.ena import send_submission_to_ena
from gfbio_submissions.generic.models import ResourceCredential

logger = logging.getLogger(__name__)


def _safe_get_submission(submission_id, include_closed):
    submission = None
    try:
        submission = Submission.objects.get_non_error_submission(
            submission_id) if include_closed else Submission.objects.get_open_submission(
            submission_id)
    except Submission.DoesNotExist as e:
        logger.warning(
            'task_utils.py | _safe_get_submission | error {0}'.format(e))
    return submission


def _safe_get_submitted_submission(submission_id):
    submission = None
    try:
        submission = Submission.objects.get_submitted_and_error_submissions(
            submission_id)
    except Submission.DoesNotExist as e:
        logger.warning(
            'task_utils.py | _safe_get_submitted_submission | error {0}'.format(
                e))
    return submission


# TODO: refactor or merge if possible. only submision owners siteconf relevant
def _safe_get_site_config(submission):
    site_config = None
    if submission and submission.user:
        site_config = submission.user.site_configuration
        # try:
        #     site_config = SiteConfiguration.objects.get_site_configuration(
        #         submission.site)
        # except SiteConfiguration.DoesNotExist as e:
        #     logger.warning(
        #         'task_utils.py | _safe_get_site_config | error {0}'.format(e))
    return site_config


def _get_submitted_submission_and_site_configuration(submission_id, task):
    try:
        submission = _safe_get_submitted_submission(submission_id)
        if submission is None:
            logger.warning(
                'task_utils.py | '
                '_get_submitted_submission_and_site_configuration | '
                'raise TransferInternalError | no submission for pk={0} |'
                ' task={1}'.format(
                    submission_id,
                    task.name
                )
            )
            raise TransferInternalError(
                'SubmissionTransferHandler | '
                '_get_submitted_submission_and_site_configuration | '
                'no Submission available for submission pk={0}.'.format(
                    submission_id,
                )
            )
        site_config = _safe_get_site_config(submission)
        if site_config is None:
            logger.warning(
                'task_utils.py | '
                '_get_submitted_submission_and_site_configuration | '
                'raise TransferInternalError | no site_config for submission '
                'with pk={0} | task={1}'.format(
                    submission_id,
                    task.name
                )
            )
            raise TransferInternalError(
                'SubmissionTransferHandler | '
                '_get_submitted_submission_and_site_configuration | '
                'no SiteConfiguration available for site={0}.'.format(
                    submission.site,
                )
            )
        if task:
            TaskProgressReport.objects.create_initial_report(
                submission=submission,
                task=task)
        return submission, site_config
    except TransferInternalError as e:
        logger.warning(
            'task_utils.py | _get_submitted_submission_and_site_configuration '
            '| task={0} '
            '| submission pk={1} | return={2} | '
            'TransferInternalError={3}'.format(
                task.name,
                submission_id,
                (TaskProgressReport.CANCELLED, None),
                e
            )
        )
        return TaskProgressReport.CANCELLED, None


def _get_submission_and_site_configuration(submission_id, task,
                                           include_closed):
    site_config = None
    try:
        submission = _safe_get_submission(submission_id, include_closed)
        if submission is None:
            logger.warning(
                'task_utils.py | _get_submission_and_site_configuration | '
                'raise TransferInternalError | no submission for pk={0} |'
                ' include_closed={1} | task={2}'.format(
                    submission_id,
                    include_closed,
                    task.name
                )
            )
            raise TransferInternalError(
                'SubmissionTransferHandler | get_submission_and_site_configuration | '
                'no Submission available for submission pk={0}. include_closed={1}'.format(
                    submission_id,
                    include_closed,
                )
            )
        site_config = _safe_get_site_config(submission)
        if site_config is None:
            logger.warning(
                'task_utils.py | _get_submission_and_site_configuration | '
                'raise TransferInternalError | no site_config for submission '
                'with pk={0} | include_closed={1} | task={2}'.format(
                    submission_id,
                    include_closed,
                    task.name
                )
            )
            raise TransferInternalError(
                'SubmissionTransferHandler | get_submission_and_site_configuration | '
                'no SiteConfiguration available for site={0}.'.format(
                    submission.site,
                )
            )
    except TransferInternalError as e:
        logger.warning(
            'task_utils.py | _get_submission_and_site_configuration | task={0} '
            '| submission pk={0} | include_closed={1} | return={2} | '
            'TransferInternalError={3}'.format(
                task.name,
                submission_id,
                include_closed,
                (TaskProgressReport.CANCELLED, None),
                e
            )
        )
        submission = TaskProgressReport.CANCELLED
    # TODO: this may have to move elsewhere since TaskReport need to be created in everytask
    #   but in the last months some of the newer tasks are not Calling this method
    if task:
        TaskProgressReport.objects.create_initial_report(
            submission=None if submission == TaskProgressReport.CANCELLED else submission,
            task=task)
    return submission, site_config


def send_task_fail_mail(broker_submission_id, task, additional_text=''):
    logger.info('task_utils.py | send_task_fail_mail | '
                'broker_submission_id={0} | '
                'task={1}'.format(broker_submission_id, task.name))
    mail_admins(
        subject=TASK_FAIL_SUBJECT_TEMPLATE.format(
            task.name,
            broker_submission_id
        ),
        message=TASK_FAIL_TEXT_TEMPLATE.format(
            task.name,
            task.request.retries,
            broker_submission_id,
            additional_text,
        ),
    )
    return TaskProgressReport.CANCELLED


def get_submission_and_site_configuration(submission_id, task,
                                          include_closed):
    logger.info('task_utils.py | get_submission_and_site_configuration | '
                ' submission_id={0} | task={1} | include_closed={2}'
                ''.format(submission_id, task.name, include_closed))
    try:
        return _get_submission_and_site_configuration(submission_id, task,
                                                      include_closed)
    except TransferInternalError as ce:
        logger.warning(
            'task_utils.py | get_submission_and_site_configuration | task={0} '
            '| submission pk={1} | include_closed={2} | will '
            'send_task_fail_mail TransferInternalError={3}'.format(
                task.name,
                submission_id,
                include_closed,
                ce
            )
        )
        return send_task_fail_mail('*', task), None


def get_submitted_submission_and_site_configuration(submission_id, task):
    logger.info(
        'task_utils.py | get_submitted_submission_and_site_configuration | '
        ' submission_id={0} | task={1} |'
        ''.format(submission_id, task.name))
    try:
        return _get_submitted_submission_and_site_configuration(submission_id,
                                                                task)
    except TransferInternalError as ce:
        logger.warning(
            'task_utils.py | get_submitted_submission_and_site_configuration '
            '| task={0} '
            '| submission pk={1} |  will '
            'send_task_fail_mail TransferInternalError={2}'.format(
                task.name,
                submission_id,
                ce
            )
        )
        return send_task_fail_mail('*', task), None


def raise_transfer_server_exceptions(response, task, max_retries,
                                     broker_submission_id='broker_submission_id_not_available'):
    logger.info('task_utils.py | raise_transfer_server_exceptions | '
                'resonse.status_code={0} | broker_submission_id={1} | '
                'task={2} | retries={3}'.format(response.status_code,
                                                broker_submission_id, task,
                                                task.request.retries))
    if task.request.retries >= max_retries:
        logger.info('task_utils.py | raise_transfer_server_exceptions | '
                    'task.request.retries={0} >= max_retries={1} | '
                    'send_task_fail_mail'.format(task.request.retries,
                                                 max_retries))
        return send_task_fail_mail(broker_submission_id, task,
                                   'Maximum number of retries exceeded')
    else:
        try:
            logger.info('task_utils.py | raise_transfer_server_exceptions | '
                        'raise_response_exceptions | task={0} | response={1} | '
                        ''.format(task.name, response))
            raise_response_exceptions(response)
        except TransferClientError as ce:
            logger.info('task_utils.py | TransferClientError, '
                        'send_task_fail_mail | task={0} | response={1} | '
                        'error={2}'.format(task, response, ce))
            return send_task_fail_mail(broker_submission_id, task,
                                       'Client error:\n{0}'.format(ce))


def retry_no_ticket_available_exception(task, broker_submission_id,
                                        number_of_tickets):
    try:
        raise_no_ticket_exception(number_of_tickets)
    except NoTicketAvailableError as e:
        if task.request.retries >= SUBMISSION_UPLOAD_MAX_RETRIES:
            logger.info('task_utils.py | retry_no_ticket_available_exception | '
                        'task.request.retries={0} >= max_retries={1} | '
                        'send_task_fail_mail'.format(task.request.retries,
                                                     SUBMISSION_UPLOAD_MAX_RETRIES))
            send_task_fail_mail(broker_submission_id, task)
            return TaskProgressReport.CANCELLED
        else:
            logger.info('task_utils.py | retry_no_ticket_available_exception | '
                        'task={0} | error={1} | '
                        'retries={2}'.format(task.name, e,
                                             task.request.retries))
            task.retry(
                exc=e,
                countdown=(task.request.retries + 1
                           ) * SUBMISSION_UPLOAD_RETRY_DELAY)


def jira_error_auto_retry(jira_client, task, broker_submission_id,
                          max_retries=SUBMISSION_MAX_RETRIES):
    logger.info('task_utils.py | jira_error_auto_retry | '
                'broker_submission_id={0} | task={1} | max_retries={2}'
                ''.format(broker_submission_id, task.name, max_retries))
    if jira_client and jira_client.error:
        return raise_transfer_server_exceptions(
            response=jira_client.error.response,
            task=task,
            broker_submission_id=broker_submission_id,
            max_retries=max_retries,
        )
    return True


def request_error_auto_retry(response, task, broker_submission_id,
                             max_retries=SUBMISSION_MAX_RETRIES):
    logger.info('task_utils.py | request_error_auto_retry | '
                'broker_submission_id={0} | task={1} | max_retries={2}'
                ''.format(broker_submission_id, task.name, max_retries))
    if response.status_code and response.status_code >= 400:
        return raise_transfer_server_exceptions(
            response, task, broker_submission_id, max_retries
        )
    return True

def send_data_to_ena_for_validation_or_test(task, submission_id, action):
    # get submission
    submission = Submission.objects.get(pk=submission_id)
    if not Submission:
        TaskProgressReport.objects.create_initial_report(
            task=task)
        return 'No submission found with pk {}'.format(submission_id)

    # create initial task report
    TaskProgressReport.objects.create_initial_report(
        submission=submission,
        task=task)

    # get correct resource cred
    request_server = 'ENA' if action == 'VALIDATE' else 'ENA-Testserver'
    resource_cred = ResourceCredential.objects.filter(title=request_server).first()
    if resource_cred is None:
        return 'No resource credentials found for {}'.format(request_server)

    # check for XML files
    ena_submission_data = AuditableTextData.objects.assemble_ena_submission_data(
        submission=submission)
    if ena_submission_data == {}:
        return 'No XML files found'

    # submit data to ENA
    try:
        response, request_id = send_submission_to_ena(submission,
                                                      resource_cred,
                                                      ena_submission_data,
                                                      action=action,
                                                      )
        res = raise_transfer_server_exceptions(
            response=response,
            task=task,
            broker_submission_id=submission.broker_submission_id,
            max_retries=SUBMISSION_MAX_RETRIES)
    except ConnectionError as e:
        logger.error(
            msg='connection_error {}.url={} title={}'.format(
                e,
                resource_cred.url,
                resource_cred.title)
        )
        response = Response()
    return str(request_id), response.status_code, smart_text(
        response.content)

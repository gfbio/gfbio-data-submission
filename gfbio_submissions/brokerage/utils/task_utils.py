# -*- coding: utf-8 -*-
import logging

from django.core.mail import mail_admins

from gfbio_submissions.brokerage.configuration.settings import \
    TASK_FAIL_SUBJECT_TEMPLATE, TASK_FAIL_TEXT_TEMPLATE, SUBMISSION_MAX_RETRIES, \
    SUBMISSION_UPLOAD_MAX_RETRIES, SUBMISSION_UPLOAD_RETRY_DELAY
from gfbio_submissions.brokerage.exceptions import TransferInternalError, \
    raise_response_exceptions, TransferClientError, raise_no_ticket_exception, \
    NoTicketAvailableError
from gfbio_submissions.brokerage.models import TaskProgressReport, Submission, \
    SiteConfiguration

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


def _safe_get_site_config(submission):
    site_config = None
    if submission:
        try:
            site_config = SiteConfiguration.objects.get_site_configuration(
                submission.site)
        except SiteConfiguration.DoesNotExist as e:
            logger.warning(
                'task_utils.py | _safe_get_site_config | error {0}'.format(e))
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
        if task:
            TaskProgressReport.objects.create_initial_report(
                submission=submission,
                task=task)
        return submission, site_config
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
        return TaskProgressReport.CANCELLED, None


def send_task_fail_mail(broker_submission_id, task):
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
                                     broker_submission_id='NO_BSI'):
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
        return send_task_fail_mail(broker_submission_id, task)
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
            return send_task_fail_mail(broker_submission_id, task)


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

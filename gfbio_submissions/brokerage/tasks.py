# -*- coding: utf-8 -*-
import logging
import os
from pprint import pprint

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
    get_submission_and_site_configuration
from gfbio_submissions.users.models import User
from .configuration.settings import BASE_HOST_NAME, \
    PRIMARY_DATA_FILE_MAX_RETRIES, PRIMARY_DATA_FILE_DELAY, \
    SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from .models import BrokerObject, \
    AuditableTextData, RequestLog, AdditionalReference, TaskProgressReport, \
    Submission, SubmissionUpload, SiteConfiguration
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
        # logger.info('SubmissionTask | {0} | on_retry | ')
        print('\n\n+++++++++ on_retry\n\n')
        # TODO: capture this idea of reporting to sentry
        # sentrycli.captureException(exc)
        TaskProgressReport.objects.update_report_on_exception(
            'RETRY', exc, task_id, args, kwargs, einfo)
        super(SubmissionTask, self).on_retry(exc, task_id, args, kwargs, einfo)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        print('\n\n+++++++++ on_failure\n\n')
        TaskProgressReport.objects.update_report_on_exception(
            'FAILURE', exc, task_id, args, kwargs, einfo)
        super(SubmissionTask, self).on_failure(exc, task_id, args, kwargs,
                                               einfo)

    def on_success(self, retval, task_id, args, kwargs):
        print('\n\n+++++++++ on_success\n\n')
        pprint(self.trail)
        TaskProgressReport.objects.update_report_on_success(
            retval, task_id, args, kwargs)
        super(SubmissionTask, self).on_success(retval, task_id, args, kwargs)

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        print('\n\n+++++++++ after return\n\n')
        pprint(self.trail)
        TaskProgressReport.objects.update_report_after_return(status, task_id)
        super(SubmissionTask, self).after_return(
            status, retval, task_id, args, kwargs, einfo)


# common tasks -----------------------------------------------------------------

# TODO: re-consider if needed when workflow is clear
@celery.task(name='tasks.check_for_molecular_content_in_submission_task',
             base=SubmissionTask)
def check_for_molecular_content_in_submission_task(submission_id=None):
    logger.info(
        msg='check_for_molecular_content_in_submission_task. get submission'
            ' with pk={}.'.format(submission_id))
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id,
        task=check_for_molecular_content_in_submission_task
    )
    logger.info(
        msg='check_for_molecular_content_in_submission_task. '
            'process submission={}.'.format(submission.broker_submission_id))

    path = os.path.join(
        os.getcwd(),
        'gfbio_submissions/brokerage/schemas/ena_requirements.json')
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


@celery.task(name='tasks.trigger_submission_transfer', base=SubmissionTask)
def trigger_submission_transfer(previous_task_result=None, submission_id=None):
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
    transfer_handler.initiate_submission_process(
        release=submission.release,
    )


@celery.task(name='tasks.trigger_submission_transfer_for_updates',
             base=SubmissionTask)
def trigger_submission_transfer_for_updates(previous_task_result=None,
                                            broker_submission_id=None):
    logger.info(
        msg='trigger_submission_transfer_for_updates. get submission_id with broker_submission_id={}.'.format(
            broker_submission_id)
    )
    submission_id = Submission.objects.get_open_submission_id_for_bsi(
        broker_submission_id=broker_submission_id)
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id,
        task=trigger_submission_transfer_for_updates
    )

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
#   all other target do nothing
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


# TODO: move elsewhere ? -------------------------------------------------------

# def send_task_fail_mail(broker_submission_id, task):
#     mail_admins(
#         subject=TASK_FAIL_SUBJECT_TEMPLATE.format(
#             task.name,
#             broker_submission_id
#         ),
#         message=TASK_FAIL_TEXT_TEMPLATE.format(
#             task.name,
#             task.request.retries,
#             broker_submission_id,
#         ),
#     )
#     return TaskProgressReport.CANCELLED
#
#
# def raise_transfer_server_exceptions(response, task, broker_submission_id,
#                                      max_retries):
#     if task.request.retries >= max_retries:
#         return send_task_fail_mail(broker_submission_id, task)
#     else:
#         try:
#             SubmissionTransferHandler.raise_response_exceptions(response)
#         except SubmissionTransferHandler.TransferClientError as ce:
#             return send_task_fail_mail(broker_submission_id, task)
#
#
# def jira_error_auto_retry(jira_client, task, broker_submission_id,
#                           max_retries=SUBMISSION_MAX_RETRIES):
#     if jira_client and jira_client.error:
#         return raise_transfer_server_exceptions(
#             response=jira_client.error.response,
#             task=task,
#             broker_submission_id=broker_submission_id,
#             max_retries=max_retries,
#         )
#     return True


# TODO: s.o. -------------------------------------------------------------------

def apply_timebased_task_retry_policy(task, submission, no_of_tickets):
    try:
        SubmissionUpload.raise_ticket_exeptions(no_of_tickets)
    except SubmissionUpload.NoTicketAvailableError as e:
        logger.warning(
            msg='{} SubmissionUpload.NoTicketAvailableError {}'.format(
                task.name, e)
        )
        logger.info(
            msg='{} SubmissionUpload.NoTicketAvailableError number_of_retries={}'
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
    except TransferServerError as e:
        logger.warning(
            msg='{} TransferServerError {}'.format(
                task.name, e)
        )
        logger.info(
            msg='{} TransferServerError number_of_retries={}'
                ''.format(task.name, task.request.retries)
        )
        if task.request.retries == SUBMISSION_MAX_RETRIES:
            logger.warning(
                msg='{} TransferServerError (mail_admins) max_retries={}'
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
                msg='{} TransferServerError retry after delay'
                    ''.format(task.name)
            )
            # TODO: for testing 4.3
            try:
                task.retry(
                    exc=e,
                    throw=False,
                    countdown=(
                                      task.request.retries + 1) * SUBMISSION_RETRY_DELAY,
                )
            # TODO: for testing 4.3
            except RuntimeError as re:
                print('\n\n RUNTIME ERROR RETRY ')
                pprint(re)

    except TransferClientError as e:
        logger.warning(
            msg='{} TransferClientError {}'.format(
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
                submission.brokerobject_set.all().delete()
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

@celery.task(name='tasks.delete_related_auditable_textdata_task',
             base=SubmissionTask)
def delete_related_auditable_textdata_task(prev_task_result=None,
                                           submission_id=None):
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id,
        task=delete_related_auditable_textdata_task,
        get_closed_submission=True,
    )
    logger.info(
        msg='delete_related_auditable_textdata_task. '
            'previous_task_result={} | submission_id={}'.format(
            prev_task_result,
            submission_id)
    )
    if submission is not None and len(submission.brokerobject_set.all()) > 0:
        logger.info(
            msg='delete_related_auditable_textdata_task. start deleting. '
                'submission_id={}'.format(submission_id)
        )
        with transaction.atomic():
            submission.auditabletextdata_set.all().delete()
        logger.info(
            msg='delete_related_auditable_textdata_task. done deleting. '
                'submission_id={}'.format(submission_id)
        )
    else:
        logger.info(
            msg='delete_related_auditable_textdata_task. no submission. '
                'return CANCELLED '
                'submission_id={}'.format(submission_id)
        )
        return TaskProgressReport.CANCELLED


@celery.task(name='tasks.prepare_ena_submission_data_task',
             base=SubmissionTask)
def prepare_ena_submission_data_task(prev_task_result=None, submission_id=None):
    submission = SubmissionTransferHandler.get_submission_for_task(
        submission_id=submission_id,
        task=prepare_ena_submission_data_task,
        get_closed_submission=True,
    )
    logger.info(
        msg='prepare_ena_submission_data_task. start prepare_ena_data '
            'previous_task_result={} | submission_id={}'.format(
            prev_task_result,
            submission_id)
    )
    if submission is not None and len(
            submission.brokerobject_set.all()) > 0:
        with transaction.atomic():
            submission.auditabletextdata_set.all().delete()
        ena_submission_data = prepare_ena_data(submission=submission)
        logger.info(
            msg='prepare_ena_submission_data_task. finished prepare_ena_data '
                'submission_id={}'.format(submission_id)
        )
        store_ena_data_as_auditable_text_data(submission=submission,
                                              data=ena_submission_data)
        # TODO: this will become obsolete once, data is taken from AuditableTextData ....
        logger.info(
            msg='prepare_ena_submission_data_task. finished '
                'store_ena_data_as_auditable_text_data '
                'submission_id={}'.format(submission_id)
        )
        return ena_submission_data
    else:
        logger.info(
            msg='prepare_ena_submission_data_task. no submission or '
                'no brokerobjects. return CANCELLED '
                'submission_id={}'.format(submission_id)
        )
        return TaskProgressReport.CANCELLED


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
        if ena_submission_data == {}:
            return TaskProgressReport.CANCELLED
        try:
            response, request_id = send_submission_to_ena(submission,
                                                          site_configuration.ena_server,
                                                          ena_submission_data,
                                                          )
            apply_default_task_retry_policy(
                response,
                transfer_data_to_ena_task,
                submission,
            )
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

@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.create_pangaea_issue_task', base=SubmissionTask)
def create_pangaea_issue_task(login_token=None, submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=create_pangaea_issue_task
    )
    if submission is not None and site_configuration is not None:
        jira_client = JiraClient(
            resource=site_configuration.pangaea_jira_server,
            token_resource=site_configuration.pangaea_token_server)
        jira_client.create_pangaea_issue(site_config=site_configuration,
                                         submission=submission)
        if jira_client.error:
            apply_default_task_retry_policy(
                jira_client.error.response,
                create_pangaea_issue_task,
                submission
            )
        if jira_client.issue:
            submission.additionalreference_set.create(
                type=AdditionalReference.PANGAEA_JIRA_TICKET,
                reference_key=jira_client.issue.key,
                primary=True
            )
            return {
                'issue_key': jira_client.issue.key,
            }
    else:
        return TaskProgressReport.CANCELLED


# TODO: this one relies on prevoius task: create_pangaea_issue_task
# TODO: this task relies on additional kwargs, as returned from task above
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.add_accession_to_pangaea_issue_task',
             base=SubmissionTask)
def add_accession_to_pangaea_issue_task(kwargs=None, submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=add_accession_to_pangaea_issue_task
    )
    if submission is not None and site_configuration is not None \
            and 'issue_key' in kwargs.keys():

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

            if jira_client.error:
                apply_default_task_retry_policy(
                    jira_client.error.response,
                    add_accession_to_pangaea_issue_task,
                    submission
                )
    else:
        return TaskProgressReport.CANCELLED


# TODO: this one relies on prevoius task: attach_to_pangaea_issue_task
# TODO: this task relies on additional kwargs, as returned from task above
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.attach_to_pangaea_issue_task',
             base=SubmissionTask)
def attach_to_pangaea_issue_task(kwargs={}, submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=attach_to_pangaea_issue_task
    )
    if submission is not None and site_configuration is not None \
            and 'issue_key' in kwargs.keys():

        ticket_key = kwargs.get('issue_key', 'None')
        jira_client = JiraClient(
            resource=site_configuration.pangaea_jira_server,
            token_resource=site_configuration.pangaea_token_server
        )
        jira_client.attach_to_pangaea_issue(key=ticket_key,
                                            submission=submission)
        if jira_client.error:
            apply_default_task_retry_policy(
                jira_client.error.response,
                attach_to_pangaea_issue_task,
                submission
            )
        return {'issue_key': ticket_key}

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
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.get_user_email_task', base=SubmissionTask)
def get_user_email_task(submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=get_user_email_task)
    logger.info(
        msg='get_user_email_task submission_id={0}'.format(submission_id)
    )
    res = {
        'user_email': site_configuration.contact,
        'user_full_name': '',
        'first_name': '',
        'last_name': '',
    }
    if submission is not None and site_configuration is not None:
        if site_configuration.use_gfbio_services:
            logger.info(
                msg='get_user_email_task submission_id={0} | use_gfbio_services={1}'.format(
                    submission_id, site_configuration.use_gfbio_services)
            )
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

        logger.info(
            msg='get_user_email_task submission_id={0} | use_gfbio_services={1} | return={2}'.format(
                submission_id, site_configuration.use_gfbio_services,
                res)
        )
        submission.submitting_user_common_information = '{0};{1}'.format(
            res['user_full_name'], res['user_email'])
        submission.save()
        return res
    else:
        logger.info(
            msg='get_user_email_task submission_id={0} | use_gfbio_services={1} | return={2}'.format(
                submission_id, site_configuration.use_gfbio_services,
                TaskProgressReport.CANCELLED)
        )
        return TaskProgressReport.CANCELLED


@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.create_submission_issue_task', base=SubmissionTask)
def create_submission_issue_task(prev_task_result=None, submission_id=None):
    # TODO: refactor after jira access has been refactored
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=create_submission_issue_task)

    # TODO: test task without check for null, what happens when errors occur here, not caused inside a
    #  method called here

    # TODO: like TODO above, perhaps this check can be omitted if above is re-implemented to prevent NONE
    if submission is not None and site_configuration is not None:

        # TODO: only needed for comment on ticket, thus remove
        # TODO: althouht filter for primary should deliver only on ticket, a dedicated manager method
        #   would be cleaner (no .first() on query set)
        # existing_tickets = submission.additionalreference_set.filter(
        #     Q(type=AdditionalReference.GFBIO_HELPDESK_TICKET) & Q(primary=True))

        # TODO: abstract/capsule logging. keep extensive logging while calls to log
        #  are abstracted for cleaber code in task
        logger.info(
            msg='create_submission_issue_task submission_id={}'.format(
                submission_id, ))

        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.create_submission_issue(reporter=prev_task_result,
                                            site_config=site_configuration,
                                            submission=submission)
        if jira_client.error:
            apply_default_task_retry_policy(jira_client.error.response,
                                            create_submission_issue_task,
                                            submission)
        elif jira_client.issue:
            submission.additionalreference_set.create(
                type=AdditionalReference.GFBIO_HELPDESK_TICKET,
                reference_key=jira_client.issue.key,
                primary=True
            )
    else:
        return TaskProgressReport.CANCELLED


# TODO: examine all tasks for redundant code and possible generalization e.g.:
# TODO: more generic like update above
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.add_accession_to_submission_issue_task',
             base=SubmissionTask)
def add_accession_to_submission_issue_task(prev_task_result=None,
                                           submission_id=None,
                                           target_archive=None):
    logger.info(
        msg='add_accession_to_submission_issue_task submission_id={0} | '
            'prev_task_result={1} | '
            'target_archive={2}'.format(submission_id, prev_task_result,
                                        target_archive)
    )

    # No submission will be returned if submission.status is error
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id,
        task=add_accession_to_submission_issue_task,
        get_closed_submission=True)

    if submission is not None and site_configuration is not None:

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
                if jira_client.error:
                    apply_default_task_retry_policy(
                        jira_client.error.response,
                        add_accession_to_submission_issue_task,
                        submission
                    )
    else:
        return TaskProgressReport.CANCELLED


# FIXME: here problems while using new jirclient to attach, especiall while put submissionupload
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.attach_to_submission_issue_task',
             base=SubmissionTask)
def attach_to_submission_issue_task(kwargs=None, submission_id=None,
                                    submission_upload_id=None):
    logger.info(
        msg='attach_to_submission_issue_task submission_id={0} | '
            'submission_upload_id={1}'.format(submission_id,
                                              submission_upload_id))
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id, task=attach_to_submission_issue_task,
        get_closed_submission=True)
    if submission is not None and site_configuration is not None:

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

                if jira_client.error:
                    apply_default_task_retry_policy(
                        jira_client.error.response,
                        attach_to_submission_issue_task,
                        submission
                    )
                else:
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
            apply_timebased_task_retry_policy(
                task=attach_to_submission_issue_task,
                submission=submission,
                no_of_tickets=1 if reference else 0
                # always 1 if available due to filter rules
            )
            return False
    else:
        return TaskProgressReport.CANCELLED


@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.delete_submission_issue_attachment_task',
             base=SubmissionTask)
def delete_submission_issue_attachment_task(kwargs=None, submission_id=None,
                                            attachment_id=None):
    logger.info(
        msg='delete_submission_issue_attachment_task submission_id={0} '
            '| attachment_id={1}'.format(submission_id, attachment_id)
    )
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id,
        task=delete_submission_issue_attachment_task,
        get_closed_submission=True)
    if submission is not None and site_configuration is not None and attachment_id is not None:
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
        if jira_client.error:
            # TODO: maybe no retry needed, if it fails, attachment my be still there ..
            apply_default_task_retry_policy(
                jira_client.error.response,
                delete_submission_issue_attachment_task,
                submission)
        else:
            return True
    else:
        return TaskProgressReport.CANCELLED


# TODO: add tests ...
@celery.task(max_retries=SUBMISSION_MAX_RETRIES,
             name='tasks.add_pangaea_doi_task',
             base=SubmissionTask)
def add_pangaea_doi_task(prev_task_result=None,
                         pangaea_doi=None, submission_id=None):
    submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
        submission_id=submission_id,
        task=add_pangaea_doi_task,
        get_closed_submission=True)
    if submission is not None and site_configuration is not None:

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
            if jira_client.error:
                apply_default_task_retry_policy(
                    jira_client.error.response,
                    add_pangaea_doi_task,
                    submission)

    else:
        return TaskProgressReport.CANCELLED


@celery.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.add_pangaealink_to_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    # https://docs.celeryproject.org/en/latest/userguide/tasks.html#Task.retry_backoff
    retry_backoff=60,
    retry_jitter=True
)
def add_pangaealink_to_submission_issue_task(
        self,
        submission_id=None):
    # submission, site_configuration = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
    #     submission_id=submission_id,
    #     task=add_pangaealink_to_submission_issue_task,
    #     get_closed_submission=True
    # )

    # TODO: use this for all calls, also wher only submission without conf was requested
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    # if submission is not None and site_configuration is not None:

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
        # if 500 <= jira_client.error.response.status_code < 600:
        #     # auto-retry:
        #     if self.request.retries >= SUBMISSION_MAX_RETRIES:
        #         print('\nmax retries exceded for exception',
        #               jira_client.error,
        #               ' do stuff ... return safely\n++++++++++++++++++++++++++++++\n')
        #         return TaskProgressReport.CANCELLED
        #     else:
        #         raise SubmissionTransferHandler.TransferServerError
    # return True

    # else:
#     return TaskProgressReport.CANCELLED

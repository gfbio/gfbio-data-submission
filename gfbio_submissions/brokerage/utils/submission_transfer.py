# -*- coding: utf-8 -*-
import logging

from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_DELAY, \
    ENA, ENA_PANGAEA
from gfbio_submissions.brokerage.models import Submission, SiteConfiguration, \
    TaskProgressReport

logger = logging.getLogger(__name__)


class SubmissionTransferHandler(object):
    class TransferError(Exception):
        pass

    class TransferClientError(TransferError):
        pass

    class TransferServerError(TransferError):
        pass

    class TransferUnknownError(TransferError):
        pass

    class TransferInvalidSubmission(TransferError):
        pass

    class TransferInternalError(TransferError):
        pass

    def __init__(self, submission_id, target_archive):
        self.target_archive = target_archive
        self.submission_id = submission_id

    @classmethod
    def _get_submission(cls, submission_id, get_closed_submission=False):
        submission = None
        try:
            if get_closed_submission:
                submission = Submission.objects.get_submission_including_closed_for_task(
                    id=submission_id)
            else:
                submission = Submission.objects.get_submission_for_task(
                    id=submission_id)
        except Submission.DoesNotExist as e:
            logger.error(
                msg='SubmissionTransferHandler _get_submission. Submission does not exist'
                    ' submission pk={}. Error={}'
                    ''.format(submission_id, e)
            )
            raise cls.TransferInternalError(
                '_get_submission No Submission found for pk={}. Original message: {}'.format(
                    submission_id, e))
        finally:
            return submission

    @classmethod
    def get_submission_for_task(cls, submission_id=None, task=None,
                                get_closed_submission=False):
        submission = cls._get_submission(submission_id, get_closed_submission)
        if task:
            task_report, created = TaskProgressReport.objects.create_initial_report(
                submission=submission,
                task=task)
        return submission

    @classmethod
    def get_submission_and_siteconfig_for_task(cls, submission_id=None,
                                               task=None,
                                               get_closed_submission=False):
        # TODO: Catch DoesNotExist here, so tasks will have to deal with only on type of exception
        submission = cls._get_submission(submission_id, get_closed_submission)
        if submission:
            try:
                site_configuration = SiteConfiguration.objects.get_site_configuration_for_task(
                    site=submission.site)
            except SiteConfiguration.DoesNotExist as e:
                logger.error(
                    msg='SubmissionTransferHandler. SiteConfiguration does not exist'
                        ' submission pk={}. Error={}'
                        ''.format(submission_id, e)
                )
                raise cls.TransferInternalError(
                    'No SiteConfiguration found for site={}. Original message: '
                    '{}'.format(submission.site, e))
        else:
            site_configuration = None
        if task:
            task_report, created = TaskProgressReport.objects.create_initial_report(
                submission=submission,
                task=task)
        return submission, site_configuration

    @classmethod
    def raise_response_exceptions(cls, response):
        error = None
        if not response.ok:
            if 400 <= response.status_code < 500:
                error = cls.TransferClientError(
                    response.status_code,
                    response.content
                )
            elif 500 <= response.status_code < 600:
                error = cls.TransferServerError(response.status_code)
            else:
                error = cls.TransferUnknownError(response.status_code)
            if error:
                logger.error(
                    msg='SubmissionTransferError: '
                        'Aborted with status_code {0} '
                        'due to error {1}'.format(response.status_code,
                                                  error))
                raise error

    def pre_process_molecular_data_chain(self):
        from gfbio_submissions.brokerage.tasks import \
            create_broker_objects_from_submission_data_task, \
            prepare_ena_submission_data_task
        return create_broker_objects_from_submission_data_task.s(
            submission_id=self.submission_id).set(
            countdown=SUBMISSION_DELAY) \
               | prepare_ena_submission_data_task.s(
            submission_id=self.submission_id).set(
            countdown=SUBMISSION_DELAY)
        # \
        #        | check_on_hold_status_task.s(
        #     submission_id=self.submission_id).set(
        #     countdown=SUBMISSION_DELAY)

    # TODO: better name !
    def initiate_submission_process(self, release=False, update=False,
                                    molecular_data_available=True):
        logger.info(
            'SubmissionTransferHandler. initiate_submission_process. '
            'submission_id={0} target_archive={1}'.format(self.submission_id,
                                                          self.target_archive))
        from gfbio_submissions.brokerage.tasks import \
            create_helpdesk_ticket_task, get_gfbio_user_email_task, \
            check_on_hold_status_task

        logger.info(
            'SubmissionTransferHandler. update={0} release={1}'
            ''.format(update, release)
        )
        # TODO: update only, without release does nothing ?
        if update and release:

            # TODO: add csv parsing to chain when conditions indicate it
            #  ... see perform_create TODOs
            chain = check_on_hold_status_task.s(
                submission_id=self.submission_id).set(
                countdown=SUBMISSION_DELAY)
            if self.target_archive == ENA \
                    or self.target_archive == ENA_PANGAEA:
                logger.info(
                    'SubmissionTransferHandler. target_archive={0} trigger '
                    'create_broker_objects_from_submission_data_task and '
                    'prepare_ena_submission_data_task'
                    ''.format(self.target_archive)
                )
                if molecular_data_available:
                    chain = chain | self.pre_process_molecular_data_chain()
        elif not update:
            # TODO: use IDM derived email. not old portal email
            chain = get_gfbio_user_email_task.s(
                submission_id=self.submission_id).set(
                countdown=SUBMISSION_DELAY) \
                    | create_helpdesk_ticket_task.s(
                submission_id=self.submission_id).set(
                countdown=SUBMISSION_DELAY)
            if release:
                chain = chain | check_on_hold_status_task.s(
                    submission_id=self.submission_id).set(
                    countdown=SUBMISSION_DELAY)
                if self.target_archive == ENA \
                        or self.target_archive == ENA_PANGAEA:
                    if molecular_data_available:
                        chain = chain | self.pre_process_molecular_data_chain()
        else:
            return None
        chain()

    # TODO: SUBMISSION_DELAY also in site_config (inclundung delay and max retries) ?
    def execute_submission_to_ena(self):
        logger.info(
            'SubmissionTransferHandler. execute_submission_to_ena. target_archive={}'.format(
                self.target_archive))
        from gfbio_submissions.brokerage.tasks import \
            transfer_data_to_ena_task, process_ena_response_task, \
            comment_helpdesk_ticket_task

        chain = transfer_data_to_ena_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | process_ena_response_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | comment_helpdesk_ticket_task.s(
            submission_id=self.submission_id,
            target_archive=ENA).set(countdown=SUBMISSION_DELAY)
        chain()

    def execute_submission_to_ena_and_pangaea(self):
        logger.info(
            'SubmissionTransferHandler. execute_submission_to_ena_and_pangaea. target_archive='.format(
                self.target_archive))
        from gfbio_submissions.brokerage.tasks import \
            transfer_data_to_ena_task, process_ena_response_task, \
            comment_helpdesk_ticket_task, request_pangaea_login_token_task, \
            create_pangaea_jira_ticket_task, \
            attach_file_to_pangaea_ticket_task, \
            comment_on_pangaea_ticket_task, \
            add_pangaealink_to_helpdesk_ticket_task

        chain = transfer_data_to_ena_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | process_ena_response_task.s(submission_id=self.submission_id,
                                              close_submission_on_success=False).set(
            countdown=SUBMISSION_DELAY) \
                | comment_helpdesk_ticket_task.s(
            submission_id=self.submission_id,
            target_archive=ENA).set(countdown=SUBMISSION_DELAY) \
                | request_pangaea_login_token_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | create_pangaea_jira_ticket_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | attach_file_to_pangaea_ticket_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | comment_on_pangaea_ticket_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | add_pangaealink_to_helpdesk_ticket_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)
        chain()

    def execute(self):
        if self.target_archive == ENA:
            self.execute_submission_to_ena()
        elif self.target_archive == ENA_PANGAEA:
            self.execute_submission_to_ena_and_pangaea()
        else:
            logger.error(
                msg='SubmissionTransferHandler. No execute method found for '
                    'target_archive={}'.format(self.target_archive)
            )

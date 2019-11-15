# -*- coding: utf-8 -*-
import logging

from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_DELAY, \
    ENA, ENA_PANGAEA

logger = logging.getLogger(__name__)


class SubmissionTransferHandler(object):

    def __init__(self, submission_id, target_archive):
        self.target_archive = target_archive
        self.submission_id = submission_id

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
    def initiate_submission_process(self, release=False, update=False):
        logger.info(
            'SubmissionTransferHandler. initiate_submission_process. '
            'submission_id={0} target_archive={1}'.format(self.submission_id,
                                                          self.target_archive))
        from gfbio_submissions.brokerage.tasks import \
            create_submission_issue_task, \
            check_on_hold_status_task, get_gfbio_helpdesk_username_task

        logger.info(
            'SubmissionTransferHandler. update={0} release={1}'
            ''.format(update, release)
        )
        # TODO: update only, without release does nothing ?
        if update and release:

            # TODO: add csv parsing to chain when conditions indicate it
            #  ... see perform_create TODOs

            # TODO: check for molecular data before on_hold since there the target is crucial ???

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
                # if molecular_data_available:
                chain = chain | self.pre_process_molecular_data_chain()
        elif not update:
            chain = get_gfbio_helpdesk_username_task.s(
                submission_id=self.submission_id).set(
                countdown=SUBMISSION_DELAY) \
                    | create_submission_issue_task.s(
                submission_id=self.submission_id).set(
                countdown=SUBMISSION_DELAY)
            if release:
                chain = chain | check_on_hold_status_task.s(
                    submission_id=self.submission_id).set(
                    countdown=SUBMISSION_DELAY)
                if self.target_archive == ENA \
                        or self.target_archive == ENA_PANGAEA:
                    # if molecular_data_available:
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
            add_accession_to_submission_issue_task

        chain = transfer_data_to_ena_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | process_ena_response_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | add_accession_to_submission_issue_task.s(
            submission_id=self.submission_id,
            target_archive=ENA).set(countdown=SUBMISSION_DELAY)
        chain()

    def execute_submission_to_ena_and_pangaea(self):
        logger.info(
            'SubmissionTransferHandler. execute_submission_to_ena_and_pangaea. target_archive='.format(
                self.target_archive))
        from gfbio_submissions.brokerage.tasks import \
            transfer_data_to_ena_task, process_ena_response_task, \
            add_accession_to_submission_issue_task, \
            create_pangaea_issue_task, \
            attach_to_pangaea_issue_task, \
            add_accession_to_pangaea_issue_task, \
            add_pangaealink_to_submission_issue_task

        chain = transfer_data_to_ena_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | process_ena_response_task.s(submission_id=self.submission_id,
                                              close_submission_on_success=False).set(
            countdown=SUBMISSION_DELAY) \
                | add_accession_to_submission_issue_task.s(
            submission_id=self.submission_id,
            target_archive=ENA).set(countdown=SUBMISSION_DELAY) \
                | create_pangaea_issue_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | attach_to_pangaea_issue_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | add_accession_to_pangaea_issue_task.s(
            submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY) \
                | add_pangaealink_to_submission_issue_task.s(
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

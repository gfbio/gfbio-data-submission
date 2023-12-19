# -*- coding: utf-8 -*-
import logging

from ..configuration.settings import SUBMISSION_DELAY, ENA, ENA_PANGAEA

logger = logging.getLogger(__name__)


class SubmissionTransferHandler(object):
    def __init__(
        self,
        submission_id,
        target_archive,
        molecular_data_found=False,
        molecular_data_check_performed=False,
    ):
        self.target_archive = target_archive
        self.submission_id = submission_id
        self.molecular_data_found = molecular_data_found
        self.molecular_data_check_performed = molecular_data_check_performed

    def pre_process_molecular_data_chain(self):
        from ..tasks.broker_object_tasks.create_broker_objects_from_submission_data import (
            create_broker_objects_from_submission_data_task,
        )
        from ..tasks.auditable_text_data_tasks.prepare_ena_submission_data import (
            prepare_ena_submission_data_task,
        )

        return create_broker_objects_from_submission_data_task.s(submission_id=self.submission_id).set(
            countdown=SUBMISSION_DELAY
        ) | prepare_ena_submission_data_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)

    def initiate_submission_process(self, release=False, update=False):
        logger.info(
            "SubmissionTransferHandler. initiate_submission_process. "
            "submission_id={0} target_archive={1}".format(self.submission_id, self.target_archive)
        )
        from ..tasks.submission_tasks.check_on_hold_status import (
            check_on_hold_status_task,
        )

        logger.info("SubmissionTransferHandler. update={0} release={1}" "".format(update, release))

        if update and release:
            chain = check_on_hold_status_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)
            if self.target_archive == ENA or self.target_archive == ENA_PANGAEA:
                logger.info(
                    "SubmissionTransferHandler. target_archive={0} trigger "
                    "create_broker_objects_from_submission_data_task and "
                    "prepare_ena_submission_data_task"
                    "".format(self.target_archive)
                )

                if not self.molecular_data_check_performed or (
                    self.molecular_data_check_performed and self.molecular_data_found
                ):
                    chain = chain | self.pre_process_molecular_data_chain()

        elif not update and release:
            chain = check_on_hold_status_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)
            if self.target_archive == ENA or self.target_archive == ENA_PANGAEA:
                if not self.molecular_data_check_performed or (
                    self.molecular_data_check_performed and self.molecular_data_found
                ):
                    chain = chain | self.pre_process_molecular_data_chain()
        else:
            return None
        chain()

    # TODO: SUBMISSION_DELAY also in site_config (inclundung delay and max retries) ?
    def execute_submission_to_ena(self):
        logger.info(
            "SubmissionTransferHandler. execute_submission_to_ena. target_archive={}".format(self.target_archive)
        )

        from ..tasks.transfer_tasks.transfer_data_to_ena import (
            transfer_data_to_ena_task,
        )
        from ..tasks.transfer_tasks.process_ena_response import (
            process_ena_response_task,
        )
        from ..tasks.jira_tasks.add_accession_to_submission_issue import (
            add_accession_to_submission_issue_task,
        )
        from ..tasks.jira_tasks.add_accession_link_to_submission_issue import (
            add_accession_link_to_submission_issue_task,
        )

        chain = (
            transfer_data_to_ena_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)
            | process_ena_response_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)
            | add_accession_to_submission_issue_task.s(submission_id=self.submission_id, target_archive=ENA).set(
                countdown=SUBMISSION_DELAY
            )
            | add_accession_link_to_submission_issue_task.s(submission_id=self.submission_id, target_archive=ENA).set(
                countdown=SUBMISSION_DELAY
            )
        )
        chain()

    def execute_submission_to_ena_and_pangaea(self):
        logger.info(
            "SubmissionTransferHandler. execute_submission_to_ena_and_pangaea. target_archive=".format(
                self.target_archive
            )
        )

        from ..tasks.transfer_tasks.transfer_data_to_ena import (
            transfer_data_to_ena_task,
        )
        from ..tasks.transfer_tasks.process_ena_response import (
            process_ena_response_task,
        )
        from ..tasks.jira_tasks.add_accession_to_submission_issue import (
            add_accession_to_submission_issue_task,
        )
        from ..tasks.jira_tasks.create_pangaea_issue import create_pangaea_issue_task
        from ..tasks.jira_tasks.attach_to_pangaea_issue import (
            attach_to_pangaea_issue_task,
        )
        from ..tasks.jira_tasks.add_accession_to_pangaea_issue import (
            add_accession_to_pangaea_issue_task,
        )
        from ..tasks.jira_tasks.add_pangaealink_to_submission_issue import (
            add_pangaealink_to_submission_issue_task,
        )
        from ..tasks.jira_tasks.add_accession_link_to_submission_issue import (
            add_accession_link_to_submission_issue_task,
        )

        chain = (
            transfer_data_to_ena_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)
            | process_ena_response_task.s(submission_id=self.submission_id, close_submission_on_success=False).set(
                countdown=SUBMISSION_DELAY
            )
            | add_accession_to_submission_issue_task.s(
                submission_id=self.submission_id, target_archive=ENA_PANGAEA
            ).set(countdown=SUBMISSION_DELAY)
            | add_accession_link_to_submission_issue_task.s(submission_id=self.submission_id, target_archive=ENA).set(
                countdown=SUBMISSION_DELAY
            )
            | create_pangaea_issue_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)
            | attach_to_pangaea_issue_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)
            | add_accession_to_pangaea_issue_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)
            | add_pangaealink_to_submission_issue_task.s(submission_id=self.submission_id).set(
                countdown=SUBMISSION_DELAY
            )
        )
        chain()

    def execute(self):
        if self.target_archive == ENA:
            self.execute_submission_to_ena()
        elif self.target_archive == ENA_PANGAEA:
            self.execute_submission_to_ena_and_pangaea()
        else:
            logger.error(
                msg="SubmissionTransferHandler. No execute method found for "
                "target_archive={}".format(self.target_archive)
            )

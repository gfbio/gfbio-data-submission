# -*- coding: utf-8 -*-
import logging

from gfbio_submissions.brokerage.tasks.submission_tasks.check_for_submittable_data import (
    check_for_submittable_data_task,
)
from ..configuration.settings import SUBMISSION_DELAY, ENA, ENA_PANGAEA, ATAX
from ..models import SubmissionCloudUpload
from ..models.submission_upload import SubmissionUpload
from ..tasks.atax_tasks.atax_run_combination_task import atax_run_combination_task, \
    atax_run_combination_for_cloud_upload_task

logger = logging.getLogger(__name__)


class SubmissionProcessHandler(object):
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
        from ..tasks.auditable_text_data_tasks.prepare_ena_submission_data import prepare_ena_submission_data_task
        from ..tasks.broker_object_tasks.create_broker_objects_from_submission_data import (
            create_broker_objects_from_submission_data_task,
        )

        return create_broker_objects_from_submission_data_task.s(submission_id=self.submission_id).set(
            countdown=SUBMISSION_DELAY
        ) | prepare_ena_submission_data_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)

    def add_molecular_data_tasks_to_chain(self, chain, release, update):
        if update and release:
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
            if not self.molecular_data_check_performed or (
                self.molecular_data_check_performed and self.molecular_data_found
            ):
                chain = chain | self.pre_process_molecular_data_chain()
        return chain

    def add_alpha_taxonomic_data_tasks_to_chain(self, chain):
        uploads = SubmissionUpload.objects.filter(submission_id=self.submission_id)
        cloud_uploads = SubmissionCloudUpload.objects.filter(submission_id=self.submission_id)
        if len(cloud_uploads) and len(uploads) == 0:
            return (
                chain
                | atax_run_combination_for_cloud_upload_task.s(submission_id=self.submission_id).set(
                countdown=SUBMISSION_DELAY)
            )
        else:
            return (
                chain
                | atax_run_combination_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)
            )

    def add_submittable_data_check_task_to_chain(self, chain):
        return chain | check_for_submittable_data_task.s(submission_id=self.submission_id).set(
            countdown=SUBMISSION_DELAY
        )

    def initiate_submission_process(self, release=False, update=False):
        logger.info(
            "SubmissionTransferHandler. initiate_submission_process. "
            "submission_id={0} target_archive={1}".format(self.submission_id, self.target_archive)
        )
        from ..tasks.submission_tasks.check_on_hold_status import check_on_hold_status_task

        logger.info("SubmissionTransferHandler. update={0} release={1}" "".format(update, release))

        chain = check_on_hold_status_task.s(submission_id=self.submission_id).set(countdown=SUBMISSION_DELAY)

        if self.target_archive == ENA or self.target_archive == ENA_PANGAEA:
            logger.info(
                "SubmissionTransferHandler. target_archive={0} | "
                "add_molecular_data_tasks_to_chain ".format(self.target_archive)
            )
            chain = self.add_molecular_data_tasks_to_chain(chain, release, update)
        elif self.target_archive == ATAX:
            logger.info(
                "SubmissionTransferHandler. target_archive={0} | "
                "add_alpha_taxonomic_data_tasks_to_chain ".format(self.target_archive)
            )
            chain = self.add_alpha_taxonomic_data_tasks_to_chain(chain)

        chain = self.add_submittable_data_check_task_to_chain(chain)

        logger.info("SubmissionTransferHandler. target_archive={0} | " "execute chain() ".format(self.target_archive))
        chain()

    # TODO: SUBMISSION_DELAY also in site_config (inclundung delay and max retries) ?
    def execute_submission_to_ena(self):
        logger.info(
            "SubmissionTransferHandler. execute_submission_to_ena. target_archive={}".format(self.target_archive)
        )

        from ..tasks.jira_tasks.add_accession_link_to_submission_issue import (
            add_accession_link_to_submission_issue_task,
        )
        from ..tasks.jira_tasks.add_accession_to_submission_issue import add_accession_to_submission_issue_task
        from ..tasks.process_tasks.process_ena_response import process_ena_response_task
        from ..tasks.process_tasks.transfer_data_to_ena import transfer_data_to_ena_task

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
            "SubmissionTransferHandler. execute_submission_to_ena_and_pangaea. target_archive={0}".format(
                self.target_archive
            )
        )

        from ..tasks.jira_tasks.add_accession_link_to_submission_issue import (
            add_accession_link_to_submission_issue_task,
        )
        from ..tasks.jira_tasks.add_accession_to_pangaea_issue import add_accession_to_pangaea_issue_task
        from ..tasks.jira_tasks.add_accession_to_submission_issue import add_accession_to_submission_issue_task
        from ..tasks.jira_tasks.add_pangaealink_to_submission_issue import add_pangaealink_to_submission_issue_task
        from ..tasks.jira_tasks.attach_to_pangaea_issue import attach_to_pangaea_issue_task
        from ..tasks.jira_tasks.create_pangaea_issue import create_pangaea_issue_task
        from ..tasks.process_tasks.process_ena_response import process_ena_response_task
        from ..tasks.process_tasks.transfer_data_to_ena import transfer_data_to_ena_task

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

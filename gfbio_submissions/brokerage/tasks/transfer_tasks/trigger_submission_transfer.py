# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.submission_transfer import SubmissionTransferHandler
from ...utils.task_utils import get_submission_and_site_configuration


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.trigger_submission_transfer",
)
def trigger_submission_transfer_task(
    self, previous_task_result=None, submission_id=None
):
    molecular_data_available = False
    check_performed = False
    messages = []

    if isinstance(previous_task_result, dict):
        molecular_data_available = previous_task_result.get(
            "molecular_data_available", False
        )
        check_performed = previous_task_result.get(
            "molecular_data_check_performed", False
        )
        messages = previous_task_result.get("messages", [])

    logger.info(
        msg="trigger_submission_transfer. get submission with pk={}.".format(
            submission_id
        )
    )
    if len(messages):
        logger.warning(
            "tasks.py | trigger_submission_transfer | "
            "previous task reported error messages={0} | "
            "submission_id={1}".format(messages, submission_id)
        )
        return TaskProgressReport.CANCELLED
    # TODO: needs only submission, not both.
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )

    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    transfer_handler = SubmissionTransferHandler(
        submission_id=submission.pk,
        target_archive=submission.target,
        molecular_data_found=molecular_data_available,
        molecular_data_check_performed=check_performed,
    )
    transfer_handler.initiate_submission_process(
        release=submission.release,
    )

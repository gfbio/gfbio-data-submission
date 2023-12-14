# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.ena_cli import create_ena_manifest_text_data
from ...utils.task_utils import get_submission_and_site_configuration

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.create_targeted_sequence_ena_manifest_task",
)
def create_targeted_sequence_ena_manifest_task(
    self,
    previous_result=None,
    submission_id=None,
):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | create_targeted_sequence_ena_manifest_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED
    if submission is None:
        logger.warning(
            "tasks.py | create_targeted_sequence_ena_manifest_task | "
            "no valid Submission available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    text_data = create_ena_manifest_text_data(submission=submission)
    logger.info(
        "tasks.py | create_targeted_sequence_ena_manifest_task | "
        "created auditable_text_data pk={0} | "
        "submission_id={1} ".format(text_data.pk, submission_id)
    )
    return text_data.pk

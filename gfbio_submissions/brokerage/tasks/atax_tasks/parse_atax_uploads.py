# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.task_utils import get_submission

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.parse_atax_uploads_task",
)
def parse_atax_uploads_task(
    self,
    previous_result=None,
    submission_id=None):
    logger.info("parse_atax_uploads.py | parse_atax_uploads_task | submission_id={}".format(submission_id))

    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "parse_atax_uploads.py | parse_atax_uploads_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED

    submission = get_submission(submission_id=submission_id, task=self, include_closed=True)

    if not submission.release:
        logger.warning(
            "parse_atax_uploads.py | parse_atax_uploads_task | "
            "trying to parse files of unreleased submission | release={0} | "
            "submission_id={1}".format(submission.release, submission.id)
        )
        return TaskProgressReport.CANCELLED

    # ----- TODO ---- move to module

    # ----- TODO ---- END move to module

    # DONE - TODO: submission has to be released=True
    # TODO: iterate all uploads associated to this submission
    # TODO: content of every file has to be parsed to XML
    # TODO: store content in AuditableTextData associated to submission
    # TODO: return taskresult suitble to be use in atax chain
    # TODO: add new tasks to celery app list for (auto)discover
    return True, submission.broker_submission_id

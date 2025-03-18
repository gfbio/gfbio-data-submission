# -*- coding: utf-8 -*-
import logging

from django.db import transaction

from config.celery_app import app
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.clean_submission_for_update_task",
)
def clean_submission_for_update_task(self, previous_task_result=None, submission_id=None):
    report, created = TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    submission = Submission.objects.get_or_none(submission_id)

    # TODO: add submission relation from submission_upload, relation

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | clean_submission_for_update_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED

    if not submission:
        logger.error(
            "tasks.py | clean_submission_for_update_task | "
            "no valid Submission available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    report.submission = submission
    report.save()

    data = submission.data
    molecular_requirements_keys = ["samples", "experiments", "runs"]  # 'study_type',

    if "validation" in data.keys():
        data.pop("validation")
    for k in molecular_requirements_keys:
        if k in data.get("requirements", {}).keys():
            data.get("requirements", {}).pop(k)

    with transaction.atomic():
        submission.save()
    return True

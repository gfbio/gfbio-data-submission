# -*- coding: utf-8 -*-
import logging
import os

from django.db import transaction
from kombu.utils import json

from config.celery_app import app
from ...configuration.settings import ENA_PANGAEA
from ...models.submission_upload import SubmissionUpload
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.csv import parse_molecular_csv
from ...utils.schema_validation import validate_data_full


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.parse_csv_to_update_clean_submission_task",
)
def parse_csv_to_update_clean_submission_task(self, previous_task_result=None, submission_upload_id=None):
    # TODO: here it would be possible to get the related submission for the TaskReport
    report, created = TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    submission_upload = SubmissionUpload.objects.get_linked_molecular_submission_upload(submission_upload_id)

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | parse_csv_to_update_clean_submission_task | "
            "previous task reported={0} | "
            "submission_upload_id={1}".format(TaskProgressReport.CANCELLED, submission_upload_id)
        )
        return TaskProgressReport.CANCELLED

    if submission_upload is None:
        logger.error(
            "tasks.py | parse_csv_to_update_clean_submission_task | "
            "no valid SubmissionUpload available | "
            "submission_upload_id={0}".format(submission_upload_id)
        )
        return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission

    with open(submission_upload.file.path, "r") as file:
        molecular_requirements = parse_molecular_csv(
            file,
        )

    path = os.path.join(os.getcwd(), "gfbio_submissions/brokerage/schemas/ena_requirements.json")

    with transaction.atomic():
        submission_upload.submission.data["requirements"].update(molecular_requirements)

        valid, full_errors = validate_data_full(
            data=submission_upload.submission.data,
            target=ENA_PANGAEA,
            schema_location=path,
        )

        if not valid:
            messages = [e.message for e in full_errors]
            submission_upload.submission.data.update({"validation": messages})
            report.task_exception_info = json.dumps({"validation": messages})

        report.save()
        submission_upload.submission.save()
        if not valid:
            # TODO: update tpr with errors from validation
            return TaskProgressReport.CANCELLED
        else:
            return True

# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.ena_mandatory_fields import validate_ena_mandatory_fields
from gfbio_submissions.brokerage.utils.submission_file_opener import create_submission_file_opener

logger = logging.getLogger(__name__)

TASK_NAME = "ENA mandatory fields"


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_ena_mandatory_fields_task",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def check_ena_mandatory_fields_task(self, previous_task_result=None, submission_id=None, report_id=None):
    report = MetadataValidationReport.objects.select_related("submission", "upload_file__file_upload").get(pk=report_id)
    validation_task_report = report.validationtaskreport_set.create(task_name=TASK_NAME, status="PENDING")

    upload_file = report.upload_file
    file_opener = create_submission_file_opener(report.submission)
    findings = []

    if not file_opener.is_csv(upload_file):
        findings.append(
            {
                "status": "ERROR",
                "row": None,
                "column": None,
                "column_name": None,
                "message": "Metadata validation requires a CSV metadata file.",
                "help_text": "Upload the molecular metadata template as a .csv file.",
            }
        )
    else:
        try:
            with file_opener.csv_reader(upload_file) as csv_file:
                findings = validate_ena_mandatory_fields(csv_file)
        except Exception as error:
            logger.exception("Failed to validate ENA mandatory fields for report %s", report_id)
            findings.append(
                {
                    "status": "ERROR",
                    "row": None,
                    "column": None,
                    "column_name": None,
                    "message": f"Could not read metadata file for validation: {error}",
                    "help_text": "Ensure the metadata file is a valid CSV and accessible to the submission system.",
                }
            )

    for finding in findings:
        validation_task_report.validationfinding_set.create(**finding)

    if any(finding["status"] == "ERROR" for finding in findings):
        validation_task_report.status = "ERROR"
    else:
        validation_task_report.status = "SUCCESS"
    validation_task_report.save()
    return True

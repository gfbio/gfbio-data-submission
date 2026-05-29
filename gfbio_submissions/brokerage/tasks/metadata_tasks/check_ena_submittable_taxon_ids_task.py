# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import (
    SUBMISSION_MAX_RETRIES,
    SUBMISSION_RETRY_DELAY,
)
from gfbio_submissions.brokerage.models.metadata_validation_report import (
    MetadataValidationReport,
)
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.csv import check_submittable_taxon_id

logger = logging.getLogger(__name__)

TASK_NAME = "ENA taxon_id submittability"


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_ena_submittable_taxon_ids_task",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def check_ena_submittable_taxon_ids_task(self, previous_task_result=None, report_id=None):
    report = MetadataValidationReport.objects.select_related("submission").get(pk=report_id)
    validation_task_report = report.validationtaskreport_set.create(
        task_name=TASK_NAME,
        status="PENDING",
    )

    findings = []
    try:
        status, messages, check_performed = check_submittable_taxon_id(report.submission)
        if not check_performed:
            findings.append(
                {
                    "status": "WARNING",
                    "row": None,
                    "column": None,
                    "column_name": "taxon_id",
                    "message": "Taxon ID submittability check could not be performed.",
                    "help_text": "Ensure a CSV metadata file with taxon_id values is available.",
                }
            )
        elif not status:
            findings.extend(
                [
                    {
                        "status": "ERROR",
                        "row": None,
                        "column": None,
                        "column_name": "taxon_id",
                        "message": message,
                        "help_text": (
                            "Use ENA-submittable NCBI taxonomy IDs. Please verify taxon_id "
                            "values against the ENA taxonomy service."
                        ),
                    }
                    for message in messages
                ]
            )
    except Exception as error:
        logger.exception(
            "Failed to validate ENA taxon_id submittability for report %s",
            report_id,
        )
        findings.append(
            {
                "status": "ERROR",
                "row": None,
                "column": None,
                "column_name": "taxon_id",
                "message": f"Could not validate taxon_id values against ENA: {error}",
                "help_text": "Please retry later. If the problem persists, contact support.",
            }
        )

    for finding in findings:
        validation_task_report.validationfinding_set.create(**finding)

    if any(finding["status"] == "ERROR" for finding in findings):
        validation_task_report.status = "ERROR"
    elif any(finding["status"] == "WARNING" for finding in findings):
        validation_task_report.status = "WARNING"
    else:
        validation_task_report.status = "SUCCESS"
    validation_task_report.save()
    return True

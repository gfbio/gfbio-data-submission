# -*- coding: utf-8 -*-
import csv
import logging
import re

from django.utils.encoding import smart_str

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
from gfbio_submissions.brokerage.utils.submission_file_opener import create_submission_file_opener

logger = logging.getLogger(__name__)

TASK_NAME = "ENA taxon_id submittability"

_TAXON_ID_HELP_TEXT = (
    "Use ENA-submittable NCBI taxonomy IDs. Please verify taxon_id "
    "values against the ENA taxonomy service."
)
_NON_SUBMITTABLE_MESSAGE_PATTERN = re.compile(
    r"not submittable:\s*(.+)$",
    re.IGNORECASE,
)


def _parse_non_submittable_taxon_ids(messages):
    taxon_ids = set()
    for message in messages:
        match = _NON_SUBMITTABLE_MESSAGE_PATTERN.search(message)
        if not match:
            continue
        for taxon_id in match.group(1).split(","):
            taxon_id = taxon_id.strip()
            if taxon_id:
                taxon_ids.add(taxon_id)
    return taxon_ids


def _column_index(fieldnames, field_name):
    try:
        return fieldnames.index(field_name) + 1
    except ValueError:
        return None


def _findings_for_invalid_taxon_ids(upload_file, submission, invalid_taxon_ids):
    """Map invalid taxon IDs from the legacy check back to CSV row/column locations."""
    if not invalid_taxon_ids:
        return []

    file_opener = create_submission_file_opener(submission)
    if not file_opener.is_csv(upload_file):
        return []

    findings = []
    try:
        with file_opener.csv_reader(upload_file) as csv_file:
            header_line = csv_file.readline()
            if not header_line or not header_line.strip():
                return []

            #TODO: Replace with "delimiter = detect_delimiter(header_line)" from DASS-3526 and check for return -
            # returns ";" instead of an exception in detect_delimiter
            dialect = csv.Sniffer().sniff(smart_str(header_line))
            csv_file.seek(0)
            delimiter = dialect.delimiter if dialect.delimiter in [",", ";", "\t"] else ";"
            csv_reader = csv.DictReader(
                csv_file,
                delimiter=delimiter,
                quotechar='"',
                skipinitialspace=True,
            )
            if not csv_reader.fieldnames:
                return []

            fieldnames = [field.strip().lower() for field in csv_reader.fieldnames]
            for index, field in enumerate(csv_reader.fieldnames):
                csv_reader.fieldnames[index] = field.strip().lower()

            if "taxon_id" not in fieldnames:
                return []

            taxon_id_column = _column_index(fieldnames, "taxon_id")
            data_row_number = 1
            for row in csv_reader:
                data_row_number += 1
                taxon_id = str(row.get("taxon_id", "")).strip()
                if taxon_id and taxon_id in invalid_taxon_ids:
                    findings.append(
                        {
                            "status": "ERROR",
                            "row": data_row_number,
                            "column": taxon_id_column,
                            "column_name": "taxon_id",
                            "message": (
                                f"Taxon ID '{taxon_id}' in row {data_row_number} "
                                "is not submittable to ENA."
                            ),
                            "help_text": _TAXON_ID_HELP_TEXT,
                        }
                    )
    except Exception as error:
        logger.warning(
            "Could not resolve taxon_id row/column locations for report upload %s: %s",
            upload_file.pk,
            error,
        )
        return []

    return findings


def _fallback_findings_from_messages(messages):
    return [
        {
            "status": "ERROR",
            "row": None,
            "column": None,
            "column_name": "taxon_id",
            "message": message,
            "help_text": _TAXON_ID_HELP_TEXT,
        }
        for message in messages
    ]


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_ena_submittable_taxon_ids_task",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def check_ena_submittable_taxon_ids_task(self, previous_task_result=None, report_id=None):
    report = MetadataValidationReport.objects.select_related(
        "submission",
        "upload_file__file_upload",
    ).get(pk=report_id)
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
            invalid_taxon_ids = _parse_non_submittable_taxon_ids(messages)
            findings = _findings_for_invalid_taxon_ids(
                report.upload_file,
                report.submission,
                invalid_taxon_ids,
            )
            if not findings:
                findings = _fallback_findings_from_messages(messages)
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

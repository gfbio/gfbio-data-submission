# -*- coding: utf-8 -*-

import csv as csv_module
import io
import logging

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
from gfbio_submissions.brokerage.utils.submission_file_opener import (
    create_submission_file_opener,
)

logger = logging.getLogger(__name__)

TASK_NAME = "Character encoding check"

_ENA_HELP_TEXT = (
    "ENA prefers plain ASCII. Please replace special characters, e.g. "
    "ä->ae, ö->oe, ü->ue, ß->ss, or accented letters with their base letter."
)


def _detect_delimiter(first_line):
    try:
        dialect = csv_module.Sniffer().sniff(smart_str(first_line))
        return dialect.delimiter if dialect.delimiter in [",", ";", "\t"] else ";"
    except csv_module.Error:
        return ";"


def _non_ascii_characters(value):
    return [character for character in sorted(set(value)) if ord(character) > 127]


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.validate_character_encoding",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def validate_character_encoding_task(self, previous_task_result=None, report_id=None):
    report = MetadataValidationReport.objects.get(pk=report_id)
    submission = report.submission
    cloud_upload = report.upload_file
    opener = create_submission_file_opener(submission)

    # The encoding is detected (and the file decoded) by the opener via
    # sniff_encoding. A failure here means the file is not decodable text.
    try:
        with opener.csv_reader(cloud_upload) as csv_file:
            content = csv_file.read()
    except (UnicodeDecodeError, LookupError) as e:
        logger.warning(
            "validate_character_encoding_task: could not decode metadata file "
            "of submission '%s': %s",
            submission.broker_submission_id,
            e,
        )
        task_report = report.validationtaskreport_set.create(
            task_name=TASK_NAME, status="ERROR"
        )
        task_report.validationfinding_set.create(
            status="ERROR",
            message="The uploaded metadata file could not be read as text "
            "(its encoding could not be determined).",
            help_text="Please re-save the file as UTF-8 encoded CSV and upload it again.",
        )
        report.save()
        return True
    except OSError as e:
        # The file could not be opened (e.g. it is not yet available on the
        # mounted storage). Record the problem instead of crashing the task so
        # the validation report still completes and the user is notified.
        logger.warning(
            "validate_character_encoding_task: could not open metadata file "
            "of submission '%s': %s",
            submission.broker_submission_id,
            e,
        )
        task_report = report.validationtaskreport_set.create(
            task_name=TASK_NAME, status="ERROR"
        )
        task_report.validationfinding_set.create(
            status="ERROR",
            message="The uploaded metadata file could not be opened for validation.",
            help_text="Please try uploading the file again. If the problem "
            "persists, contact the helpdesk.",
        )
        report.save()
        return True

    lines = content.splitlines()
    delimiter = _detect_delimiter(lines[0]) if lines else ";"
    reader = csv_module.reader(
        io.StringIO(content),
        delimiter=delimiter,
        quotechar='"',
        skipinitialspace=True,
    )
    rows = list(reader)
    header = rows[0] if rows else []

    findings = []
    for row_index, row in enumerate(rows, start=1):  # row 1 == header row
        for column_index, value in enumerate(row, start=1):  # 1-based column
            characters = _non_ascii_characters(value)
            if characters:
                column_name = (
                    header[column_index - 1]
                    if column_index - 1 < len(header)
                    else None
                )
                findings.append((row_index, column_index, column_name, value, characters))

    status = "WARNING" if findings else "SUCCESS"
    task_report = report.validationtaskreport_set.create(
        task_name=TASK_NAME, status=status
    )
    for row_index, column_index, column_name, value, characters in findings:
        task_report.validationfinding_set.create(
            status="WARNING",
            row=row_index,
            column=column_index,
            column_name=column_name,
            message="Non-ASCII character(s) {characters} found in value '{value}'.".format(
                characters=" ".join(repr(c) for c in characters),
                value=value,
            ),
            help_text=_ENA_HELP_TEXT,
        )
    report.save()
    return True

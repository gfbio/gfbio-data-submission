import csv
import difflib
import logging

from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.tasks.metadata_tasks.data.allowed_location_names import allowed_location_names
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.submission_file_opener import create_submission_file_opener


logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.test_check",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def validate_metadata_file_countries_task(self, previous_task_result=None, report_id=None):
    report = MetadataValidationReport.objects.get(pk=report_id)
    validation_task_report = report.validationtaskreport_set.create(task_name="Validate Metafile Geographic Locations")

    file_opener = create_submission_file_opener(report.submission)
    cloud_upload_file = report.upload_file
    column_name = "geographic location (country and/or sea)"
    try:
        with file_opener.csv_reader(cloud_upload_file) as meta_file:
            dialect = csv.Sniffer().sniff(meta_file.read(200))
            meta_file.seek(0)
            csv_reader = csv.DictReader(meta_file, dialect=dialect)
            column_index = -1
            for row in csv_reader:
                if csv_reader.line_num == 2:
                    if column_name in csv_reader.fieldnames:
                        column_index = csv_reader.fieldnames.index(column_name) + 1
                    else:
                        validation_task_report.status = "ERROR"
                        validation_task_report.validationfinding_set.create(
                            message="Column Geographic Location is missing.",
                            help_text=f"Please ensure the column '{column_name}' exists and there is a geographic location name set for every row in the column.",
                            column_name=column_name,
                            status = "ERROR",
                            row = 1,
                        )
                        return
                location_name = row.get(column_name, "")
                if not location_name:
                    validation_task_report.status = "ERROR"
                    validation_task_report.validationfinding_set.create(
                        message="Geographic Location is missing.",
                        help_text=f"Please ensure there is a geographic location name set for every row in column '{column_name}'.",
                        column_name=column_name,
                        status = "ERROR",
                        row = csv_reader.line_num,
                        column = column_index,
                    )
                else:
                    sanitized_location_name = location_name.strip()
                    if ":" in location_name:
                        sanitized_location_name = location_name.split(":")[0].strip()
                    
                    if not sanitized_location_name in allowed_location_names and sanitized_location_name != "not applicable" and sanitized_location_name != "missing":
                        validation_task_report.status = "ERROR"
                        help_text = f"Please double check the geografic location {sanitized_location_name}."
                        close_names = difflib.get_close_matches(location_name, allowed_location_names)
                        if len(close_names) == 1:
                            help_text += " Did you maybe mean " + close_names[0] + "?"
                        elif len(close_names) > 1:
                            help_text += " Did you maybe mean one of these:" + ", ".join(close_names) + "?"
                        validation_task_report.validationfinding_set.create(
                            message="The Geographic Location does not match the ENA-vocabulary (https://www.insdc.org/submitting-standards/geo_loc_name-qualifier-vocabulary/).",
                            help_text=help_text,
                            column_name=column_name,
                            status = "ERROR",
                            row = csv_reader.line_num,
                            column = column_index,
                        )

        if validation_task_report.status != "ERROR":
            validation_task_report.status = "SUCCESS"
    except Exception as e:
        logger.error(f"Error: Exception on parsing file {cloud_upload_file}: {e}.")
        return False
    finally:
        validation_task_report.save()
    report.save()
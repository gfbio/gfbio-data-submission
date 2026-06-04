import logging

from celery import chord

from config.celery_app import app
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.tasks.metadata_tasks.check_ena_mandatory_fields_task import check_ena_mandatory_fields_task
from gfbio_submissions.brokerage.tasks.metadata_tasks.check_ena_submittable_taxon_ids_task import (
    check_ena_submittable_taxon_ids_task,
)
from gfbio_submissions.brokerage.tasks.metadata_tasks.notify_on_report_completed_task import notify_on_report_completed_task
from gfbio_submissions.brokerage.tasks.metadata_tasks.validate_metadata_file_countries_task import validate_metadata_file_countries_task
from gfbio_submissions.brokerage.tasks.metadata_tasks.validate_character_encoding_task import validate_character_encoding_task
from ...configuration.settings import SUBMISSION_DELAY, SUBMISSION_MAX_RETRIES, ENA
from ...tasks.submission_task import SubmissionTask
from ...utils.task_utils import get_any_submission_and_site_configuration

logger = logging.getLogger(__name__)


@app.task(base=SubmissionTask, bind=True, name="tasks.add_metadata_file_validation_task")
def add_metadata_file_validation_task(
    self,
    previous_task_result=None,
    submission_id=None,
    submission_upload_id=None,
    triggered_by_user_id=None,
):
    submission, site_configuration = get_any_submission_and_site_configuration(
        submission_id=submission_id, task=self
    )

    metadata_file = SubmissionCloudUpload.objects.get(pk=submission_upload_id)
    if metadata_file and metadata_file.meta_data:
        if submission.target == ENA:
            if triggered_by_user_id is None:
                triggered_by_user_id = metadata_file.user_id
            if not MetadataValidationReport.objects.filter(submission_id=submission_id, upload_file=metadata_file, file_md5_checksum=metadata_file.file_upload.md5):
                new_report = MetadataValidationReport.objects.create(
                    submission_id=submission_id,
                    upload_file=metadata_file,
                    file_md5_checksum=metadata_file.file_upload.md5,
                    triggered_by_id=triggered_by_user_id,
                )
                new_report.save()
                parallel_checks = [
                    check_ena_mandatory_fields_task.s(submission_id=submission_id, report_id=new_report.id).set(
                        countdown=SUBMISSION_DELAY
                    ),
                    validate_metadata_file_countries_task.s(submission_id=submission_id, report_id=new_report.id).set(
                        countdown=SUBMISSION_DELAY
                    ),
                    check_ena_submittable_taxon_ids_task.s(submission_id=submission_id, report_id=new_report.id).set(
                        countdown=SUBMISSION_DELAY
                    ),
                    validate_character_encoding_task.s(submission_id=submission_id, report_id=new_report.id).set(
                        countdown=SUBMISSION_DELAY
                    ),
                ]
                chord(parallel_checks).apply_async(
                    kwargs={
                        "body":notify_on_report_completed_task.s(
                            submission_id=submission_id,
                            report_id=new_report.id
                        ).set(countdown=SUBMISSION_DELAY, max_retries=SUBMISSION_MAX_RETRIES).on_error(
                            notify_on_report_completed_task.s(
                                submission_id=submission_id,
                                report_id=new_report.id
                            ).set(countdown=SUBMISSION_DELAY, max_retries=SUBMISSION_MAX_RETRIES)
                        ),
                    },
                    max_retries=SUBMISSION_MAX_RETRIES
                )
            else:
                raise Exception(
                    (
                        f"Their is already a validation-file for file {metadata_file.file_upload.original_filename} "
                        f"with checksum {metadata_file.file_upload.md5}, "
                        "so no validation-report was triggered."
                    )
                )
        else:
            raise Exception(f"The submission {submission_id} doesn't has the target ENA, so no validation-report was triggered.")
    else:
        raise Exception(f"The file {metadata_file.file_upload.original_filename} is not a meta-data-file, so no validation-report was triggered.")
    return True

import logging

from celery import chord

from config.celery_app import app
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.tasks.metadata_tasks.notify_on_report_completed_task import notify_on_report_completed_task
from gfbio_submissions.brokerage.tasks.metadata_tasks.test_check_task import test_check_task
from ...configuration.settings import SUBMISSION_DELAY, SUBMISSION_MAX_RETRIES, ENA
from ...tasks.submission_task import SubmissionTask
from ...utils.task_utils import get_submission_and_site_configuration

logger = logging.getLogger(__name__)


@app.task(base=SubmissionTask, bind=True, name="tasks.add_metadata_file_validation_task")
def add_metadata_file_validation_task(self, previous_task_result=None, submission_id=None, submission_upload_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )

    metadata_file = SubmissionCloudUpload.objects.get(pk=submission_upload_id)
    if metadata_file and submission.target == ENA:
        if not MetadataValidationReport.objects.filter(submission_id=submission_id, upload_file=metadata_file):
            new_report = MetadataValidationReport.objects.create(submission_id=submission_id, upload_file=metadata_file)
            new_report.save()
            parallel_checks = [
                test_check_task.s(report_id=new_report.id).set(
                    countdown=SUBMISSION_DELAY
                )
            ]
            chord(parallel_checks).apply_async(
                kwargs={
                    "body":notify_on_report_completed_task.s(
                        report_id=new_report.id
                    ).set(countdown=SUBMISSION_DELAY, max_retries=SUBMISSION_MAX_RETRIES).on_error(
                        notify_on_report_completed_task.s(
                            report_id=new_report.id
                        ).set(countdown=SUBMISSION_DELAY, max_retries=SUBMISSION_MAX_RETRIES)
                    ),
                },
                max_retries=SUBMISSION_MAX_RETRIES
            )
    return True
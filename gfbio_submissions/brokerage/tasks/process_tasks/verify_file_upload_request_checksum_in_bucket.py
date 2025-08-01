# -*- coding: utf-8 -*-
import logging
import os

from django.conf import settings

from config.celery_app import app
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.s3fs import calculate_checksum_locally
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...models import SubmissionCloudUpload
from ...models.task_progress_report import TaskProgressReport
from ...utils.task_utils import get_submission_and_site_configuration, jira_error_auto_retry

logger = logging.getLogger(__name__)

from ..submission_task import SubmissionTask

@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.verify_file_upload_request_checksum_in_bucket_task",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
    queue="ena_transfer",
)
def verify_file_upload_request_checksum_in_bucket_task(self, previous_result=None, submission_cloud_upload_id=None, submission_id=None):
    logger.info(f"tasks.py | check_transfer_cloud_upload_checksums_task | queue={self.queue} | task_id={self.request.id}")
    if previous_result == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )

    if submission == TaskProgressReport.CANCELLED:
        logger.error(
            f"tasks.py | check_transfer_cloud_upload_checksums_task | previous task reported={TaskProgressReport.CANCELLED} | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id} | task_id={self.request.id}")
        return TaskProgressReport.CANCELLED
    try:
        submission_cloud_upload = SubmissionCloudUpload.objects.get(pk=submission_cloud_upload_id)
    except SubmissionCloudUpload.DoesNotExist:
        logger.error(
            f"tasks.py | check_transfer_cloud_upload_checksums_task | no valid SubmissionCloudUpload available | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id} | task_id={self.request.id}")
        return TaskProgressReport.CANCELLED

    file_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{submission_cloud_upload.file_upload.file_key}"
    if not os.path.exists(file_path):
        logger.error(
            f"tasks.py | check_transfer_cloud_upload_checksums_task | no valid file_path available | file_path={file_path} | task_id={self.request.id}"
        )
        return TaskProgressReport.CANCELLED


    calculated_md5sum = calculate_checksum_locally("md5", submission_cloud_upload)
    if calculated_md5sum != submission_cloud_upload.file_upload.md5:
        checksum_missmatch_message = (
            f"A checksum-missmatch occurred for the transmitted file '{submission_cloud_upload.file_upload.original_filename}'. "
            f"Expected checksum: {submission_cloud_upload.file_upload.md5}, actual checksum: {calculated_md5sum}"
        )
        logger.warning(
            f"tasks.py | check_transfer_cloud_upload_checksums_task | " + checksum_missmatch_message +
            f" | submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id} | task_id={self.request.id}")

        reference = submission.get_primary_helpdesk_reference()

        if reference and site_configuration.helpdesk_server:
            jira_client = JiraClient(resource=site_configuration.helpdesk_server)
            jira_client.add_comment(key_or_issue=reference.reference_key, text=checksum_missmatch_message, is_internal=False)
            return jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )

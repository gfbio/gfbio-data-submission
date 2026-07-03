# -*- coding: utf-8 -*-
import logging
import os

from django.conf import settings

from config.celery_app import app
from gfbio_submissions.brokerage.models.jira_queue_message import JiraQueueMessage
from gfbio_submissions.brokerage.utils.s3fs import calculate_checksum_locally
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...models import SubmissionCloudUpload
from ...models.task_progress_report import TaskProgressReport
from ...utils.task_utils import get_submission_and_site_configuration

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
    jira_message_data = {"file_name": submission_cloud_upload.file_upload.original_filename}
    if calculated_md5sum == submission_cloud_upload.file_upload.md5:
        submission_cloud_upload.status = SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM
        submission_cloud_upload.save()
        submission_cloud_upload.log_change([{"changed": {"fields": [f"status changed to {submission_cloud_upload.status}"]}}])
        jira_message_data["checksum_missmatched"] = False
    else:
        submission_cloud_upload.status = SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM
        submission_cloud_upload.save()
        submission_cloud_upload.log_change([{"changed": {"fields": [f"status changed to {submission_cloud_upload.status}"]}}])
        checksum_missmatch_message = (
            f"A checksum-missmatch occurred for the transmitted file '{submission_cloud_upload.file_upload.original_filename}'. "
            f"Expected checksum: {submission_cloud_upload.file_upload.md5}, actual checksum: {calculated_md5sum}"
        )
        
        jira_message_data["checksum_missmatched"] = True
        jira_message_data["provided_checksum"] = submission_cloud_upload.file_upload.md5
        jira_message_data["calculated_checksum"] = calculated_md5sum
        logger.warning(
            f"tasks.py | check_transfer_cloud_upload_checksums_task | " + checksum_missmatch_message +
            f" | submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id} | task_id={self.request.id}")

    jira_queue_message = JiraQueueMessage.objects.create(
        type=JiraQueueMessage.TYPE_CHECKSUM_CALCULATED,
        data=jira_message_data,
        submission_id=submission_id
    )
    jira_queue_message.save()

    return jira_queue_message.pk
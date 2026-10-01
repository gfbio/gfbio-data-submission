# -*- coding: utf-8 -*-
import logging

from botocore.exceptions import ClientError

from gfbio_submissions.brokerage.exceptions.transfer_exceptions import TransferServerError
from gfbio_submissions.brokerage.models.jira_queue_message import JiraQueueMessage
from gfbio_submissions.brokerage.utils.cloud_upload_checksum import (
    _is_transient_s3_error,
    calculate_checksum_locally,
)

from ...models import SubmissionCloudUpload
from ...models.task_progress_report import TaskProgressReport
from ...utils.task_utils import get_submission_and_site_configuration
from ..submission_task import submission_task

logger = logging.getLogger(__name__)


@submission_task("tasks.verify_file_upload_request_checksum_in_bucket_task", queue="ena_transfer")
def verify_file_upload_request_checksum_in_bucket_task(
    self, previous_result=None, submission_cloud_upload_id=None, submission_id=None
):
    logger.info(
        f"tasks.py | check_transfer_cloud_upload_checksums_task | queue={self.queue} | task_id={self.request.id}"
    )
    if previous_result == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )

    if submission == TaskProgressReport.CANCELLED:
        logger.error(
            "tasks.py | check_transfer_cloud_upload_checksums_task | "
            f"previous task reported={TaskProgressReport.CANCELLED} | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | "
            f"submission_id={submission_id} | task_id={self.request.id}"
        )
        return TaskProgressReport.CANCELLED
    try:
        submission_cloud_upload = SubmissionCloudUpload.objects.get(pk=submission_cloud_upload_id)
    except SubmissionCloudUpload.DoesNotExist:
        logger.error(
            "tasks.py | check_transfer_cloud_upload_checksums_task | "
            "no valid SubmissionCloudUpload available | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | "
            f"submission_id={submission_id} | task_id={self.request.id}"
        )
        return TaskProgressReport.CANCELLED

    try:
        calculated_md5sum = calculate_checksum_locally("md5", submission_cloud_upload)
    except ClientError as exc:
        if _is_transient_s3_error(exc):
            raise TransferServerError(str(exc)) from exc
        raise
    if calculated_md5sum == "":
        logger.error(
            f"tasks.py | check_transfer_cloud_upload_checksums_task | object not found in S3 | "
            f"file_key={submission_cloud_upload.file_upload.file_key} | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id} | "
            f"task_id={self.request.id}"
        )
        return TaskProgressReport.CANCELLED

    jira_message_data = {"file_name": submission_cloud_upload.file_upload.original_filename}
    if calculated_md5sum == submission_cloud_upload.file_upload.md5:
        submission_cloud_upload.status = SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM
        submission_cloud_upload.save()
        submission_cloud_upload.log_change(
            [{"changed": {"fields": [f"status changed to {submission_cloud_upload.status}"]}}]
        )
        jira_message_data["checksum_missmatched"] = False
    else:
        submission_cloud_upload.status = SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM
        submission_cloud_upload.save()
        submission_cloud_upload.log_change(
            [{"changed": {"fields": [f"status changed to {submission_cloud_upload.status}"]}}]
        )
        checksum_missmatch_message = (
            "A checksum-missmatch occurred for the transmitted file "
            f"'{submission_cloud_upload.file_upload.original_filename}'. "
            f"Expected checksum: {submission_cloud_upload.file_upload.md5}, "
            f"actual checksum: {calculated_md5sum}"
        )

        jira_message_data["checksum_missmatched"] = True
        jira_message_data["provided_checksum"] = submission_cloud_upload.file_upload.md5
        jira_message_data["calculated_checksum"] = calculated_md5sum
        logger.warning(
            "tasks.py | check_transfer_cloud_upload_checksums_task | "
            + checksum_missmatch_message
            + f" | submission_cloud_upload_id={submission_cloud_upload_id} | "
            f"submission_id={submission_id} | task_id={self.request.id}"
        )

    jira_queue_message = JiraQueueMessage.objects.create(
        type=JiraQueueMessage.TYPE_CHECKSUM_CALCULATED, data=jira_message_data, submission_id=submission_id
    )
    jira_queue_message.save()

    return jira_queue_message.pk

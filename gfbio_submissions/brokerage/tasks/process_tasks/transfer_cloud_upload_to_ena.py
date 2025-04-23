# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...models import SubmissionCloudUpload
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.transfer_cloud_upload_to_ena_task",
    # autoretry_for=(TransferServerError, TransferClientError),
    # retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    # retry_backoff=SUBMISSION_RETRY_DELAY,
    # retry_jitter=True,
)
def transfer_cloud_upload_to_ena_task(self, previous_result=None, submission_cloud_upload_id=None):
    if previous_result == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    submission_cloud_upload = None
    try:
        submission_cloud_upload = SubmissionCloudUpload.objects.get(pk=submission_cloud_upload_id)
    except SubmissionCloudUpload.DoesNotExist:
        logger.error(
            "tasks.py | transfer_cloud_upload_to_ena_task | "
            "no valid SubmissionCloudUpload available | "
            "submission_cloud_upload_id={0}".format(submission_cloud_upload_id))
        return TaskProgressReport.CANCELLED
    print("download temp file for cloud upload", submission_cloud_upload)
    print("transfer via ascp")
    print("deal with return values")
    print("save result to Requestlog & TaskProgressReport")
    print("delete temp file")
    return TaskProgressReport.CANCELLED

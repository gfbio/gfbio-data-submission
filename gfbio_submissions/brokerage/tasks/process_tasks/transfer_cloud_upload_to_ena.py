# -*- coding: utf-8 -*-
import logging
import os
import tempfile

from config.celery_app import app
from ...models import SubmissionCloudUpload
from ...models.task_progress_report import TaskProgressReport
from dt_upload.views.backend_based_upload_mixins import get_s3_client

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
    print("\n\nprocess upload: ", submission_cloud_upload)
    print(submission_cloud_upload.file_upload.original_filename)
    print(submission_cloud_upload.file_upload.file_key)
    print(submission_cloud_upload.file_upload.s3_location)
    print("check s3 mount -------------------")
    path = "/mnt/s3bucket"
    file_path = f"{path}{os.path.sep}{submission_cloud_upload.file_upload.file_key}"
    print(os.path.exists(path))
    print(os.path.exists(file_path))
    if os.path.exists(file_path):
        print(file_path)
        print(os.path.getsize(file_path))
    else:
        print("no found ", file_path)
    # bucket_name, s3_client = get_s3_client()
    # with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
    #     s3_client.download_fileobj(
    #         Bucket=bucket_name,
    #         Key=submission_cloud_upload.file_upload.file_key,
    #         Fileobj=tmp_file
    #     )
    #     local_path = tmp_file.name
    #     print("Loca PATH", local_path)
    #     print("size ", os.path.getsize(local_path))
    print("\n\n-----------------------------------\n\ntransfer via ascp")
    print("deal with return values")
    print("save result to Requestlog & TaskProgressReport")
    print("delete temp file")
    # os.remove(local_path)
    return TaskProgressReport.CANCELLED

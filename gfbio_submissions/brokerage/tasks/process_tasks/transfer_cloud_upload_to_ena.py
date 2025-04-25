# -*- coding: utf-8 -*-
import logging
import os
import subprocess

from config.celery_app import app
from config.settings.base import ASPERA_ASCP_PATH
from ...models import SubmissionCloudUpload
from ...models.task_progress_report import TaskProgressReport
from ...utils.task_utils import get_submission_and_site_configuration
from ....generic.models.request_log import RequestLog

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.transfer_cloud_upload_to_ena_task",
)
def transfer_cloud_upload_to_ena_task(self, previous_result=None, submission_cloud_upload_id=None, submission_id=None):
    if previous_result == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | previous task reported={TaskProgressReport.CANCELLED} | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id}")
        return TaskProgressReport.CANCELLED
    submission_cloud_upload = None
    try:
        submission_cloud_upload = SubmissionCloudUpload.objects.get(pk=submission_cloud_upload_id)
    except SubmissionCloudUpload.DoesNotExist:
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | no valid SubmissionCloudUpload available | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id}")
        return TaskProgressReport.CANCELLED

    # TODO: defaults per settings
    path = "/mnt/s3bucket"
    file_path = f"{path}{os.path.sep}{submission_cloud_upload.file_upload.file_key}"
    if not os.path.exists(file_path):
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | no valid file_path available | file_path={file_path} "
        )
        return TaskProgressReport.CANCELLED

    aspera_host = site_configuration.ena_aspera_server.url
    aspera_user = site_configuration.ena_aspera_server.username

    # according to: https://ena-docs.readthedocs.io/en/latest/submit/fileprep/upload.html#using-aspera-ascp-command-line-program
    aspera_target_path = "."


    remote_dest = f"{aspera_user}@{aspera_host}:{aspera_target_path}"

    cmd = [ASPERA_ASCP_PATH, "-QT", "-l", "100M", file_path, remote_dest]
    logger.info(f"tasks.py | transfer_cloud_upload_to_ena_task | execute cmd={cmd}")

    res = TaskProgressReport.CANCELLED
    details = {"cmd": cmd}
    try:
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        proc.communicate(input=f"{site_configuration.ena_aspera_server.password}\n".encode("ASCII"))
        res = True
    except Exception as e:
        details['error'] = str(e)
        logger.error(f"tasks.py | transfer_cloud_upload_to_ena_task | error={e} | cmd={cmd} | ")

    RequestLog.objects.create(
        type=RequestLog.OUTGOING,
        url=site_configuration.ena_aspera_server.url,
        method=RequestLog.NONE,
        user=submission.user,
        submission_id=submission.broker_submission_id,
        request_details=details,
        # response_content=response.data,
        # response_status=response.status_code,
    )
    print("\n\n-----------------------------------\n\ntransfer via ascp")
    print("deal with return values")
    return res

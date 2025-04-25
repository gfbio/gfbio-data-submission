# -*- coding: utf-8 -*-
import logging
import os
import subprocess

from config.celery_app import app
from ...models import SubmissionCloudUpload
from ...models.task_progress_report import TaskProgressReport
from ...utils.task_utils import get_submission_and_site_configuration

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

    # TODO: via resource credentials.
    # aspera_host = "webin.ebi.ac.uk"
    # aspera_user = "Webin-40945"
    aspera_host = site_configuration.ena_aspera_server.url
    aspera_user = site_configuration.ena_aspera_server.username

    # TODO: defaults per settings
    # according to: https://ena-docs.readthedocs.io/en/latest/submit/fileprep/upload.html#using-aspera-ascp-command-line-program
    aspera_target_path = "."
    ascp_path = "/home/asperauser/.aspera/connect/bin/ascp"

    remote_dest = f"{aspera_user}@{aspera_host}:{aspera_target_path}"

    cmd = [ascp_path, "-QT", "-l", "100M", file_path, remote_dest]
    logger.info(f"tasks.py | transfer_cloud_upload_to_ena_task | execute cmd={cmd}")

    try:
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        proc.communicate(input=f"{site_configuration.ena_aspera_server.password}\n".encode("ASCII"))
    except Exception as e:
        logger.error(f"tasks.py | transfer_cloud_upload_to_ena_task | error={e} | cmd={cmd} | ")
        return TaskProgressReport.CANCELLED

    print("\n\n-----------------------------------\n\ntransfer via ascp")
    print("deal with return values")
    print("save result to Requestlog & TaskProgressReport")
    return True

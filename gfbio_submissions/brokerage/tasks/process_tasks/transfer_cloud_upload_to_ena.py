# -*- coding: utf-8 -*-
import logging
import os
import subprocess

from celery.exceptions import Retry
from django.conf import settings

from config.celery_app import app
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
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
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
    queue="ena_transfer",
)
def transfer_cloud_upload_to_ena_task(self, previous_result=None, submission_cloud_upload_id=None, submission_id=None):
    logger.info(f"tasks.py | transfer_cloud_upload_to_ena_task | queue={self.queue} | task_id={self.request.id}")
    if previous_result == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | previous task reported={TaskProgressReport.CANCELLED} | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id} | task_id={self.request.id}")
        return TaskProgressReport.CANCELLED
    submission_cloud_upload = None
    try:
        submission_cloud_upload = SubmissionCloudUpload.objects.get(pk=submission_cloud_upload_id)
    except SubmissionCloudUpload.DoesNotExist:
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | no valid SubmissionCloudUpload available | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id} | task_id={self.request.id}")
        return TaskProgressReport.CANCELLED

    # TODO: defaults per settings

    file_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{submission_cloud_upload.file_upload.file_key}"
    if not os.path.exists(file_path):
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | no valid file_path available | file_path={file_path} | task_id={self.request.id}"
        )
        return TaskProgressReport.CANCELLED

    aspera_host = site_configuration.ena_aspera_server.url
    aspera_user = site_configuration.ena_aspera_server.username

    # according to: https://ena-docs.readthedocs.io/en/latest/submit/fileprep/upload.html#using-aspera-ascp-command-line-program
    aspera_target_path = "."

    remote_dest = f"{aspera_user}@{aspera_host}:{aspera_target_path}"

    cmd = [settings.ASPERA_ASCP_PATH, "-QT", "-l", "100M", file_path, remote_dest]
    logger.info(f"tasks.py | transfer_cloud_upload_to_ena_task | execute cmd={cmd} | task_id={self.request.id}")

    res = TaskProgressReport.CANCELLED
    details = {"cmd": cmd}
    try:
        logger.info(f"tasks.py | trying to execute | task_id={self.request.id}")

        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.info(f"tasks.py | subprocess opened | execute proc={proc} | task_id={self.request.id}")

        stdout, stderr = proc.communicate(input=f"{site_configuration.ena_aspera_server.password}\n".encode("ASCII"))

        logger.info(
            f"tasks.py | transfer_cloud_upload_to_ena_task | after communicate password | ascp stdout: {stdout.decode(errors='replace')} | task_id={self.request.id}")
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | after communicate password |ascp stderr: {stderr.decode(errors='replace')} | task_id={self.request.id}")
        logger.info(
            f"tasks.py | transfer_cloud_upload_to_ena_task | after communicate password | expect process to be terminated | {proc.returncode} | task_id={self.request.id}")

        retryable_patterns = [
            "failed to connect",
            "unable to reach server",
            "target address not available",
            "server not responding",
            "session timeout",
            "connection lost",
            "network error",
            "timeout"
        ]
        if proc.returncode != 0:
            stderr_str = stderr.decode(errors='replace').lower()
            if any(pattern in stderr_str for pattern in retryable_patterns):
                logger.info(
                    f"tasks.py | transfer_cloud_upload_to_ena_task | starting retry | "
                    f"stderr_str={stderr_str} | proc.returncode={proc.returncode} | task_id={self.request.id}"
                )
                raise self.retry(exc=Exception(stderr_str))
            else:
                res = TaskProgressReport.CANCELLED
                logger.error(
                    f"tasks.py | transfer_cloud_upload_to_ena_task | general error | "
                    f"stderr_str={stderr_str} | proc.returncode={proc.returncode} | task_id={self.request.id}"
                )
        else:
            res = True
    except Retry:
        raise
    except Exception as e:
        details['error'] = str(e)
        logger.error(f"tasks.py | transfer_cloud_upload_to_ena_task | error={e} | cmd={cmd} | task_id={self.request.id}")

    RequestLog.objects.create(
        type=RequestLog.OUTGOING,
        url=site_configuration.ena_aspera_server.url,
        method=RequestLog.NONE,
        user=submission.user,
        submission_id=submission.broker_submission_id,
        request_details=details,
    )
    return res

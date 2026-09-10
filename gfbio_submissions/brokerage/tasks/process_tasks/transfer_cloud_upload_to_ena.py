import json
import logging
import os
import subprocess
import uuid

import celery
from celery.exceptions import Retry
from django.conf import settings
from django.core.cache import cache
from kombu.exceptions import OperationalError as KombuOperationalError

from config.celery_app import app

from ....generic.models.request_log import RequestLog
from ....users.models import User
from ...configuration.settings import (
    SUBMISSION_DELAY,
    SUBMISSION_MAX_RETRIES,
    SUBMISSION_RETRY_DELAY,
)
from ...exceptions.transfer_exceptions import TransferServerError
from ...models import SubmissionCloudUpload
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.ena import open_ftp_to_ena_download_file_and_calculate_checksum
from ...utils.task_utils import get_submission_and_site_configuration
from .notify_admin_on_ena_transfer_completed import (
    notify_admin_on_ena_transfer_completed_task,
)

logger = logging.getLogger(__name__)


def ensure_folder_with_keep(path):
    logger.info(f"tasks.py | transfer_cloud_upload_to_ena_task | ensure_folder_with_keep | path={path}")
    os.makedirs(path, exist_ok=True)
    keep_file = os.path.join(path, ".keep")
    if not os.path.exists(keep_file):
        logger.info(f"tasks.py | transfer_cloud_upload_to_ena_task | ensure_folder_with_keep | "
                    f"path not existing write={keep_file}")
        with open(keep_file, "w") as f:
            f.write("")


def perform_ascp_file_transfer(task, file_path, site_configuration, submission, submission_cloud_upload, user_id,
                               report, target_filename=None):
    # according to: https://ena-docs.readthedocs.io/en/latest/submit/fileprep/upload.html#using-aspera-ascp-command-line-program
    # Rename on upload: put the final name in the remote path (…/submission_id/original_filename).
    if target_filename:
        target_filename = os.path.basename(target_filename)
    aspera_host = site_configuration.ena_aspera_server.url
    aspera_user = site_configuration.ena_aspera_server.username
    aspera_target_path = (
        f"/{submission.broker_submission_id}/{target_filename}"
        if target_filename
        else f"/{submission.broker_submission_id}/"
    )
    remote_dest = f"{aspera_user}@{aspera_host}:{aspera_target_path}"
    cmd = [settings.ASPERA_ASCP_PATH, "-QT", "-l", "100M", file_path, remote_dest]
    logger.info(f"tasks.py | transfer_cloud_upload_to_ena_task | execute cmd={cmd} | task_id={task.request.id}")
    res = TaskProgressReport.CANCELLED
    details = {"cmd": cmd}
    try:
        logger.info(f"tasks.py | trying to execute | task_id={task.request.id}")
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.info(f"tasks.py | subprocess opened | execute proc={proc} | task_id={task.request.id}")

        stdout, stderr = proc.communicate(input=f"{site_configuration.ena_aspera_server.password}\n".encode("ASCII"))
        details["stdout"] = stdout.decode("utf-8")
        details["stderr"] = stderr.decode("utf-8")
        logger.info(
            f"tasks.py | transfer_cloud_upload_to_ena_task | after communicate password | "
            f"ascp stdout: {stdout.decode(errors='replace')} | task_id={task.request.id}")
        logger.info(
            f"tasks.py | transfer_cloud_upload_to_ena_task | after communicate password |"
            f"ascp stderr: {stderr.decode(errors='replace')} | task_id={task.request.id}")
        logger.info(
            f"tasks.py | transfer_cloud_upload_to_ena_task | after communicate password | "
            f"expect process to be terminated | {proc.returncode} | task_id={task.request.id}")

        retryable_patterns = [
            "failed to connect",
            "unable to reach server",
            "target address not available",
            "server not responding",
            "session timeout",
            "connection lost",
            "network error",
            "timeout",
        ]
        if proc.returncode != 0:
            stderr_str = stderr.decode(errors="replace").lower()
            if submission_cloud_upload.status != SubmissionCloudUpload.STATUS_TRANSFER_FAILED:
                submission_cloud_upload.status = SubmissionCloudUpload.STATUS_TRANSFER_FAILED
                submission_cloud_upload.save()
                submission_cloud_upload.log_change([{"changed": {
                    "fields": [f"status changed to {submission_cloud_upload.status} due to {stderr_str}"]}}], user_id)
            else:
                submission_cloud_upload.log_change(
                    [{"changed": {"fields": [f"status kept at {submission_cloud_upload.status} due to {stderr_str}"]}}],
                    user_id)

            if any(pattern in stderr_str for pattern in retryable_patterns):
                logger.info(
                    f"tasks.py | transfer_cloud_upload_to_ena_task | starting retry | "
                    f"stderr_str={stderr_str} | proc.returncode={proc.returncode} | task_id={task.request.id}"
                )
                raise task.retry(
                    exc=Exception(stderr_str),
                    max_retries=SUBMISSION_MAX_RETRIES,
                    countdown=SUBMISSION_RETRY_DELAY,
                )
            else:
                res = TaskProgressReport.CANCELLED
                logger.error(
                    f"tasks.py | transfer_cloud_upload_to_ena_task | general error | "
                    f"stderr_str={stderr_str} | proc.returncode={proc.returncode} | task_id={task.request.id}"
                )
                report.task_exception = "Bad response from Aspera: " + json.dumps(details)
                report.save()
        else:
            res = True
            # save the space, if no error occured
            del details["stdout"]
            del details["stderr"]
    except Retry:
        details["retry_raised"] = True
        raise
    except Exception as e:
        details["error"] = str(e)
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | error={e} | cmd={cmd} | task_id={task.request.id}")
        if submission_cloud_upload.status != SubmissionCloudUpload.STATUS_TRANSFER_FAILED:
            submission_cloud_upload.status = SubmissionCloudUpload.STATUS_TRANSFER_FAILED
            submission_cloud_upload.save()
            submission_cloud_upload.log_change([{"changed": {
                "fields": [f"status changed to {submission_cloud_upload.status} due to {details['error']}"]}}], user_id)
        else:
            submission_cloud_upload.log_change([{"changed": {
                "fields": [f"status kept at {submission_cloud_upload.status} due to {details['error']}"]}}], user_id)
        raise
    finally:
        RequestLog.objects.create(
            type=RequestLog.OUTGOING,
            url=site_configuration.ena_aspera_server.url,
            method=RequestLog.NONE,
            user=submission.user,
            submission_id=submission.broker_submission_id,
            request_details=details,
        )
    return res


def check_checksum_via_ftp(task, site_configuration, submission, submission_cloud_upload, admin_user):
    try:
        calculated_md5sum, transmission_protocol = open_ftp_to_ena_download_file_and_calculate_checksum(
            site_configuration, submission_cloud_upload)
        if calculated_md5sum == submission_cloud_upload.file_upload.md5:
            checksum_message = f"Matching checksums: {calculated_md5sum}"
            submission_cloud_upload.status = SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_CHECKED_CHECKSUM
            submission_cloud_upload.save()
            submission_cloud_upload.log_change(
                [{"changed": {"fields": [f"status changed to {submission_cloud_upload.status}"]}}], admin_user.pk)
        else:
            checksum_message = f"Expected checksum: {submission_cloud_upload.file_upload.md5} | actual checksum: {calculated_md5sum}"
            submission_cloud_upload.status = SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_BAD_CHECKSUM
            submission_cloud_upload.save()
            submission_cloud_upload.log_change(
                [{"changed": {"fields": [f"status changed to {submission_cloud_upload.status} ({checksum_message})"]}}],
                admin_user.pk)

            transmission_protocol.append(checksum_message)
            if task.request.retries == 0:
                raise task.retry(
                    exc=Exception(transmission_protocol),
                    max_retries=SUBMISSION_MAX_RETRIES,
                    countdown=SUBMISSION_RETRY_DELAY,
                )
            else:
                message = (
                    f"Checksum-Missmatch in submission {submission.broker_submission_id}, cloud_upload {submission_cloud_upload.file_upload.original_filename}: "
                    + f"The checksum of the transmitted file {submission_cloud_upload.file_upload.original_filename} "
                    + f"at ENA differs from the expected checksum, even after retrying. {checksum_message}"
                )
                raise Exception(message)
    finally:
        RequestLog.objects.create(
            type=RequestLog.OUTGOING,
            url=site_configuration.ena_ftp.url,
            method=RequestLog.NONE,
            user=admin_user if admin_user else None,
            submission_id=submission.broker_submission_id,
            json=transmission_protocol,
            files=submission_cloud_upload.file_upload.original_filename,
            data=checksum_message,
        )


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.transfer_cloud_upload_to_ena_task",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
    queue="ena_transfer",
)
def transfer_cloud_upload_to_ena_task(self, previous_result=None, submission_cloud_upload_id=None, submission_id=None,
                                      user_id=None):
    logger.info(f"tasks.py | transfer_cloud_upload_to_ena_task | queue={self.queue} | task_id={self.request.id}")
    if previous_result == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )

    admin_user = None
    if user_id:
        admin_user = User.objects.get(pk=user_id)
    if submission == TaskProgressReport.CANCELLED:
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | previous task reported={TaskProgressReport.CANCELLED} | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id} | task_id={self.request.id}")
        return TaskProgressReport.CANCELLED

    report, created = TaskProgressReport.objects.create_initial_report(submission=submission, task=self)
    try:
        submission_cloud_upload = SubmissionCloudUpload.objects.get(pk=submission_cloud_upload_id)
    except SubmissionCloudUpload.DoesNotExist:
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | no valid SubmissionCloudUpload available | "
            f"submission_cloud_upload_id={submission_cloud_upload_id} | submission_id={submission_id} | task_id={self.request.id}")
        report.task_exception = "no valid SubmissionCloudUpload available"
        report.save()
        return TaskProgressReport.CANCELLED

    file_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{submission_cloud_upload.file_upload.file_key}"
    if not os.path.exists(file_path):
        logger.error(
            f"tasks.py | transfer_cloud_upload_to_ena_task | no valid file_path available | file_path={file_path} | task_id={self.request.id}"
        )
        report.task_exception = f"no valid file_path available | file_path={file_path} "
        report.save()
        submission_cloud_upload.status = SubmissionCloudUpload.STATUS_TRANSFER_FAILED
        submission_cloud_upload.save()
        submission_cloud_upload.log_change([{"changed": {
            "fields": [f"status changed to {submission_cloud_upload.status} (File not found in bucket)"]}}], user_id)
        return TaskProgressReport.CANCELLED

    folder_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{submission.broker_submission_id}"
    ensure_folder_with_keep(folder_path)

    original_filename = submission_cloud_upload.file_upload.original_filename
    key_basename = os.path.basename(file_path)
    orig_basename = os.path.basename(original_filename) if original_filename else ""
    target_filename = None
    if orig_basename and key_basename != orig_basename:
        target_filename = orig_basename
        logger.info(
            f"tasks.py | transfer_cloud_upload_to_ena_task | transfer with original_filename | "
            f"original={orig_basename} | file_key_basename={key_basename} | task_id={self.request.id}"
        )

    transfer_result = perform_ascp_file_transfer(
        self,
        file_path,
        site_configuration,
        submission,
        submission_cloud_upload,
        user_id,
        report,
        target_filename=target_filename,
    )
    if transfer_result == True:
        submission_cloud_upload.status = SubmissionCloudUpload.STATUS_IS_TRANSFERRED
        submission_cloud_upload.save()
        submission_cloud_upload.log_change(
            [{"changed": {"fields": [f"status changed to {submission_cloud_upload.status}"]}}], user_id
        )
        check_checksum_via_ftp(self, site_configuration, submission, submission_cloud_upload, admin_user)

    return transfer_result


ENA_TRANSFER_LOCK_TIMEOUT = 7 * 24 * 60 * 60


def ena_transfer_lock_key(submission_id):
    return f"ena-cloud-upload-transfer:{submission_id}"


def acquire_ena_transfer_lock(submission_id):
    token = str(uuid.uuid4())
    if cache.add(ena_transfer_lock_key(submission_id), token, ENA_TRANSFER_LOCK_TIMEOUT):
        return token
    return None


def release_ena_transfer_lock(submission_id, token):
    key = ena_transfer_lock_key(submission_id)
    if token and cache.get(key) == token:
        cache.delete(key)


def _apply_async_or_reraise(signature, **options):
    try:
        return signature.apply_async(**options)
    except (ConnectionError, KombuOperationalError) as exc:
        raise TransferServerError(str(exc)) from exc


class EnaTransferDispatcherTask(celery.Task):
    abstract = True

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        release_ena_transfer_lock(kwargs.get("submission_id"), kwargs.get("lock_token"))
        super().on_failure(exc, task_id, args, kwargs, einfo)


@app.task(
    base=EnaTransferDispatcherTask,
    bind=True,
    name="tasks.advance_ena_cloud_upload_transfer_task",
    queue="ena_transfer",
    autoretry_for=(TransferServerError,),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def advance_ena_cloud_upload_transfer_task(
    self,
    previous_result=None,
    submission_id=None,
    submission_cloud_upload_ids=None,
    user_id=None,
    index=0,
    lock_token=None,
):
    """Schedule the next ENA transfer, or notify when the submission list is done.

    Each transfer is started with the same immutable dispatcher as success and
    error callback so a terminal failure still continues with the next file.
    Celery retries keep those links; they do not advance the index.
    Uses a plain bound task so orchestration does not create TaskProgressReports.
    """
    upload_ids = list(submission_cloud_upload_ids or [])
    if index >= len(upload_ids):
        logger.info(
            "tasks.py | advance_ena_cloud_upload_transfer_task | notify | "
            "submission_id=%s | upload_count=%s | task_id=%s",
            submission_id,
            len(upload_ids),
            self.request.id,
        )
        _apply_async_or_reraise(
            notify_admin_on_ena_transfer_completed_task.si(
                submission_id=submission_id,
                submission_cloud_upload_ids=upload_ids,
            ),
            countdown=SUBMISSION_DELAY,
        )
        release_ena_transfer_lock(submission_id, lock_token)
        return True

    logger.info(
        "tasks.py | advance_ena_cloud_upload_transfer_task | schedule transfer | "
        "submission_id=%s | index=%s | submission_cloud_upload_id=%s | task_id=%s",
        submission_id,
        index,
        upload_ids[index],
        self.request.id,
    )
    continuation = advance_ena_cloud_upload_transfer_task.si(
        submission_id=submission_id,
        submission_cloud_upload_ids=upload_ids,
        user_id=user_id,
        index=index + 1,
        lock_token=lock_token,
    )
    _apply_async_or_reraise(
        transfer_cloud_upload_to_ena_task.si(
            submission_cloud_upload_id=upload_ids[index],
            submission_id=submission_id,
            user_id=user_id,
        ),
        link=continuation,
        link_error=continuation.clone(),
    )
    return True

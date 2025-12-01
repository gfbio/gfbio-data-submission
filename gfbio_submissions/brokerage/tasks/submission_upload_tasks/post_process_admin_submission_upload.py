import logging
from django.conf import settings
import os
import hashlib

from django.db import transaction

from config.celery_app import app
from dt_upload.models import FileUploadRequest
from dt_upload.tasks.backup_task import save_to_redundant_storage_clientside_fileupload

from ...models.task_progress_report import TaskProgressReport
from ..submission_task import SubmissionTask

logger = logging.getLogger(__name__)



@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.post_process_admin_submission_upload_task",
)
def post_process_admin_submission_upload_task(self, previous_task_result=None, file_upload_request_id=None):
    report, created = TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    file_upload_request = FileUploadRequest.objects.filter(id=file_upload_request_id).first()

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | post_process_admin_submission_upload_task | "
            "previous task reported={0} | "
            "file_upload_request_id={1}".format(TaskProgressReport.CANCELLED, file_upload_request_id)
        )
        return TaskProgressReport.CANCELLED

    if not file_upload_request:
        logger.error(
            "tasks.py | post_process_admin_submission_upload_task | "
            "no valid FileUploadRequest available | "
            "file_upload_request_id={0}".format(file_upload_request_id)
        )
        return TaskProgressReport.CANCELLED

    with transaction.atomic():
        move_file_and_update_file_upload(file_upload_request)

    with transaction.atomic():
        report.save()
    return True


def move_file_and_update_file_upload(file_upload_request):
    file_path_src = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{file_upload_request.uploaded_file.name}"
    file_path_trg = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{file_upload_request.file_key}"
    mv_cmd = f'mv -f "{file_path_src}" "{file_path_trg}"'
    os.system(mv_cmd)

    file_upload_request.uploaded_file.name = file_upload_request.file_key
    file_upload_request.file_size = os.stat(file_path_trg).st_size

    if os.path.exists(file_path_trg):
        with open(file_path_trg, 'rb') as f:
            f_read = f.read()
            file_upload_request.md5 = hashlib.md5(f_read).hexdigest()
            file_upload_request.sha256 = hashlib.sha256(f_read).hexdigest()

    file_upload_request.status = "COMPLETED"
    file_upload_request.save()

    if getattr(settings, "DJANGO_UPLOAD_TOOLS_USE_MODEL_BACKUP", False):
        save_to_redundant_storage_clientside_fileupload.apply_async(
            kwargs={
                "file_upload_request_id": file_upload_request.id,
            }
        )
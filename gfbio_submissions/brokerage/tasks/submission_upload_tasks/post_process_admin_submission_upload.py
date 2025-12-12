import logging
from django.conf import settings
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
    """
    Recalculate size and checksums for the current uploaded_file and update metadata.

    The file is assumed to already be stored at uploaded_file.name using CloudStorage
    (upload_to of FileUploadRequest has already placed it under <submission_id>/<filename>).
    """

    field_file = file_upload_request.uploaded_file
    if not field_file or not field_file.name:
        logger.warning(
            "move_file_and_update_file_upload: no uploaded_file for FileUploadRequest id=%s",
            file_upload_request.pk,
        )
        return

    storage = field_file.storage
    name = field_file.name

    file_upload_request.file_key = name

    if not storage.exists(name):
        logger.error(
            "move_file_and_update_file_upload: storage object %r not found for FileUploadRequest id=%s",
            name,
            file_upload_request.pk,
        )
        file_upload_request.status = FileUploadRequest.FAILED
        file_upload_request.save(update_fields=["status"])
        return

    file_size = storage.size(name)

    md5 = hashlib.md5()
    sha256 = hashlib.sha256()
    with storage.open(name, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            if not chunk:
                break
            md5.update(chunk)
            sha256.update(chunk)

    file_upload_request.file_size = file_size
    file_upload_request.md5 = md5.hexdigest()
    file_upload_request.sha256 = sha256.hexdigest()

    file_upload_request.status = FileUploadRequest.COMPLETED
    file_upload_request.save()

    if getattr(settings, "DJANGO_UPLOAD_TOOLS_USE_MODEL_BACKUP", False):
        save_to_redundant_storage_clientside_fileupload.apply_async(
            kwargs={"file_upload_request_id": file_upload_request.id}
        )

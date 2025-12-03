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


def move_file_and_update_file_upload(file_upload_request, delete_old=True):
    """
    Re-save the uploaded file under its desired key and update metadata.

    The overwrite / "new unique name" behavior is delegated to CloudStorage,
    which uses DJANGO_UPLOAD_TOOLS_USE_REUPLOAD.
    """
    field_file = file_upload_request.uploaded_file

    if not field_file:
        return

    print("hehehehe" + field_file.name)
    storage = field_file.storage
    print("hehehehe" + storage)

    requested_name = file_upload_request.file_key
    print("hehehehe" + requested_name)
    field_file.open("rb")

    try:
        stored_name = storage.save(requested_name, field_file.file)
    finally:
        field_file.close()

    file_upload_request.file_key = stored_name
    file_upload_request.uploaded_file.name = stored_name
    file_upload_request.file_size = storage.size(stored_name)

    md5 = hashlib.md5()
    sha256 = hashlib.sha256()
    with storage.open(stored_name, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            md5.update(chunk)
            sha256.update(chunk)

    file_upload_request.md5 = md5.hexdigest()
    file_upload_request.sha256 = sha256.hexdigest()

    file_upload_request.status = FileUploadRequest.COMPLETED
    file_upload_request.save()

    if getattr(settings, "DJANGO_UPLOAD_TOOLS_USE_MODEL_BACKUP", False):
        save_to_redundant_storage_clientside_fileupload.apply_async(
            kwargs={"file_upload_request_id": file_upload_request.id}
        )

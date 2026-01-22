import logging
import os
from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from dt_upload.models import FileUploadRequest
from .models import SubmissionCloudUpload
from .tasks.submission_upload_tasks.post_process_admin_submission_upload import (
    post_process_admin_submission_upload_task,
    move_file_and_update_file_upload,
)
from builtins import getattr

from dt_upload.models import FileUploadRequest

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=FileUploadRequest, dispatch_uid="fileuploadrequest_flag_file_change")
def flag_uploaded_file_change(sender, instance: FileUploadRequest, **kwargs):
    """
    Mark instance._uploaded_file_changed = True only when:

    - The instance already existed (pk is not None), AND
    - It already had a non-empty uploaded_file name before, AND
    - A *new* upload object was assigned (admin reupload).

    This ignores:
    - Initial creation (pk is None),
    - Transitions "no file" -> "file",
    - Saves where no new file was uploaded.
    """

    file = instance.uploaded_file

    # New instance: never trigger the "file changed" logic
    if not instance.pk:
        instance._uploaded_file_changed = False
        return

    # Existing instance: look at old DB state
    try:
        old = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        instance._uploaded_file_changed = False
        return

    old_name = old.uploaded_file.name if old.uploaded_file else ""
    new_name = file.name if file else ""

    # If there was no file before or no file now, do NOT trigger.
    # This makes "empty -> file" and "file -> empty" both no-ops for the task.
    if not old_name or not new_name:
        instance._uploaded_file_changed = False
        return

    # Only treat "a new upload object was assigned" as a change.
    # This is what happens in the admin when a user actually uploads a new file,
    # even if the filename stays the same.
    if file is not None and hasattr(file, "_committed") and not file._committed:
        instance._uploaded_file_changed = True
    else:
        instance._uploaded_file_changed = False


@receiver(post_save, sender=FileUploadRequest, dispatch_uid="recalculate_checksums")
def recalculate_checksums(sender, instance: FileUploadRequest, **kwargs):
    """
    Trigger checksum recalculation and metadata update when the file changes.

    - Only runs when _uploaded_file_changed is True (set by pre_save).
    - Only runs if there is a related SubmissionCloudUpload.
    - In Celery eager/debug mode: run inline.
    - Otherwise: mark as pending + schedule Celery task.
    """

    # Only care when the file field changed in this save
    if not getattr(instance, "_uploaded_file_changed", False):
        return

    # Clean up the flag to avoid leaking state
    if hasattr(instance, "_uploaded_file_changed"):
        delattr(instance, "_uploaded_file_changed")

    # We only care about FileUploadRequest objects that are wired to a submission
    submission_cloud_upload = (
        SubmissionCloudUpload.objects.filter(file_upload_id=instance.pk).select_related("submission").first()
    )

    if not submission_cloud_upload:
        return

    # Must actually have a file
    if not instance.uploaded_file or not instance.uploaded_file.name:
        return

    is_celery_in_debug = getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False) or getattr(
        settings, "CELERY_TASK_EAGER_PROPAGATES", False
    )

    # In local debug/eager mode, just do the work inline.
    if is_celery_in_debug:
        logger.debug(
            "recalculate_checksums: running inline for FileUploadRequest id=%s (eager Celery)",
            instance.pk,
        )
        move_file_and_update_file_upload(instance)
        return

    # In normal mode: mark as pending and schedule Celery task.
    instance.status = "PENDING-admin-upload"
    instance.md5 = "calculating"
    instance.sha256 = "calculating"
    instance.file_size = -1

    # This save will trigger post_save again, but _uploaded_file_changed will be False then.
    instance.save(update_fields=["status", "md5", "sha256", "file_size"])

    submission_cloud_upload.status = SubmissionCloudUpload.STATUS_NEW
    submission_cloud_upload.save()

    post_process_admin_submission_upload_task.apply_async(kwargs={"file_upload_request_id": str(instance.pk)})

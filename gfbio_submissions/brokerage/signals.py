import os
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from dt_upload.models import FileUploadRequest
from .models import SubmissionCloudUpload
from .tasks.submission_upload_tasks.post_process_admin_submission_upload import post_process_admin_submission_upload_task, move_file_and_update_file_upload

@receiver(post_save, sender=FileUploadRequest, dispatch_uid="recalculate_checksums")
def recalculate_checksums(sender, instance, **kwargs):
    submission_cloud_upload = SubmissionCloudUpload.objects.filter(file_upload_id = instance.pk).first()

    if (
        submission_cloud_upload and instance.status != "PENDING-admin-upload" and instance.uploaded_file.name 
            and not instance.uploaded_file.name.startswith(str(submission_cloud_upload.submission.broker_submission_id))
        ):
        file_path_in_bucket_root = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{instance.uploaded_file.name}"
        if os.path.exists(file_path_in_bucket_root):
            if (settings.CELERY_TASK_EAGER_PROPAGATES or settings.CELERY_TASK_ALWAYS_EAGER):
                # for some reason the changes made in celery get rolled back when these settings are active. So work around for local testing:
                move_file_and_update_file_upload(instance)
                return

            instance.status = "PENDING-admin-upload"
            instance.md5 = "calculating"
            instance.sha256 = "calculating"
            instance.file_size = -1
            instance.save()

            post_process_admin_submission_upload_task.apply_async(
                kwargs={"file_upload_request_id":"{0}".format(instance.pk)}
            )
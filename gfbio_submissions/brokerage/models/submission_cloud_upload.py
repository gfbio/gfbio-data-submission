# -*- coding: utf-8 -*-
from auditlog.registry import auditlog
from django.db import models
from model_utils.models import TimeStampedModel

from config.settings.base import AUTH_USER_MODEL

from ..configuration.settings import SUBMISSION_UPLOAD_RETRY_DELAY
from .submission import Submission


def _cloud_upload_change_note(message):
    if isinstance(message, str):
        return message
    parts = []
    if isinstance(message, list):
        for item in message:
            if not isinstance(item, dict):
                continue
            fields = (item.get("changed") or {}).get("fields") or []
            parts.extend(str(field) for field in fields)
    if parts:
        return "; ".join(parts)
    return str(message)


class SubmissionCloudUpload(TimeStampedModel):
    STATUS_ACTIVE = 'active'
    STATUS_NEW = 'new'
    STATUS_UPLOADED = 'uploaded'
    STATUS_UPLOADED_WITH_CHECKED_CHECKSUM = 'uploaded_with_checked_checksum'
    STATUS_UPLOADED_WITH_BAD_CHECKSUM = 'uploaded_with_bad_checksum'
    STATUS_TRANSFER_FAILED = 'transfer_failed'
    STATUS_IS_TRANSFERRED = 'transferred'
    STATUS_IS_TRANSFERRED_WITH_CHECKED_CHECKSUM = 'transferred_with_checked_checksum'
    STATUS_IS_TRANSFERRED_WITH_BAD_CHECKSUM = 'transferred_with_bad_checksum'
    STATUS_DELETED = 'deleted'
    STATUS_CHOICES = (
        (STATUS_NEW, 'New'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_DELETED, 'Deleted'),
        (STATUS_UPLOADED, 'In our bucket'),
        (STATUS_UPLOADED_WITH_CHECKED_CHECKSUM, 'In our bucket, checksum-check successfull'),
        (STATUS_UPLOADED_WITH_BAD_CHECKSUM, 'In our bucket, checksum-check failed'),
        (STATUS_IS_TRANSFERRED, 'File was transferred'),
        (STATUS_TRANSFER_FAILED, 'Tried to transfer file but failed'),
        (STATUS_IS_TRANSFERRED_WITH_CHECKED_CHECKSUM, 'File was transferred, checksum-check successfull'),
        (STATUS_IS_TRANSFERRED_WITH_BAD_CHECKSUM, 'File was transferred, checksum-check failed'),
    )

    submission = models.ForeignKey(
        Submission,
        null=True,
        blank=True,
        help_text="Submission associated with this SubmissionCloudUpload.",
        on_delete=models.CASCADE,
    )

    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="user_cloud_uploads",
        help_text="Owner of this SubmissionCloudUpload. Same as related submission.user",
        on_delete=models.SET_NULL,
    )

    attach_to_ticket = models.BooleanField(
        default=False,
        help_text="If checked the uploaded file will be attached to the "
                  "primary helpdesk ticket of the related submission.",
    )

    modified_recently = models.BooleanField(
        default=False,
        help_text="Checked automatically if 'file' has been updated and its content/md5_checksum has changed",
    )

    attachment_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="If 'file' is attached to a ticket, 'attachement_id' stores the primary identifier of "
                  "the attachment. Needed to access the attachment directly in the helpdesk, e.g. for removing an "
                  "attachment from a ticket.",
    )

    meta_data = models.BooleanField(
        default=False,
        help_text="Checked value means that it is assumed that this file contains the 'meta-data' of the related "
                  "submission. Only one meta-data file per submission is allowed",
    )

    status = models.CharField(
        max_length=128,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
        help_text="Select the status of the upload."
    )

    # TODO: use dt_upload m5 methods ?
    # md5_checksum = models.CharField(blank=True, max_length=32, default="", help_text='MD5 checksum of "file"')

    file_upload = models.OneToOneField('dt_upload.FileUploadRequest', on_delete=models.CASCADE, null=True, blank=True)

    def save(self, ignore_attach_to_ticket=False, *args, **kwargs):
        super(SubmissionCloudUpload, self).save(*args, **kwargs)

    def trigger_attach_to_issue(self):
        if self.attach_to_ticket and self.meta_data and self.file_upload is not None:
            # TODO: change to constant FileUploadRequest.COMPLETED
            if self.file_upload.status == "COMPLETED":
                from ..tasks.jira_tasks.attach_to_submission_issue import attach_cloud_upload_to_submission_issue_task
                attach_cloud_upload_to_submission_issue_task.apply_async(
                    kwargs={
                        "submission_id": "{0}".format(self.submission.pk),
                        "submission_upload_id": "{0}".format(self.pk),
                    },
                    countdown=SUBMISSION_UPLOAD_RETRY_DELAY,
                )

    def log_change(self, message, user_id=None):
        """Store the status note on the audit trail.

        A status save in the same moment already has a diff row. The note is
        attached there. A note without a fresh status diff, such as "status kept",
        becomes its own audit row. The cloud-upload overview reads this note.
        """
        from datetime import timedelta

        from auditlog.models import LogEntry as AuditLogEntry
        from django.contrib.auth import get_user_model
        from django.utils import timezone

        from gfbio_submissions.brokerage.audit_context import current_submission_audit_context

        note = _cloud_upload_change_note(message)
        latest = (
            AuditLogEntry.objects.get_for_object(self)
            .filter(action=AuditLogEntry.Action.UPDATE)
            .order_by("-pk")
            .first()
        )
        if (
            latest is not None
            and "status" in latest.changes_dict
            and not (latest.additional_data or {}).get("detail")
            and timezone.now() - latest.timestamp < timedelta(seconds=5)
        ):
            extra = dict(latest.additional_data or {})
            extra["detail"] = note
            latest.additional_data = extra
            update_fields = ["additional_data"]
            if latest.actor_id is None and user_id:
                actor = get_user_model().objects.filter(pk=user_id).first()
                if actor is not None:
                    latest.actor = actor
                    update_fields.append("actor")
            latest.save(update_fields=update_fields)
            return

        actor = None
        actor_pk = user_id or getattr(getattr(self, "submission", None), "user_id", None)
        if actor_pk:
            actor = get_user_model().objects.filter(pk=actor_pk).first()
        extra = dict(current_submission_audit_context() or {})
        extra["detail"] = note
        AuditLogEntry.objects.log_create(
            self,
            action=AuditLogEntry.Action.UPDATE,
            changes="{}",
            actor=actor,
            additional_data=extra,
        )

    @staticmethod
    def format_display_name(
        submission_broker_submission_id,
        has_file_upload,
        file_upload_id,
        original_filename,
        file_upload_status,
    ):
        if not has_file_upload:
            return f"{submission_broker_submission_id}-NO-FILE-UPLOAD-REQUEST"
        if original_filename:
            return (
                f"{original_filename} / {submission_broker_submission_id}-"
                f"{file_upload_id}-{file_upload_status}"
            )
        return f"{submission_broker_submission_id}-{file_upload_id}-{file_upload_status}"

    def __str__(self):
        file_upload = self.file_upload
        return self.format_display_name(
            self.submission.broker_submission_id,
            file_upload is not None,
            file_upload.id if file_upload else None,
            file_upload.original_filename if file_upload else None,
            file_upload.status if file_upload else None,
        )

    @staticmethod
    def get_status_name(status):
        status_name = "-"
        for status_choice in SubmissionCloudUpload.STATUS_CHOICES:
            if status_choice[0] == status:
                status_name = status_choice[1]
                break
        return status_name

    def get_additional_data(self):
        from gfbio_submissions.brokerage.audit_context import current_submission_audit_context

        return current_submission_audit_context()


auditlog.register(
    SubmissionCloudUpload,
    include_fields=[
        "status",
        "submission",
        "user",
        "attach_to_ticket",
        "meta_data",
        "attachment_id",
    ],
)
# -*- coding: utf-8 -*-
from django.db import models
from model_utils.models import TimeStampedModel

from config.settings.base import AUTH_USER_MODEL
from .submission import Submission


class SubmissionCloudUpload(TimeStampedModel):
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

    # TODO: use dt_upload m5 methods ?
    # md5_checksum = models.CharField(blank=True, max_length=32, default="", help_text='MD5 checksum of "file"')

    file_upload = models.OneToOneField('dt_upload.FileUploadRequest', on_delete=models.CASCADE, null=True, blank=True)

    def save(self, ignore_attach_to_ticket=False, *args, **kwargs):
        super(SubmissionCloudUpload, self).save(*args, **kwargs)

        # TODO: add a check for completeness/availability in cloud before starting this
        #   or re-define workflow for attach e.g. meta-data
        # if self.attach_to_ticket and not ignore_attach_to_ticket:
        #     from ..tasks.jira_tasks.attach_to_submission_issue import (
        #         attach_to_submission_issue_task,
        #     )
        #     attach_to_submission_issue_task.apply_async(
        #         kwargs={
        #             "submission_id": "{0}".format(self.submission.pk),
        #             "submission_upload_id": "{0}".format(self.pk),
        #         },
        #         countdown=SUBMISSION_UPLOAD_RETRY_DELAY,
        #     )

    def __str__(self):
        # return f"{self.submission.broker_submission_id}-{self.file_upload.id}-{self.file_upload.status}"
        if self.file_upload is None:
            return f"{self.submission.broker_submission_id}-NO-FILE-UPLOAD-REQUEST"
        elif self.file_upload.original_filename:
            return f"{self.file_upload.original_filename} / {self.submission.broker_submission_id}-{self.file_upload.id}-{self.file_upload.status}"
        else:
            return f"{self.submission.broker_submission_id}-{self.file_upload.id}-{self.file_upload.status}"

# -*- coding: utf-8 -*-
import os

from django.db import models
from model_utils.models import TimeStampedModel

from config.settings.base import AUTH_USER_MODEL
from gfbio_submissions.brokerage.configuration.settings import (
    ENA,
    ENA_PANGAEA,
    GENERIC,
    ATAX,
    SUBMISSION_UPLOAD_RETRY_DELAY,
    SUBMISSION_DELAY,
)

# from gfbio_submissions.brokerage.managers import SubmissionUploadManager
from .submission import Submission
from gfbio_submissions.brokerage.storage import OverwriteStorage
from gfbio_submissions.brokerage.utils.submission_tools import (
    submission_upload_path,
    hash_file,
)
from ..managers.submission_upload_manager import SubmissionUploadManager


class SubmissionUpload(TimeStampedModel):
    TARGETS = (
        (ENA, ENA),
        (ENA_PANGAEA, ENA_PANGAEA),
        (GENERIC, GENERIC),
        (ATAX, ATAX),
    )

    submission = models.ForeignKey(
        Submission,
        null=True,
        blank=True,
        help_text="Submission associated with this Upload.",
        on_delete=models.CASCADE,
    )

    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="user_uploads",
        help_text="Owner of this SubmissionUpload. " "Same as related submission.user",
        on_delete=models.SET_NULL,
    )
    # TODO: previous version: site&user
    # site = models.ForeignKey(
    #     AUTH_USER_MODEL,
    #     null=True,
    #     blank=True,
    #     related_name='site_upload',
    #     help_text='Related "Site". E.g. gfbio-portal or silva.',
    #     on_delete=models.SET_NULL
    # )
    # TODO: once IDM in place, it will be possible to directly assign real users
    # user = models.ForeignKey(
    #     AUTH_USER_MODEL,
    #     null=True,
    #     blank=True,
    #     related_name='user_upload',
    #     help_text='Related "User". E.g. a real person that uses '
    #               'the submission frontend',
    #     on_delete=models.SET_NULL
    # )
    attach_to_ticket = models.BooleanField(
        default=False,
        help_text="If checked, thus having True as value, every uploaded "
        "file will be attached to the main helpdesk ticket"
        'associated with "submission".',
    )

    modified_recently = models.BooleanField(
        default=False,
        help_text='Checked automatically if "file" has been updated and '
        "its content/md5_checksum has changed",
    )

    attachment_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="If file is attached to a ticket, it might be useful to store"
        " the primary identifier of the attachment. Needed e.g. for"
        " removing an attachment from a ticket.",
    )
    meta_data = models.BooleanField(
        default=False,
        help_text="A True/checked value means that this file contains " "meta-data.",
    )
    file = models.FileField(
        max_length=220,
        upload_to=submission_upload_path,
        storage=OverwriteStorage(),
        help_text="The actual file uploaded.",
    )

    md5_checksum = models.CharField(
        blank=True, max_length=32, default="", help_text='MD5 checksum of "file"'
    )

    objects = SubmissionUploadManager()

    def save(self, ignore_attach_to_ticket=False, *args, **kwargs):
        # TODO: consider task/chain for this. every new/save resets md5 to '' then task is
        #   put to queue
        if self.pk is None:
            self.md5_checksum = hash_file(self.file)
        else:
            md5 = hash_file(self.file)
            if md5 != self.md5_checksum:
                self.modified_recently = True
                self.md5_checksum = md5
        super(SubmissionUpload, self).save(*args, **kwargs)

        if self.attach_to_ticket and not ignore_attach_to_ticket:
            from ..tasks import attach_to_submission_issue_task

            attach_to_submission_issue_task.apply_async(
                kwargs={
                    "submission_id": "{0}".format(self.submission.pk),
                    "submission_upload_id": "{0}".format(self.pk),
                },
                countdown=SUBMISSION_UPLOAD_RETRY_DELAY,
            )

        if self.submission is not None:
            if self.submission.target == ATAX:
                from ..tasks import (
                    atax_submission_parse_csv_upload_to_xml_task,
                    atax_submission_validate_xml_upload_task,
                    atax_submission_combine_xmls_to_one_structure_task,
                )

                chain = (
                    atax_submission_parse_csv_upload_to_xml_task.s(
                        submission_id=self.submission.pk, submission_upload_id=self.pk
                    ).set(countdown=SUBMISSION_DELAY)
                    | atax_submission_validate_xml_upload_task.s(
                        submission_id=self.submission.pk,
                        submission_upload_id=self.pk,
                        is_combination=False,
                    ).set(countdown=SUBMISSION_DELAY)
                    | atax_submission_combine_xmls_to_one_structure_task.s(
                        submission_id=self.submission.pk, submission_upload_id=self.pk
                    ).set(countdown=SUBMISSION_DELAY)
                    | atax_submission_validate_xml_upload_task.s(
                        submission_id=self.submission.pk,
                        submission_upload_id=self.pk,
                        is_combination=True,
                    ).set(countdown=SUBMISSION_DELAY)
                )

                chain()

    def __str__(self):
        return " / ".join(reversed(self.file.name.split(os.sep)))

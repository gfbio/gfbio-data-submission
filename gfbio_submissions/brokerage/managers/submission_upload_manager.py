# -*- coding: utf-8 -*-
from django.db import models

from ..configuration.settings import ENA, ENA_PANGAEA, ATAX


class SubmissionUploadManager(models.Manager):
    def get_upload_with_related_submission(self, submission_upload_id):
        try:
            submission_upload = self.get(pk=submission_upload_id)
        except self.model.DoesNotExist as e:
            return None
        if submission_upload.submission is None:
            return None
        return submission_upload

    def get_linked_molecular_submission_upload(self, submission_upload_id):
        submission_upload = self.get_upload_with_related_submission(submission_upload_id)
        if submission_upload is None:
            return None
        if submission_upload.submission.target != ENA and submission_upload.submission.target != ENA_PANGAEA:
            return None
        if "requirements" not in submission_upload.submission.data.keys():
            return None
        return submission_upload

    def get_related_submission_id(self, submission_upload_id):
        submission_upload = self.get_upload_with_related_submission(submission_upload_id)
        if submission_upload is None:
            return None
        return submission_upload.submission.id

    def get_linked_atax_submission_upload(self, submission_upload_id):
        submission_upload = self.get_upload_with_related_submission(submission_upload_id)
        # TODO: simplify to one expression. if needed at all ...
        if submission_upload is None:
            return None
        if submission_upload.submission.target != ATAX:
            return None
        return submission_upload

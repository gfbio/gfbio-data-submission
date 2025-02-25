# -*- coding: utf-8 -*-

from django.test import TestCase
from dt_upload.models import FileUploadRequest
from dt_upload.tests.test_models import TestN4BUploadModel

from gfbio_submissions.brokerage.models import SubmissionCloudUpload
from gfbio_submissions.users.models import User
from ...models.submission import Submission


class TestSubmissionCloudUpload(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="user1")
        self.submission = Submission.objects.create(user=self.user)
        self.file_upload_request = FileUploadRequest()


    def test_instance(self):
        upload = SubmissionCloudUpload(
            user=self.user,
            submission=self.submission,
        )
        self.assertTrue(isinstance(upload, SubmissionCloudUpload))
        self.assertIsNone(upload.file_upload)

    def test_str(self):
        upload = SubmissionCloudUpload(
            user=self.user,
            submission=self.submission,
            file_upload=self.file_upload_request,
        )
        self.assertEqual(
            "{0}-{1}-{2}".format(
                self.submission.broker_submission_id,
                self.file_upload_request.id,
                self.file_upload_request.status
            ),
            upload.__str__(),
        )

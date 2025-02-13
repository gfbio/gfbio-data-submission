# -*- coding: utf-8 -*-

from django.test import TestCase
from dt_upload.tests.test_models import TestN4BUploadModel

from gfbio_submissions.brokerage.models import SubmissionCloudUpload
from gfbio_submissions.users.models import User
from ...models.submission import Submission


class TestSubmissionCloudUpload(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="user1")
        self.submission = Submission.objects.create(user=self.user)
        self.dt_upload = TestN4BUploadModel._create_dt_upload()

    def test_instance(self):
        upload = SubmissionCloudUpload(
            user=self.user,
            submission=self.submission,
            file=self.dt_upload,
        )
        self.assertTrue(isinstance(upload, SubmissionCloudUpload))

    def test_str(self):
        upload = SubmissionCloudUpload(
            user=self.user,
            submission=self.submission,
            file=self.dt_upload,
        )
        self.assertIn(
            " / {0}".format(self.submission.broker_submission_id),
            upload.__str__(),
        )

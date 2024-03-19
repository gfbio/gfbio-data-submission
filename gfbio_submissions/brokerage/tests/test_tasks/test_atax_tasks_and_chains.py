# -*- coding: utf-8 -*-

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer,
)
from gfbio_submissions.users.models import User
from ...models import submission
from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload
from ...models.task_progress_report import TaskProgressReport
from ...tasks.atax_tasks.parse_atax_uploads import parse_atax_uploads_task


class TestAtaxSubmissionTasks(TestCase):
    @classmethod
    def setUpTestData(cls):
        # TODO: add realword  taxonomics csv data here
        cls.user = User.objects.create(username="user1")
        submission = _create_submission_via_serializer(username=cls.user.name, create_broker_objects=False, atax=True)
        submission.release = True
        submission.save()
        simple_file = SimpleUploadedFile("test_upload_1.csv", b"these are the file contents!")
        SubmissionUpload.objects.create(
            submission=submission,
            user=cls.user,
            file=simple_file,
        )
        simple_file = SimpleUploadedFile("test_upload_2.csv", b"these are the file contents!")
        SubmissionUpload.objects.create(
            submission=submission,
            user=cls.user,
            file=simple_file,
        )
        simple_file = SimpleUploadedFile("test_upload_3.csv", b"these are the file contents!")
        SubmissionUpload.objects.create(
            submission=submission,
            user=cls.user,
            file=simple_file,
        )

    def test_db_content(self):
        submission = Submission.objects.first()
        self.assertEqual("user1", submission.user.username)
        uploads = submission.submissionupload_set.all()
        self.assertEqual(3, len(uploads))

    def test_parse_atax_uploads_task(self):
        submission = Submission.objects.first()
        result = parse_atax_uploads_task.apply_async(
            kwargs={"submission_id": submission.pk}
        )
        self.assertTrue(result.successful())
        res = result.get()
        print(res)

    def test_parse_uploads_task_for_unreleased_submission(self):
        submission = _create_submission_via_serializer(username=self.user.name, create_broker_objects=False, atax=True)
        submission.release = False
        submission.save()
        result = parse_atax_uploads_task.apply_async(
            kwargs={"submission_id": submission.pk}
        )
        self.assertTrue(result.successful())
        res = result.get()
        self.assertEqual(TaskProgressReport.CANCELLED, res)

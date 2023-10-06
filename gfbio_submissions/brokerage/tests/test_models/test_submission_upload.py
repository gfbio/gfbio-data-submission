# -*- coding: utf-8 -*-
import os
import shutil
from unittest import skip

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from config.settings.base import MEDIA_ROOT
from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
from gfbio_submissions.users.models import User
from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload


class TestSubmissionUpload(TestCase):
    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(username="user1")
        Submission.objects.create(user=user)

    @classmethod
    def tearDownClass(cls):
        super(TestSubmissionUpload, cls).tearDownClass()
        [
            shutil.rmtree(
                path="{0}{1}{2}".format(MEDIA_ROOT, os.sep, o), ignore_errors=False
            )
            for o in os.listdir(MEDIA_ROOT)
        ]

    @classmethod
    def _create_submission_upload(cls, size=0):
        simple_file = SimpleUploadedFile(
            "test_submission_upload.txt", b"these are the file contents!"
        )
        return SubmissionUpload.objects.create(
            submission=Submission.objects.first(),
            user=User.objects.first(),
            file=simple_file,
        )

    def test_instance(self):
        self.assertEqual(0, len(SubmissionUpload.objects.all()))
        self._create_submission_upload()
        self.assertEqual(1, len(SubmissionUpload.objects.all()))

    def test_str(self):
        submission_upload = self._create_submission_upload()
        self.assertIn(
            ".txt / {0}".format(Submission.objects.first().broker_submission_id),
            submission_upload.__str__(),
        )

    def test_md5_checksum(self):
        submission_upload = self._create_submission_upload()
        self.assertEqual(
            "e3cb20d82bf3ecc6957b89907e409370", submission_upload.md5_checksum
        )

    @skip("creates a huge file under media/<bsi>/....txt")
    def test_huge_file_md5(self):
        # time dd if=/dev/zero of=generated.txt count=3221225 bs=1024
        # 3221225+0 records in
        # 3221225+0 records out
        # 3298534400 bytes (3,3 GB, 3,1 GiB) copied, 6,21109 s, 531 MB/s
        #
        # real	0m6,212s
        # user	0m1,681s
        # sys	0m4,519s

        # MD5 took  5.114250603999608  seconds
        with open(
            os.path.join(_get_test_data_dir_path(), "generated.txt"), "rb"
        ) as data_file:
            simple_file = SimpleUploadedFile(
                "test_submission_upload.txt", data_file.read()
            )
            SubmissionUpload.objects.create(
                submission=Submission.objects.first(),
                user=User.objects.first(),
                file=simple_file,
            )

    def test_same_file_name(self):
        self.assertEqual(0, len(SubmissionUpload.objects.all()))
        SubmissionUpload.objects.create(
            submission=Submission.objects.first(),
            user=User.objects.first(),
            file=SimpleUploadedFile(
                "test_submission_upload.txt", b"these are the file contents!"
            ),
        )
        SubmissionUpload.objects.create(
            submission=Submission.objects.first(),
            user=User.objects.first(),
            file=SimpleUploadedFile(
                "test_submission_upload.txt",
                b"these are the file contents! but different",
            ),
        )
        self.assertEqual(2, len(SubmissionUpload.objects.all()))

        # with default storage filenames will not be the same
        # self.assertNotEqual(SubmissionUpload.objects.first().file.name,
        #                     SubmissionUpload.objects.last().file.name)

        # with override custom storage filenames will BE the same
        self.assertEqual(
            SubmissionUpload.objects.first().file.name,
            SubmissionUpload.objects.last().file.name,
        )

        # TODO: test how many SubmissionUpload instances are there for the same file
        #   consider a clean up or mechanism to update if file name is the same (ignoring
        #   possible different content / md5)

        # when testing with local dev server:
        # - added 3x same file to upload dialog (was accepted)
        # - one is marked as metadata
        # - under media only on file available
        # - 3 SubmissionUploads (same md5)
        # - 3 attachement ids from jira (== 3 attac

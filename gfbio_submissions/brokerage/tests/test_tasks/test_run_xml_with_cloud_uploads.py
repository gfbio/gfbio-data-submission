# -*- coding: utf-8 -*-

import os
import shutil
import tempfile
from unittest.mock import patch

from django.conf import settings
from dt_upload.models import FileUploadRequest

from .test_tasks_base import TestTasks
from ...models import SubmissionCloudUpload
from ...models.auditable_text_data import AuditableTextData
from ...models.submission import Submission
from ...tasks.auditable_text_data_tasks.prepare_ena_submission_data import prepare_ena_submission_data_task


class TestPrepareRunXMLWithCloudUploads(TestTasks):

    def setUp(self):
        self.cloud_uploads = []
        submission = Submission.objects.first()
        file_upload_1 = FileUploadRequest.objects.create(
            original_filename="File3.forward.fastq.gz",
            file_key="File3.forward.fastq.gz-1234",
            file_type="fastq",
            status="PENDING",
            user=submission.user,
        )
        self.cloud_uploads.append(SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=file_upload_1
        )
        )
        file_upload_2 = FileUploadRequest.objects.create(
            original_filename="File3.reverse.fastq.gz",
            file_key="File3.reverse.fastq.gz-1234",
            file_type="fastq",
            status="PENDING",
            user=submission.user,
        )
        self.cloud_uploads.append(SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=file_upload_2
        )
        )
        self.tmpdir = tempfile.mkdtemp()
        self.s3fs_patch = patch.object(settings, 'S3FS_MOUNT_POINT', self.tmpdir)
        self.s3fs_patch.start()
        self.file_paths = []
        for cu in self.cloud_uploads:
            file_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{cu.file_upload.file_key}"
            with open(file_path, 'wb') as f:
                f.write(os.urandom(1024))  # 1KB random data
            self.file_paths.append(file_path)

    def tearDown(self):
        self.s3fs_patch.stop()
        shutil.rmtree(self.tmpdir)

    def test_prepare_ena_submission_data_task(self):
        submission = Submission.objects.first()
        text_data = AuditableTextData.objects.all()
        self.assertEqual(0, len(text_data))
        result = prepare_ena_submission_data_task.apply_async(kwargs={"submission_id": submission.pk})
        self.assertTrue(result.successful())
        ret_val = result.get()
        self.assertTrue(isinstance(ret_val, dict))
        self.assertIn("SAMPLE", ret_val.keys())
        text_data = AuditableTextData.objects.all()
        self.assertEqual(4, len(text_data))

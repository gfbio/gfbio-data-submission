# -*- coding: utf-8 -*-

import os
import shutil
import tempfile
from unittest.mock import patch

from django.conf import settings
from dt_upload.models import FileUploadRequest
from gfbio_submissions.brokerage.models.broker_object import BrokerObject

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

    def test_prepare_ena_submission_data_task_fails_with_missing_file_and_checksum(self):
        submission = Submission.objects.first()
        SubmissionCloudUpload.objects.filter(file_upload__file_key="File3.reverse.fastq.gz-1234").delete()
        try:
            prepare_ena_submission_data_task.apply_async(kwargs={"submission_id": submission.pk})
            self.fail()
        except AssertionError:
            raise
        except Exception as exc:
            self.assertTrue(f"{exc}".startswith("Errors occured during preparation of ena-data"))
            self.assertTrue("- For the referenced file 'File3.reverse.fastq.gz' exists no checksum in the metadata-file and no cloud-upload was found." in f"{exc}")


    def test_prepare_ena_submission_data_task_fails_with_file_missmatching_checksum(self):
        submission = Submission.objects.first()
        submission.data["requirements"]["experiments"][0]["files"]["forward_read_file_checksum"] = "some bad checksum standin"
        submission.save()
        BrokerObject.objects.add_submission_data(submission)
        try:
            prepare_ena_submission_data_task.apply_async(kwargs={"submission_id": submission.pk})
            self.fail()
        except AssertionError:
            raise
        except Exception as exc:
            self.assertTrue(f"{exc}".startswith("Errors occured during preparation of ena-data"))
            self.assertTrue("- For the referenced file 'File3.forward.fastq.gz' exists a checksum in the metadata-file (some bad checksum standin), that does not match the checksum of the cloud-upload" in f"{exc}")

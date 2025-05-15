# -*- coding: utf-8 -*-
from pprint import pprint
from unittest.mock import MagicMock
from unittest.mock import patch

from django.conf import settings
from django.urls import reverse
from dt_upload.models import FileUploadRequest
from dt_upload.models import MultiPartUpload
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.configuration.settings import (
    GFBIO_HELPDESK_TICKET, )
from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer, )
from gfbio_submissions.users.models import User
from .test_tasks_base import TestTasks
from ...models import SubmissionCloudUpload
from ...models.auditable_text_data import AuditableTextData
from ...models.submission import Submission
from ...tasks.auditable_text_data_tasks.prepare_ena_submission_data import prepare_ena_submission_data_task
import tempfile
import os
from unittest.mock import patch
import hashlib

import tempfile
import shutil
import os
from django.test import TestCase
from django.conf import settings
from unittest.mock import patch

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
        # MultiPartUpload.objects.create(
        #     upload_id="u-1234",
        #     file_upload_request=file_upload_1,
        #     parts_expected=2
        # )
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
        # MultiPartUpload.objects.create(
        #     upload_id="u-4567",
        #     file_upload_request=file_upload_2,
        #     parts_expected=2
        # )
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
            print(file_path)
            with open(file_path, 'wb') as f:
                f.write(os.urandom(1024))  # 1KB random data
            self.file_paths.append(file_path)

    def tearDown(self):
        self.s3fs_patch.stop()
        shutil.rmtree(self.tmpdir)

    def test_prepare_ena_submission_data_task(self):
        # with tempfile.TemporaryDirectory() as tmpdir:
        #     # Patch the mount point
        #     with patch.object(settings, 'S3FS_MOUNT_POINT', tmpdir):
        #         for cu in self.cloud_uploads:
        #             file_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{cu.file_upload.file_key}"
        #             print(file_path)
        #             # file_path = os.path.join(settings.S3FS_MOUNT_POINT, 'testfile.txt')
        #             content = os.urandom(1024)
        #             with open(file_path, 'wb') as f:
        #                 f.write(content)
        #             # Now calculate md5
        #             with open(file_path, 'rb') as f:
        #                 md5 = hashlib.md5(f.read()).hexdigest()
        #                 print(md5)
                # assert md5 == hashlib.md5(content).hexdigest()
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

        print('RUN XML: ----------------')
        pprint(ret_val['RUN'])

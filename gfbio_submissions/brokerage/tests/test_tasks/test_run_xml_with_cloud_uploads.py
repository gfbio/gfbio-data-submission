# -*- coding: utf-8 -*-

import hashlib
from unittest.mock import patch
from xml.etree import ElementTree as ET

import boto3
from dt_upload.models import FileUploadRequest
from moto import mock_s3

from ...models import SubmissionCloudUpload
from ...models.auditable_text_data import AuditableTextData
from ...models.broker_object import BrokerObject
from ...models.submission import Submission
from ...tasks.auditable_text_data_tasks.prepare_ena_submission_data import prepare_ena_submission_data_task
from .test_tasks_base import TestTasks

GET_S3_CLIENT_PATH = "gfbio_submissions.brokerage.utils.cloud_upload_checksum.backend_based_upload_mixins.get_s3_client"
OBJECT_BYTES = b"deterministic-cloud-upload-bytes"
EXPECTED_MD5 = hashlib.md5(OBJECT_BYTES).hexdigest()
STORED_MD5 = hashlib.md5(b"stored-md5-should-skip-s3").hexdigest()


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
        self.cloud_uploads.append(
            SubmissionCloudUpload.objects.create(
                submission=submission,
                attach_to_ticket=False,
                meta_data=False,
                file_upload=file_upload_1,
            )
        )
        file_upload_2 = FileUploadRequest.objects.create(
            original_filename="File3.reverse.fastq.gz",
            file_key="File3.reverse.fastq.gz-1234",
            file_type="fastq",
            status="PENDING",
            user=submission.user,
        )
        self.cloud_uploads.append(
            SubmissionCloudUpload.objects.create(
                submission=submission,
                attach_to_ticket=False,
                meta_data=False,
                file_upload=file_upload_2,
            )
        )
        self.bucket_name = "checksum-test-bucket"
        self._moto = mock_s3()
        self._moto.start()
        self.s3 = boto3.client(
            "s3",
            region_name="us-east-1",
            aws_access_key_id="fake_access_key",
            aws_secret_access_key="fake_secret_key",
        )
        self.s3.create_bucket(Bucket=self.bucket_name)
        for cloud_upload in self.cloud_uploads:
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=cloud_upload.file_upload.file_key,
                Body=OBJECT_BYTES,
            )
        self.get_s3_patcher = patch(GET_S3_CLIENT_PATH, return_value=(self.bucket_name, self.s3))
        self.get_s3_mock = self.get_s3_patcher.start()

    def tearDown(self):
        self.get_s3_patcher.stop()
        self._moto.stop()

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
        run_xml = ret_val["RUN"][1]
        file_elements = list(ET.fromstring(run_xml).iter("FILE"))
        self.assertEqual(2, len(file_elements))
        for file_element in file_elements:
            self.assertEqual(EXPECTED_MD5, file_element.get("checksum"))
            self.assertEqual("MD5", file_element.get("checksum_method"))
        self.get_s3_mock.assert_called()

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
            self.assertIn(
                "- For the referenced file 'File3.reverse.fastq.gz' exists no checksum "
                "in the metadata-file and no cloud-upload was found.",
                f"{exc}",
            )

    def test_prepare_ena_submission_data_task_fails_with_file_missmatching_checksum(self):
        submission = Submission.objects.first()
        submission.data["requirements"]["experiments"][0]["files"][
            "forward_read_file_checksum"
        ] = "some bad checksum standin"
        submission.save()
        BrokerObject.objects.add_submission_data(submission)
        try:
            prepare_ena_submission_data_task.apply_async(kwargs={"submission_id": submission.pk})
            self.fail()
        except AssertionError:
            raise
        except Exception as exc:
            self.assertTrue(f"{exc}".startswith("Errors occured during preparation of ena-data"))
            self.assertIn(
                "- For the referenced file 'File3.forward.fastq.gz' exists a checksum in the "
                "metadata-file (some bad checksum standin), that does not match the checksum "
                "of the cloud-upload",
                f"{exc}",
            )

    def test_stored_md5_skips_s3(self):
        for cloud_upload in self.cloud_uploads:
            cloud_upload.file_upload.md5 = STORED_MD5
            cloud_upload.file_upload.save()
        self.get_s3_mock.reset_mock()
        submission = Submission.objects.first()

        result = prepare_ena_submission_data_task.apply_async(kwargs={"submission_id": submission.pk})

        self.assertTrue(result.successful())
        self.get_s3_mock.assert_not_called()
        run_xml = result.get()["RUN"][1]
        for file_element in ET.fromstring(run_xml).iter("FILE"):
            self.assertEqual(STORED_MD5, file_element.get("checksum"))

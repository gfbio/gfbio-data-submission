# -*- coding: utf-8 -*-
from unittest.mock import MagicMock, patch

from botocore.exceptions import ClientError
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from dt_upload.models import MultiPartUpload, backend_based_upload_models
from dt_upload.serializers import backend_based_upload_serializers
from rest_framework import status

from gfbio_submissions.brokerage.utils.cloud_upload_multipart import (
    abort_multipart_uploads_for_file_upload,
    restart_multipart_on_file_upload_request,
    _replace_multipart_upload_parts,
    _reuse_or_create_multipart_upload,
)

User = get_user_model()


class CloudUploadMultipartUtilsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="multipart_utils", password="testpass123")
        settings.AWS_STORAGE_BUCKET_NAME = "fake-bucket"
        settings.AWS_ACCESS_KEY_ID = "fake_access_key"
        settings.AWS_SECRET_ACCESS_KEY = "fake_secret_key"
        settings.AWS_S3_REGION_NAME = "us-east-1"
        settings.AWS_S3_ENDPOINT_URL = None

        self.file_upload = backend_based_upload_models.FileUploadRequest.objects.create(
            original_filename="sample.fastq.gz",
            file_key="broker-id/sample.fastq.gz",
            file_type="application/gzip",
            file_size=1024,
            status="FAILED",
            s3_location="s3://old/location",
            user=self.user,
        )
        self.start_payload = {
            "filename": "sample.fastq.gz",
            "filetype": "application/gzip",
            "total_size": 20 * 1024 * 1024,
            "part_size": 5 * 1024 * 1024,
            "total_parts": 4,
            "md5": "a" * 32,
            "sha256": "b" * 64,
        }

    def _valid_start_serializer(self):
        serializer = backend_based_upload_serializers.MultipartUploadStartSerializer(
            data=self.start_payload,
        )
        serializer.is_valid(raise_exception=True)
        return serializer

    @patch(
        "gfbio_submissions.brokerage.utils.cloud_upload_multipart.backend_based_upload_mixins.abort_multipart_upload"
    )
    def test_abort_multipart_uploads_calls_abort_when_upload_id_set(self, abort_mock):
        MultiPartUpload.objects.create(
            upload_id="upload-a",
            file_upload_request=self.file_upload,
            parts_expected=2,
        )

        abort_multipart_uploads_for_file_upload(self.file_upload)

        abort_mock.assert_called_once_with("upload-a")

    @patch(
        "gfbio_submissions.brokerage.utils.cloud_upload_multipart.backend_based_upload_mixins.abort_multipart_upload"
    )
    def test_abort_multipart_uploads_skips_empty_upload_id(self, abort_mock):
        MultiPartUpload.objects.create(
            upload_id="",
            file_upload_request=self.file_upload,
            parts_expected=1,
        )

        abort_multipart_uploads_for_file_upload(self.file_upload)

        abort_mock.assert_not_called()

    @patch(
        "gfbio_submissions.brokerage.utils.cloud_upload_multipart.backend_based_upload_mixins.abort_multipart_upload",
        side_effect=RuntimeError("s3 down"),
    )
    def test_abort_multipart_uploads_does_not_raise_when_abort_fails(self, abort_mock):
        MultiPartUpload.objects.create(
            upload_id="upload-a",
            file_upload_request=self.file_upload,
            parts_expected=1,
        )

        abort_multipart_uploads_for_file_upload(self.file_upload)

        abort_mock.assert_called_once_with("upload-a")

    def test_replace_multipart_upload_parts_replaces_rows(self):
        multipart = MultiPartUpload.objects.create(
            upload_id="old-upload",
            file_upload_request=self.file_upload,
            parts_expected=1,
        )
        backend_based_upload_models.UploadPart.objects.create(
            multipart_upload=multipart,
            part_number=1,
            completed=True,
            etag="'old'",
        )

        parts = _replace_multipart_upload_parts(multipart, total_parts=3)

        self.assertEqual(len(parts), 3)
        self.assertEqual(
            backend_based_upload_models.UploadPart.objects.filter(multipart_upload=multipart).count(),
            3,
        )
        self.assertFalse(
            backend_based_upload_models.UploadPart.objects.filter(
                multipart_upload=multipart,
                completed=True,
            ).exists(),
        )
        self.assertEqual([p.part_number for p in parts], [1, 2, 3])

    def test_reuse_or_create_multipart_upload_creates_when_missing(self):
        multipart, parts = _reuse_or_create_multipart_upload(
            self.file_upload,
            upload_id="new-upload-id",
            total_parts=2,
        )

        self.assertEqual(multipart.upload_id, "new-upload-id")
        self.assertEqual(multipart.parts_expected, 2)
        self.assertEqual(len(parts), 2)
        self.assertEqual(
            MultiPartUpload.objects.filter(file_upload_request=self.file_upload).count(),
            1,
        )

    def test_reuse_or_create_multipart_upload_updates_existing_row(self):
        multipart = MultiPartUpload.objects.create(
            upload_id="old-upload",
            file_upload_request=self.file_upload,
            parts_expected=1,
        )
        backend_based_upload_models.UploadPart.objects.create(
            multipart_upload=multipart,
            part_number=1,
            completed=True,
        )
        original_pk = multipart.pk

        updated, parts = _reuse_or_create_multipart_upload(
            self.file_upload,
            upload_id="restarted-upload",
            total_parts=4,
        )

        self.assertEqual(updated.pk, original_pk)
        self.assertEqual(updated.upload_id, "restarted-upload")
        self.assertEqual(updated.parts_expected, 4)
        self.assertEqual(len(parts), 4)
        self.assertEqual(
            MultiPartUpload.objects.filter(file_upload_request=self.file_upload).count(),
            1,
        )

    @patch(
        "gfbio_submissions.brokerage.utils.cloud_upload_multipart.backend_based_upload_mixins.get_s3_client"
    )
    @patch(
        "gfbio_submissions.brokerage.utils.cloud_upload_multipart.abort_multipart_uploads_for_file_upload"
    )
    def test_restart_multipart_on_file_upload_request_success(self, abort_mock, get_s3_mock):
        multipart = MultiPartUpload.objects.create(
            upload_id="old-upload",
            file_upload_request=self.file_upload,
            parts_expected=1,
        )
        s3_client = MagicMock()
        s3_client.create_multipart_upload.return_value = {"UploadId": "new-upload-id"}
        get_s3_mock.return_value = ("fake-bucket", s3_client)

        response_status, response_data, upload_id = restart_multipart_on_file_upload_request(
            None,
            self.file_upload,
            self._valid_start_serializer(),
        )

        abort_mock.assert_called_once_with(self.file_upload)
        self.assertEqual(response_status, status.HTTP_201_CREATED)
        self.assertEqual(upload_id, "new-upload-id")
        self.assertEqual(response_data["upload_id"], "new-upload-id")
        self.assertEqual(response_data["file_key"], self.file_upload.file_key)
        self.assertEqual(len(response_data["parts"]), self.start_payload["total_parts"])

        self.file_upload.refresh_from_db()
        self.assertEqual(self.file_upload.status, "PENDING")
        self.assertEqual(self.file_upload.s3_location, "")
        self.assertEqual(self.file_upload.file_size, self.start_payload["total_size"])
        self.assertEqual(self.file_upload.md5, self.start_payload["md5"])
        self.assertEqual(self.file_upload.sha256, self.start_payload["sha256"])

        multipart.refresh_from_db()
        self.assertEqual(multipart.upload_id, "new-upload-id")
        self.assertEqual(multipart.parts_expected, self.start_payload["total_parts"])
        s3_client.create_multipart_upload.assert_called_once_with(
            Bucket="fake-bucket",
            Key=self.file_upload.file_key,
            ContentType=self.start_payload["filetype"],
        )

    @patch(
        "gfbio_submissions.brokerage.utils.cloud_upload_multipart.backend_based_upload_mixins.get_s3_client"
    )
    @patch(
        "gfbio_submissions.brokerage.utils.cloud_upload_multipart.abort_multipart_uploads_for_file_upload"
    )
    def test_restart_multipart_on_file_upload_request_s3_error(self, _abort_mock, get_s3_mock):
        s3_client = MagicMock()
        s3_client.create_multipart_upload.side_effect = ClientError(
            error_response={"Error": {"Code": "TestError", "Message": "boom"}},
            operation_name="CreateMultipartUpload",
        )
        get_s3_mock.return_value = ("fake-bucket", s3_client)

        response_status, response_data, upload_id = restart_multipart_on_file_upload_request(
            None,
            self.file_upload,
            self._valid_start_serializer(),
        )

        self.assertEqual(response_status, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("error", response_data)
        self.assertEqual(upload_id, "")

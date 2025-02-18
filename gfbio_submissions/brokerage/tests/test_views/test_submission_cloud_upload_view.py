# -*- coding: utf-8 -*-

import json
import os
import tempfile
from pprint import pprint
from unittest.mock import patch, MagicMock

from botocore.exceptions import ClientError
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from dt_upload.models import backend_based_upload_models
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.configuration.settings import (
    GFBIO_HELPDESK_TICKET,
)
from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer,
)
from ...models.submission import Submission
from ...models.submission_cloud_upload import SubmissionCloudUpload

User = get_user_model()


class TestRealWorldSubmissionCloudUploadView(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

        submission = _create_submission_via_serializer()
        submission.additionalreference_set.create(type=GFBIO_HELPDESK_TICKET, reference_key="FAKE_KEY", primary=True)
        _create_submission_via_serializer()

    def test_upload_to_s3(self):
        submission = Submission.objects.first()
        url = reverse(
            "brokerage:submissions_cloud_upload",
            kwargs={"broker_submission_id": submission.broker_submission_id},
        )
        print(url)

        file_size_mb = 10
        file_size_bytes = file_size_mb * 1024 * 1024
        part_size = 2
        total_parts = int(file_size_mb / part_size)

        with tempfile.NamedTemporaryFile(
            delete=False) as tmp_file:
            random_data = os.urandom(file_size_bytes)
            tmp_file.write(random_data)
            tmp_file_path = tmp_file.name

        data = {
            "filename": os.path.basename(tmp_file_path),
            "filetype": "application/octet-stream",
            "total_size": file_size_bytes,
            "part_size": part_size * 1024 * 1024,  # x MB
            "total_parts": total_parts
        }
        print(data)

        print('SETTINGS ---------------------------------')
        print('settings.DJANGO_UPLOAD_TOOLS_USE_S3', settings.DJANGO_UPLOAD_TOOLS_USE_S3)
        print('AWS_ACCESS_KEY_ID',  settings.AWS_ACCESS_KEY_ID)
        print('AWS_SECRET_ACCESS_KEY', settings.AWS_SECRET_ACCESS_KEY)
        print('AWS_STORAGE_BUCKET_NAME', settings.AWS_STORAGE_BUCKET_NAME)
        print('AWS_S3_REGION_NAME', settings.AWS_S3_REGION_NAME)
        print('AWS_S3_ENDPOINT_URL', settings.AWS_S3_ENDPOINT_URL)
        print('aws_s3_domain', settings.AWS_S3_DOMAIN)

        response = self.client.post(url, data=data, format="json")
        print('\nRESPONSE ----------------------------------------------------------')
        print(response.status_code)
        content = json.loads(response.content)
        pprint(content)

        os.remove(tmp_file_path)


class TestSubmissionCloudUploadView(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

        submission = _create_submission_via_serializer()
        submission.additionalreference_set.create(type=GFBIO_HELPDESK_TICKET, reference_key="FAKE_KEY", primary=True)
        _create_submission_via_serializer()

        # Basic test data
        self.test_file_data = {
            "filename": "test_file.mp4",
            "filetype": "video/mp4",
            "total_size": 20 * 1024 * 1024,  # 20MB
            "part_size": 5 * 1024 * 1024,  # 5MB
            "total_parts": 4
        }

        settings.AWS_STORAGE_BUCKET_NAME = "fake-bucket"
        settings.AWS_ACCESS_KEY_ID = "fake_access_key"
        settings.AWS_SECRET_ACCESS_KEY = "fake_secret_key"
        settings.AWS_S3_REGION_NAME = "us-east-1"
        settings.AWS_S3_ENDPOINT_URL = None

        # Mock S3 responses
        self.mock_upload_id = "test-upload-id-12345"
        self.mock_file_key = "test-file-key-12345"

        # Create mock S3 client
        self.s3_client_mock = MagicMock()
        self.s3_patcher = patch("boto3.client", return_value=self.s3_client_mock)
        self.s3_patcher.start()

    def tearDown(self):
        self.s3_patcher.stop()

    # TODO: currently whole workflow of creating a SCU along with theD DTUpload objects
    #   basically start of upload process before asking for the first s3 upload url
    def test_empty_post(self):
        self.s3_client_mock.create_multipart_upload.return_value = {
            "UploadId": self.mock_upload_id
        }
        submission = Submission.objects.first()
        url = reverse(
            "brokerage:submissions_cloud_upload",
            kwargs={"broker_submission_id": submission.broker_submission_id},
        )

        print(url)
        data = self.test_file_data
        data["attach_to_ticket"] = False
        data["meta_data"] = True
        print('DATA FOR INITIAL POST -------------------------------------------')
        pprint(data)
        print('-----------------------------------------------------------------')
        response = self.client.post(url, data=data, format="json")
        content = json.loads(response.content)
        print('\nRESPONSE ----------------------------------------------------------')
        pprint(content)
        print('-----------------------------------------------------------------')

        # SubmissionCloudUpload ------------------------------------------------
        self.assertEqual(201, response.status_code)
        self.assertEqual(str(submission.broker_submission_id),
                         content.get("broker_submission_id", "no-bsi"))
        self.assertEqual(1, len(SubmissionCloudUpload.objects.all()))
        print('\nSCU OBJ  -----------------------------------------------------')
        pprint(SubmissionCloudUpload.objects.first().__dict__)

        # DTUpload FileUploadRequest -------------------------------------------
        file_upload = backend_based_upload_models.FileUploadRequest.objects.first()
        self.assertIsNotNone(file_upload)
        self.assertEqual(file_upload.original_filename, self.test_file_data["filename"])
        self.assertEqual(file_upload.status, "PENDING")
        # bsi in filekey
        self.assertIn(str(submission.broker_submission_id), file_upload.file_key)
        print('\nFILE UPLOAD REQUEST OBJ  -----------------------------------------------------')
        pprint(file_upload.__dict__)

        # DTUpload MultiPartUpload -------------------------------------------
        multipart = backend_based_upload_models.MultiPartUpload.objects.first()
        self.assertIsNotNone(multipart)
        self.assertEqual(multipart.upload_id, self.mock_upload_id)
        self.assertEqual(multipart.parts_expected, self.test_file_data["total_parts"])
        print('\nMULTIPART OBJ  -----------------------------------------------------')
        pprint(multipart.__dict__)

        # DTUpload UploadPart -------------------------------------------
        upload_parts = backend_based_upload_models.UploadPart.objects.all()
        self.assertEqual(multipart.parts_expected, len(upload_parts))
        print('\nUPLOAD PARTS OBJs  -----------------------------------------------------')
        for u in upload_parts:
            self.assertEqual(multipart, u.multipart_upload)
            print('\n==================')
            pprint(u.__dict__)

        # Assert S3 client called correctly
        self.s3_client_mock.create_multipart_upload.assert_called_once()

        # DONE: TODO: next : integrate dtuplod viiew into submission urls to complete uload to s3transfer
        # TODO: put more info about nextz step and part upload url into initial response of SCU objkect
        # tODO: 500 & 400 from s3 views
        # TODO: custom views via inheritance work, maybe add bsi to views for consistency ? compare SubmissionCloudUploadPartURLView
        # TODO: clean up Multipart / Parts Objects after success or abort ?
        #   maybe even FileUploadRequest ?

    def test_get_part_url(self):
        file_upload = backend_based_upload_models.FileUploadRequest.objects.create(
            original_filename=self.test_file_data["filename"],
            file_key=self.mock_file_key,
            file_type=self.test_file_data["filetype"],
            status="PENDING",
            user=self.user
        )

        multipart = backend_based_upload_models.MultiPartUpload.objects.create(
            upload_id=self.mock_upload_id,
            file_upload_request=file_upload,
            parts_expected=self.test_file_data["total_parts"]
        )
        print(multipart.upload_id)
        # Mock S3 generate_presigned_url response
        mock_url = "https://test-bucket.s3.amazonaws.com/test-presigned-url"
        self.s3_client_mock.generate_presigned_url.return_value = mock_url

        # Make request for part URL
        url = reverse("brokerage:submissions_cloud_upload_part", kwargs={"upload_id": self.mock_upload_id})
        print(url)
        response = self.client.post(url, {"part_number": 1}, format="json")

        pprint(json.loads(response.content))
        # Assert response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["presigned_url"], mock_url)
        self.assertEqual(response.data["part_number"], 1)

        # Assert S3 client called correctly
        self.s3_client_mock.generate_presigned_url.assert_called_once()

    def test_complete_multipart_upload(self):
        # Create test records
        file_upload = backend_based_upload_models.FileUploadRequest.objects.create(
            original_filename=self.test_file_data["filename"],
            file_key=self.mock_file_key,
            file_type=self.test_file_data["filetype"],
            status="PENDING",
            user=self.user
        )

        multipart = backend_based_upload_models.MultiPartUpload.objects.create(
            upload_id=self.mock_upload_id,
            file_upload_request=file_upload,
            parts_expected=2
        )

        # Test parts data
        parts_data = {
            "parts": [
                {"PartNumber": 1, "ETag": "'test-etag-1'"},
                {"PartNumber": 2, "ETag": "'test-etag-2'"}
            ]
        }

        # Mock S3 complete_multipart_upload response
        self.s3_client_mock.complete_multipart_upload.return_value = {
            "Location": "https://test-bucket.s3.amazonaws.com/test-file"
        }

        # Make request to complete upload
        url = reverse("brokerage:submissions_cloud_upload_complete", kwargs={"upload_id": self.mock_upload_id})
        response = self.client.put(url, parts_data, format="json")
        print('RESPONSE -------------------------------------------------')
        print(response.status_code)
        print(response.content)

        # Assert response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "completed")
        self.assertIn("location", response.data)

        # Assert database records updated
        print('\nFILE UPLOAD OBJ -----------------------------------------------------------')
        file_upload.refresh_from_db()
        pprint(file_upload.__dict__)
        print('\nMULTIPART OBJ -----------------------------------------------------------')
        multipart.refresh_from_db()
        pprint(multipart.__dict__)
        self.assertEqual(file_upload.status, "COMPLETED")
        self.assertIsNotNone(multipart.completed_at)

        # Assert S3 client called correctly
        self.s3_client_mock.complete_multipart_upload.assert_called_once()

    def test_abort_multipart_upload(self):
        """Test aborting a multipart upload"""
        # Create test records
        file_upload = backend_based_upload_models.FileUploadRequest.objects.create(
            original_filename=self.test_file_data["filename"],
            file_key=self.mock_file_key,
            file_type=self.test_file_data["filetype"],
            status="PENDING",
            user=self.user
        )

        multipart = backend_based_upload_models.MultiPartUpload.objects.create(
            upload_id=self.mock_upload_id,
            file_upload_request=file_upload,
            parts_expected=2
        )

        # Make request to abort upload
        url = reverse("brokerage:submissions_cloud_upload_abort", kwargs={"upload_id": self.mock_upload_id})
        response = self.client.delete(url)
        print(response.content)

        # Assert response
        self.assertEqual(response.status_code, 204)

        # Assert database records updated
        file_upload.refresh_from_db()
        self.assertEqual(file_upload.status, "FAILED")

        # Assert S3 client called correctly
        self.s3_client_mock.abort_multipart_upload.assert_called_once()

    def test_error_handling(self):
        """Test error handling scenarios"""
        # Test invalid upload ID
        url = reverse("brokerage:submissions_cloud_upload_part", kwargs={"upload_id": "invalid-id"})
        response = self.client.post(url, {"part_number": 1}, format="json")
        self.assertEqual(response.status_code, 404)

        # Test S3 error handling
        self.s3_client_mock.create_multipart_upload.side_effect = ClientError(
            error_response={"Error": {"Code": "TestError", "Message": "Test error"}},
            operation_name="CreateMultiPartUpload"
        )

        submission = Submission.objects.first()
        url = reverse(
            "brokerage:submissions_cloud_upload",
            kwargs={"broker_submission_id": submission.broker_submission_id},
        )
        response = self.client.post(url, self.test_file_data, format="json")
        self.assertEqual(response.status_code, 500)

    # def test_validation(self):
    #     """Test input validation"""
    #     # Test missing required fields
    #     url = reverse("dt_upload:backend-multipart-start")
    #     invalid_data = self.test_file_data.copy()
    #     del invalid_data["filename"]
    #     response = self.client.post(url, invalid_data, format="json")
    #     self.assertEqual(response.status_code, 400)
    #
    #     # Test invalid part number
    #     url = reverse("dt_upload:backend-multipart-part", kwargs={"upload_id": self.mock_upload_id})
    #     response = self.client.post(url, {"part_number": 0}, format="json")
    #     self.assertEqual(response.status_code, 400)
    #
    # def test_concurrent_uploads(self):
    #     """Test handling multiple concurrent uploads"""
    #     # Create multiple upload requests
    #     upload_ids = []
    #     for i in range(3):
    #         self.s3_client_mock.create_multipart_upload.return_value = {
    #             "UploadId": f"test-upload-id-{i}"
    #         }
    #
    #         url = reverse("dt_upload:backend-multipart-start")
    #         response = self.client.post(url, self.test_file_data, format="json")
    #         pprint(json.loads(response.content))
    #         self.assertEqual(response.status_code, 201)
    #         upload_ids.append(response.data["upload_id"])
    #
    #     # Verify all uploads are tracked
    #     self.assertEqual(MultiPartUpload.objects.count(), 3)
    #     self.assertEqual(FileUploadRequest.objects.count(), 3)

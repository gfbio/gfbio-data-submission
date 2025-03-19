# -*- coding: utf-8 -*-

import json
import os
import tempfile
from dataclasses import dataclass
from pprint import pprint
from typing import Optional
from unittest import skip
from unittest.mock import patch, MagicMock

import requests
import responses
from botocore.exceptions import ClientError
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from dt_upload.models import MultiPartUpload
from dt_upload.models import backend_based_upload_models
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.configuration.settings import (
    GFBIO_HELPDESK_TICKET,
)
from gfbio_submissions.brokerage.configuration.settings import (
    JIRA_ATTACHMENT_SUB_URL,
    JIRA_ISSUE_URL,
)
from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer, _get_jira_attach_response, _get_jira_issue_response,
)
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.users.models import User
from ...models.submission import Submission
from ...models.submission_cloud_upload import SubmissionCloudUpload

User = get_user_model()


@skip("request to real s3 bucket, if settings are set properly")
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

        file_size_mb = 20
        file_size_bytes = file_size_mb * 1024 * 1024
        part_size = 5  # TODO:  2 zu klein fr s3 ?
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

        response = self.client.post(url, data=data, format="json")

        submission_cloud_upload = SubmissionCloudUpload.objects.get(submission=submission)
        file_upload = submission_cloud_upload.file_upload
        multipart = MultiPartUpload.objects.get(file_upload_request=file_upload)

        # --------------------------------------------------------------------------------------

        # TODO: for local file and to store information about part of actual file
        @dataclass
        class UploadPart:
            part_number: int
            start_byte: int
            end_byte: int
            etag: Optional[str] = None
            completed: bool = False

        f_parts = []
        f_part_number = 1
        f_size = os.path.getsize(tmp_file_path)
        f_name = os.path.basename(tmp_file_path)
        f_part_size = part_size * 1024 * 1024

        # TODO: local determination of sstart and end bytes for local file parts
        for start_byte in range(0, f_size, f_part_size):
            end_byte = min(start_byte + f_part_size, f_size)
            f_parts.append(UploadPart(
                part_number=f_part_number,
                start_byte=start_byte,
                end_byte=end_byte
            ))
            f_part_number += 1

        completed_parts = []
        with open(tmp_file_path, 'rb') as file:
            for f_part in f_parts:
                response = self.client.post(url, {'part_number': f_part.part_number}, format="json")
                f_part_content = json.loads(response.content)

                presigned_url = f_part_content['presigned_url']

                # Read the part data
                file.seek(f_part.start_byte)
                part_data = file.read(f_part.end_byte - f_part.start_byte)

                # Upload the part
                s3_response = requests.put(presigned_url, data=part_data)
                etag = s3_response.headers['ETag'].strip('"')
                completed_parts.append({
                    "PartNumber": f_part.part_number,
                    "ETag": etag
                })

        # complete
        data_for_complete = {'parts': completed_parts}
        url = reverse("brokerage:submissions_cloud_upload_complete", kwargs={"upload_id": multipart.upload_id})
        response = self.client.put(url, data_for_complete, format="json")
        file_upload.refresh_from_db()
        submission_cloud_upload.refresh_from_db()

        os.remove(tmp_file_path)


class TestSubmissionCloudUploadView(TestCase):

    def setUp(self):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        site_config = SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            ena_server=resource_cred,
            ena_report_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
            contact="kevin@horstmeier.de",
        )

        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(site_config.helpdesk_server.url),
            status=200,
        )

        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/FAKE_KEY".format(site_config.helpdesk_server.url),
            json=_get_jira_issue_response(),
        )

        responses.add(
            responses.POST,
            "{0}{1}/{2}/{3}".format(
                site_config.helpdesk_server.url,
                JIRA_ISSUE_URL,
                "SAND-1661",
                JIRA_ATTACHMENT_SUB_URL,
            ),
            json=_get_jira_attach_response(),
            status=200,
        )
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

        submission = _create_submission_via_serializer()
        submission.additionalreference_set.create(type=GFBIO_HELPDESK_TICKET, reference_key="FAKE_KEY", primary=True)
        _create_submission_via_serializer()

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

        self.mock_upload_id = "test-upload-id-12345"
        self.mock_file_key = "test-file-key-12345"

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

        data = self.test_file_data
        data["attach_to_ticket"] = False
        data["meta_data"] = True
        response = self.client.post(url, data=data, format="json")
        content = json.loads(response.content)

        # SubmissionCloudUpload ------------------------------------------------
        self.assertEqual(201, response.status_code)
        self.assertEqual(str(submission.broker_submission_id),
                         content.get("broker_submission_id", "no-bsi"))
        self.assertEqual(1, len(SubmissionCloudUpload.objects.all()))

        # DTUpload FileUploadRequest -------------------------------------------
        file_upload = backend_based_upload_models.FileUploadRequest.objects.first()
        self.assertIsNotNone(file_upload)
        self.assertEqual(file_upload.original_filename, self.test_file_data["filename"])
        self.assertEqual(file_upload.status, "PENDING")
        # bsi in filekey
        self.assertIn(str(submission.broker_submission_id), file_upload.file_key)

        # DTUpload MultiPartUpload -------------------------------------------
        multipart = backend_based_upload_models.MultiPartUpload.objects.first()
        self.assertIsNotNone(multipart)
        self.assertEqual(multipart.upload_id, self.mock_upload_id)
        self.assertEqual(multipart.parts_expected, self.test_file_data["total_parts"])

        # DTUpload UploadPart -------------------------------------------
        upload_parts = backend_based_upload_models.UploadPart.objects.all()
        self.assertEqual(multipart.parts_expected, len(upload_parts))
        for u in upload_parts:
            self.assertEqual(multipart, u.multipart_upload)

        # Assert S3 client called correctly
        self.s3_client_mock.create_multipart_upload.assert_called_once()

        # DONE: TODO: next : integrate dtuplod viiew into submission urls to complete uload to s3transfer
        # TODO: put more info about nextz step and part upload url into initial response of SCU objkect
        # DONE: tODO: 500 & 400 from s3 views
        # DONE: TODO: custom views via inheritance work, maybe add bsi to views for consistency ? compare SubmissionCloudUploadPartURLView
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
        # Mock S3 generate_presigned_url response
        mock_url = "https://test-bucket.s3.amazonaws.com/test-presigned-url"
        self.s3_client_mock.generate_presigned_url.return_value = mock_url

        # Make request for part URL
        url = reverse("brokerage:submissions_cloud_upload_part", kwargs={"upload_id": self.mock_upload_id})
        response = self.client.post(url, {"part_number": 1}, format="json")

        # Assert response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["presigned_url"], mock_url)
        self.assertEqual(response.data["part_number"], 1)

        # Assert S3 client called correctly
        self.s3_client_mock.generate_presigned_url.assert_called_once()

    @responses.activate
    def test_complete_multipart_upload(self):
        # Create test records
        file_upload = backend_based_upload_models.FileUploadRequest.objects.create(
            original_filename=self.test_file_data["filename"],
            file_key=self.mock_file_key,
            file_type=self.test_file_data["filetype"],
            status="PENDING",
            user=self.user
        )

        submission = Submission.objects.first()
        submission_cloud_upload = SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=True,
            meta_data=True,
            file_upload=file_upload
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
        pprint(response.data)

        # Assert response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "completed")
        self.assertIn("location", response.data)

        # Assert database records updated
        file_upload.refresh_from_db()
        multipart.refresh_from_db()
        self.assertEqual(file_upload.status, "COMPLETED")
        self.assertIsNotNone(multipart.completed_at)


        # print(submission_cloud_upload.file_upload.uploaded_file)
        # # with tempfile.TemporaryDirectory() as tmpdir:
        #
        # with open("s3-test", "wb") as f:
        #     res = self.s3_client_mock.download_fileobj(Bucket=settings.AWS_STORAGE_BUCKET_NAME,
        #                                          Key=submission_cloud_upload.file_upload.file_key, Fileobj=f)
        #     # print(res.read())
        #     f.close()
        # with open("s3-test", "rb") as f:
        #     print(f.name)
        #     print(f.read())
        #
        # local_file_path = 'Datei.txt'
        # try:
        #     # s3 = boto3.client('s3')
        #     self.s3_client_mock.download_file(settings.AWS_STORAGE_BUCKET_NAME, submission_cloud_upload.file_upload.file_key, local_file_path)
        #     print(f"Datei erfolgreich heruntergeladen nach: {local_file_path}")
        #     # with open(local_file_path, 'rb') as f_in:
        #     #     print(f_in.read())
        # except Exception as e:
        #     print(f"Fehler beim Herunterladen der Datei: {e}")

        # with default_storage.open(submission_cloud_upload.file_upload.uploaded_file.url, 'rb') as f:
        #     print(f.read())
        # with open(submission_cloud_upload.file_upload.uploaded_file.file, "rb") as f:
        #     print(f.read())

        # with open(temp_path, "wb") as f:
        # if s3_client is not None:
        #     s3_client.download_fileobj(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_key, Fileobj=f)
        # else:
        #     raise Exception("S3 client is not configured.")
        # Assert S3 client called correctly
        self.s3_client_mock.complete_multipart_upload.assert_called_once()
        submission_cloud_upload.refresh_from_db()
        self.assertEqual(10814, submission_cloud_upload.attachment_id)

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

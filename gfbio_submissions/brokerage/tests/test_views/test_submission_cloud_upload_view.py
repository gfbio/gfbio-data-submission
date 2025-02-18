# -*- coding: utf-8 -*-
import json
import os
import shutil
from pprint import pprint
from urllib.parse import urlparse
from uuid import uuid4

import responses
from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from config.settings.base import MEDIA_ROOT, MEDIA_URL
from gfbio_submissions.brokerage.configuration.settings import (
    GFBIO_HELPDESK_TICKET,
    JIRA_ATTACHMENT_SUB_URL,
    JIRA_ATTACHMENT_URL,
    JIRA_ISSUE_URL,
)
from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer,
    _get_jira_attach_response,
    _get_jira_issue_response,
)
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from ...models.submission_cloud_upload import SubmissionCloudUpload

from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload
from ...models.task_progress_report import TaskProgressReport
import json
from pprint import pprint
from unittest.mock import patch, MagicMock

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from botocore.exceptions import ClientError

from dt_upload.models import backend_based_upload_models

User = get_user_model()


class TestSubmissionCloudUploadView(TestCase):

    def setUp(self):
        # resource_cred = ResourceCredential.objects.create(
        #     title="Resource Title",
        #     url="https://www.example.com",
        #     authentication_string="letMeIn",
        # )
        #
        # self.site_config = SiteConfiguration.objects.create(
        #     title="default",
        #     release_submissions=False,
        #     ena_server=resource_cred,
        #     pangaea_token_server=resource_cred,
        #     pangaea_jira_server=resource_cred,
        #     helpdesk_server=resource_cred,
        #     comment="Default configuration",
        # )
        # user = User.objects.create_user(username="horst", email="horst@horst.de", password="password")
        # permissions = Permission.objects.filter(
        #     content_type__app_label="brokerage", codename__endswith="submissioncloudupload"
        # )
        # # print(permissions)
        # user.user_permissions.add(*permissions)
        # user.site_configuration = self.site_config
        # user.save()
        # token = Token.objects.create(user=user)
        # client = APIClient()
        # client.credentials(HTTP_AUTHORIZATION="Token " + token.key)
        # self.api_client = client
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

        # user = User.objects.create_user(username="kevin", email="kevin@kevin.de", password="secret", is_staff=True)
        # token = Token.objects.create(user=user)
        # client = APIClient()
        # client.credentials(HTTP_AUTHORIZATION="Token " + token.key)
        # cls.other_api_client = client

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
        print(submission.status)
        url = reverse(
            "brokerage:submissions_cloud_upload",
            kwargs={"broker_submission_id": submission.broker_submission_id},
        )
        print(url)
        data = self.test_file_data
        data["attach_to_ticket"] = False
        data["meta_data"] = True
        response = self.client.post(url, data=data, format="json")
        content = json.loads(response.content)
        pprint(content)

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

        # TODO: next : integrate dtuplod viiew into submission urls to complete uload to s3transfer
        # TODO: put more info about nextz step and part upload url into initial response of SCU objkect





# -*- coding: utf-8 -*-

from unittest.mock import MagicMock
from unittest.mock import patch

import responses
from django.conf import settings
from django.urls import reverse
from dt_upload.models import FileUploadRequest
from dt_upload.models import MultiPartUpload
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.configuration.settings import (
    GFBIO_HELPDESK_TICKET, )
from gfbio_submissions.brokerage.configuration.settings import (
    JIRA_ATTACHMENT_SUB_URL,
    JIRA_ATTACHMENT_URL,
    JIRA_ISSUE_URL,
)
from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer, _get_jira_attach_response,
)
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User
from ...models import SubmissionCloudUpload
from ...models.submission import Submission
from ...tasks.jira_tasks.attach_to_submission_issue import attach_cloud_upload_to_submission_issue_task
from ...tasks.jira_tasks.delete_submission_issue_attachment import delete_submission_issue_attachment_task
from ...tests.test_tasks.test_helpdesk_tasks_base import TestHelpDeskTasksBase


class TestAttachCloudUploadToIssueTasks(TestHelpDeskTasksBase):

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

    def _add_submission_upload(self):
        file_upload = FileUploadRequest.objects.create(
            original_filename=self.test_file_data["filename"],
            file_key=self.mock_file_key,
            file_type=self.test_file_data["filetype"],
            status="PENDING",
            user=self.user
        )

        submission = Submission.objects.first()
        SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=True,
            meta_data=False,
            file_upload=file_upload
        )

        MultiPartUpload.objects.create(
            upload_id=self.mock_upload_id,
            file_upload_request=file_upload,
            parts_expected=2
        )

        parts_data = {
            "parts": [
                {"PartNumber": 1, "ETag": "'test-etag-1'"},
                {"PartNumber": 2, "ETag": "'test-etag-2'"}
            ]
        }

        self.s3_client_mock.complete_multipart_upload.return_value = {
            "Location": "https://test-bucket.s3.amazonaws.com/test-file"
        }

        url = reverse("brokerage:submissions_cloud_upload_complete", kwargs={"upload_id": self.mock_upload_id})
        self.client.put(url, parts_data, format="json")

    def _prepare_responses(self):
        self._add_submission_upload()
        site_config = SiteConfiguration.objects.first()

        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(site_config.helpdesk_server.url),
            status=200,
        )

        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/FAKE_KEY".format(site_config.helpdesk_server.url),
            json=self.issue_json,
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

    @responses.activate
    def test_attach_cloud_upload_to_issue_task(self):
        self._prepare_responses()
        submission = Submission.objects.first()
        cloud_upload = SubmissionCloudUpload.objects.first()
        cloud_upload.meta_data = True
        cloud_upload.save()
        result = attach_cloud_upload_to_submission_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "submission_upload_id": cloud_upload.pk,
            }
        )

        self.assertTrue(result.successful())
        self.assertTrue(result.get())
        cloud_upload.refresh_from_db()
        self.assertEqual(10814, cloud_upload.attachment_id)

    @responses.activate
    def test_attach_cloud_upload_to_issue_task_no_file_upload(self):
        self._prepare_responses()
        submission = Submission.objects.first()
        cloud_upload = SubmissionCloudUpload.objects.first()
        cloud_upload.meta_data = True
        cloud_upload.file_upload = None
        cloud_upload.save()
        result = attach_cloud_upload_to_submission_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "submission_upload_id": cloud_upload.pk,
            }
        )

        self.assertTrue(result.successful())
        self.assertTrue(result.get())
        cloud_upload.refresh_from_db()
        self.assertIsNone(cloud_upload.attachment_id)

    @responses.activate
    def test_attach_cloud_upload_to_issue_task_invalid_key(self):
        self._prepare_responses()
        submission = Submission.objects.first()
        cloud_upload = SubmissionCloudUpload.objects.first()
        cloud_upload.meta_data = True
        cloud_upload.file_upload.file_key = 'invalid-123'
        cloud_upload.file_upload.save()
        cloud_upload.save()
        result = attach_cloud_upload_to_submission_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "submission_upload_id": cloud_upload.pk,
            }
        )

        self.assertTrue(result.successful())
        self.assertTrue(result.get())
        cloud_upload.refresh_from_db()
        self.assertEqual(10814, cloud_upload.attachment_id)

    @responses.activate
    def test_delete_attachment_task(self):
        self._prepare_responses()
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()

        submission_upload = SubmissionCloudUpload.objects.first()
        url = "{0}{1}/{2}".format(
            site_config.helpdesk_server.url,
            JIRA_ATTACHMENT_URL,
            submission_upload.attachment_id,
        )
        responses.add(responses.DELETE, url, body=b"", status=204)
        result = delete_submission_issue_attachment_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "attachment_id": SubmissionCloudUpload.objects.first().attachment_id,
            }
        )
        self.assertTrue(result.successful())
        self.assertTrue(result.get())

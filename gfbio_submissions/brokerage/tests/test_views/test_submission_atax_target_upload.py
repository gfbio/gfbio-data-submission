import json
import os
import shutil

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from config.settings.base import MEDIA_ROOT
from gfbio_submissions.brokerage.configuration.settings import (
    GFBIO_HELPDESK_TICKET,
    JIRA_ATTACHMENT_SUB_URL,
    JIRA_ISSUE_URL,
)
from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer,
    _get_jira_attach_response,
    _get_jira_issue_response,
)
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User
from .test_submission_upload_view import TestSubmissionUploadView
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport


class TestSubmissionUploadViewForAtaxTarget(TestCase):
    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )

        cls.site_config = SiteConfiguration.objects.create(
            title="default",
            release_submissions=False,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
        )
        user = User.objects.create_user(username="horst", email="hans@hans.de", password="password321")
        permissions = Permission.objects.filter(
            content_type__app_label="brokerage", codename__endswith="submissionupload"
        )
        user.user_permissions.add(*permissions)
        user.site_configuration = cls.site_config
        user.save()
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Token " + token.key)
        cls.api_client = client

        user = User.objects.create_user(username="kevin", email="kevin@kevin.de", password="secret", is_staff=True)
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Token " + token.key)
        cls.other_api_client = client

        submission = _create_submission_via_serializer(atax=True)
        submission.additionalreference_set.create(type=GFBIO_HELPDESK_TICKET, reference_key="FAKE_KEY", primary=True)
        _create_submission_via_serializer(atax=True)

        cls.upload_url = reverse(
            "brokerage:submissions_upload",
            kwargs={"broker_submission_id": submission.broker_submission_id},
        )

    @classmethod
    def tearDownClass(cls):
        super(TestSubmissionUploadViewForAtaxTarget, cls).tearDownClass()
        [
            shutil.rmtree(path="{0}{1}{2}".format(MEDIA_ROOT, os.sep, o), ignore_errors=False)
            for o in os.listdir(MEDIA_ROOT)
        ]

    @classmethod
    def _add_issue_responses(cls, submission=None):
        if submission is None:
            submission = Submission.objects.all().first()
        site_config = SiteConfiguration.objects.first()

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

        url = reverse(
            "brokerage:submissions_upload",
            kwargs={"broker_submission_id": submission.broker_submission_id},
        )
        responses.add(responses.POST, url, json={}, status=200)

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

    def test_simple_upload_to_atx_submission(self):
        submission = Submission.objects.first()
        submission.status = Submission.OPEN
        submission.save()
        self.assertEqual("ATAX", submission.target)

        data = TestSubmissionUploadView._create_test_data("/tmp/test_data_file.bla")
        response = self.api_client.post(self.upload_url, data, format="multipart")
        self.assertEqual(201, response.status_code)
        content = json.loads(response.content)
        self.assertFalse(content.get('attach_to_ticket'))
        self.assertEqual(1, len(submission.submissionupload_set.all()))
        self.assertEqual(0, len(TaskProgressReport.objects.all()))

    @responses.activate
    def test_simple_upload_to_atx_and_attach_to_issue(self):
        submission = Submission.objects.first()
        submission.status = Submission.OPEN
        submission.save()
        self.assertEqual("ATAX", submission.target)
        self._add_issue_responses(submission)
        data = TestSubmissionUploadView._create_test_data("/tmp/test_data_file.bla")
        data["attach_to_ticket"] = True
        response = self.api_client.post(self.upload_url, data, format="multipart")
        self.assertEqual(201, response.status_code)
        content = json.loads(response.content)
        self.assertTrue(content.get('attach_to_ticket'))
        self.assertEqual(1, len(submission.submissionupload_set.all()))
        self.assertNotEqual(0, len(TaskProgressReport.objects.all()))

    def test_upload_to_atx_submission_with_changed_status(self):
        submission = Submission.objects.first()
        submission.status = Submission.OPEN
        submission.save()
        self.assertEqual("ATAX", submission.target)
        self.assertEqual(Submission.OPEN, submission.status)

        data = TestSubmissionUploadView._create_test_data("/tmp/test_data_file.bla", delete=False)
        response = self.api_client.post(self.upload_url, data, format="multipart")
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(submission.submissionupload_set.all()))

        submission.status = Submission.SUBMITTED
        submission.save()
        self.assertEqual("ATAX", submission.target)
        self.assertEqual(Submission.SUBMITTED, submission.status)
        data = TestSubmissionUploadView._create_test_data("/tmp/new_test_data_file.bla", delete=False)
        response = self.api_client.post(self.upload_url, data, format="multipart")
        content = json.loads(response.content)
        self.assertEqual(400, response.status_code)
        self.assertEqual('no uploads allowed with current submission status', content.get('error', 'no_error_found'))
        self.assertEqual(1, len(submission.submissionupload_set.all()))

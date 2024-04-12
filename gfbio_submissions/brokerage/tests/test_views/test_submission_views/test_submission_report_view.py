# -*- coding: utf-8 -*-
import json

from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.status import HTTP_401_UNAUTHORIZED, HTTP_200_OK
from rest_framework.test import APIClient

from gfbio_submissions.users.models import User
from ....models.submission import Submission
from ....models.submission_report import SubmissionReport
from ....tests.utils import _create_submission_via_serializer


class TestSubmissionReportView(TestCase):
    @classmethod
    def setUp(cls):
        user = User.objects.create_user(username="horst", email="horst@horst.de", password="password")
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Token " + token.key)
        cls.api_client = client

        user_2 = User.objects.create_user(username="xyz", email="xyz@horst.de", password="password1234")
        token_2 = Token.objects.create(user=user_2)
        client_2 = APIClient()
        client_2.credentials(HTTP_AUTHORIZATION="Token " + token_2.key)
        cls.api_client_2 = client_2

        submission_1 = _create_submission_via_serializer(username=user.name)
        submission_2 = _create_submission_via_serializer(username=user_2.name)

        SubmissionReport.objects.create(submission=submission_1, report="Test Report",
                                        report_category=SubmissionReport.ERROR)
        SubmissionReport.objects.create(submission=submission_1, report="Test Report",
                                        report_category=SubmissionReport.INFO)
        SubmissionReport.objects.create(submission=submission_2, report="Test Report",
                                        report_category=SubmissionReport.DEBUG)

    def test_no_credentials(self):
        submission = Submission.objects.last()
        url = '/api/submissions/{}/reports/'.format(submission.broker_submission_id)
        response = self.client.get(url)
        self.assertEqual(HTTP_401_UNAUTHORIZED, response.status_code)

    def test_invalid_credentials(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Token 0815kjbdfljhbdsf")
        submission = Submission.objects.last()
        url = '/api/submissions/{}/reports/'.format(submission.broker_submission_id)
        response = client.get(url)
        self.assertEqual(HTTP_401_UNAUTHORIZED, response.status_code)

    def test_ownership(self):
        submission = Submission.objects.first()
        url = '/api/submissions/{}/reports/'.format(submission.broker_submission_id)

        response = self.api_client_2.get(url)
        content = json.loads(response.content)
        self.assertEqual(HTTP_200_OK, response.status_code)
        self.assertListEqual([], content)

        response = self.api_client.get(url)
        content = json.loads(response.content)
        self.assertEqual(HTTP_200_OK, response.status_code)
        self.assertEqual(2, len(content))

    def test_get_reports(self):
        submission = Submission.objects.first()
        url = '/api/submissions/{}/reports/'.format(submission.broker_submission_id)
        response = self.api_client.get(url)
        content = json.loads(response.content)
        self.assertEqual(200, response.status_code)
        self.assertEqual(2, len(content))

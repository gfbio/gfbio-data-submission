# -*- coding: utf-8 -*-

from django.test import TestCase

from ..utils import (
    _create_submission_via_serializer, )
from ...models.submission_report import SubmissionReport
from gfbio_submissions.users.models import User

class TestSubmissionReport(TestCase):

    def test_model(self):
        User.objects.create(username="user1")
        submission = _create_submission_via_serializer()
        report = SubmissionReport.objects.create(submission=submission, report="Test Report",
                                                 report_category=SubmissionReport.ERROR)
        self.assertEqual(SubmissionReport.ERROR, report.report_category)

# -*- coding: utf-8 -*-

from django.test import TestCase

from gfbio_submissions.users.models import User
from ..utils import _create_submission_via_serializer
from ...serializers.submission_report_serializer import SubmissionReportSerializer


class SubmissionReportSerializerTest(TestCase):

    def test_instance_serialization(self):
        User.objects.create(username="user1")
        submission = _create_submission_via_serializer()
        serializer = SubmissionReportSerializer(
            data={"submission": submission.pk, "report": "Lorem Ispum", "report_category": "INFO"})
        valid = serializer.is_valid()
        self.assertTrue(valid)
        self.assertDictEqual({}, serializer.errors)

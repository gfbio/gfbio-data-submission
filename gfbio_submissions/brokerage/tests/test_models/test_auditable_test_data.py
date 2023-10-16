# -*- coding: utf-8 -*-

from django.test import TestCase

from gfbio_submissions.brokerage.admin import download_auditable_text_data
from gfbio_submissions.brokerage.utils.ena import (
    prepare_ena_data,
    store_ena_data_as_auditable_text_data,
)
from gfbio_submissions.users.models import User
from ..utils import _get_ena_data, _get_ena_data_without_runs
from ...models.auditable_text_data import AuditableTextData
from ...models.broker_object import BrokerObject
from ...models.submission import Submission
from ...serializers.submission_serializer import SubmissionSerializer


# from ...serializers import SubmissionSerializer


class TestAuditableTextData(TestCase):
    # TODO: redundant in various test_classes move to test_utils
    @classmethod
    def _create_submission_via_serializer(cls, runs=False):
        serializer = SubmissionSerializer(
            data={
                "target": "ENA",
                "release": True,
                "data": _get_ena_data() if runs else _get_ena_data_without_runs(),
            }
        )
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)
        return submission

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(username="horst", email="horst@horst.de", password="password")
        cls._create_submission_via_serializer()

    def test_instance(self):
        submission = Submission.objects.first()
        atd = AuditableTextData.objects.create(name="test-file", submission=submission)
        self.assertFalse(atd.pk is None)
        self.assertIsInstance(atd, AuditableTextData)

    def test_store_ena_data_as_auditable_text_data(self):
        submission = Submission.objects.first()
        all_text_data = AuditableTextData.objects.all()
        self.assertEqual(0, len(all_text_data))
        data = prepare_ena_data(submission)
        store_ena_data_as_auditable_text_data(submission, data)
        all_text_data = AuditableTextData.objects.all()
        self.assertEqual(4, len(all_text_data))
        text_data_for_submission = AuditableTextData.objects.filter(submission=submission)
        self.assertEqual(4, len(text_data_for_submission))

    def test_admin_download(self):
        submission = Submission.objects.first()
        data = prepare_ena_data(submission)
        store_ena_data_as_auditable_text_data(submission, data)
        data = AuditableTextData.objects.filter(submission=submission)
        response = download_auditable_text_data(
            None,
            None,
            Submission.objects.filter(broker_submission_id=submission.broker_submission_id),
        )
        self.assertEqual(200, response.status_code)

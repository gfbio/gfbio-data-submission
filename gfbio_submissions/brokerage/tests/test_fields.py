# -*- coding: utf-8 -*-
import json

from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import (
    _get_ena_data,
    _get_ena_data_without_runs,
)
from gfbio_submissions.users.models import User
from ..models.broker_object import BrokerObject
from ..models.submission import Submission
from ..serializers.submission_serializer import SubmissionSerializer


class JsonDictFieldTest(TestCase):
    # TODO: move to utils or similar ...
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
        User.objects.create(username="user1")
        cls._create_submission_via_serializer(runs=True)

    def test_submission_data_escape_situation(self):
        submission = Submission.objects.first()
        self.assertTrue(isinstance(submission.data, dict))
        serialized_data = json.dumps(submission.data)
        self.assertTrue(type(serialized_data) == str)
        self.assertEqual(0, serialized_data.count("\\"))
        submission.save()
        self.assertTrue(isinstance(submission.data, dict))
        serialized_data = json.dumps(submission.data)
        self.assertTrue(type(serialized_data) == str)
        self.assertEqual(0, serialized_data.count("\\"))
        submission.save()
        self.assertTrue(isinstance(submission.data, dict))
        serialized_data = json.dumps(submission.data)
        self.assertTrue(type(serialized_data) == str)
        self.assertEqual(0, serialized_data.count("\\"))

    def test_search_submission_data(self):
        submission = Submission.objects.first()
        qs = Submission.objects.filter(data__requirements__title="Test Data Submission")
        self.assertEqual(1, len(qs))
        self.assertEqual(
            submission.broker_submission_id, qs.first().broker_submission_id
        )
        qs = Submission.objects.filter(data__requirements__has_key="custom_key")
        self.assertEqual(0, len(qs))
        submission.data["requirements"]["custom_key"] = True
        submission.save()
        qs = Submission.objects.filter(data__requirements__has_key="custom_key")
        self.assertEqual(1, len(qs))

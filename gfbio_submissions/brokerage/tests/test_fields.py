# -*- coding: utf-8 -*-
import json

from django.test import TestCase

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.users.models import User


class JsonDictFieldTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        User.objects.create(
            username="user1"
        )
        SubmissionTest._create_submission_via_serializer(runs=True)

    def test_submission_data_escape_situation(self):
        submission = Submission.objects.first()
        self.assertTrue(isinstance(submission.data, dict))
        serialized_data = json.dumps(submission.data)
        self.assertTrue(type(serialized_data) == str)
        self.assertEqual(0, serialized_data.count('\\'))
        submission.save()
        self.assertTrue(isinstance(submission.data, dict))
        serialized_data = json.dumps(submission.data)
        self.assertTrue(type(serialized_data) == str)
        self.assertEqual(0, serialized_data.count('\\'))
        submission.save()
        self.assertTrue(isinstance(submission.data, dict))
        serialized_data = json.dumps(submission.data)
        self.assertTrue(type(serialized_data) == str)
        self.assertEqual(0, serialized_data.count('\\'))

    def test_search_submission_data(self):
        submission = Submission.objects.first()
        qs = Submission.objects.filter(
            data__requirements__title='Test Data Submission')
        self.assertEqual(1, len(qs))
        self.assertEqual(submission.broker_submission_id,
                         qs.first().broker_submission_id)
        qs = Submission.objects.filter(data__requirements__has_key='custom_key')
        self.assertEqual(0, len(qs))
        submission.data['requirements']['custom_key'] = True
        submission.save()
        qs = Submission.objects.filter(data__requirements__has_key='custom_key')
        self.assertEqual(1, len(qs))

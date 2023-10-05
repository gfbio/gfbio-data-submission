# -*- coding: utf-8 -*-
import datetime

from django.test import TestCase

from ...serializers.submission_detail_serializer import SubmissionDetailSerializer
from ...serializers.submission_serializer import SubmissionSerializer


class SubmissionSerializerTest(TestCase):

    def test_empty_generic_submission(self):
        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': {}
        })
        valid = serializer.is_valid()
        self.assertFalse(valid)

    def test_min_generic_submission(self):
        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': {
                'requirements': {
                    'title': 'Generic Title',
                    'description': 'Generic submission description'
                }
            }
        })
        valid = serializer.is_valid()
        self.assertTrue(valid)

    def test_generic_submission_errors(self):
        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': {
                'requirements': {
                    'title': 'Generic Title',
                    'description': 'Generic submission description',
                    'categories': 'wrong'
                }
            }
        })
        valid = serializer.is_valid()
        self.assertFalse(valid)

    def test_wrong_contributors(self):
        serializer = SubmissionDetailSerializer(data={
            'target': 'GENERIC',
            'release': False,
            'data': {
                'requirements': {
                    'title': 'Generic Title',
                    'description': 'Generic submission description',
                    'categories': 'wrong',
                    "contributors": [{"lastName": "Bar |", "position": 1, "firstName": "Foo",
                                      "contribution": "Author/Creator,Data Owner", "emailAddress": "foo@bar.de"}]
                }
            }
        })
        valid = serializer.is_valid()
        self.assertIn('pipe "|" character is not allowed', serializer.errors['data'][0])
        self.assertFalse(valid)

    def test_correct_contributors(self):
        serializer = SubmissionDetailSerializer(data={
            'target': 'GENERIC',
            'release': False,
            'data': {
                'requirements': {
                    'title': 'Generic Title',
                    'description': 'Generic submission description',
                    'categories': 'wrong',
                    "contributors": [{"lastName": "Bar", "position": 1, "firstName": "Foo",
                                      "contribution": "Author/Creator,Data Owner", "emailAddress": "foo@bar.de"}]
                }
            }
        })
        valid = serializer.is_valid()
        self.assertEqual(0, len(serializer.errors))
        self.assertTrue(valid)

    def test_past_embargo(self):
        serializer = SubmissionDetailSerializer(data={
            'target': 'GENERIC',
            'release': False,
            'embargo': datetime.date.today() - datetime.timedelta(days=10),
            'data': {
                'requirements': {
                    'title': 'Generic Title',
                    'description': 'Generic submission description',
                }
            }
        })
        valid = serializer.is_valid()
        self.assertIn('earliest possible date is 24 hours from today', serializer.errors['data'][0])
        self.assertFalse(valid)

    def test_wrong_future_embargo(self):
        serializer = SubmissionDetailSerializer(data={
            'target': 'GENERIC',
            'release': False,
            'embargo': datetime.date.today() + datetime.timedelta(days=800),
            'data': {
                'requirements': {
                    'title': 'Generic Title',
                    'description': 'Generic submission description',
                }
            }
        })
        valid = serializer.is_valid()
        self.assertIn('latest possible date is 2 years from today', serializer.errors['data'][0])
        self.assertFalse(valid)

    def test_correct_embargo(self):
        serializer = SubmissionDetailSerializer(data={
            'target': 'GENERIC',
            'release': False,
            'embargo': datetime.date.today() + datetime.timedelta(days=10),
            'data': {
                'requirements': {
                    'title': 'Generic Title',
                    'description': 'Generic submission description',
                }
            }
        })
        valid = serializer.is_valid()
        self.assertTrue(valid)

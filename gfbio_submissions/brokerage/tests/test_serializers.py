# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.brokerage.serializers import SubmissionSerializer


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

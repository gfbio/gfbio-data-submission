# -*- coding: utf-8 -*-

from django.test import TestCase

from gfbio_submissions.brokerage.models import ResourceCredential


class ResourceCredentialTest(TestCase):

    def setUp(self):
        ResourceCredential.objects.get_or_create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )

    def test_instance(self):
        resource_credentials = ResourceCredential.objects.all()
        self.assertEqual(1, len(resource_credentials))

    def test_str(self):
        resource_credentials = ResourceCredential.objects.all()
        self.assertEqual(
            'Resource Title',
            resource_credentials.first().__str__()
        )

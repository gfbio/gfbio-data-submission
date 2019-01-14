# -*- coding: utf-8 -*-
from urllib.parse import urlparse
from uuid import uuid4

from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.core.urlresolvers import reverse
from rest_framework.test import APIClient

from config.settings.base import MEDIA_URL
from gfbio_submissions.brokerage.models import SubmissionFileUpload, Submission, \
    SiteConfiguration, ResourceCredential
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.users.models import User


class TestSubmissionFileUpload(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submission')
        user.user_permissions.add(*permissions)
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage', codename__endswith='upload')
        user.user_permissions.add(*permissions)
        token = Token.objects.create(user=User.objects.first())
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        cls.site_config = SiteConfiguration.objects.create(
            title='default',
            release_submissions=False,
            use_gfbio_services=False,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )
        SubmissionTest._create_submission_via_serializer()
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        cls.api_client = client

    def _create_test_data(self, path):
        self._delete_test_data()
        f = open(path, 'w')
        f.write('test123\n')
        f.close()
        f = open(path, 'rb')
        return {
            'file': f,
        }

    @staticmethod
    def _delete_test_data():
        SubmissionFileUpload.objects.all().delete()

    def test_valid_file_upload(self):
        submission = Submission.objects.all().first()
        url = reverse(
            'brokerage:submissions_upload',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        data = self._create_test_data('/tmp/test_upload')
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn(b'broker_submission_id', response.content)
        self.assertIn(b'site', response.content)
        self.assertEqual(User.objects.first().username, response.data['site'])
        self.assertIn(b'file', response.content)
        self.assertTrue(
            urlparse(response.data['file']).path.startswith(MEDIA_URL))

    def test_no_submission_upload(self):
        url = reverse(
            'brokerage:submissions_upload',
            kwargs={
                'broker_submission_id': uuid4()
            })
        data = self._create_test_data('/tmp/test_upload')
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn(b'No submission', response.content)

    def test_empty_upload(self):
        submission = Submission.objects.all().first()
        url = reverse(
            'brokerage:submissions_upload',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        response = self.api_client.post(url, {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(b'No file was submitted.', response.content)

# -*- coding: utf-8 -*-
import json
from urllib.parse import urlparse
from uuid import uuid4

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.core.urlresolvers import reverse
from rest_framework.test import APIClient

from config.settings.base import MEDIA_URL
from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL, HELPDESK_ATTACHMENT_SUB_URL
from gfbio_submissions.brokerage.models import SubmissionFileUpload, Submission, \
    SiteConfiguration, ResourceCredential, PrimaryDataFile, AdditionalReference, \
    TaskProgressReport
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.tests.utils import _get_jira_attach_response
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
        token = Token.objects.create(user=user)
        SubmissionTest._create_submission_via_serializer()
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        cls.api_client = client
        # resource_cred = ResourceCredential.objects.create(
        #     title='Resource Title',
        #     url='https://www.example.com',
        #     authentication_string='letMeIn'
        # )
        # cls.site_config = SiteConfiguration.objects.create(
        #     title='default',
        #     release_submissions=False,
        #     use_gfbio_services=False,
        #     ena_server=resource_cred,
        #     pangaea_server=resource_cred,
        #     gfbio_server=resource_cred,
        #     helpdesk_server=resource_cred,
        #     comment='Default configuration',
        # )

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


class TestPrimaryDataFile(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')

        # for p in Permission.objects.filter(content_type__app_label='brokerage', codename__endswith='primarydatafile'):
        #     print(p.codename)
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='primarydatafile')
        # permissions = Permission.objects.filter(
        #     content_type__app_label='brokerage',
        #     codename__endswith='submission')
        user.user_permissions.add(*permissions)
        # permissions = Permission.objects.filter(
        #     content_type__app_label='brokerage', codename__endswith='upload')
        # user.user_permissions.add(*permissions)
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        cls.api_client = client
        user = User.objects.create_user(
            username='kevin', email='kevin@kevin.de', password='secret',
            is_staff=True)
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        cls.other_api_client = client
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
        submission = SubmissionTest._create_submission_via_serializer()
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        submission = SubmissionTest._create_submission_via_serializer()

    @classmethod
    def _create_test_data(cls, path, delete=True):
        if delete:
            cls._delete_test_data()
        f = open(path, 'w')
        f.write('test123\n')
        f.close()
        f = open(path, 'rb')
        return {
            'data_file': f,
        }

    @staticmethod
    def _delete_test_data():
        PrimaryDataFile.objects.all().delete()

    def test_empty_relation(self):
        submission = Submission.objects.first()
        pd = submission.primarydatafile_set.first()
        self.assertIsNone(pd)

    @responses.activate
    def test_valid_file_upload(self):
        submission = Submission.objects.all().first()
        site_config = SiteConfiguration.objects.first()
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          HELPDESK_API_SUB_URL,
                          'FAKE_KEY',
                          HELPDESK_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        reports_len = len(TaskProgressReport.objects.all())
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn(b'broker_submission_id', response.content)
        self.assertIn(b'"id"', response.content)
        self.assertIn(b'site', response.content)
        self.assertEqual(User.objects.first().username, response.data['site'])
        self.assertIn(b'data_file', response.content)
        self.assertTrue(
            urlparse(response.data['data_file']).path.startswith(MEDIA_URL))
        self.assertGreater(len(TaskProgressReport.objects.all()), reports_len)

    def test_no_permission_file_upload(self):
        submission = Submission.objects.all().first()
        url = reverse(
            'brokerage:submissions_primary_data',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        data = self._create_test_data('/tmp/test_primary_data_file')
        response = self.other_api_client.post(url, data, format='multipart')

        self.assertEqual(403, response.status_code)

    @responses.activate
    def test_not_owner_file_upload(self):
        submission = Submission.objects.first()
        submission.site = User.objects.last()
        submission.save()
        site_config = SiteConfiguration.objects.first()
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          HELPDESK_API_SUB_URL,
                          'FAKE_KEY',
                          HELPDESK_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        response = self.api_client.post(url, data, format='multipart')
        # FIXME: until changed, everyone with permissions can add file, even if not owner of respective submission
        self.assertEqual(201, response.status_code)

    def test_get_list(self):
        submission = Submission.objects.first()
        url = reverse(
            'brokerage:submissions_primary_data',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        response = self.api_client.get(url)
        self.assertEqual(405, response.status_code)

    def test_get_detail(self):
        submission = Submission.objects.all().first()
        url = reverse(
            'brokerage:submissions_primary_data_detail',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': 1
            })

        response = self.api_client.get(url)
        self.assertEqual(405, response.status_code)

    @responses.activate
    def test_wrong_submission_put(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = reverse(
            'brokerage:submissions_primary_data',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          HELPDESK_API_SUB_URL,
                          'FAKE_KEY',
                          HELPDESK_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file_1111')
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(PrimaryDataFile.objects.all()))
        fname = PrimaryDataFile.objects.all().first().data_file.name
        self.assertIn('test_primary_data_file_1111', fname)
        content = json.loads(response.content.decode('utf-8'))
        submission = Submission.objects.last()
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY_2',
            primary=True
        )
        url = reverse(
            'brokerage:submissions_primary_data_detail',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': content.get('id')
            })
        data = self._create_test_data('/tmp/test_primary_data_file_2222', False)
        response = self.api_client.put(url, data, format='multipart')
        self.assertEqual(400, response.status_code)

    @responses.activate
    def test_valid_file_put(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = reverse(
            'brokerage:submissions_primary_data',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          HELPDESK_API_SUB_URL,
                          'FAKE_KEY',
                          HELPDESK_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file_1111')
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(PrimaryDataFile.objects.all()))
        fname = PrimaryDataFile.objects.all().first().data_file.name
        self.assertIn('test_primary_data_file_1111', fname)
        content = json.loads(response.content.decode('utf-8'))
        url = reverse(
            'brokerage:submissions_primary_data_detail',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': content.get('id')
            })
        data = self._create_test_data('/tmp/test_primary_data_file_2222', False)
        response = self.api_client.put(url, data, format='multipart')
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(PrimaryDataFile.objects.all()))
        fname = PrimaryDataFile.objects.all().first().data_file.name
        self.assertIn('test_primary_data_file_2222', fname)

    def test_no_submission_upload(self):
        url = reverse(
            'brokerage:submissions_primary_data',
            kwargs={
                'broker_submission_id': uuid4()
            })
        data = self._create_test_data('/tmp/test_primary_data_file')
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn(b'No submission', response.content)

    def test_empty_upload(self):
        submission = Submission.objects.first()
        url = reverse(
            'brokerage:submissions_primary_data',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        response = self.api_client.post(url, {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(b'No file was submitted.', response.content)

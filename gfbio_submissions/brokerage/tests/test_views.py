# -*- coding: utf-8 -*-
import base64
import json
from urllib.parse import urlparse
from uuid import uuid4

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from config.settings.base import MEDIA_URL
from gfbio_submissions.brokerage.configuration.settings import \
    JIRA_ISSUE_URL, JIRA_ATTACHMENT_SUB_URL, JIRA_ATTACHMENT_URL
from gfbio_submissions.brokerage.models import Submission, \
    SiteConfiguration, ResourceCredential, AdditionalReference, \
    TaskProgressReport, SubmissionUpload
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.tests.utils import _get_jira_attach_response, \
    _get_jira_issue_response, _get_pangaea_comment_response
from gfbio_submissions.users.models import User


class TestSubmissionUploadView(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submissionupload'
        )
        user.user_permissions.add(*permissions)
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
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )
        submission = SubmissionTest._create_submission_via_serializer()
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        SubmissionTest._create_submission_via_serializer()

    @classmethod
    def _create_test_data(cls, path, content='test123\n', delete=True,
                          attach=False):
        if delete:
            cls._delete_test_data()
        f = open(path, 'w')
        f.write(content)
        f.close()
        f = open(path, 'rb')
        return {
            'file': f,
            'attach_to_ticket': attach,
        }

    @staticmethod
    def _delete_test_data():
        SubmissionUpload.objects.all().delete()

    @classmethod
    def _do_post_with_mocked_responses(cls,
                                       file_name='test_primary_data_file_1111',
                                       attach=False):
        site_config = SiteConfiguration.objects.first()
        submission = Submission.objects.first()
        responses.add(responses.GET,
                      '{0}/rest/api/2/field'.format(
                          site_config.helpdesk_server.url),
                      status=200)
        issue_json = _get_jira_issue_response()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/FAKE_KEY'.format(
                site_config.helpdesk_server.url),
            json=issue_json
        )
        url = reverse(
            'brokerage:submissions_upload',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        responses.add(responses.POST, url, json={}, status=200)

        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          JIRA_ISSUE_URL,
                          'SAND-1661',
                          JIRA_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)

        data = cls._create_test_data('/tmp/{0}'.format(file_name),
                                     attach=attach)

        return cls.api_client.post(url, data, format='multipart')

    def test_empty_relation(self):
        submission = Submission.objects.first()
        pd = submission.submissionupload_set.first()
        self.assertIsNone(pd)

    @responses.activate
    def test_valid_upload_no_task(self):
        submission = Submission.objects.all().first()
        site_config = SiteConfiguration.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')

        reports_len = len(TaskProgressReport.objects.all())
        uploads_len = len(SubmissionUpload.objects.all())
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn(b'broker_submission_id', response.content)
        self.assertIn(b'"id"', response.content)
        self.assertIn(b'site', response.content)
        self.assertEqual(User.objects.first().username, response.data['site'])
        self.assertIn(b'file', response.content)
        self.assertTrue(
            urlparse(response.data['file']).path.startswith(MEDIA_URL))
        # TODO: no task is triggered yet
        self.assertEqual(len(TaskProgressReport.objects.all()), reports_len)
        self.assertGreater(len(SubmissionUpload.objects.all()), uploads_len)

    def test_upload_of_multiple_files(self):
        submission = Submission.objects.all().first()
        site_config = SiteConfiguration.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)

    @responses.activate
    def test_valid_upload_with_task(self):
        submission = Submission.objects.all().first()
        site_config = SiteConfiguration.objects.first()

        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
        )

        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/FAKE_KEY'.format(
                site_config.helpdesk_server.url),
            json=_get_jira_issue_response(),
        )

        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)

        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          JIRA_ISSUE_URL,
                          'SAND-1661',
                          JIRA_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        data['attach_to_ticket'] = True

        reports_len = len(TaskProgressReport.objects.all())
        uploads_len = len(SubmissionUpload.objects.all())
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn(b'broker_submission_id', response.content)
        self.assertIn(b'"id"', response.content)
        self.assertIn(b'site', response.content)
        self.assertEqual(User.objects.first().username, response.data['site'])
        self.assertIn(b'file', response.content)
        self.assertTrue(
            urlparse(response.data['file']).path.startswith(MEDIA_URL))
        self.assertGreater(len(TaskProgressReport.objects.all()), reports_len)
        self.assertGreater(len(SubmissionUpload.objects.all()), uploads_len)

    def test_no_permission_file_upload(self):
        submission = Submission.objects.all().first()
        url = reverse(
            'brokerage:submissions_upload',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        data = self._create_test_data('/tmp/test_primary_data_file')
        response = self.other_api_client.post(url, data, format='multipart')

        self.assertEqual(403, response.status_code)

    @responses.activate
    def test_not_owner_file_upload(self):
        responses.add(responses.PUT,
                      'https://www.example.com/rest/api/2/issue/FAKE_KEY',
                      body='', status=200)
        submission = Submission.objects.first()
        submission.site = User.objects.last()
        submission.save()
        site_config = SiteConfiguration.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          JIRA_ISSUE_URL,
                          'FAKE_KEY',
                          JIRA_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        response = self.api_client.post(url, data, format='multipart')
        # FIXME: until changed, everyone with permissions can add file, even if not owner of respective submission
        self.assertEqual(201, response.status_code)

    @responses.activate
    def test_get_list_per_submission(self):
        submission = Submission.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        r = self.api_client.post(url, data, format='multipart')
        data_2 = self._create_test_data('/tmp/test_primary_data_file_2',
                                        delete=False)
        r2 = self.api_client.post(url, data_2, format='multipart')

        url = reverse('brokerage:submissions_uploads', kwargs={
            'broker_submission_id': submission.broker_submission_id})

        response = self.api_client.get(url)
        # self.assertEqual(200, response.status_code)
        content = json.loads(response.content.decode('utf-8'))
        self.assertTrue(isinstance(content, list))
        self.assertEqual(2, len(content))

    @responses.activate
    def test_list_uploads_queryset(self):
        submission = Submission.objects.first()
        submission_2 = Submission.objects.last()
        self.assertNotEqual(submission.broker_submission_id,
                            submission_2.broker_submission_id)

        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)

        url_2 = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission_2.broker_submission_id})
        responses.add(responses.POST, url_2, json={}, status=200)

        data = self._create_test_data('/tmp/test_primary_data_file')
        self.api_client.post(url, data, format='multipart')

        data_2 = self._create_test_data('/tmp/test_primary_data_file_2',
                                        delete=False)
        self.api_client.post(url_2, data_2, format='multipart')

        submission = Submission.objects.first()
        self.assertTrue(1, len(submission.submissionupload_set.all()))
        submission_2 = Submission.objects.last()
        self.assertTrue(1, len(submission_2.submissionupload_set.all()))

        url = reverse('brokerage:submissions_uploads', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        response = self.api_client.get(url)
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(1, len(content))
        self.assertIn('test_primary_data_file', content[0].get('file', ''))

        url = reverse('brokerage:submissions_uploads', kwargs={
            'broker_submission_id': submission_2.broker_submission_id})
        response = self.api_client.get(url)
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(1, len(content))
        self.assertTrue(
            content[0].get('file', '').endswith('test_primary_data_file_2'))

    @responses.activate
    def test_get_list_per_submission_content(self):
        submission = Submission.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        self.api_client.post(url, data, format='multipart')
        data_2 = self._create_test_data('/tmp/test_primary_data_file_2')
        self.api_client.post(url, data_2, format='multipart')

        url = reverse('brokerage:submissions_uploads', kwargs={
            'broker_submission_id': submission.broker_submission_id})

        response = self.api_client.get(url)
        content = json.loads(response.content.decode('utf-8'))
        self.assertTrue('file' in content[0].keys())
        self.assertTrue('file_name' in content[0].keys())
        self.assertTrue('file_size' in content[0].keys())
        self.assertTrue('meta_data' in content[0].keys())

    def test_get_list_no_submission(self):
        url = reverse('brokerage:submissions_uploads', kwargs={
            'broker_submission_id': uuid4()})
        response = self.api_client.get(url)
        self.assertEqual(200, response.status_code)
        content = json.loads(response.content.decode('utf-8'))
        self.assertTrue(isinstance(content, list))
        self.assertEqual(0, len(content))

    def test_get_detail(self):
        submission = Submission.objects.all().first()
        url = reverse(
            'brokerage:submissions_upload_detail',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': 1
            })

        response = self.api_client.get(url)
        self.assertEqual(405, response.status_code)

    @responses.activate
    def test_delete(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        responses.add(responses.GET,
                      '{0}/rest/api/2/field'.format(
                          site_config.helpdesk_server.url),
                      status=200)
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        self.api_client.post(url, data, format='multipart')
        self.assertEqual(1, len(submission.submissionupload_set.filter()))
        submission_upload = submission.submissionupload_set.first()
        submission_upload.attachment_id = 1
        submission_upload.save()
        url = '{0}{1}/{2}'.format(
            site_config.helpdesk_server.url,
            JIRA_ATTACHMENT_URL,
            submission_upload.attachment_id)
        responses.add(responses.DELETE, url, body=b'', status=204)

        url = reverse(
            'brokerage:submissions_upload_detail',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': submission.submissionupload_set.filter().first().pk
            })
        response = self.api_client.delete(url)
        self.assertEqual(204, response.status_code)
        self.assertEqual(b'', response.content)

    @responses.activate
    def test_wrong_submission_put(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = reverse(
            'brokerage:submissions_upload',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          JIRA_ISSUE_URL,
                          'FAKE_KEY',
                          JIRA_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file_11112222')
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(SubmissionUpload.objects.all()))
        fname = SubmissionUpload.objects.all().first().file.name
        self.assertIn('test_primary_data_file_11112222', fname)
        content = json.loads(response.content.decode('utf-8'))
        submission = Submission.objects.last()
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY_2',
            primary=True
        )
        url = reverse(
            'brokerage:submissions_upload_detail',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': content.get('id')
            })
        data = self._create_test_data('/tmp/test_primary_data_file_2222',
                                      delete=False)
        response = self.api_client.put(url, data, format='multipart')
        self.assertEqual(400, response.status_code)

    @responses.activate
    def test_valid_file_put_no_task(self):
        submission = Submission.objects.first()
        reports_len = len(TaskProgressReport.objects.all())
        response = self._do_post_with_mocked_responses(
            file_name='test_primary_data_file_1111')
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(SubmissionUpload.objects.all()))
        fname = SubmissionUpload.objects.all().first().file.name
        self.assertIn('test_primary_data_file_1111', fname)
        content = json.loads(response.content.decode('utf-8'))
        url = reverse(
            'brokerage:submissions_upload_detail',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': content.get('id')
            })
        data = self._create_test_data(path='/tmp/test_primary_data_file_2222',
                                      delete=False)
        response = self.api_client.put(url, data, format='multipart')
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(SubmissionUpload.objects.all()))
        fname = SubmissionUpload.objects.all().first().file.name
        self.assertIn('test_primary_data_file_2222', fname)
        self.assertEqual(len(TaskProgressReport.objects.all()), reports_len)

    @responses.activate
    def test_valid_file_put_with_task(self):
        submission = Submission.objects.first()
        reports_len = len(TaskProgressReport.objects.all())

        response = self._do_post_with_mocked_responses(
            file_name='test_primary_data_file_1111')
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(SubmissionUpload.objects.all()))
        fname = SubmissionUpload.objects.all().first().file.name
        self.assertIn('test_primary_data_file_1111', fname)
        self.assertEqual(len(TaskProgressReport.objects.all()), reports_len)

        content = json.loads(response.content.decode('utf-8'))
        url = reverse(
            'brokerage:submissions_upload_detail',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': content.get('id')
            })
        data = self._create_test_data('/tmp/test_primary_data_file_2222',
                                      delete=False)
        data['attach_to_ticket'] = True
        response = self.api_client.put(url, data, format='multipart')

        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(SubmissionUpload.objects.all()))
        fname = SubmissionUpload.objects.all().first().file.name
        self.assertIn('test_primary_data_file_2222', fname)
        self.assertGreater(len(TaskProgressReport.objects.all()), reports_len)

    @responses.activate
    def test_file_put_same_content_with_task(self):
        submission = Submission.objects.first()
        response = self._do_post_with_mocked_responses(
            file_name='test_primary_data_file_1111', attach=True)

        self.assertEqual(1, len(submission.submissionupload_set.all()))
        submission_upload = submission.submissionupload_set.first()
        checksum = submission_upload.md5_checksum

        content = json.loads(response.content.decode('utf-8'))
        url = reverse(
            'brokerage:submissions_upload_detail',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': content.get('id')
            })
        data = self._create_test_data('/tmp/test_primary_data_file_1111',
                                      delete=False, attach=True)

        response = self.api_client.put(url, data, format='multipart')

        self.assertEqual(1, len(submission.submissionupload_set.all()))
        submission_upload = submission.submissionupload_set.first()
        self.assertEqual(checksum, submission_upload.md5_checksum)
        self.assertFalse(submission_upload.modified_recently)

        task_reports = TaskProgressReport.objects.all().order_by('created')
        self.assertEqual(2, len(task_reports))
        self.assertTrue(task_reports.first().task_return_value)
        self.assertEqual(TaskProgressReport.CANCELLED,
                         task_reports.last().task_return_value)

    @responses.activate
    def test_file_put_modified_content_with_task(self):
        submission = Submission.objects.first()
        response = self._do_post_with_mocked_responses(
            file_name='test_primary_data_file_1111', attach=True)

        self.assertEqual(1, len(submission.submissionupload_set.all()))
        submission_upload = submission.submissionupload_set.first()
        checksum = submission_upload.md5_checksum

        content = json.loads(response.content.decode('utf-8'))
        url = reverse(
            'brokerage:submissions_upload_detail',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': content.get('id')
            })
        data = self._create_test_data('/tmp/test_primary_data_file_1111',
                                      delete=False, attach=True,
                                      content='different\n')

        response = self.api_client.put(url, data, format='multipart')

        self.assertEqual(1, len(submission.submissionupload_set.all()))
        submission_upload = submission.submissionupload_set.first()
        self.assertNotEqual(checksum, submission_upload.md5_checksum)
        self.assertFalse(submission_upload.modified_recently)

        task_reports = TaskProgressReport.objects.all().order_by('created')
        self.assertEqual(2, len(task_reports))
        self.assertTrue(task_reports.first().task_return_value)
        self.assertTrue(task_reports.last().task_return_value)
        # self.assertEqual(TaskProgressReport.CANCELLED,
        #                  task_reports.last().task_return_value)

    def test_no_submission_upload(self):
        url = reverse(
            'brokerage:submissions_upload',
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
            'brokerage:submissions_upload',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        response = self.api_client.post(url, {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(b'No file was submitted.', response.content)

    @responses.activate
    def test_valid_file_patch_no_task(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = reverse(
            'brokerage:submissions_upload',
            kwargs={
                'broker_submission_id': submission.broker_submission_id
            })
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          JIRA_ISSUE_URL,
                          'FAKE_KEY',
                          JIRA_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file_1111')
        response = self.api_client.post(url, data, format='multipart')
        content = json.loads(response.content.decode('utf-8'))
        self.assertFalse(SubmissionUpload.objects.first().meta_data)

        url = reverse(
            'brokerage:submissions_upload_patch',
            kwargs={
                'broker_submission_id': submission.broker_submission_id,
                'pk': content.get('id')
            })
        response = self.api_client.patch(url, {'meta_data': True})
        self.assertEqual(200, response.status_code)
        self.assertTrue(SubmissionUpload.objects.first().meta_data)


class TestSubmissionCommentView(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submission'
        )
        user.user_permissions.add(*permissions)
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        cls.api_client = client

        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )

        cls.site_config = SiteConfiguration.objects.create(
            title='default',
            release_submissions=False,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )
        submission = SubmissionTest._create_submission_via_serializer()
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='SAND-1661',
            primary=True
        )
        SubmissionTest._create_submission_via_serializer()

    def test_get(self):
        submission = Submission.objects.first()
        response = self.api_client.get('/api/submissions/{0}/comment/'.format(
            submission.broker_submission_id))
        self.assertEqual(405, response.status_code)

    @responses.activate
    def test_valid_post(self):
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(self.site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            '{0}/rest/api/2/issue/SAND-1661/comment'.format(
                self.site_config.helpdesk_server.url),
            json=_get_pangaea_comment_response(),
            status=200)
        submission = Submission.objects.first()
        response = self.api_client.post(
            '/api/submissions/{0}/comment/'.format(
                submission.broker_submission_id), {'comment': 'a comment'})
        self.assertEqual(201, response.status_code)
        self.assertDictEqual({'comment': 'a comment'},
                             json.loads(response.content))

    def test_invalid_credentials_post(self):
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:wrong').decode('utf-8')
        )
        submission = Submission.objects.first()
        response = client.post(
            '/api/submissions/{0}/comment/'.format(
                submission.broker_submission_id), {'comment': 'a comment'})
        self.assertEqual(401, response.status_code)

    def test_empty_post(self):
        submission = Submission.objects.first()
        response = self.api_client.post(
            '/api/submissions/{0}/comment/'.format(
                submission.broker_submission_id), {})
        self.assertEqual(400, response.status_code)
        self.assertIn('comment', json.loads(response.content).keys())

    def test_post_unknown_broker_submission_id(self):
        response = self.api_client.post(
            '/api/submissions/{0}/comment/'.format(uuid4()),
            {'comment': 'a comment'})
        self.assertEqual(404, response.status_code)
        self.assertIn('submission', json.loads(response.content).keys())

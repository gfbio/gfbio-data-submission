# -*- coding: utf-8 -*-
import base64
import datetime
import json
import os
import urllib
from pprint import pprint
from urllib.parse import urlencode
from uuid import UUID, uuid4

import responses
from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIRequestFactory, APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL, GENERIC, ENA
from gfbio_submissions.brokerage.models import Submission, RequestLog, \
    SiteConfiguration, ResourceCredential, TaskProgressReport, SubmissionUpload
from gfbio_submissions.brokerage.tests.utils import \
    _get_submission_request_data, _get_submission_post_response, \
    _get_test_data_dir_path
from gfbio_submissions.users.models import User


class TestSubmissionView(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submission')
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password',
            is_site=True)
        user.user_permissions.add(*cls.permissions)

        upload_permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submissionupload'
        )
        user.user_permissions.add(*upload_permissions)

        user = User.objects.create_user(
            username='kevin', email='kevin@kevin.de', password='secret',
            is_staff=True, is_site=True)
        user.user_permissions.add(*cls.permissions)

        regular_user = User.objects.create_user(
            username='regular_user', email='re@gu.la', password='secret',
            is_staff=False, is_site=False, is_user=True)
        regular_user.user_permissions.add(*cls.permissions)

        regular_user = User.objects.create_user(
            username='regular_user_2', email='re2@gu.la', password='secret',
            is_staff=False, is_site=False, is_user=True)
        regular_user.user_permissions.add(*cls.permissions)

        User.objects.create_superuser(
            username='admin', email='admin@admin.de', password='psst')
        cls.factory = APIRequestFactory()
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
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:password').decode('utf-8')
        )
        cls.api_client = client
        other_client = APIClient()
        other_client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'kevin:secret').decode('utf-8')
        )
        cls.other_api_client = other_client

    def _add_create_ticket_response(self):
        responses.add(
            responses.POST,
            '{0}{1}'.format(
                self.site_config.helpdesk_server.url,
                HELPDESK_API_SUB_URL
            ),
            status=200,
            body=json.dumps({'mocked_response': True})
        )

    def _add_update_ticket_response(self):
        url = '{0}{1}/{2}'.format(
            self.site_config.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'no_key_available'
        )
        responses.add(responses.PUT, url, body='', status=204)

    def _post_submission(self):
        return self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': False, 'data': {
                'requirements': {
                    'title': 'A Title',
                    'description': 'A Description'}}},
            format='json'
        )

    def _post_submission_with_submitting_user(self, submitting_user='69'):
        return self.api_client.post(
            '/api/submissions/',
            {
                'target': 'ENA',
                'release': False,
                'submitting_user': '{}'.format(submitting_user),
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            },
            format='json'
        )

    @classmethod
    def _create_test_meta_data(cls, delete=True):
        if delete:
            cls._delete_test_data()
        csv_file = open(
            os.path.join(_get_test_data_dir_path(), 'molecular_metadata.csv'),
            'rb'
        )
        return {
            'file': csv_file,
            'meta_data': True,
        }

    @staticmethod
    def _delete_test_data():
        SubmissionUpload.objects.all().delete()


class TestSubmissionViewSimple(TestSubmissionView):

    def test_submissions_get_request(self):
        response = self.client.get('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_empty_min_post(self):
        response = self.api_client.post('/api/submissions/', {}, format='json')
        self.assertEqual(400, response.status_code)
        self.assertEqual(0, len(Submission.objects.all()))

    def test_empty_min_post_errors(self):
        response = self.api_client.post('/api/submissions/', {}, format='json')
        keys = json.loads(response.content.decode('utf-8')).keys()
        self.assertIn('target', keys)
        self.assertIn('data', keys)

    @responses.activate
    def test_post_on_submission_detail_view(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        response = self.api_client.post(
            '/api/submissions/{}/'.format(submission.pk),
            {'target': 'ENA', 'data': {'requirements': {
                'title': 'A Title 0815', 'description': 'A Description 2'}}},
            format='json'
        )
        self.assertEqual(405, response.status_code)

    @responses.activate
    def test_delete_submission(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        response = self.api_client.delete(
            '/api/submissions/{0}/'.format(submission.broker_submission_id))
        self.assertEqual(204, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        self.assertEqual(Submission.CANCELLED, submission.status)

    @responses.activate
    def test_patch_submission(self):
        self._add_create_ticket_response()
        self._post_submission()
        response = self.api_client.patch(
            '/api/submissions/{0}/'.format(Submission.objects.first().id),
            {'target': 'ENA_PANGAEA'},
            format='json'
        )
        self.assertEqual(405, response.status_code)


class TestSubmissionViewMinimumPosts(TestSubmissionView):

    def test_invalid_min_post(self):
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post('/api/submissions/',
                                        {'target': 'ENA', 'data': {}},
                                        format='json'
                                        )
        self.assertEqual(400, response.status_code)
        keys = json.loads(response.content.decode('utf-8')).keys()
        self.assertIn('optional_validation', keys)
        self.assertIn('data', keys)
        self.assertEqual(0, len(Submission.objects.all()))

    def test_schema_error_min_post(self):
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post('/api/submissions/',
                                        {'target': 'ENA',
                                         'data': {'requirements': {}}},
                                        format='json'
                                        )
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(400, response.status_code)
        self.assertIn('data', content.keys())
        self.assertListEqual(
            ["requirements : 'title' is a required property",
             "requirements : 'description' is a required property"],
            content['data'])
        self.assertEqual(0, len(Submission.objects.all()))

    @responses.activate
    def test_valid_min_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'data': {'requirements': {
                'title': 'A Title',
                'description': 'A Description'}}},
            format='json'
        )
        content = json.loads(response.content.decode('utf-8'))
        expected = {
            'broker_submission_id': content['broker_submission_id'],
            'data': {'optional_validation': [
                "requirements : 'study_type' is a required property",
                "requirements : 'samples' is a required property",
                "requirements : 'experiments' is a required property"],
                'requirements': {'description': 'A Description',
                                 'title': 'A Title'}},
            # 'embargo': '{0}'.format(
            #     datetime.date.today() + datetime.timedelta(days=365)),
            # TODO: better defaults in model
            'embargo': None,
            'download_url': '',
            'release': False,
            'site': 'horst',
            'site_project_id': '',
            'status': 'OPEN',
            'submitting_user': '',
            'target': 'ENA'
        }
        self.assertEqual(201, response.status_code)
        self.assertDictEqual(expected, content)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.last()

        pprint(submission.data)

        self.assertEqual(UUID(content['broker_submission_id']),
                         submission.broker_submission_id)
        # self.assertIsNotNone(submission.embargo)
        self.assertIsNone(submission.embargo)
        self.assertFalse(submission.release)
        self.assertEqual(0, len(submission.site_project_id))
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(0, len(submission.submitting_user))
        # self.assertEqual(0,
        #                  len(submission.submitting_user_common_information))
        site_config = SiteConfiguration.objects.first()
        self.assertIn(site_config.contact,
                      submission.submitting_user_common_information)
        self.assertEqual('ENA', submission.target)
        request_logs = RequestLog.objects.filter(type=RequestLog.INCOMING)
        self.assertEqual(1, len(request_logs))

    @responses.activate
    def test_valid_explicit_min_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        response = self._post_submission()
        content = json.loads(response.content.decode('utf-8'))
        expected = {
            'broker_submission_id': content['broker_submission_id'],
            'data': {'optional_validation': [
                u"requirements : 'study_type' is a required property",
                u"requirements : 'samples' is a required property",
                u"requirements : 'experiments' is a required property"],
                'requirements': {'description': 'A Description',
                                 'title': 'A Title'}},
            # 'embargo': '{0}'.format(
            #     datetime.date.today() + datetime.timedelta(days=365)),
            # TODO: better defaults in model
            'embargo': None,
            'download_url': '',
            'release': False,
            'site': 'horst',
            'site_project_id': '',
            'status': 'OPEN',
            'submitting_user': '',
            'target': 'ENA'}
        self.assertEqual(201, response.status_code)
        self.assertDictEqual(expected, content)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.last()
        self.assertEqual(UUID(expected['broker_submission_id']),
                         submission.broker_submission_id)

    @responses.activate
    def test_min_post_without_target(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post(
            '/api/submissions/',
            {'release': False, 'target': 'nonsense', 'data': {
                'requirements': {
                    'title': 'A Title',
                    'description': 'A Description'}}},
            format='json'
        )
        self.assertEqual(400, response.status_code)
        self.assertIn(b'target', response.content)
        self.assertEqual(0, len(Submission.objects.all()))


class TestSubmissionViewFullPosts(TestSubmissionView):

    @responses.activate
    def test_empty_max_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': True, 'data': {
                'requirements': {
                    'title': 'A Title',
                    'description': 'A Description'}}},
            format='json'
        )
        self.assertEqual(400, response.status_code)
        self.assertNotIn(b'study_alias', response.content)
        self.assertIn(b'study_type', response.content)
        self.assertIn(b'samples', response.content)
        self.assertIn(b'experiments', response.content)
        self.assertEqual(0, len(Submission.objects.all()))

    # FIXME: in unit tests: "id": "file:///opt/project/staticfiles/schemas/minimal_requirements.json",
    # FIXME: when running docker-compose with dev.yml
    # FIXME: id to /app/staticfiles/schemas/ena_requirements.json
    # FIXME: since id determins root for looking up included files
    @responses.activate
    def test_valid_max_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': True,
             'data': _get_submission_request_data()},
            format='json'
        )
        self.assertEqual(201, response.status_code)
        content = json.loads(response.content.decode('utf-8'))
        expected = _get_submission_post_response()
        # expected['embargo'] = '{0}'.format(
        #     datetime.date.today() + datetime.timedelta(days=365))
        expected['broker_submission_id'] = content['broker_submission_id']
        self.assertDictEqual(expected, content)
        self.assertNotIn('download_url', content['data']['requirements'].keys())
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        self.assertEqual(UUID(expected['broker_submission_id']),
                         submission.broker_submission_id)
        self.assertEqual(Submission.SUBMITTED,
                         content.get('status', 'NOPE'))
        self.assertEqual('', submission.download_url)

    @responses.activate
    def test_valid_max_post_target_generic(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        # since no generic field is mandatory
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'GENERIC', 'release': True,
             'data': {
                 'requirements': {
                     'title': 'A Title',
                     'description': 'A Description'}}},
            format='json'
        )
        self.assertEqual(201, response.status_code)
        content = json.loads(response.content.decode('utf-8'))
        # expected = _get_submission_post_response()
        # expected['embargo'] = '{0}'.format(
        #     datetime.date.today() + datetime.timedelta(days=365))
        # expected['broker_submission_id'] = content['broker_submission_id']
        # self.assertDictEqual(expected, content)
        # self.assertNotIn('download_url', content['data']['requirements'].keys())
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        # self.assertEqual(UUID(expected['broker_submission_id']),
        #                  submission.broker_submission_id)
        self.assertEqual(Submission.SUBMITTED,
                         content.get('status', 'NOPE'))
        self.assertEqual('', submission.download_url)

    # TODO: move to dedicatet test class
    @responses.activate
    def test_valid_generic_post_with_molecular_meta_data(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        response = self.api_client.post(
            '/api/submissions/',
            {
                'target': 'GENERIC', 'release': False,
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        self.assertEqual(GENERIC, submission.target)

        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        data = self._create_test_meta_data()
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(submission.submissionupload_set.all()))
        self.assertTrue(submission.submissionupload_set.first().meta_data)

        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {
                'target': 'GENERIC', 'release': True,
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        self.assertEqual(200, response.status_code)
        expected_task_names = [
            'tasks.trigger_submission_transfer',
            'tasks.get_user_email_task',
            'tasks.create_helpdesk_ticket_task',
            'tasks.update_helpdesk_ticket_task',
            'tasks.trigger_submission_transfer_for_updates',
            'tasks.check_on_hold_status_task',
            'tasks.create_broker_objects_from_submission_data_task',
            'tasks.prepare_ena_submission_data_task',
        ]
        all_task_reports = list(
            TaskProgressReport.objects.values_list(
                'task_name', flat=True).order_by('created')
        )
        self.assertListEqual(expected_task_names, all_task_reports)
        i = 0
        for a in all_task_reports:
            i += 1
            print(i, ') ', a)

            # submission = Submission.objects.all().first()
            # submission.target = GENERIC
            # submission.data = {
            #     'requirements': {
            #         'title': 'A Title',
            #         'description': 'A Description',
            #         'data_center': 'ENA – European Nucleotide Archive'}
            # }
            # submission.save(allow_update=False)
            #
            # url = reverse('brokerage:submissions_upload', kwargs={
            #     'broker_submission_id': submission.broker_submission_id})
            # responses.add(responses.POST, url, json={}, status=200)
            # data = self._create_test_data('/tmp/test_primary_data_file')
            # data['meta_data'] = True
            # response = self.api_client.post(url, data, format='multipart')
            #
            # # expected state of submission with on (meta_data) file
            # self.assertEqual(GENERIC, submission.target)
            # self.assertTrue(submission.release)
            # self.assertIn('data_center',
            #               submission.data.get('requirements', {}).keys())
            # self.assertIn('ENA',
            #               submission.data.get('requirements', {}).get(
            #                   'data_center',
            #                   ''))
            # print(submission.submissionupload_set.all())
            # self.assertEqual(1, len(submission.submissionupload_set.all()))
            # upload = submission.submissionupload_set.first()
            # self.assertTrue(upload.meta_data)
            # print('\n##############################\n')
            #
            # res = check_for_molecular_content(submission)
            # print('RES OF CHECK ', res)

            # content = json.loads(response.content.decode('utf-8'))
            # pprint(content)

            # self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            # self.assertIn(b'broker_submission_id', response.content)
            # self.assertIn(b'"id"', response.content)
            # self.assertIn(b'site', response.content)
            # self.assertEqual(User.objects.first().username, response.data['site'])
            # self.assertIn(b'file', response.content)
            # self.assertTrue(
            #     urlparse(response.data['file']).path.startswith(MEDIA_URL))
            # # TODO: no task is triggered yet
            # self.assertEqual(len(TaskProgressReport.objects.all()), reports_len)
            # self.assertGreater(len(SubmissionUpload.objects.all()), uploads_len)

        @responses.activate
        def test_valid_max_post_with_data_url(self):
            self._add_create_ticket_response()
            self.assertEqual(0, len(Submission.objects.all()))
            url = 'https://www.google.de'
            response = self.api_client.post(
                '/api/submissions/',
                {'target': 'ENA', 'release': True,
                 'data': _get_submission_request_data(),
                 'download_url': url},
                format='json'
            )
            self.assertEqual(201, response.status_code)
            self.assertEqual(1, len(Submission.objects.all()))
            submission = Submission.objects.first()
            self.assertEqual(url, submission.download_url)

            # FIXME: Why extra PUT in this POST test ? Regression Test ?
            # response = self.client.put(
            #     '/api/submissions/{0}/'.format(
            #         sub.broker_submission_id),
            #     content_type='application/json',
            #     data=json.dumps({
            #         'target': 'ENA',
            #         'data': new_data_copy,
            #         'download_url': '{0}/{1}'.format(url, 'download'),
            #     }), **VALID_USER)
            # self.assertEqual(200, response.status_code)
            # self.assertEqual(7, len(Submission.objects.all()))
            # sub = Submission.objects.last()
            # self.assertEqual('{0}/{1}'.format(url, 'download'),
            #                  sub.download_url)

        # TODO: test valid max post with embargo value in data

        def test_valid_max_post_with_invalid_min_data(self):
            self.assertEqual(0, len(Submission.objects.all()))
            data = _get_submission_request_data()
            data['requirements'].pop('description')
            response = self.api_client.post(
                '/api/submissions/',
                {'target': 'ENA', 'release': True, 'data': data},
                format='json'
            )
            self.assertEqual(400, response.status_code)
            self.assertIn('description', response.content.decode('utf-8'))
            self.assertEqual(0, len(Submission.objects.all()))

    class TestSubmissionViewDataCenterCheck(TestSubmissionView):

        @responses.activate
        def test_ena_datacenter_no_files(self):
            self._add_create_ticket_response()
            response = self.api_client.post(
                '/api/submissions/',
                {'target': 'GENERIC', 'release': True,
                 'data': {
                     'requirements': {
                         'title': 'A Title',
                         'description': 'A Description',
                         'data_center': 'ENA – European Nucleotide Archive'}}},
                format='json'
            )
            self.assertEqual(201, response.status_code)
            submission = Submission.objects.first()
            self.assertEqual(GENERIC, submission.target)
            expected_tasks = ['tasks.trigger_submission_transfer',
                              'tasks.get_user_email_task',
                              'tasks.create_helpdesk_ticket_task',
                              'tasks.check_on_hold_status_task']
            for t in TaskProgressReport.objects.filter(
                    submission=submission).order_by('created'):
                self.assertIn(t.task_name, expected_tasks)

        @responses.activate
        def test_ena_datacenter_with_suitable_file_after_put(self):
            self._add_create_ticket_response()
            self._add_update_ticket_response()
            response = self.api_client.post(
                '/api/submissions/',
                {'target': 'GENERIC', 'release': False,
                 'data': {
                     'requirements': {
                         'title': 'A Title',
                         'description': 'A Description',
                         'data_center': 'ENA – European Nucleotide Archive'}}},
                format='json'
            )
            self.assertEqual(201, response.status_code)
            submission = Submission.objects.first()
            self.assertEqual(GENERIC, submission.target)
            with open(os.path.join(_get_test_data_dir_path(),
                                   'molecular_metadata.csv'), 'rb') as csv_file:
                uploaded_file = SimpleUploadedFile(
                    name='molecular.csv',
                    content_type='text/csv',
                    content=csv_file.read()
                )

            submission.submissionupload_set.create(
                submission=submission,
                site=User.objects.first(),
                user=User.objects.first(),
                meta_data=True,
                file=uploaded_file,
            )
            self.assertEqual(1, len(
                submission.submissionupload_set.filter(meta_data=True)))
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'GENERIC', 'release': True,
                 'data': {
                     'requirements': {
                         'title': 'A Title',
                         'description': 'A Description',
                         'data_center': 'ENA – European Nucleotide Archive'}}},
                format='json'
            )
            self.assertEqual(200, response.status_code)
            submission = Submission.objects.first()
            self.assertEqual(ENA, submission.target)
            expected_tasks = ['tasks.trigger_submission_transfer',
                              'tasks.check_on_hold_status_task',
                              'tasks.get_user_email_task',
                              'tasks.create_helpdesk_ticket_task',
                              'tasks.update_helpdesk_ticket_task',  # x2
                              'tasks.trigger_submission_transfer_for_updates',
                              'tasks.create_broker_objects_from_submission_data_task',
                              'tasks.prepare_ena_submission_data_task']
            for t in TaskProgressReport.objects.filter(
                    submission=submission).order_by('created'):
                self.assertIn(t.task_name, expected_tasks)

        @responses.activate
        def test_ena_datacenter_with_unsuitable_file_after_put(self):
            self._add_create_ticket_response()
            self._add_update_ticket_response()
            response = self.api_client.post(
                '/api/submissions/',
                {'target': 'GENERIC', 'release': False,
                 'data': {
                     'requirements': {
                         'title': 'A Title',
                         'description': 'A Description',
                         'data_center': 'ENA – European Nucleotide Archive'}}},
                format='json'
            )
            self.assertEqual(201, response.status_code)
            submission = Submission.objects.first()
            self.assertEqual(GENERIC, submission.target)
            with open(os.path.join(_get_test_data_dir_path(),
                                   'ena_data.json'), 'rb') as csv_file:
                uploaded_file = SimpleUploadedFile(
                    name='molecular.csv',
                    content_type='text/json',
                    content=csv_file.read()
                )

            submission.submissionupload_set.create(
                submission=submission,
                site=User.objects.first(),
                user=User.objects.first(),
                meta_data=True,
                file=uploaded_file,
            )
            self.assertEqual(1, len(
                submission.submissionupload_set.filter(meta_data=True)))
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'GENERIC', 'release': True,
                 'data': {
                     'requirements': {
                         'title': 'A Title',
                         'description': 'A Description',
                         'data_center': 'ENA – European Nucleotide Archive'}}},
                format='json'
            )
            self.assertEqual(200, response.status_code)
            submission = Submission.objects.first()
            self.assertEqual(ENA, submission.target)
            expected_tasks = ['tasks.trigger_submission_transfer',
                              'tasks.get_user_email_task',
                              'tasks.create_helpdesk_ticket_task',
                              'tasks.update_helpdesk_ticket_task',
                              'tasks.trigger_submission_transfer_for_updates',
                              'tasks.check_on_hold_status_task'
                              ]
            for t in TaskProgressReport.objects.filter(
                    submission=submission).order_by('created'):
                print(t.task_name, ' ', t.created)
                self.assertIn(t.task_name, expected_tasks)

        @responses.activate
        def test_ena_datacenter_with_binary_file_after_put(self):
            self._add_create_ticket_response()
            self._add_update_ticket_response()
            response = self.api_client.post(
                '/api/submissions/',
                {'target': 'GENERIC', 'release': False,
                 'data': {
                     'requirements': {
                         'title': 'A Title',
                         'description': 'A Description',
                         'data_center': 'ENA – European Nucleotide Archive'}}},
                format='json'
            )
            self.assertEqual(201, response.status_code)
            submission = Submission.objects.first()
            self.assertEqual(GENERIC, submission.target)

            submission.submissionupload_set.create(
                submission=submission,
                site=User.objects.first(),
                user=User.objects.first(),
                meta_data=True,
                file=SimpleUploadedFile('test.png', b'\x00\x01\x02\x03'),
            )
            self.assertEqual(1, len(
                submission.submissionupload_set.filter(meta_data=True)))
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'GENERIC', 'release': True,
                 'data': {
                     'requirements': {
                         'title': 'A Title',
                         'description': 'A Description',
                         'data_center': 'ENA – European Nucleotide Archive'}}},
                format='json'
            )
            self.assertEqual(200, response.status_code)
            submission = Submission.objects.first()
            self.assertEqual(ENA, submission.target)
            expected_tasks = ['tasks.trigger_submission_transfer',
                              'tasks.get_user_email_task',
                              'tasks.create_helpdesk_ticket_task',
                              'tasks.update_helpdesk_ticket_task',
                              'tasks.trigger_submission_transfer_for_updates',
                              'tasks.check_on_hold_status_task'
                              ]
            for t in TaskProgressReport.objects.filter(
                    submission=submission).order_by('created'):
                print(t.task_name, ' ', t.created)
                self.assertIn(t.task_name, expected_tasks)

    # FIXME: duplicate of below ?
    class TestSubmissionViewGetRequest(TestSubmissionView):

        @responses.activate
        def test_get_submissions(self):
            self._add_create_ticket_response()
            self._post_submission()
            response = self.api_client.get('/api/submissions/')
            content = json.loads(response.content.decode('utf-8'))
            self.assertEqual(200, response.status_code)
            self.assertEqual(1, len(Submission.objects.all()))
            self.assertEqual(1, len(content))

        # TODO: note that 'site' has access to ALL submission created with
        #  its credentials
        @responses.activate
        def test_get_submissions_for_site_user(self):
            self._add_create_ticket_response()
            self._post_submission()
            self.other_api_client.post(
                '/api/submissions/',
                {'target': 'ENA', 'release': False, 'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'}}},
                format='json'
            )
            self.assertEqual(2, len(Submission.objects.all()))
            response = self.api_client.get('/api/submissions/')
            content = json.loads(response.content.decode('utf-8'))
            self.assertEqual(1, len(content))

        @responses.activate
        def test_get_submission(self):
            self._add_create_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            response = self.api_client.get(
                '/api/submissions/{0}/'.format(submission.broker_submission_id))
            content = json.loads(response.content.decode('utf-8'))
            self.assertEqual(200, response.status_code)
            self.assertTrue(isinstance(content, dict))
            self.assertEqual('horst', content['site'])

        @responses.activate
        def test_no_submission_for_id(self):
            self._add_create_ticket_response()
            self._post_submission()
            response = self.api_client.get(
                '/api/submissions/{0}/'.format(uuid4()))
            self.assertEqual(404, response.status_code)

    # FIXME: duplicate of above ?
    class TestUserSubmissionViewGetRequests(TestSubmissionView):

        @responses.activate
        def _prepare_submissions_for_various_users(self):
            self._add_create_ticket_response()
            regular_user = User.objects.get(username='regular_user')
            self._post_submission_with_submitting_user(regular_user.id)
            self._post_submission_with_submitting_user(regular_user.id)
            regular_user_2 = User.objects.get(username='regular_user_2')
            self._post_submission_with_submitting_user(regular_user_2.id)
            self._post_submission()
            # 1 - horst - no submitting_user
            # 2 - reg. - reg
            # 1 - reg2 -reg2
            # total 4

        @responses.activate
        def test_get_submissions(self):
            self._add_create_ticket_response()
            regular_user = User.objects.get(username='regular_user')
            self._post_submission_with_submitting_user(regular_user.id)
            response = self.api_client.get(
                '/api/submissions/user/{0}/'.format(regular_user.id))
            self.assertEqual(200, response.status_code)
            submissions = json.loads(response.content.decode('utf-8'))
            self.assertEqual(1, len(submissions))
            self.assertEqual('{0}'.format(regular_user.id),
                             submissions[0].get('submitting_user', 'xxx'))

        @responses.activate
        def test_get_submissions_with_email_id(self):
            self._add_create_ticket_response()
            regular_user = User.objects.get(username='regular_user')
            self._post_submission_with_submitting_user(regular_user.email)
            response = self.api_client.get(
                '/api/submissions/user/{0}/'.format(regular_user.email))
            self.assertEqual(200, response.status_code)
            submissions = json.loads(response.content.decode('utf-8'))
            self.assertEqual(1, len(submissions))
            self.assertEqual('{0}'.format(regular_user.email),
                             submissions[0].get('submitting_user', 'xxx'))

        @responses.activate
        def test_get_submissions_unknown_userid(self):
            self._add_create_ticket_response()
            regular_user = User.objects.get(username='regular_user')
            self._post_submission_with_submitting_user(regular_user.id)
            self._post_submission_with_submitting_user(regular_user.id)
            response = self.api_client.get('/api/submissions/user/69/')
            self.assertEqual(200, response.status_code)
            submissions = json.loads(response.content.decode('utf-8'))
            self.assertEqual(0, len(submissions))

        def test_get_submissions_various_user_ids(self):
            self._prepare_submissions_for_various_users()
            self.assertEqual(4, len(Submission.objects.all()))

            regular_user = User.objects.get(username='regular_user')
            regular_user_2 = User.objects.get(username='regular_user_2')
            horst = User.objects.get(username='horst')

            response = self.api_client.get(
                '/api/submissions/user/{0}/'.format(regular_user.id))
            submissions = json.loads(response.content.decode('utf-8'))
            self.assertEqual(2, len(submissions))

            response = self.api_client.get(
                '/api/submissions/user/{0}/'.format(regular_user_2.id))
            submissions = json.loads(response.content.decode('utf-8'))
            self.assertEqual(1, len(submissions))

            response = self.api_client.get(
                '/api/submissions/user/{0}/'.format(horst.id))
            submissions = json.loads(response.content.decode('utf-8'))
            self.assertEqual(200, response.status_code)
            self.assertEqual(0, len(submissions))

        @responses.activate
        def test_get_submissions_with_special_characters_id(self):
            self._add_create_ticket_response()
            user_identifier = '?=§$%@@!"\'!&//()ß´`^°#~,مليسيا'
            self._post_submission_with_submitting_user(user_identifier)
            submission = Submission.objects.first()
            self.assertEqual(user_identifier, submission.submitting_user)
            # quote before using such a string in an url
            quoted = urllib.parse.quote(user_identifier)
            response = self.api_client.get(
                '/api/submissions/user/{0}/'.format(quoted))
            self.assertEqual(200, response.status_code)
            submissions = json.loads(response.content.decode('utf-8'))
            self.assertEqual(1, len(submissions))
            self.assertEqual('{0}'.format(user_identifier),
                             submissions[0].get('submitting_user', 'xxx'))

        def test_get_no_submissions_for_user(self):
            response = self.api_client.get(
                '/api/submissions/user/69/')
            self.assertEqual(200, response.status_code)
            submissions = json.loads(response.content.decode('utf-8'))
            self.assertListEqual(submissions, [])

        def test_get_no_parameter(self):
            response = self.api_client.get(
                '/api/submissions/user/')
            self.assertEqual(404, response.status_code)

        @responses.activate
        def test_get_submissions_no_credentials(self):
            self._add_create_ticket_response()
            regular_user = User.objects.get(username='regular_user')
            self._post_submission_with_submitting_user(regular_user.id)
            response = self.client.get(
                '/api/submissions/user/{0}/'.format(regular_user.id))
            self.assertEqual(401, response.status_code)

        @responses.activate
        def test_get_submissions_content(self):
            self._add_create_ticket_response()
            regular_user = User.objects.get(username='regular_user')
            self._post_submission_with_submitting_user(regular_user.id)
            self._post_submission_with_submitting_user(regular_user.id)
            response = self.api_client.get(
                '/api/submissions/user/{0}/'.format(regular_user.id))
            self.assertEqual(200, response.status_code)
            submissions = json.loads(response.content.decode('utf-8'))
            self.assertIsInstance(submissions, list)
            self.assertEqual(2, len(submissions))
            self.assertIsInstance(submissions[0], dict)

    class TestSubmissionViewPutRequests(TestSubmissionView):

        @responses.activate
        def test_put_submission(self):
            self._add_create_ticket_response()
            self._add_update_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'data': {
                    'requirements': {
                        'title': 'A Title 0815',
                        'description': 'A Description 2'}}},
                format='json'
            )
            content = json.loads(response.content.decode('utf-8'))
            self.assertEqual(200, response.status_code)
            self.assertTrue(isinstance(content, dict))
            self.assertIn('0815', content['data']['requirements']['title'])
            self.assertEqual(1, len(Submission.objects.all()))

        @responses.activate
        def test_put_submission_with_ticket_update(self):
            self._add_create_ticket_response()
            self._post_submission()
            ticket_key = 'FAKE-101'
            site_config = SiteConfiguration.objects.first()
            url = '{0}{1}/{2}'.format(
                site_config.helpdesk_server.url,
                HELPDESK_API_SUB_URL,
                ticket_key
            )
            responses.add(responses.PUT, url, body='', status=204)
            submission = Submission.objects.first()

            primary_ref = submission.additionalreference_set.first()

            self.assertTrue(primary_ref.primary)
            primary_ref.reference_key = ticket_key
            primary_ref.save()
            submission.embargo = datetime.date.today() + datetime.timedelta(
                days=365)
            submission.save()
            update_tasks = TaskProgressReport.objects.filter(
                task_name='tasks.update_helpdesk_ticket_task')
            print(update_tasks)
            self.assertEqual(1, len(update_tasks))

        @responses.activate
        def test_putpost_submission(self):
            self._add_create_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            response = self.api_client.post(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'data': {
                    'requirements': {
                        'title': 'A Title 0815',
                        'description': 'A Description 2'}}},
                format='json'
            )
            self.assertEqual(405, response.status_code)
            self.assertEqual('{"detail":"Method \\"POST\\" not allowed."}',
                             response.content.decode('utf-8'))

        @responses.activate
        def test_put_submission_min_validation(self):
            self._add_create_ticket_response()
            self._add_update_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'data': {'requirements': {
                    'title': 'A Title 0815',
                    'description': 'A Description 2'}}},
                format='json'
            )
            content = json.loads(response.content.decode('utf-8'))
            submission = Submission.objects.first()
            self.assertEqual(Submission.OPEN, submission.status)
            self.assertEqual(200, response.status_code)
            self.assertIn('optional_validation', content['data'].keys())
            self.assertIn('optional_validation', submission.data)

            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'data': {'requirements': {}}},
                format='json'
            )
            content = json.loads(response.content.decode('utf-8'))
            submission = Submission.objects.first()
            self.assertEqual(Submission.OPEN, submission.status)
            self.assertEqual(400, response.status_code)
            self.assertIn('optional_validation', content.keys())

        @responses.activate
        def test_put_submission_valid_max_validation(self):
            self._add_create_ticket_response()
            self._add_update_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'release': True,
                 'data': _get_submission_request_data()},
                format='json'
            )
            content = json.loads(response.content.decode('utf-8'))
            submission = Submission.objects.last()
            self.assertEqual(200, response.status_code)
            self.assertFalse('optional_validation' in content['data'].keys())
            self.assertFalse('optional_validation' in submission.data)

            submission = Submission.objects.last()
            self.assertEqual(Submission.SUBMITTED,
                             content.get('status', 'NOPE'))
            self.assertEqual(Submission.SUBMITTED, submission.status)

        @responses.activate
        def test_put_submission_invalid_max_validation(self):
            self._add_create_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            data = _get_submission_request_data()
            data['requirements'].pop('samples')
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'release': True, 'data': data},
                format='json'
            )
            self.assertEqual(400, response.status_code)
            self.assertIn("'samples' is a required property",
                          response.content.decode('utf-8'))
            self.assertFalse(
                'optional_validation' in response.content.decode('utf-8'))
            submission = Submission.objects.first()
            self.assertEqual(Submission.OPEN, submission.status)

        @responses.activate
        def test_put_submission_max_validation_without_release(self):
            self._add_create_ticket_response()
            self._add_update_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'release': False,
                 'data': _get_submission_request_data()},
                format='json'
            )
            content = json.loads(response.content.decode('utf-8'))
            submission = Submission.objects.first()
            self.assertEqual(200, response.status_code)
            self.assertFalse('optional_validation' in content['data'].keys())
            self.assertFalse('optional_validation' in submission.data)
            submission = Submission.objects.first()
            self.assertEqual(Submission.OPEN,
                             content.get('status', 'NOPE'))
            self.assertEqual(Submission.OPEN, submission.status)

        @responses.activate
        def test_put_on_submitted_submission(self):
            self._add_create_ticket_response()
            self._add_update_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            submission.release = True
            submission.status = Submission.SUBMITTED
            submission.save()
            self.assertEqual(Submission.SUBMITTED, submission.status)
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'release': False,
                 'data': _get_submission_request_data()},
                format='json'
            )
            # TODO: 06.06.2019 allow edit of submissions with status SUBMITTED ...
            self.assertTrue(200, response.status_code)
            # self.assertTrue(400, response.status_code)
            # content = response.content.decode('utf-8')
            # self.assertIn('"status":"SUBMITTED"', content)
            # self.assertIn(
            #     '"broker_submission_id":"{0}"'.format(
            #         submission.broker_submission_id),
            #     content)
            # self.assertIn(
            #     '"error":"no modifications allowed with current status"',
            #     content)

        @responses.activate
        def test_put_on_cancelled_submission(self):
            self._add_create_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            submission.status = Submission.CANCELLED
            submission.save()
            self.assertEqual(Submission.CANCELLED, submission.status)

            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'release': False,
                 'data': _get_submission_request_data()},
                format='json'
            )
            self.assertTrue(400, response.status_code)
            content = response.content.decode('utf-8')
            self.assertIn('"status":"CANCELLED"', content)
            self.assertIn(
                '"broker_submission_id":"{0}"'.format(
                    submission.broker_submission_id),
                content)
            self.assertIn(
                '"error":"no modifications allowed with current status"',
                content)

        @responses.activate
        def test_put_on_error_submission(self):
            self._add_create_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            submission.status = Submission.ERROR
            submission.save()
            self.assertEqual(Submission.ERROR, submission.status)
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'release': False,
                 'data': _get_submission_request_data()},
                format='json'
            )
            self.assertTrue(400, response.status_code)
            content = response.content.decode('utf-8')
            self.assertIn('"status":"ERROR"', content)
            self.assertIn(
                '"broker_submission_id":"{0}"'.format(
                    submission.broker_submission_id),
                content)
            self.assertIn(
                '"error":"no modifications allowed with current status"',
                content)

        @responses.activate
        def test_put_on_closed_submission(self):
            self._add_create_ticket_response()
            self._add_update_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            submission.status = Submission.CLOSED
            submission.save()
            self.assertEqual(Submission.CLOSED, submission.status)
            response = self.api_client.put(
                '/api/submissions/{0}/'.format(submission.broker_submission_id),
                {'target': 'ENA', 'release': False,
                 'data': _get_submission_request_data()},
                format='json'
            )
            self.assertTrue(400, response.status_code)
            content = response.content.decode('utf-8')
            self.assertIn('"status":"CLOSED"', content)
            self.assertIn(
                '"error":"no modifications allowed with current status"',
                content)
            self.assertIn(
                '"broker_submission_id":"{0}"'.format(
                    submission.broker_submission_id),
                content)

    class TestSubmissionViewDeleteRequests(TestSubmissionView):

        @responses.activate
        def test_delete_submission_db(self):
            self._add_create_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            self.assertEqual(1, len(Submission.objects.all()))
            self.api_client.delete(
                '/api/submissions/{0}/'.format(submission.broker_submission_id))
            self.assertEqual(1, len(Submission.objects.all()))

        @responses.activate
        def test_delete_submission_response(self):
            self._add_create_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            response = self.api_client.delete(
                '/api/submissions/{0}/'.format(submission.broker_submission_id))
            self.assertEqual(204, response.status_code)
            self.assertEqual(0, len(response.content))

        @responses.activate
        def test_delete_submission_status(self):
            self._add_create_ticket_response()
            self._post_submission()
            submission = Submission.objects.first()
            self.assertEqual(Submission.OPEN, submission.status)
            self.api_client.delete(
                '/api/submissions/{0}/'.format(submission.broker_submission_id))
            submission = Submission.objects.first()
            self.assertEqual(Submission.CANCELLED, submission.status)

    class TestSubmissionViewPermissions(TestSubmissionView):

        def test_no_credentials(self):
            response = self.client.post('/api/submissions/')
            self.assertEqual(401, response.status_code)

        def test_get_no_credentials(self):
            response = self.client.get('/api/submissions/')
            self.assertEqual(401, response.status_code)

        def test_get_submission_no_credentials(self):
            response = self.client.get('/api/submissions/{0}/'.format(uuid4()))
            self.assertEqual(401, response.status_code)

        def test_get_with_credentials(self):
            response = self.api_client.get('/api/submissions/')
            self.assertEqual(200, response.status_code)

        def test_invalid_basic_auth(self):
            client = APIClient()
            client.credentials(
                HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                    b'horst:wrong').decode('utf-8')
            )
            response = client.post('/api/submissions/', {'some': 'data'},
                                   format='json')
            self.assertEqual(401, response.status_code)

        def test_detail_invalid_basic_auth(self):
            client = APIClient()
            client.credentials(
                HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                    b'horst:wrong').decode('utf-8')
            )
            response = client.get('/api/submissions/{0}/'.format(uuid4()))
            self.assertEqual(401, response.status_code)

        def test_valid_basic_auth(self):
            client = APIClient()
            client.credentials(
                HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                    b'horst:password').decode('utf-8')
            )
            response = client.post('/api/submissions/', {'some': 'data'},
                                   format='json')
            self.assertNotEqual(401, response.status_code)
            self.assertEqual(400, response.status_code)

        def test_super_user(self):
            client = APIClient()
            client.credentials(
                HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                    b'admin:psst').decode('utf-8')
            )
            response = client.post('/api/submissions/', {'some': 'data'},
                                   format='json')
            self.assertNotEqual(401, response.status_code)
            self.assertEqual(400, response.status_code)

        def test_staff_user(self):
            client = APIClient()
            client.credentials(
                HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                    b'kevin:secret').decode('utf-8')
            )
            response = client.post('/api/submissions/', {'some': 'data'},
                                   format='json')
            self.assertNotEqual(401, response.status_code)
            self.assertEqual(400, response.status_code)

        def test_active_user(self):
            client = APIClient()
            client.credentials(
                HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                    b'horst:password').decode('utf-8')
            )
            response = client.post('/api/submissions/', {'some': 'data'},
                                   format='json')
            self.assertNotEqual(401, response.status_code)
            self.assertEqual(400, response.status_code)

        def test_inactive_user(self):
            user = User.objects.create_user(
                username='inactive', email='in@acitve.de', password='nope',
                is_active=False)
            user.user_permissions.add(*self.permissions)
            client = APIClient()
            client.credentials(
                HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                    b'inactive:nope').decode('utf-8')
            )
            response = client.post('/api/submissions/')
            self.assertEqual(401, response.status_code)

        def test_active_user_without_permissions(self):
            User.objects.create_user(username='noperm', email='no@perm.de',
                                     password='nope')
            client = APIClient()
            client.credentials(
                HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                    b'noperm:nope').decode('utf-8')
            )
            response = client.post('/api/submissions/', {}, format='json')
            self.assertEqual(403, response.status_code)

        def test_invalid_token_authentication(self):
            client = APIClient()
            client.credentials(
                HTTP_AUTHORIZATION='Token afafff4f3f3f77faff2f71f')
            response = client.post('/api/submissions/', {'some': 'data'})
            self.assertEqual(401, response.status_code)

        def test_valid_token_authentication(self):
            token = Token.objects.create(
                user=User.objects.get(username='horst'))
            client = APIClient()
            client.credentials(HTTP_AUTHORIZATION='Token {0}'.format(token.key))

            response = client.post('/api/submissions/', {
                'site_project_id': 'p1', 'submitting_user': 'johnDoe',
                'site_object_id': 'o1', 'study': '{}'})
            self.assertNotEqual(401, response.status_code)
            self.assertEqual(400, response.status_code)

        def test_valid_authentication_with_token_from_db(self):
            user = User.objects.get(username='horst')
            Token.objects.create(user=user)
            token = Token.objects.filter(user=user).first()
            client = APIClient()
            client.credentials(HTTP_AUTHORIZATION='Token {0}'.format(token.key))
            response = client.post('/api/submissions/', {
                'site_project_id': 'p1', 'submitting_user': 'johnDoe',
                'site_object_id': 'o1', 'study': '{}'})
            self.assertNotEqual(401, response.status_code)
            self.assertEqual(400, response.status_code)

    class TestSubmissionViewGenericTarget(TestSubmissionView):

        def test_post_empty_generic(self):
            response = self.api_client.post(
                '/api/submissions/',
                {'target': 'GENERIC', 'release': False, 'data': {}},
                format='json'
            )
            self.assertEqual(400, response.status_code)
            keys = json.loads(response.content.decode('utf-8')).keys()
            self.assertIn('optional_validation', keys)
            self.assertIn('data', keys)
            self.assertEqual(0, len(Submission.objects.all()))

        def test_schema_error_min_post(self):
            self.assertEqual(0, len(Submission.objects.all()))
            response = self.api_client.post('/api/submissions/',
                                            {'target': 'GENERIC',
                                             'data': {'requirements': {}}},
                                            format='json'
                                            )
            content = json.loads(response.content.decode('utf-8'))
            self.assertEqual(400, response.status_code)
            self.assertIn('data', content.keys())
            self.assertListEqual(
                ["requirements : 'title' is a required property",
                 "requirements : 'description' is a required property"],
                content['data'])
            self.assertEqual(0, len(Submission.objects.all()))

        @responses.activate
        def test_valid_min_post(self):
            self._add_create_ticket_response()
            self.assertEqual(0, len(Submission.objects.all()))
            self.assertEqual(0, len(RequestLog.objects.all()))
            response = self.api_client.post(
                '/api/submissions/',
                {'target': 'GENERIC', 'data': {
                    'requirements': {
                        'title': 'A Generic Title',
                        'description': 'A Generic Description'}}},
                format='json'
            )
            content = json.loads(response.content.decode('utf-8'))
            # No 'optional_validation' since all generic special fields
            # are non-mandatory
            expected = {
                # 'embargo': '{0}'.format(
                #     datetime.date.today() + datetime.timedelta(days=365)),
                # TODO: better defaults in model
                'embargo': None,
                'download_url': '',
                'status': 'OPEN',
                'release': False,
                'broker_submission_id': content['broker_submission_id'],
                'site_project_id': '',
                'target': 'GENERIC',
                'site': 'horst',
                'submitting_user': '',
                'data': {
                    'requirements': {
                        'description': 'A Generic Description',
                        'title': 'A Generic Title'
                    }
                }
            }
            self.assertEqual(201, response.status_code)
            self.assertDictEqual(expected, content)
            self.assertEqual(1, len(Submission.objects.all()))
            submission = Submission.objects.last()
            self.assertEqual(UUID(content['broker_submission_id']),
                             submission.broker_submission_id)
            # self.assertIsNotNone(submission.embargo)
            self.assertIsNone(submission.embargo)
            self.assertFalse(submission.release)
            self.assertEqual(0, len(submission.site_project_id))
            self.assertEqual(Submission.OPEN, submission.status)
            self.assertEqual(0, len(submission.submitting_user))
            site_config = SiteConfiguration.objects.first()
            self.assertIn(site_config.contact,
                          submission.submitting_user_common_information)
            self.assertEqual('GENERIC', submission.target)
            request_logs = RequestLog.objects.filter(type=RequestLog.INCOMING)
            self.assertEqual(1, len(request_logs))

        # TODO: move to integration-test file
        # TODO: modify to use new endpoints

        # --------------------------------------------------------------------------
        # @skip('test against debug server, that needs to be up and running')
        # def test_post_to_debug_server_full_submission(self):
        #     response = requests.post(
        #         url='http://127.0.0.1:8000/brokerage/submissions/full',
        #         data=json.dumps(FullWorkflowTest.content),
        #         headers={
        #             'Authorization': 'Token e4501de7f37d3044778f7939155f90cfb1625c6e',
        #             'Content-Type': 'application/json'}
        #     )

        # @skip('test against GWDG')
        # def test_post_to_gwdg_server(self):
        #     # let form validation fail
        #     # self.content['sample'] = 2
        #     # access existing submission
        #     # self.content['broker_submission_id'] = 'cdd73460-eec7-40a3-9a1f-f0a314f821f3'
        #     # change site_project_id
        #     # self.content['site_project_id'] = 'p8'
        #
        #     response = requests.post(
        #         url='http://c103-170.cloud.gwdg.de/brokerage/submissions/full',
        #         data=json.dumps(FullWorkflowTest.content),
        #         headers={
        #             'Authorization': 'Token 95bf481b2262df60953c31604a585450445880af',
        #             'Content-Type': 'application/json'}
        #     )

        # @skip('test against c103-171.cloud.gwdg.de (docker)')
        # def test_post_to_gwdg_docker_server(self):
        #     response = requests.post(
        #         url='https://c103-171.cloud.gwdg.de/brokerage/submissions/full',
        #         data=json.dumps(FullWorkflowTest.content),
        #         headers={
        #             'Authorization': 'Token 8b63a9874f6188bf65987a56dd5b6ab5da7ec23a',
        #             'Content-Type': 'application/json'}
        #     )

        # @skip('test against services.gfbio.org (docker)')
        # def test_post_to_gwdg_docker_server_2(self):
        #     response = requests.post(
        #         url='https://https://services.gfbio.org/api/submissions/',
        #         data=json.dumps(FullWorkflowTest.content),
        #         headers={
        #             'Authorization': 'Token f411f893264e2fe3c153a8998fe2c9c75944cb89',
        #             'Content-Type': 'application/json'}
        #     )

        # --------------------------------------------------------------------------

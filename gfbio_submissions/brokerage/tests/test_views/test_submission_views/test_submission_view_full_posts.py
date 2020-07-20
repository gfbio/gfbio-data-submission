# -*- coding: utf-8 -*-

import json
import os
import shutil
from uuid import UUID

import responses
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from config.settings.base import MEDIA_ROOT
from gfbio_submissions.brokerage.configuration.settings import \
    GENERIC, ENA
from gfbio_submissions.brokerage.models import Submission, TaskProgressReport
from gfbio_submissions.brokerage.tests.utils import \
    _get_submission_request_data, _get_submission_post_response
from gfbio_submissions.users.models import User
from .test_submission_view_base import TestSubmissionView


class TestSubmissionViewFullPosts(TestSubmissionView):

    @classmethod
    def tearDownClass(cls):
        super(TestSubmissionViewFullPosts, cls).tearDownClass()
        [shutil.rmtree(path='{0}{1}{2}'.format(MEDIA_ROOT, os.sep, o),
                       ignore_errors=False) for o in os.listdir(MEDIA_ROOT)]

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
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(201, response.status_code)
        expected = _get_submission_post_response()
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
    def test_valid_max_post_of_fresh_user(self):
        self._add_create_ticket_response()
        self._add_gfbio_helpdesk_user_service_response(user_name='new_user',
                                                       email='new@user.de')
        self.assertEqual(0, len(Submission.objects.all()))

        user = User.objects.create_user(
            username='new_user', email='new@user.de', password='pass1234', )
        user.site_configuration = self.site_config
        user.save()

        token, created = Token.objects.get_or_create(user_id=user.id)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': True,
             'data': _get_submission_request_data()},
            format='json'
        )
        self.assertEqual(201, response.status_code)
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual('new_user', content['user'])

        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': True,
             'data': _get_submission_request_data()},
            format='json'
        )

        self.assertEqual(2, len(Submission.objects.all()))
        response = client.get('/api/submissions/')
        content = json.loads(response.content)
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(content))

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
        title = 'A Title for meta-data in GENERIC'
        response = self.api_client.post(
            '/api/submissions/',
            {
                'target': 'GENERIC', 'release': False,
                'data': {
                    'requirements': {
                        'title': title,
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
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        self.assertEqual(200, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(ENA, submission.target)
        self.assertNotIn('validation', submission.data.keys())

        expected_task_names = [
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.create_submission_issue_task',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.update_submission_issue_task',
            'tasks.check_for_molecular_content_in_submission_task',
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

        self.assertEqual(
            1,
            len(submission.brokerobject_set.filter(type='study'))
        )
        study = submission.brokerobject_set.filter(type='study').first()
        self.assertEqual(title, study.data.get('study_title', ''))

        self.assertEqual(
            3,
            len(submission.brokerobject_set.filter(type='sample'))
        )
        sample = submission.brokerobject_set.filter(type='sample').first()
        self.assertEqual('Sample No. 1', sample.data.get('sample_title', ''))

        self.assertEqual(
            3,
            len(submission.brokerobject_set.filter(type='experiment'))
        )
        experiment = submission.brokerobject_set.filter(
            type='experiment').first()
        self.assertIn('files', experiment.data.keys())

        submission_text_data = list(
            submission.auditabletextdata_set.values_list(
                'name', flat=True).order_by('created')
        )
        expected_text_data_names = [
            'study.xml',
            'sample.xml',
            'experiment.xml',
            'run.xml'
        ]
        for s in submission_text_data:
            self.assertIn(s, expected_text_data_names)

    # TODO: move to dedicatet test class
    @responses.activate
    def test_update_with_molecular_meta_data_csv(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        title = 'A Title for meta-data in GENERIC'
        response = self.api_client.post(
            '/api/submissions/',
            {
                'target': 'GENERIC', 'release': False,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        submission = Submission.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        data = self._create_test_meta_data()
        response = self.api_client.post(url, data, format='multipart')
        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {
                'target': 'GENERIC', 'release': True,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        submission = Submission.objects.first()
        self.assertEqual(ENA, submission.target)

        data = self._create_test_meta_data(delete=False, update=True)
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(2, len(submission.submissionupload_set.all()))
        original_upload = submission.submissionupload_set.get(
            file='{0}/molecular_metadata.csv'.format(
                submission.broker_submission_id
            )
        )
        update_upload = submission.submissionupload_set.get(
            file='{0}/molecular_metadata_for_update.csv'.format(
                submission.broker_submission_id
            )
        )
        original_upload.meta_data = False
        original_upload.save()
        self.assertFalse(original_upload.meta_data)
        self.assertTrue(update_upload.meta_data)

        self.assertEqual(10, len(submission.brokerobject_set.all()))
        self.assertEqual(4, len(submission.auditabletextdata_set.all()))

        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {
                'target': 'GENERIC', 'release': True,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        submission = Submission.objects.first()
        sample = submission.brokerobject_set.filter(type='sample').first()
        self.assertEqual('Update-Sample No. 1',
                         sample.data.get('sample_title', ''))

        self.assertEqual(10, len(submission.brokerobject_set.all()))
        self.assertEqual(4, len(submission.auditabletextdata_set.all()))

        data = self._create_test_meta_data(delete=True, invalid=True)
        response = self.api_client.post(url, data, format='multipart')
        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {
                'target': 'GENERIC', 'release': True,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        submission = Submission.objects.first()
        self.assertEqual(ENA, submission.target)

    # TODO: move to dedicatet test class
    @responses.activate
    def test_valid_generic_post_with_invalid_molecular_meta_data(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        title = 'A Title for meta-data in GENERIC'
        response = self.api_client.post(
            '/api/submissions/',
            {
                'target': 'GENERIC', 'release': False,
                'data': {
                    'requirements': {
                        'title': title,
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
        data = self._create_test_meta_data(invalid=True)
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
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        self.assertEqual(200, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(ENA, submission.target)
        self.assertIn('validation', submission.data.keys())
        self.assertEqual(2, len(submission.data.get('validation', [])))

        expected_task_names = [
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.create_submission_issue_task',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.update_submission_issue_task',
            'tasks.check_for_molecular_content_in_submission_task',
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

        # self.assertEqual(0, len(submission.brokerobject_set.all()))
        self.assertEqual(10, len(submission.brokerobject_set.all()))
        # self.assertEqual(0, len(submission.auditabletextdata_set.all()))
        self.assertEqual(4, len(submission.auditabletextdata_set.all()))

        check_tasks = TaskProgressReport.objects.filter(
            task_name='tasks.check_for_molecular_content_in_submission_task')
        for c in check_tasks:
            self.assertIn('messages', c.task_return_value)

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

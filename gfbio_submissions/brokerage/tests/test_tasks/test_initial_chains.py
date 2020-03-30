# -*- coding: utf-8 -*-

import base64
import json
from pprint import pprint
from urllib.parse import quote

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework.test import APIRequestFactory, APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    JIRA_ISSUE_URL, JIRA_USERNAME_URL_TEMPLATE, \
    JIRA_USERNAME_URL_FULLNAME_TEMPLATE
from gfbio_submissions.brokerage.models import Submission, TaskProgressReport
from gfbio_submissions.brokerage.tests.utils import \
    _get_submission_request_data
from gfbio_submissions.generic.models import SiteConfiguration, \
    ResourceCredential
from gfbio_submissions.users.models import User


class TestInitialChainTasks(TestCase):

    @classmethod
    def setUpTestData(cls):
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
        cls.permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submission')
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        user.user_permissions.add(*cls.permissions)
        user.site_configuration = cls.site_config
        user.save()
        cls.factory = APIRequestFactory()

        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:password').decode('utf-8')
        )
        cls.api_client = client

    def _add_jira_client_responses(self):
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(self.site_config.helpdesk_server.url),
            status=200,
        )

    def _add_create_helpdesk_user_response(self):
        user = User.objects.first()
        url = JIRA_USERNAME_URL_TEMPLATE.format(
            user.username, user.email
        )
        responses.add(responses.GET, url, body='{0}'.format(user.username),
                      status=200)
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format(
            user.external_user_id, user.email,
            quote(user.name)
        )
        responses.add(responses.GET, url, body='{0}'.format(user.username),
                      status=200)

    def _add_create_ticket_response(self):
        self._add_jira_client_responses()
        self._add_create_helpdesk_user_response()
        responses.add(
            responses.POST,
            '{0}{1}'.format(
                self.site_config.helpdesk_server.url,
                JIRA_ISSUE_URL
            ),
            status=200,
            body=json.dumps({'mocked_response': True})
        )

    @responses.activate
    def test_min_post_initial_chain(self):
        self._add_create_ticket_response()
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))
        min_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            }))
        self.assertEqual(201, min_response.status_code)
        task_reports = TaskProgressReport.objects.all()
        expected_tasknames = ['tasks.get_gfbio_helpdesk_username_task',
                              'tasks.create_submission_issue_task',
                              'tasks.check_for_molecular_content_in_submission_task',
                              'tasks.trigger_submission_transfer', ]
        self.assertEqual(4, len(task_reports))
        for t in task_reports:
            self.assertIn(t.task_name, expected_tasknames)

    @responses.activate
    def test_no_release_initial_chain(self):
        self._add_create_ticket_response()
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))
        min_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'GENERIC',
                'release': False,
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            }))
        self.assertEqual(201, min_response.status_code)
        task_reports = TaskProgressReport.objects.all()
        expected_tasknames = ['tasks.get_gfbio_helpdesk_username_task',
                              'tasks.create_submission_issue_task',
                              'tasks.check_for_molecular_content_in_submission_task',
                              'tasks.trigger_submission_transfer', ]
        self.assertEqual(4, len(task_reports))
        for t in task_reports:
            self.assertIn(t.task_name, expected_tasknames)

    @responses.activate
    def test_max_post_with_release_initial_chain(self):
        self._add_create_ticket_response()
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))
        max_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': True,
                'data': _get_submission_request_data()
            }))
        self.assertEqual(201, max_response.status_code)
        content = json.loads(max_response.content)
        pprint(content)
        sub = Submission.objects.get(
            broker_submission_id=content.get('broker_submission_id'))
        pprint(sub.__dict__)
        task_reports = TaskProgressReport.objects.all()
        expected_tasknames = ['tasks.get_gfbio_helpdesk_username_task',
                              'tasks.create_submission_issue_task',
                              'tasks.check_for_molecular_content_in_submission_task',
                              'tasks.trigger_submission_transfer',
                              'tasks.create_broker_objects_from_submission_data_task',
                              'tasks.prepare_ena_submission_data_task',
                              'tasks.check_on_hold_status_task',
                              'tasks.update_helpdesk_ticket_task', ]
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(7, len(tprs))
        for t in task_reports:
            # print('\n', t.task_name, '\n', t.__dict__)
            self.assertIn(t.task_name, expected_tasknames)

    @responses.activate
    def test_max_post_without_release_initial_chain(self):
        self._add_create_ticket_response()
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))
        max_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': _get_submission_request_data()
            }))
        self.assertEqual(201, max_response.status_code)
        task_reports = TaskProgressReport.objects.all()
        expected_tasknames = ['tasks.get_gfbio_helpdesk_username_task',
                              'tasks.create_submission_issue_task',
                              'tasks.check_for_molecular_content_in_submission_task',
                              'tasks.trigger_submission_transfer', ]
        self.assertEqual(4, len(task_reports))
        for t in task_reports:
            self.assertIn(t.task_name, expected_tasknames)

    @responses.activate
    def test_put_initial_chain_no_release(self):
        self._add_create_ticket_response()
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))
        self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': _get_submission_request_data()
            }))
        submission = Submission.objects.first()
        responses.add(responses.PUT,
                      'https://www.example.com/rest/api/2/issue/no_key_available',
                      body='', status=200)
        self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            data={'target': 'ENA', 'release': False, 'data': {
                'requirements': {'title': 'A Title 0815',
                                 'description': 'A Description 2'}}},
            format='json', )
        task_reports = TaskProgressReport.objects.all()
        expected_tasknames = ['tasks.get_gfbio_helpdesk_username_task',
                              'tasks.create_submission_issue_task',
                              'tasks.update_submission_issue_task',
                              'tasks.trigger_submission_transfer',
                              'tasks.check_for_molecular_content_in_submission_task',
                              'tasks.trigger_submission_transfer_for_updates',
                              'tasks.update_helpdesk_ticket_task', ]
        self.assertEqual(8, len(task_reports))
        for t in task_reports:
            self.assertIn(t.task_name, expected_tasknames)

# -*- coding: utf-8 -*-
import base64
import json

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework.test import APIRequestFactory, APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL
from gfbio_submissions.brokerage.models import ResourceCredential, \
    SiteConfiguration, Submission
from gfbio_submissions.brokerage.tests.utils import _get_submission_request_data
from gfbio_submissions.users.models import User


class TestInitialChainTasks(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submission')
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        user.user_permissions.add(*cls.permissions)
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

    @responses.activate
    def test_min_post_initial_chain(self):
        self._add_create_ticket_response()
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

    @responses.activate
    def test_max_post_with_release_initial_chain(self):
        self._add_create_ticket_response()
        max_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': True,
                'data': _get_submission_request_data()
            }))
        self.assertEqual(201, max_response.status_code)

    @responses.activate
    def test_max_post_without_release_initial_chain(self):
        self._add_create_ticket_response()
        max_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': _get_submission_request_data()
            }))
        self.assertEqual(201, max_response.status_code)

    @responses.activate
    def test_put_initial_chain_no_release(self):
        self._add_create_ticket_response()
        response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': _get_submission_request_data()
            }))
        submission = Submission.objects.first()
        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            data={'target': 'ENA', 'release': False, 'data': {
                'requirements': {'title': 'A Title 0815',
                                 'description': 'A Description 2'}}},
            format='json', )

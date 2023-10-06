# -*- coding: utf-8 -*-


import base64
import json
from uuid import uuid4

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.tests.utils import _get_ena_data, \
    _get_ena_data_without_runs, _get_pangaea_comment_response
from gfbio_submissions.generic.models import SiteConfiguration, \
    ResourceCredential
from gfbio_submissions.users.models import User
from ....configuration.settings import GFBIO_HELPDESK_TICKET
from ....models.broker_object import BrokerObject
from ....models.submission import Submission
from ....serializers.submission_serializer import SubmissionSerializer


class TestSubmissionCommentView(TestCase):

    # TODO: move to utils or similar ...
    @classmethod
    def _create_submission_via_serializer(cls, runs=False):
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': _get_ena_data() if runs else _get_ena_data_without_runs()
        })
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)
        return submission

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
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submission'
        )
        user.user_permissions.add(*permissions)
        user.site_configuration = cls.site_config
        user.save()
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        cls.api_client = client

        submission = cls._create_submission_via_serializer()
        submission.additionalreference_set.create(
            type=GFBIO_HELPDESK_TICKET,
            reference_key='SAND-1661',
            primary=True
        )
        cls._create_submission_via_serializer()

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

# -*- coding: utf-8 -*-
import base64
import json
from unittest import skip
from django.test import TestCase

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.users.models import User


class TestAddSubmissionView(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username='user1',
            password='password',
        )

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
    #
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
    #
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

    def test_submissions_get_request(self):
        response = self.client.get('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_empty_min_post(self):
        valid_user = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({}),
            **valid_user)
        self.assertEqual(400, response.status_code)
        self.assertEqual(0, len(Submission.objects.all()))

    def test_empty_min_post_errors(self):
        valid_user = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        response = self.client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({}),
            **valid_user)
        keys = json.loads(response.content.decode('utf-8')).keys()
        self.assertIn('target', keys)
        self.assertIn('data', keys)

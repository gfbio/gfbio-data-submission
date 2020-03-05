# -*- coding: utf-8 -*-
import json
from uuid import UUID

import responses

from gfbio_submissions.brokerage.models import Submission, RequestLog
from .test_submission_view_base import \
    TestSubmissionView


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
            'embargo': None,
            'download_url': '',
            'status': 'OPEN',
            'release': False,
            'broker_submission_id': content['broker_submission_id'],
            'issue': '',
            'target': 'GENERIC',
            'user': 'horst',
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
        self.assertIsNone(submission.embargo)
        self.assertFalse(submission.release)
        # self.assertEqual(0, len(submission.site_project_id))
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(0, len(submission.submitting_user))
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

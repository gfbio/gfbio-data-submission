# -*- coding: utf-8 -*-

import json

import responses

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.users.models import User
from .test_submission_view_base import TestSubmissionView


# FIXME: duplicate of below ?
class TestSubmissionViewGetRequests(TestSubmissionView):

    @responses.activate
    def _prepare_submissions_for_various_users(self):
        self._add_gfbio_helpdesk_user_service_response(
            user_name='regular_user_2', email='re2@gu.la')
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

    def test_submissions_get_request(self):
        response = self.client.get('/api/submissions/')
        self.assertEqual(401, response.status_code)

    @responses.activate
    def test_get_submissions(self):
        self._add_create_ticket_response()
        self._post_submission()
        response = self.api_client.get('/api/submissions/')
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        self.assertEqual(1, len(content))

    # TODO: refactor once views have been adapted for new site/user relation
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

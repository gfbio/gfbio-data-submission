# -*- coding: utf-8 -*-
import json

import responses

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.brokerage.tests.test_views.test_submission_views.test_submission_view_base import \
    TestSubmissionView


class TestSubmissionViewSimple(TestSubmissionView):

    # FIXME: something broken in super class.setUpTestData ???
    # @classmethod
    # def setUpTestData(cls):
    #     # super(TestSubmissionView, cls).setUpTestData()
    #     user = User.objects.create_user(
    #         username='horst', email='horst@horst.de', password='password')
    #     permissions = Permission.objects.filter(
    #         content_type__app_label='brokerage',
    #         codename__endswith='submission'
    #     )
    #     user.user_permissions.add(*permissions)
    #     token = Token.objects.create(user=user)
    #     client = APIClient()
    #     client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
    #     cls.api_client = client

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

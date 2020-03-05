# -*- coding: utf-8 -*-

import json
import urllib
from uuid import uuid4

import responses

from gfbio_submissions.brokerage.models import Submission, AdditionalReference
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
        self.assertEqual('horst', content['user'])

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



    @responses.activate
    def test_get_submission_with_helpdesk_issue(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()

        AdditionalReference.objects.create(
            submission=submission,
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            primary=True,
            reference_key='SAND-0815',
        )

        response = self.api_client.get(
            '/api/submissions/{0}/'.format(submission.broker_submission_id))
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertIn('issue', content)
        self.assertEqual('SAND-0815', content.get('issue', 'NO_ISSUE'))

    @responses.activate
    def test_no_submission_for_id(self):
        self._add_create_ticket_response()
        self._post_submission()
        response = self.api_client.get(
            '/api/submissions/{0}/'.format(uuid4()))
        self.assertEqual(404, response.status_code)

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
        response = self.api_client.get('/api/submissions/user/687879/')
        self.assertEqual(200, response.status_code)
        submissions = json.loads(response.content.decode('utf-8'))
        self.assertEqual(0, len(submissions))

    # @responses.activate
    def test_get_submissions_various_user_ids(self):
        # self._add_gfbio_helpdesk_user_service_response('regular_user_2', 're2@gu.la')
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

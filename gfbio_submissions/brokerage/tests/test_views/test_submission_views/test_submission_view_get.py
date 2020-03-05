# -*- coding: utf-8 -*-

import json

import responses
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.users.models import User
from .test_submission_view_base import TestSubmissionView
from ...test_models.test_submission import SubmissionTest


class TestSubmissionViewGetRequests(TestSubmissionView):

    @classmethod
    @responses.activate
    def setUpTestData(cls):
        super().setUpTestData()

        # 1 horst horst@horst.de None default  | site:  False  | user:  True  | staff:  False  | super:  False
        # 2 kevin kevin@kevin.de None default  | site:  True  | user:  True  | staff:  True  | super:  False
        user = User.objects.get(id=2)
        user.is_user = True
        user.is_site = False
        user.save()
        # 3 regular_user re@gu.la None default  | site:  False  | user:  True  | staff:  False  | super:  False
        # 4 regular_user_2 re2@gu.la None default  | site:  False  | user:  True  | staff:  False  | super:  False
        user = User.objects.get(id=4)
        user.is_user = False
        user.is_site = True
        user.save()
        # 5 admin admin@admin.de None None  | site:  False  | user:  True  | staff:  True  | super:  True

        SubmissionTest._create_submission_via_serializer(
            user_id=1, create_broker_objects=False)
        SubmissionTest._create_submission_via_serializer(
            user_id=1, create_broker_objects=False)
        SubmissionTest._create_submission_via_serializer(
            user_id=1, create_broker_objects=False)

        SubmissionTest._create_submission_via_serializer(
            user_id=2, create_broker_objects=False)
        SubmissionTest._create_submission_via_serializer(
            user_id=2, create_broker_objects=False)

        SubmissionTest._create_submission_via_serializer(
            user_id=4, create_broker_objects=False)

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
    # @responses.activate
    # def test_get_submissions_for_site_user(self):
    #     self._add_create_ticket_response()
    #     self._post_submission()
    #
    #     print('\n\nTEST_GET_SUBMISSIONS_FOR_SITE_USER FOR USERS\n')
    #     subs = Submission.objects.all()
    #     for s in subs:
    #         print('\n', s, s.user, s.site, ' submitting_user: ',
    #               s.submitting_user)
    #
    #     self.other_api_client.post(
    #         '/api/submissions/',
    #         {'target': 'ENA', 'release': False, 'data': {
    #             'requirements': {
    #                 'title': 'A Title',
    #                 'description': 'A Description'}}},
    #         format='json'
    #     )
    #
    #     self.assertEqual(2, len(Submission.objects.all()))
    #     response = self.api_client.get('/api/submissions/')
    #     content = json.loads(response.content.decode('utf-8'))
    #     self.assertEqual(1, len(content))

    # explicit testing of ownership and permissions after user/site refactoring
    @responses.activate
    def test_get_submissions_for_users(self):

        self.assertEqual(6, len(Submission.objects.all()))

        user = User.objects.get(id=1)
        token, created = Token.objects.get_or_create(user_id=user.id)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.get('/api/submissions/')
        content = json.loads(response.content)

        self.assertEqual(200, response.status_code)
        self.assertEqual(3, len(content))
        for sub in content:
            self.assertEqual('', sub['submitting_user'])
            self.assertEqual(user.username, sub['user'])
            self.assertNotIn('site', sub.keys())

        user = User.objects.get(id=2)
        token, created = Token.objects.get_or_create(user_id=user.id)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.get('/api/submissions/')
        content = json.loads(response.content)

        self.assertEqual(200, response.status_code)
        self.assertEqual(2, len(content))
        for sub in content:
            self.assertEqual('', sub['submitting_user'])
            self.assertEqual(user.username, sub['user'])
            self.assertNotIn('site', sub.keys())

        user = User.objects.get(id=4)
        token, created = Token.objects.get_or_create(user_id=user.id)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.get('/api/submissions/')
        content = json.loads(response.content)

        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(content))
        for sub in content:
            self.assertEqual('', sub['submitting_user'])
            self.assertEqual(user.username, sub['user'])
            self.assertNotIn('site', sub.keys())

        user = User.objects.get(id=5)
        token, created = Token.objects.get_or_create(user_id=user.id)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.get('/api/submissions/')
        content = json.loads(response.content)

        self.assertEqual(200, response.status_code)
        self.assertEqual(0, len(content))

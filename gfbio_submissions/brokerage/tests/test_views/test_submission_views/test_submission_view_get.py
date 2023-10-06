# -*- coding: utf-8 -*-
import base64
import json

import responses
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from gfbio_submissions.users.models import User
from .test_submission_view_base import TestSubmissionView
from ...test_models.test_submission import SubmissionTest
from ....models.submission import Submission


class TestSubmissionViewGetRequests(TestSubmissionView):

    @classmethod
    @responses.activate
    def setUpTestData(cls):
        super().setUpTestData()

        # 1 horst horst@horst.de None default  | site:  False  | user:  True  | staff:  False  | super:  False
        # 2 kevin kevin@kevin.de None default  | site:  True  | user:  True  | staff:  True  | super:  False
        user = User.objects.get(username='horst')
        user.is_user = True
        user.is_site = False
        user.save()
        # 3 regular_user re@gu.la None default  | site:  False  | user:  True  | staff:  False  | super:  False
        # 4 regular_user_2 re2@gu.la None default  | site:  False  | user:  True  | staff:  False  | super:  False
        user = User.objects.get(username='regular_user_2')
        user.is_user = False
        user.is_site = True
        user.save()
        # 5 admin admin@admin.de None None  | site:  False  | user:  True  | staff:  True  | super:  True

        SubmissionTest._create_submission_via_serializer(
            username='horst', create_broker_objects=False)
        SubmissionTest._create_submission_via_serializer(
            username='horst', create_broker_objects=False)
        SubmissionTest._create_submission_via_serializer(
            username='horst', create_broker_objects=False)

        SubmissionTest._create_submission_via_serializer(
            username='kevin', create_broker_objects=False)
        SubmissionTest._create_submission_via_serializer(
            username='kevin', create_broker_objects=False)

        SubmissionTest._create_submission_via_serializer(
            username='regular_user_2', create_broker_objects=False)

    def test_submissions_get_request(self):
        response = self.client.get('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_invalid_token(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token 1234xxx1234')
        response = client.get('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_invalid_basic_auth(self):
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'user:invalidpassword').decode('utf-8')
        )
        response = client.get('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_get_submissions(self):
        response = self.api_client.get('/api/submissions/')
        content = json.loads(response.content.decode('utf-8'))

        self.assertEqual(200, response.status_code)
        self.assertEqual(6, len(Submission.objects.all()))
        self.assertEqual(3, len(content))

    # explicit testing of ownership and permissions after user/site refactoring
    def test_get_submissions_for_users(self):

        self.assertEqual(6, len(Submission.objects.all()))

        user = User.objects.get(username='horst')
        token, created = Token.objects.get_or_create(user_id=user.id)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.get('/api/submissions/')
        content = json.loads(response.content)

        self.assertEqual(200, response.status_code)
        self.assertEqual(3, len(content))
        for sub in content:
            # self.assertEqual('', sub['submitting_user'])
            self.assertEqual(user.username, sub['user'])
            self.assertNotIn('site', sub.keys())

        user = User.objects.get(username='kevin')
        token, created = Token.objects.get_or_create(user_id=user.id)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.get('/api/submissions/')
        content = json.loads(response.content)

        self.assertEqual(200, response.status_code)
        self.assertEqual(2, len(content))
        for sub in content:
            self.assertEqual(user.username, sub['user'])
            self.assertNotIn('site', sub.keys())

        user = User.objects.get(username='regular_user_2')
        token, created = Token.objects.get_or_create(user_id=user.id)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.get('/api/submissions/')
        content = json.loads(response.content)

        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(content))
        for sub in content:
            self.assertEqual(user.username, sub['user'])
            self.assertNotIn('site', sub.keys())

        user = User.objects.get(username='admin')
        token, created = Token.objects.get_or_create(user_id=user.id)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.get('/api/submissions/')
        content = json.loads(response.content)

        self.assertEqual(200, response.status_code)
        self.assertEqual(0, len(content))

    def test_fresh_user_get(self):
        user = User.objects.create_user(
            username='new_user', email='new@user.de', password='pass1234', )
        user.site_configuration = self.site_config
        user.save()

        self.assertFalse(user.has_perm('brokerage.add_submission'))

        SubmissionTest._create_submission_via_serializer(
            username='new_user', create_broker_objects=False)

        token, created = Token.objects.get_or_create(user_id=user.id)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.get('/api/submissions/')
        content = json.loads(response.content)
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(content))

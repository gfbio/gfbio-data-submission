# -*- coding: utf-8 -*-

import base64
from unittest import skip
from uuid import uuid4

from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from gfbio_submissions.users.models import User
from .test_submission_view_base import TestSubmissionView


class TestSubmissionViewPermissions(TestSubmissionView):

    def test_no_credentials(self):
        response = self.client.post('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_get_no_credentials(self):
        response = self.client.get('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_get_submission_no_credentials(self):
        response = self.client.get('/api/submissions/{0}/'.format(uuid4()))
        self.assertEqual(401, response.status_code)

    def test_get_with_credentials(self):
        response = self.api_client.get('/api/submissions/')
        self.assertEqual(200, response.status_code)

    def test_invalid_basic_auth(self):
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:wrong').decode('utf-8')
        )
        response = client.post('/api/submissions/', {'some': 'data'},
                               format='json')
        self.assertEqual(401, response.status_code)

    def test_detail_invalid_basic_auth(self):
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:wrong').decode('utf-8')
        )
        response = client.get('/api/submissions/{0}/'.format(uuid4()))
        self.assertEqual(401, response.status_code)

    def test_valid_basic_auth(self):
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:password').decode('utf-8')
        )
        response = client.post('/api/submissions/', {'some': 'data'},
                               format='json')
        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)

    def test_super_user(self):
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'admin:psst').decode('utf-8')
        )
        response = client.post('/api/submissions/', {'some': 'data'},
                               format='json')
        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)

    def test_staff_user(self):
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'kevin:secret').decode('utf-8')
        )
        response = client.post('/api/submissions/', {'some': 'data'},
                               format='json')
        print(response.content)
        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)

    def test_active_user(self):
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:password').decode('utf-8')
        )
        response = client.post('/api/submissions/', {'some': 'data'},
                               format='json')
        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)

    def test_inactive_user(self):
        user = User.objects.create_user(
            username='inactive', email='in@acitve.de', password='nope',
            is_active=False)
        user.user_permissions.add(*self.permissions)
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'inactive:nope').decode('utf-8')
        )
        response = client.post('/api/submissions/')
        self.assertEqual(401, response.status_code)

    @skip(reason='post does currently not require permissions')
    def test_active_user_without_permissions(self):
        User.objects.create_user(username='noperm', email='no@perm.de',
                                 password='nope')
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'noperm:nope').decode('utf-8')
        )
        response = client.post('/api/submissions/', {}, format='json')
        self.assertEqual(403, response.status_code)

    def test_invalid_token_authentication(self):
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Token afafff4f3f3f77faff2f71f')
        response = client.post('/api/submissions/', {'some': 'data'})
        self.assertEqual(401, response.status_code)

    def test_valid_token_authentication(self):
        token = Token.objects.create(
            user=User.objects.get(username='horst'))
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token {0}'.format(token.key))

        response = client.post('/api/submissions/', {
            # 'site_project_id': 'p1',
            'submitting_user': 'johnDoe',
            # 'site_object_id': 'o1',
            'study': '{}'})
        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)

    def test_valid_authentication_with_token_from_db(self):
        user = User.objects.get(username='horst')
        Token.objects.create(user=user)
        token = Token.objects.filter(user=user).first()
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token {0}'.format(token.key))
        response = client.post('/api/submissions/', {
            # 'site_project_id': 'p1',
            'submitting_user': 'johnDoe',
            # 'site_object_id': 'o1',
            'study': '{}'})
        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)

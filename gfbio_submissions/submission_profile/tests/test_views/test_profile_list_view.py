# -*- coding: utf-8 -*-
import base64
import json

from django.test import TestCase
from rest_framework.test import APIClient

from gfbio_submissions.users.models import User
from ..test_models.test_profile import TestProfile
from ...models.profile import Profile


class TestProfileListView(TestCase):
    @classmethod
    def setUpTestData(cls):
        TestProfile.setUpTestData()

        cls.user = User.objects.get(username="horst")
        cls.user_2 = User.objects.create_user(
            username="kevin",
            email="kevin@kevin.de",
            password="password",
        )

        Profile.objects.create(name="system-generic", target="GENERIC", system_wide_profile=True)
        Profile.objects.create(name="user-profile-1", target="GENERIC", user=cls.user)
        Profile.objects.create(name="user-profile-2", target="GENERIC", user=cls.user)
        Profile.objects.create(name="user-2-profile-1", target="GENERIC", user=cls.user_2)

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Basic " + base64.b64encode(b"horst:password").decode("utf-8"))
        cls.api_client = client

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Basic " + base64.b64encode(b"kevin:password").decode("utf-8"))
        cls.api_client_2 = client

    def test_get_without_credentials(self):
        response = self.client.get("/profile/profiles/")
        self.assertEqual(401, response.status_code)

    def test_get_for_user_1(self):
        response = self.api_client.get("/profile/profiles/")
        data = json.loads(response.content)
        self.assertEqual(200, response.status_code)
        self.assertEqual(3, len(data))
        system_profile = Profile.objects.get(system_wide_profile=True)
        self.assertIn(
            {'id': system_profile.id, 'name': system_profile.name, 'target': system_profile.target},
            data
        )
        other_users_profile = Profile.objects.exclude(user=self.user).exclude(system_wide_profile=True).first()
        self.assertNotIn(
            {'id': other_users_profile.id, 'name': other_users_profile.name, 'target': other_users_profile.target},
            data
        )

    def test_get_for_user_2(self):
        response = self.api_client_2.get("/profile/profiles/")
        data = json.loads(response.content)
        self.assertEqual(200, response.status_code)
        self.assertEqual(2, len(data))
        system_profile = Profile.objects.get(system_wide_profile=True)
        self.assertIn(
            {'id': system_profile.id, 'name': system_profile.name, 'target': system_profile.target},
            data
        )
        other_users_profile = Profile.objects.exclude(user=self.user_2).exclude(system_wide_profile=True).first()
        self.assertNotIn(
            {'id': other_users_profile.id, 'name': other_users_profile.name, 'target': other_users_profile.target},
            data
        )

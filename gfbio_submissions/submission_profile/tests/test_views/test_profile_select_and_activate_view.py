# -*- coding: utf-8 -*-
import base64
import json
from pprint import pprint
from django.urls import reverse
from django.test import TestCase
from rest_framework.test import APIClient

from gfbio_submissions.users.models import User
from ..test_models.test_profile import TestProfile
from ...models.profile import Profile


class TestProfileSelectAndActivateView(TestCase):
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
        Profile.objects.create(name="system-generic-2", target="GENERIC", system_wide_profile=True)
        Profile.objects.create(name="user-profile-1", target="GENERIC", user=cls.user)
        Profile.objects.create(name="user-profile-2", target="GENERIC", user=cls.user)
        Profile.objects.create(name="user-2-profile-1", target="GENERIC", user=cls.user_2)

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Basic " + base64.b64encode(b"horst:password").decode("utf-8"))
        cls.api_client = client

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Basic " + base64.b64encode(b"kevin:password").decode("utf-8"))
        cls.api_client_2 = client

    def test_valid_request(self):
        profile = Profile.objects.get(name="system-generic")
        url = reverse("profile:profile_select_and_activate", kwargs={"pk": profile.id})
        response = self.api_client.put(url)
        self.assertEqual(200, response.status_code)
        print(response.data)

    def test_request(self):
        sw_profile = Profile.objects.get(name="system-generic")
        u_profile = Profile.objects.get(name="user-profile-1")
        url = reverse("profile:profile_select_and_activate", kwargs={"pk": sw_profile.id})
        response = self.api_client.put(url)
        print(response.status_code)
        print(response.data)

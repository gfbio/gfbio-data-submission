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
        content = json.loads(response.content)
        self.assertEqual(200, response.status_code)
        self.assertIn("id", content.keys())
        self.assertIn("parent_id", content.keys())
        new_profile = Profile.objects.get(pk=content.get("id"))
        self.assertIsInstance(new_profile, Profile)
        self.assertTrue(new_profile.active_user_profile)

    def test_non_system_wide_request(self):
        profile = Profile.objects.get(name="user-profile-1")
        url = reverse("profile:profile_select_and_activate", kwargs={"pk": profile.id})
        response = self.api_client.put(url)
        content = json.loads(response.content)
        self.assertEqual(400, response.status_code)
        self.assertIn("error", content.keys())

    def test_no_credentials(self):
        profile = Profile.objects.get(name="system-generic")
        url = reverse("profile:profile_select_and_activate", kwargs={"pk": profile.id})
        response = self.client.put(url)
        self.assertEqual(401, response.status_code)

    def test_invalid_credentials(self):
        profile = Profile.objects.get(name="system-generic")
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Basic " + base64.b64encode(b"horst:invalid-password").decode("utf-8"))
        response = client.put(reverse("profile:profile_select_and_activate", kwargs={"pk": profile.pk}))
        self.assertEqual(401, response.status_code)

    def test_multiple_select_requests(self):
        profile = Profile.objects.get(name="system-generic")
        url = reverse("profile:profile_select_and_activate", kwargs={"pk": profile.id})
        first_response = self.api_client.put(url)
        self.assertEqual(200, first_response.status_code)
        first_response_content = json.loads(first_response.content)
        self.assertEqual(profile.pk, first_response_content.get("parent_id"))
        user_profile = Profile.objects.get(pk=first_response_content.get("id"))
        self.assertTrue(user_profile.active_user_profile)

        second_response = self.api_client.put(url)
        self.assertEqual(200, second_response.status_code)
        second_response_content = json.loads(second_response.content)
        self.assertEqual(profile.pk, second_response_content.get("parent_id"))
        self.assertEqual(first_response_content.get("id"), second_response_content.get("id"))
        user_profile = Profile.objects.get(pk=second_response_content.get("id"))
        self.assertTrue(user_profile.active_user_profile)

        profile = Profile.objects.get(name="system-generic-2")
        url = reverse("profile:profile_select_and_activate", kwargs={"pk": profile.id})
        third_response = self.api_client.put(url)
        self.assertEqual(200, third_response.status_code)
        third_response_content = json.loads(third_response.content)
        self.assertEqual(profile.pk, third_response_content.get("parent_id"))
        self.assertNotEqual(first_response_content.get("id"), third_response_content.get("id"))
        self.assertNotEqual(second_response_content.get("id"), third_response_content.get("id"))
        user_profile = Profile.objects.get(pk=third_response_content.get("id"))
        self.assertTrue(user_profile.active_user_profile)
        user_profile_2 = Profile.objects.get(pk=second_response_content.get("id"))
        self.assertFalse(user_profile_2.active_user_profile)




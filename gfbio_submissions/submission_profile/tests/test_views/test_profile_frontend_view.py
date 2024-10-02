# -*- coding: utf-8 -*-
import base64

from django.test import Client
from django.test import TestCase
from rest_framework.test import APIClient

from gfbio_submissions.users.models import User
from ..test_models.test_profile import TestProfile
from ...models.profile import Profile


class TestProfileFrontendView(TestCase):

    @classmethod
    def setUpTestData(cls):
        TestProfile.setUpTestData()

        profile = Profile.objects.create(name="default", target="GENERIC")

        cls.user = User.objects.create_superuser(
            username="joe",
            email="joe@horst.de",
            password="password",
            is_staff=True,
        )
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Basic " + base64.b64encode(b"joe:password").decode("utf-8"))
        cls.api_client = client

        user_2 = User.objects.create_user(
            username="kevin",
            email="kevin@kevin.de",
            password="password",
        )

        profile = Profile.objects.create(name="user-profile-1", target="GENERIC", user=cls.user)

    def test_frontend_view_without_login(self):
        response = self.client.get("/profile/ui")
        self.assertEqual(301, response.status_code)

    def test_frontend_view_with_login(self):
        c = Client()
        c.login(username="kevin", password="password")
        response = c.get("/profile/ui/", {"username": "joe", "password": "password"})
        self.assertEqual(302, response.status_code)

    def test_frontend_view_with_staff_login(self):
        c = Client()
        c.login(username="joe", password="password")
        response = c.get("/profile/ui/", {"username": "joe", "password": "password"})
        self.assertEqual(200, response.status_code)

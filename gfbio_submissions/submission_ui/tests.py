# -*- coding: utf-8 -*-

import base64

from django.contrib.auth.models import Permission
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from gfbio_submissions.generic.models.ResourceCredential import ResourceCredential
from gfbio_submissions.generic.models.SiteConfiguration import SiteConfiguration
from gfbio_submissions.users.models import User


class TestHomeView(TestCase):
    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        cls.site_config = SiteConfiguration.objects.create(
            title="default",
            release_submissions=False,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
        )

        cls.permissions = Permission.objects.filter(
            content_type__app_label="brokerage", codename__endswith="submission"
        )
        user = User.objects.create_user(
            username="horst",
            email="horst@horst.de",
            password="password",
        )
        user.site_configuration = cls.site_config
        user.save()
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Basic " + base64.b64encode(b"horst:password").decode("utf-8"))
        cls.api_client = client
        cls.base_url = reverse("home")

    def test_home_view(self):
        response = self.client.get(self.base_url)
        self.assertEqual(200, response.status_code)
        # check for landingpage-logo as proof that landinpage was hit
        self.assertIn(b'src="/static/images/gfbio_logo_claim_landing.svg"', response.content)

    def test_home_view_authenticated_user(self):
        self.client.login(username="horst", password="password")
        response = self.client.get(self.base_url)
        self.assertEqual(302, response.status_code)
        self.assertNotIn(b'src="/static/images/gfbio_logo_claim_landing.svg"', response.content)

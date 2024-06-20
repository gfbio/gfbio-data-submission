# -*- coding: utf-8 -*-
import base64
import json
import pprint
from pprint import pprint

from django.test import TestCase
from rest_framework.test import APIClient

from gfbio_submissions.users.models import User
from ..test_models.test_profile import TestProfile
from ...models.field import Field
from ...models.profile import Profile


class TestProfileDetailView(TestCase):

    @classmethod
    def setUpTestData(cls):
        TestProfile.setUpTestData()
        profile = Profile.objects.create(name="generic", target="GENERIC")
        for f in Field.objects.all():
            profile.fields.add(f)

        cls.user = User.objects.create_user(
            username="horst",
            email="horst@horst.de",
            password="password",
        )
        profile = Profile.objects.create(name="user-profile-1", target="GENERIC", user=cls.user)
        for f in Field.objects.all():
            profile.fields.add(f)

        # TODO: will change due to removin user on system wide profile
        profile = Profile.objects.create(name="user-system-profile-1", target="GENERIC", user=cls.user, system_wide_profile=True)
        for f in Field.objects.all():
            profile.fields.add(f)


        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Basic " + base64.b64encode(b"horst:password").decode("utf-8"))
        cls.api_client = client

    def test_get_existing_profile(self):
        response = self.client.get("/profile/profile/generic/")
        self.assertEqual(200, response.status_code)

    def test_profile_content(self):
        response = self.client.get("/profile/profile/generic/")
        content = json.loads(response.content)

        keys = content.keys()
        self.assertIn("name", keys)
        self.assertIn("target", keys)
        self.assertIn("form_fields", keys)

        fields = content.get("form_fields", [])
        self.assertGreater(len(fields), 0)

        first_field = fields[0]
        keys = first_field.keys()
        self.assertIn("description", keys)
        self.assertIn("field_id", keys)
        self.assertIn("field_type", keys)
        self.assertIn("title", keys)

        self.assertIn("type", first_field.get("field_type", {}).keys())

    def test_get_non_existing_profile(self):
        response = self.client.get("/profile/profile/foobar/")
        self.assertEqual(404, response.status_code)

    def test_post_profile_root(self):
        response = self.client.post("/profile/profile/", {})
        self.assertEqual(404, response.status_code)

    def test_put_profile_root(self):
        response = self.client.put("/profile/profile/", {})
        self.assertEqual(404, response.status_code)

    def test_post_existing_profile(self):
        response = self.client.post("/profile/profile/generic/", {})
        self.assertEqual(405, response.status_code)

    def test_post_profile(self):
        response = self.client.post("/profile/profile/foo/", {})
        self.assertEqual(405, response.status_code)

    def test_put_on_profile_with_no_user(self):
        response = self.api_client.put("/profile/profile/generic/", {
            "name": "generic-updated",

        }, format="json")
        content = json.loads(response.content)
        pprint(content)
        # was: self.assertEqual(405, response.status_code)
        # now -> no permission on this (valid) profile with valid credentials:
        self.assertEqual(403, response.status_code)

    def test_put_on_user_owned_profile(self):
        response = self.api_client.put("/profile/profile/user-profile-1/", {
            "name": "user-profile-1",
            "target": "ENA",

        }, format="json")
        content = json.loads(response.content)
        print(response.status_code)
        pprint(content)
        self.assertEqual(200, response.status_code)
        self.assertEqual("ENA", content.get("target", "no-target"))

    # TODO: will add code that sets user to none once system_wide_profile is set to true
    def test_put_on_user_owned_system_profile(self):
        profile = Profile.objects.get(name="user-system-profile-1")
        self.assertTrue(profile.system_wide_profile)
        self.assertEqual(self.user, profile.user)
        self.assertEqual("GENERIC", profile.target)

        response = self.api_client.put("/profile/profile/user-system-profile-1/", {
            "name": "user-system-profile-1",
            "target": "ENA",

        }, format="json")
        content = json.loads(response.content)
        print(response.status_code)
        pprint(content)
        self.assertEqual(403, response.status_code)
        profile = Profile.objects.get(name="user-system-profile-1")
        self.assertEqual("GENERIC", profile.target)
        # self.assertEqual(200, response.status_code)
        # self.assertEqual("ENA", content.get("target", "no-target"))

# -*- coding: utf-8 -*-
import base64
import json
import pprint
from pprint import pprint

from django.test import TestCase
from rest_framework.test import APIClient

from gfbio_submissions.users.models import User
from ..test_models.test_profile import TestProfile
# from ...models import ProfileFieldExtension
from ...models.field import Field
from ...models.profile import Profile


class TestProfileDetailView(TestCase):

    @classmethod
    def setUpTestData(cls):
        TestProfile.setUpTestData()
        profile = Profile.objects.create(name="generic", target="GENERIC")
        # for f in Field.objects.all():
        #     # profile.profile_fields.add(f)
        #     ProfileFieldExtension.objects.add_from_field(f, profile)

        cls.user = User.objects.get(username="horst")
        # cls.user = User.objects.create_user(
        #     username="horst",
        #     email="horst@horst.de",
        #     password="password",
        # )

        user_2 = User.objects.create_user(
            username="kevin",
            email="kevin@kevin.de",
            password="password",
        )

        profile = Profile.objects.create(name="user-profile-1", target="GENERIC", user=cls.user)
        # for f in Field.objects.all():
        #     # profile.profile_fields.add(f)
        #     ProfileFieldExtension.objects.add_from_field(f, profile)

        # TODO: will change due to removin user on system wide profile
        profile = Profile.objects.create(name="user-system-profile-1", target="GENERIC", user=cls.user,
                                         system_wide_profile=True)
        # for f in Field.objects.all():
        #     # profile.profile_fields.add(f)
        #     ProfileFieldExtension.objects.add_from_field(f, profile)

        profile = Profile.objects.create(name="system-profile-x", target="GENERIC", system_wide_profile=True)
        # for f in Field.objects.all():
        #     # profile.profile_fields.add(f)
        #     ProfileFieldExtension.objects.add_from_field(f, profile)

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Basic " + base64.b64encode(b"horst:password").decode("utf-8"))
        cls.api_client = client

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Basic " + base64.b64encode(b"kevin:password").decode("utf-8"))
        cls.api_client_2 = client

    def test_get_existing_profile(self):
        response = self.client.get("/profile/profile/generic/")
        self.assertEqual(200, response.status_code)

    def test_profile_content(self):
        response = self.client.get("/profile/profile/generic/")
        content = json.loads(response.content)
        # print(response.status_code)
        pprint(content)

        keys = content.keys()
        self.assertIn("name", keys)
        self.assertIn("target", keys)
        self.assertIn("form_fields", keys)

        fields = content.get("form_fields", [])
        self.assertGreater(len(fields), 0)

        first_form_field = fields[0]
        form_field_keys = first_form_field.keys()
        self.assertIn("field", form_field_keys)
        self.assertIn("default", form_field_keys)
        self.assertIn("mandatory", form_field_keys)
        self.assertIn("order", form_field_keys)
        self.assertIn("placeholder", form_field_keys)
        self.assertIn("system_wide_mandatory", form_field_keys)
        self.assertIn("visible", form_field_keys)

        field = first_form_field["field"]
        field_keys = field.keys()
        self.assertIn("description", field_keys)
        self.assertIn("field_id", field_keys)
        self.assertIn("field_type", field_keys)
        self.assertIn("title", field_keys)
        self.assertIn("options", field_keys)
        self.assertIn("order", field_keys)
        self.assertIn("position", field_keys)
        self.assertIn("type", field.get("field_type", {}).keys())

    def test_get_non_existing_profile(self):
        response = self.client.get("/profile/profile/foobar/")
        self.assertEqual(404, response.status_code)

    def test_get_user_profile_without_credentials(self):
        response = self.client.get("/profile/profile/user-profile-1/")
        self.assertEqual(401, response.status_code)

    def test_get_other_users_profile(self):
        response = self.api_client_2.get("/profile/profile/user-profile-1/")
        self.assertEqual(403, response.status_code)

    def test_get_system_profile_without_credentials(self):
        response = self.client.get("/profile/profile/system-profile-x/")
        self.assertEqual(200, response.status_code)

    def test_get_system_profile_with_credentials(self):
        response = self.api_client.get("/profile/profile/system-profile-x/")
        self.assertEqual(200, response.status_code)

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
        self.assertEqual(403, response.status_code)

    def test_put_on_user_owned_profile(self):
        response = self.api_client.put("/profile/profile/user-profile-1/", {
            "name": "user-profile-1",
            "target": "ENA",

        }, format="json")
        content = json.loads(response.content)
        self.assertEqual(200, response.status_code)
        self.assertEqual("ENA", content.get("target", "no-target"))

    def test_put_with_system_wide_prefix(self):
        response = self.api_client.put("/profile/profile/user-profile-1/", {
            "name": "systemuser-profile-1",

        }, format="json")
        content = json.loads(response.content)
        self.assertEqual(400, response.status_code)
        self.assertEqual(["Profile names are not allowed to beging with system"], content.get("name", "no-name"))

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
        self.assertEqual(403, response.status_code)
        profile = Profile.objects.get(name="user-system-profile-1")
        self.assertEqual("GENERIC", profile.target)

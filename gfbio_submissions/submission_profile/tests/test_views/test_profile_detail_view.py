# -*- coding: utf-8 -*-
import json
import pprint
from pprint import pprint

from django.test import TestCase

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

    def test_get_existing_profile(self):
        response = self.client.get("/profile/profile/generic/")
        self.assertEqual(200, response.status_code)

    def test_profile_content(self):
        response = self.client.get("/profile/profile/generic/")
        content = json.loads(response.content)

        keys = content.keys()
        self.assertIn("name", keys)
        self.assertIn("target", keys)
        self.assertIn("fields", keys)

        fields = content.get("fields", [])
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

    def test_put_existing_profile(self):
        response = self.client.put("/profile/profile/generic/", {})
        self.assertEqual(405, response.status_code)

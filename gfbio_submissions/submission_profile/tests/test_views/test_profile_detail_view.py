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
        cls.profile = Profile.objects.create(name="generic", target="GENERIC")
        for f in Field.objects.all():
            cls.profile.fields.add(f)

    def test_simple_get(self):
        response = self.client.get("/profile/profile/generic/")
        content = json.loads(response.content)
        pprint(content)

# -*- coding: utf-8 -*-
import json
from pprint import pprint
from rest_framework.renderers import JSONRenderer

from django.test import TestCase

from ..test_models.test_profile_field import TestProfileField
from ...configuration.settings import SYSTEM_WIDE_PROFILE_NAME_PREFIX
from ...models.profile import Profile
from ...serializers.profile_serializer import ProfileSerializer


class TestProfileSerializer(TestCase):

    @classmethod
    def setUpTestData(cls):
        TestProfileField.setUpTestData()

    def test_serializer(self):
        serializer = ProfileSerializer(data={"name": "foo", "target": "GENERIC"})
        valid = serializer.is_valid()
        self.assertTrue(valid)
        serializer.save()

    def test_unique_name(self):
        serializer = ProfileSerializer(data={"name": "foo", "target": "GENERIC"})
        serializer.is_valid()
        serializer.save()
        serializer = ProfileSerializer(data={"name": "foo", "target": "GENERIC"})
        valid = serializer.is_valid()
        self.assertFalse(valid)

    def test_system_wide_profile_name(self):
        serializer = ProfileSerializer(data={"name": f"{SYSTEM_WIDE_PROFILE_NAME_PREFIX}foo", "target": "GENERIC"})
        valid = serializer.is_valid()
        self.assertFalse(valid)

    def test_json_content(self):
        # FIXME: DASS-2101 adapt fields serialization to refactored models
        profile = Profile.objects.first()
        serializer = ProfileSerializer(profile)
        data = json.loads(JSONRenderer().render(serializer.data))
        pprint(data)

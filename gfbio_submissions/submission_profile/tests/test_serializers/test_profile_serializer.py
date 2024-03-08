# -*- coding: utf-8 -*-

from django.test import TestCase

from ...serializers.profile_serializer import ProfileSerializer


class TestProfileSerializer(TestCase):

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


# -*- coding: utf-8 -*-

from django.test import TestCase

from ..test_models.test_profile import TestProfile
from ...models.field import Field
from ...models.profile import Profile
from ...serializers.profile_serializer import ProfileSerializer


class TestProfileSerializer(TestCase):

    @classmethod
    def setUpTestData(cls):
        TestProfile.setUpTestData()
        cls.profile = Profile.objects.create(name="profile-1")
        for f in Field.objects.all():
            profile.fields.add(f)

    # TODO: may remove later
    def test_db_content(self):
        self.assertEqual(1, len(Profile.objects.all()))
        self.assertEqual(3, len(Profile.objects.first().fields.all()))

    def test_serializer(self):
        # https://www.django-rest-framework.org/api-guide/relations/#writable-nested-serializers
        serializer = ProfileSerializer(data=cls.profile)


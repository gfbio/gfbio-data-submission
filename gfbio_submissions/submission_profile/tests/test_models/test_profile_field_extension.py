# -*- coding: utf-8 -*-
from pprint import pprint
from unittest import skip

from django.test import TestCase

from ...models.field import Field
from ...models.profile import Profile
from ...models.profile_field_extension import ProfileFieldExtension
from ...models.field_type import FieldType


class TestProfileFieldExtension(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.field_type = FieldType.objects.create(type="any")
        cls.field = Field.objects.create(title="a title for a field", description="a text",
                                         field_type=cls.field_type)
        cls.profile = Profile.objects.create(name="profile-1")

    def test_instance(self):
        profile_field_extension = ProfileFieldExtension.objects.create(
            profile=self.profile, field=self.field)
        self.assertIsInstance(profile_field_extension, ProfileFieldExtension)
        self.assertEqual(1 , len(ProfileFieldExtension.objects.all()))

    def test_clone(self):
        profile_field_1 = ProfileFieldExtension.objects.create(
            profile=self.profile, field=self.field)
        profile_field_1.clone(self.profile)
        profile_fields = ProfileFieldExtension.objects.all()
        self.assertEqual(2, len(profile_fields))
        self.assertEqual(profile_fields[0].profile, profile_fields[1].profile)
        self.assertNotEqual(profile_fields[0].pk, profile_fields[1].pk)

    def test_add_system_wide_mandatory_field(self):
        self.assertEqual(0, len(ProfileFieldExtension.objects.all()))
        self.assertEqual(1, len(Profile.objects.all()))
        field = Field.objects.create(title="a title for a field", description="a text",
                                     field_type=self.field_type, system_wide_mandatory=True)
        self.assertEqual(1, len(ProfileFieldExtension.objects.all()))
        self.assertEqual(1, len(Profile.objects.all()))

    def test_set_system_wide_mandatory_field(self):
        self.assertEqual(0, len(ProfileFieldExtension.objects.all()))
        self.assertEqual(1, len(Profile.objects.all()))
        self.field.system_wide_mandatory = True
        self.field.save()
        self.assertEqual(1, len(ProfileFieldExtension.objects.all()))
        self.assertEqual(1, len(Profile.objects.all()))


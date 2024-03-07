# -*- coding: utf-8 -*-
from django.test import TestCase

from ...models.field import Field
from ...models.field_type import FieldType
from ...models.profile import Profile


class TestProfile(TestCase):

    @classmethod
    def setUpTestData(cls):
        field_type_1 = FieldType.objects.create(type="input-text")
        field_type_2 = FieldType.objects.create(type="select")

        cls.field_1 = Field.objects.create(title="a text input", field_type=field_type_1)
        cls.field_2 = Field.objects.create(title="a select field", field_type=field_type_2)
        cls.field_3 = Field.objects.create(title="another text input", field_type=field_type_1)

    def test_simple_instance_creation(self):
        obj = Profile.objects.create(name="profile-1")
        self.assertIsInstance(obj, Profile)
        self.assertEqual("profile-1", obj.name)

    def test_fields(self):
        profile = Profile.objects.create(name="profile-1")
        profile.fields.add(self.field_1)
        profile.fields.add(self.field_2)
        profile.fields.add(self.field_3)
        self.assertEqual(3, len(profile.fields.all()))

    def test_multi_add_fields(self):
        profile = Profile.objects.create(name="profile-1")
        profile.fields.add(self.field_1)
        profile.fields.add(self.field_1)
        self.assertEqual(1, len(profile.fields.all()))

# -*- coding: utf-8 -*-
from time import time
from unittest import skip

from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ENA, GENERIC
from ...models.field import Field
from ...models.field_type import FieldType
from ...models.profile import Profile


class TestProfile(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.field_type_1 = FieldType.objects.create(type="input-text")
        field_type_2 = FieldType.objects.create(type="select")

        cls.field_1 = Field.objects.create(field_name="field_1", title="a text input", description="Lorem ipsum", field_type=cls.field_type_1)
        cls.field_2 = Field.objects.create(field_name="field_1", title="a select field", description="Dolor sit", field_type=field_type_2)
        cls.field_3 = Field.objects.create(title="another text input", description="Amet consectetur",
                                           field_type=cls.field_type_1)

        cls.system_wide_mandatory_field = Field.objects.create(field_name="mandatory-field",
                                                               title="Mandatory",
                                                               description="you have to enter something here ...",
                                                               field_type=cls.field_type_1, system_wide_mandatory=True)

    def test_simple_profile_creation(self):
        obj = Profile.objects.create(name="profile-1")
        self.assertIsInstance(obj, Profile)
        self.assertEqual("profile-1", obj.name)

    def test_profile_contains_system_wide_mandatory(self):
        obj = Profile.objects.create(name="profile-1")
        self.assertEqual(1, len(obj.all_fields()))
        self.assertTrue(obj.all_fields().first().system_wide_mandatory)

    def test_profile_multiple_saves(self):
        profile = Profile.objects.create(name="profile-1")
        self.assertEqual(1, len(profile.all_fields()))
        profile.target = ENA
        profile.save()
        self.assertEqual(1, len(profile.all_fields()))
        profile.target = GENERIC
        profile.save()
        self.assertEqual(1, len(profile.all_fields()))

    def test_profile_update_on_system_wide_mandatory_change(self):
        profile = Profile.objects.create(name="profile-1")
        self.assertEqual(1, len(profile.all_fields()))
        self.field_1.system_wide_mandatory = True
        self.field_1.save()
        self.assertEqual(2, len(profile.all_fields()))
        for f in profile.fields.all():
            self.assertTrue(f.system_wide_mandatory)

    def test_profile_update_on_system_wide_mandatory_add(self):
        profile = Profile.objects.create(name="profile-1")
        self.assertEqual(1, len(profile.all_fields()))
        Field.objects.create(field_name="new-mandatory-field",
                                     title="Mandatory",
                                     description="you have to enter something here ...",
                                     field_type=self.field_type_1, system_wide_mandatory=True)
        self.assertEqual(2, len(profile.all_fields()))
        for f in profile.fields.all():
            self.assertTrue(f.system_wide_mandatory)

    @skip("switch on manually just to get an impression on performance")
    def test_large_number_of_profile_updates_on_system_wide_mandatory_change(self):
        start = time()
        self.assertEqual(1, len(Field.objects.filter(system_wide_mandatory=True)))
        for i in range(10000):
            profile = Profile.objects.create(name="profile-{x}".format(x=i))
        self.field_1.system_wide_mandatory = True
        self.field_1.save()
        # for p in Profile.objects.all():
        #     self.assertEqual(2, len(p.fields.filter(system_wide_mandatory=True)))
        elapsed = time() - start
        print('elapsed time: {}'.format(round(elapsed, 4)))

    @skip("switch on manually just to get an impression on performance")
    def test_large_number_of_profile_updates_on_system_wide_mandatory_add(self):
        start = time()
        self.assertEqual(1, len(Field.objects.filter(system_wide_mandatory=True)))
        for i in range(10000):
            profile = Profile.objects.create(name="profile-{x}".format(x=i))
        Field.objects.create(field_name="new-mandatory-field",
                             title="Mandatory",
                             description="you have to enter something here ...",
                             field_type=self.field_type_1, system_wide_mandatory=True)
        # for p in Profile.objects.all():
        #     self.assertEqual(2, len(p.fields.filter(system_wide_mandatory=True)))
        elapsed = time() - start
        print('elapsed time: {}'.format(round(elapsed, 4)))

    def test_field_add_plus_save(self):
        profile = Profile.objects.create(name="profile-1")
        profile.fields.add(self.field_1)
        self.assertEqual(2, len(profile.fields.all()))
        profile.target = ENA
        profile.save()
        self.assertEqual(2, len(profile.fields.all()))

    def test_fields(self):
        profile = Profile.objects.create(name="profile-1")
        profile.fields.add(self.field_1)
        profile.fields.add(self.field_2)
        profile.fields.add(self.field_3)
        # 3 above plus 1 system wide mandatory field
        self.assertEqual(4, len(profile.fields.all()))

    def test_multi_add_fields(self):
        profile = Profile.objects.create(name="profile-1")
        profile.fields.add(self.field_1)
        profile.fields.add(self.field_1)
        # 1 above plus 1 system wide mandatory field
        self.assertEqual(2, len(profile.fields.all()))

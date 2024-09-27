# -*- coding: utf-8 -*-
from time import time
from unittest import skip

from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ENA, GENERIC
from gfbio_submissions.users.models import User
from ...models import ProfileField
# from ...models import ProfileFieldExtension
from ...models.field import Field
from ...models.field_type import FieldType
from ...models.profile import Profile


class TestProfile(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="horst",
            email="horst@horst.de",
            password="password",
        )
        cls.field_type_1 = FieldType.objects.create(type="input-text")
        field_type_2 = FieldType.objects.create(type="select")

        cls.field_1 = Field.objects.create(field_name="field_1", title="a text input",
                                           description="Lorem ipsum", field_type=cls.field_type_1)
        cls.field_2 = Field.objects.create(field_name="field_2", title="a select field",
                                           description="Dolor sit", field_type=field_type_2)

        cls.field_3 = Field.objects.create(field_name="field_3", title="another text input",
                                           description="Amet consectetur",
                                           field_type=cls.field_type_1)

        cls.system_wide_mandatory_field = Field.objects.create(field_name="system-wide-mandatory-field",
                                                               title="Mandatory",
                                                               description="you have to enter something here ...",
                                                               field_type=cls.field_type_1,
                                                               system_wide_mandatory=True)

    def test_simple_profile_creation(self):
        obj = Profile.objects.create(name="profile-1")
        self.assertIsInstance(obj, Profile)
        self.assertEqual("profile-1", obj.name)

    def test_clone(self):
        p1 = Profile.objects.create(name="profile-1")
        self.assertEqual("profile-1", p1.name)
        p2 = p1.clone_for_user(self.user, "p2")
        self.assertEqual("p2", p2.name)
        self.assertEqual(2, len(Profile.objects.all()))

    def test_clone_related_fields(self):
        p1 = Profile.objects.create(name="profile-1")
        ProfileField.objects.update_or_create(
            profile=p1, field=self.field_1,
            defaults={"default": "default for field_1 in p1"})
        p1.fields.add(self.field_2)

        self.assertEqual(1, Profile.objects.count())
        self.assertEqual(4, Field.objects.count())
        self.assertEqual(3, ProfileField.objects.count())

        # 2 added plus on system_wide_mandatory
        self.assertEqual(3, p1.fields.count())
        self.assertEqual(3, p1.profilefield_set.count())
        self.assertEqual(3, len(p1.all_fields()))
        self.assertEqual(3, len(p1.form_fields()))

        # clone returns new instance for convienince,
        # but in general the cloning instance becomes the clone in the process
        p2 = p1.clone_for_user(self.user, "p2")
        # get p1 back again for further tests
        p1 = Profile.objects.get(name="profile-1")

        self.assertEqual(2, Profile.objects.count())
        self.assertEqual(4, Field.objects.count())
        self.assertEqual(6, ProfileField.objects.count())

        self.assertEqual(p1.fields.count(), p2.fields.count())
        self.assertEqual(p1.profilefield_set.count(), p2.profilefield_set.count())
        self.assertEqual(len(p1.all_fields()), len(p2.all_fields()))
        self.assertEqual(len(p1.form_fields()), len(p2.form_fields()))

        for f in p2.fields.all():
            self.assertIn(f, p1.fields.all())
        for pf in p2.profilefield_set.all():
            self.assertIn(pf.field, p1.fields.all())

        p1_form_fields = p1.form_fields()
        p2_form_fields = p2.form_fields()
        for i in range(0, len(p2_form_fields)):
            self.assertEqual(p2_form_fields[i].field.pk, p1_form_fields[i].field.pk)
            self.assertGreater(p2_form_fields[i].pk, p1_form_fields[i].pk)
            self.assertEqual(p2_form_fields[i].default, p1_form_fields[i].default)

        # ProfileFieldExtension.objects.create(
        #     field=self.field_1,
        #     profile=p1,
        # )
        # self.assertEqual(1, len(p1.profilefieldextension_set.filter(system_wide_mandatory=True)))
        # self.assertEqual(1, len(p1.profilefieldextension_set.filter(system_wide_mandatory=False)))
        #
        # p2 = p1.clone_for_user(self.user, "p2")
        # self.assertEqual(2, len(Profile.objects.all()))
        #
        # p1 = Profile.objects.get(name="profile-1")
        # self.assertNotEqual(p1.profilefieldextension_set.all(), p2.profilefieldextension_set.all())
        #
        # self.assertEqual(1, len(p2.profilefieldextension_set.filter(system_wide_mandatory=True)))
        # self.assertEqual(1, len(p2.profilefieldextension_set.filter(system_wide_mandatory=False)))

    def test_profile_contains_system_wide_mandatory(self):
        obj = Profile.objects.create(name="profile-1")
        self.assertEqual(1, len(obj.fields.all()))
        self.assertEqual(1, len(obj.all_fields()))
        self.assertTrue(obj.all_fields().first().mandatory)
        self.assertTrue(obj.all_fields().first().field.system_wide_mandatory)

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
        # for f in profile.profilefieldextension_set.all():
        #     self.assertTrue(f.system_wide_mandatory)
        #     self.assertTrue(f.mandatory)
        self.field_1.system_wide_mandatory = True
        self.field_1.save()
        self.assertEqual(2, len(profile.all_fields()))
        for f in profile.all_fields():
            self.assertTrue(f.field.system_wide_mandatory)
        # for f in profile.profilefieldextension_set.all():
        #     self.assertTrue(f.system_wide_mandatory)
        #     self.assertTrue(f.mandatory)

    def test_profile_update_system_wide_mandatory_already_contained(self):
        profile = Profile.objects.create(name="profile-x")
        self.assertFalse(self.field_1.system_wide_mandatory)
        profile.fields.add(self.field_1)
        self.assertEqual(2, len(profile.all_fields()))
        self.field_1.system_wide_mandatory = True
        self.field_1.save()
        self.assertTrue(self.field_1.system_wide_mandatory)
        for f in profile.all_fields():
            self.assertTrue(f.field.system_wide_mandatory)

    def test_profile_update_on_system_wide_mandatory_add(self):
        profile = Profile.objects.create(name="profile-1")
        self.assertEqual(1, len(profile.all_fields()))
        Field.objects.create(field_name="new-mandatory-field",
                             title="Mandatory",
                             description="you have to enter something here ...",
                             field_type=self.field_type_1, system_wide_mandatory=True)
        self.assertEqual(2, len(profile.all_fields()))
        for f in profile.all_fields():
            self.assertTrue(f.field.system_wide_mandatory)
        # for f in profile.profilefieldextension_set.all():
        #     self.assertTrue(f.system_wide_mandatory)
        #     self.assertTrue(f.mandatory)

    @skip("switch on manually just to get an impression on performance")
    def test_large_number_of_profile_updates_on_system_wide_mandatory_change(self):
        start = time()
        self.assertEqual(1, len(Field.objects.filter(system_wide_mandatory=True)))
        for i in range(1000):
            profile = Profile.objects.create(name="profile-{x}".format(x=i))
        self.field_1.system_wide_mandatory = True
        self.field_1.save()
        elapsed = time() - start
        print('elapsed time: {}'.format(round(elapsed, 4)))

    @skip("switch on manually just to get an impression on performance")
    def test_large_number_of_profile_updates_on_system_wide_mandatory_add(self):
        start = time()
        self.assertEqual(1, len(Field.objects.filter(system_wide_mandatory=True)))
        for i in range(1000):
            profile = Profile.objects.create(name="profile-{x}".format(x=i))
        Field.objects.create(field_name="new-mandatory-field",
                             title="Mandatory",
                             description="you have to enter something here ...",
                             field_type=self.field_type_1, system_wide_mandatory=True)
        elapsed = time() - start
        print('elapsed time: {}'.format(round(elapsed, 4)))

    # def test_field_add_plus_save(self):
    #     profile = Profile.objects.create(name="profile-1")
    #     # profile.profile_fields.add(self.field_1)
    #     ProfileFieldExtension.objects.create(
    #         field=self.field_1,
    #         profile=profile,
    #     )
    #     self.assertEqual(2, len(profile.profilefieldextension_set.all()))
    #     profile.target = ENA
    #     profile.save()
    #     self.assertEqual(2, len(profile.profilefieldextension_set.all()))

    # def test_fields(self):
    #     profile = Profile.objects.create(name="profile-1")
    #     # TODO: wrap in manager method (but Profile manager to get add like in M2M) with exceptions and return
    #     ProfileFieldExtension.objects.create(
    #         field=self.field_1,
    #         profile=profile,
    #     )
    #     ProfileFieldExtension.objects.create(
    #         field=self.field_2,
    #         profile=profile,
    #     )
    #     ProfileFieldExtension.objects.create(
    #         field=self.field_3,
    #         profile=profile,
    #     )
    #
    #     # 3 above plus 1 system wide mandatory field
    #     self.assertEqual(4, len(profile.profilefieldextension_set.all()))

    # def test_multi_add_fields(self):
    #     profile = Profile.objects.create(name="profile-1")
    #     ProfileFieldExtension.objects.add_from_field(self.field_1, profile)
    #     ProfileFieldExtension.objects.add_from_field(self.field_1, profile)
    #     # 1 above plus 1 system wide mandatory field
    #     self.assertEqual(2, len(profile.profilefieldextension_set.all()))

# -*- coding: utf-8 -*-

from django.test import TestCase

from gfbio_submissions.users.models import User
from ...models import ProfileFieldExtension
from ...models.field import Field
from ...models.field_type import FieldType
from ...models.profile import Profile


class TestProfileManager(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="horst",
            email="horst@horst.de",
            password="password",
        )
        cls.user_2 = User.objects.create_user(
            username="kevin",
            email="kevin@kevin.de",
            password="password",
        )
        cls.field_type_1 = FieldType.objects.create(type="input-text")
        field_type_2 = FieldType.objects.create(type="select")

        cls.field_1 = Field.objects.create(field_name="field_1", title="a text input",
                                           description="Lorem ipsum", field_type=cls.field_type_1)
        cls.field_2 = Field.objects.create(field_name="field_1", title="a select field",
                                           description="Dolor sit", field_type=field_type_2)

        cls.field_3 = Field.objects.create(title="another text input",
                                           description="Amet consectetur",
                                           field_type=cls.field_type_1)

        cls.system_wide_mandatory_field = Field.objects.create(field_name="mandatory-field",
                                                               title="Mandatory",
                                                               description="you have to enter something here ...",
                                                               field_type=cls.field_type_1,
                                                               system_wide_mandatory=True)
        p = Profile.objects.create(name="profile-1", user=cls.user)
        ProfileFieldExtension.objects.add_from_field(
            field=cls.field_1,
            profile=p,
        )
        p = Profile.objects.create(name="profile-2", user=cls.user, active_user_profile=True)
        ProfileFieldExtension.objects.add_from_field(
            field=cls.field_1,
            profile=p,
        )
        p = Profile.objects.create(name="profile-3", user=cls.user)
        ProfileFieldExtension.objects.add_from_field(
            field=cls.field_1,
            profile=p,
        )

    def test_db_content(self):
        self.assertEqual(3, len(Profile.objects.all()))
        self.assertEqual(1, len(Profile.objects.filter(active_user_profile=True)))
        self.assertEqual(2, len(Profile.objects.filter(active_user_profile=False)))

    def test_activate_user_profile(self):
        self.assertEqual(1, len(Profile.objects.filter(user=self.user).filter(active_user_profile=True)))
        active_pk = Profile.objects.filter(user=self.user).filter(active_user_profile=True).first().pk
        first_inactive_pk = Profile.objects.filter(user=self.user).filter(active_user_profile=False).first().pk
        self.assertNotEqual(active_pk, first_inactive_pk)
        Profile.objects.activate_user_profile(first_inactive_pk)
        self.assertTrue(Profile.objects.get(pk=first_inactive_pk).active_user_profile)
        self.assertFalse(Profile.objects.get(pk=active_pk).active_user_profile)
        self.assertEqual(1, len(Profile.objects.filter(active_user_profile=True)))

    def test_get_active_profile_double_entry(self):
        Profile.objects.create(name="profile-2-1", user=self.user_2, active_user_profile=True)
        # Profile save takes care that there is only on active profile per user, in this case the last profile
        # created with active_user_profile = True
        Profile.objects.create(name="profile-2-2", user=self.user_2, active_user_profile=True)
        self.assertEqual(1, len(Profile.objects.filter(user=self.user_2).filter(active_user_profile=True)))
        active = Profile.objects.get_active_user_profile(user=self.user_2)
        self.assertIsNotNone(active)

    def test_get_active_profile_no_entry(self):
        self.assertEqual(0, len(Profile.objects.filter(user=self.user_2).filter(active_user_profile=True)))
        active = Profile.objects.get_active_user_profile(user=self.user_2)
        self.assertIsNone(active)

    def test_get_active_user_profile(self):
        self.assertEqual(1, len(Profile.objects.filter(user=self.user).filter(active_user_profile=True)))
        active = Profile.objects.get_active_user_profile(user=self.user)
        self.assertIsInstance(active, Profile)

    def test_get_active_user_profile_name(self):
        self.assertEqual(1, len(Profile.objects.filter(user=self.user).filter(active_user_profile=True)))
        active = Profile.objects.get_active_user_profile_name(user=self.user)
        self.assertEqual("profile-2", active)

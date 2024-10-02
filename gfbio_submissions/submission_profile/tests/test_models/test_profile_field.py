# -*- coding: utf-8 -*-

from django.test import TestCase

from gfbio_submissions.users.models import User
from ...models.field import Field
from ...models.field_type import FieldType
from ...models.profile import Profile
from ...models.profile_field import ProfileField


class TestProfileField(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="horst",
            email="horst@horst.de",
            password="password",
        )
        cls.field_type_1 = FieldType.objects.create(type="input-text")
        field_type_2 = FieldType.objects.create(type="select")

        cls.f1 = Field.objects.create(
            field_name="f1", title="a text input",
            description="Lorem ipsum", field_type=cls.field_type_1)
        cls.f2 = Field.objects.create(
            field_name="f2", title="a select field",
            description="Dolor sit", field_type=field_type_2)
        cls.f3 = Field.objects.create(
            field_name="f3", title="another text input", description="Amet consectetur",
            field_type=cls.field_type_1)
        cls.mandatory_field = Field.objects.create(
            field_name="mandatory-field",
            title="Mandatory",
            description="you have to enter something here ...",
            field_type=cls.field_type_1,
            system_wide_mandatory=True)

        p1 = Profile.objects.create(name="p1")
        cls.pf1 = ProfileField.objects.create(
            field=cls.f1,
            profile=p1,
            visible=True,
            default="f1 default for p1"
        )
        p1.fields.add(cls.f3)

    def test_db_relations(self):
        p1 = Profile.objects.get(name="p1")
        self.assertEqual(4, len(Field.objects.all()))
        self.assertEqual(3, len(p1.profilefield_set.all()))
        self.assertEqual(3, len(p1.fields.all()))
        self.assertGreater(
            len(p1.profilefield_set.get(field__pk=self.f1.pk).default),
            0
        )

    def test_values_on_create(self):
        profile = Profile.objects.create(name="profile", user=self.user)
        profile.fields.add(self.f1)
        profile.fields.add(self.f2)
        self.assertEqual(3, len(profile.profilefield_set.all()))

        profile_field_f1 = ProfileField.objects.create(
            field=self.f1,
            profile=profile,
            visible=False,
            default="f1 default for p1"
        )
        profile_field = profile.profilefield_set.get(pk=profile_field_f1.pk)
        self.assertFalse(profile_field.visible)
        self.assertGreater(len(profile_field.default), 0)

        profile_field = profile.profilefield_set.get(field__pk=self.f2.pk)
        self.assertTrue(profile_field.visible)
        self.assertTrue(profile_field.mandatory)
        self.assertEqual("", profile_field.default)

    def test_update_system_wide_mandatory(self):
        profile = Profile.objects.create(name="profile", user=self.user)
        profile.fields.add(self.f1)
        self.assertEqual(2, len(profile.profilefield_set.all()))
        profile_field = profile.profilefield_set.get(field=self.mandatory_field)
        profile_field.visible = False
        profile_field.mandatory = False
        profile_field.default = "new default"
        profile_field.save()
        self.assertTrue(profile_field.visible)

    def test_update_for_profile_field(self):
        p2 = Profile.objects.create(name="p2", user=self.user)
        # system_wide_mandatory field is included in any case, compare setUp() above
        p2.fields.add(self.f1)
        p2.fields.add(self.f2)
        self.assertEqual(3, len(p2.profilefield_set.all()))
        self.assertEqual(3, len(p2.fields.all()))

        obj, created = ProfileField.objects.update_or_create(
            profile=p2, field=self.f1,
            defaults={"default": "updated default for f1 in p2"})
        self.assertFalse(created)

        obj, created = ProfileField.objects.update_or_create(
            profile=p2, field=p2.fields.get(id=self.f1.id),
            defaults={"default": "more updated default for f1 in p2"})
        self.assertFalse(created)

        self.assertEqual(3, len(p2.profilefield_set.all()))
        self.assertEqual(3, len(p2.fields.all()))

        field_to_update = p2.profilefield_set.get(field_id=self.f1.id)
        field_to_update.default = "direct updated default for f1 in p2"
        field_to_update.save()

        self.assertEqual(3, len(p2.profilefield_set.all()))
        self.assertEqual(3, len(p2.fields.all()))

# -*- coding: utf-8 -*-
from django.test import TestCase

from ...models.profile import Profile


class TestProfile(TestCase):

    def test_simple_instance_creation(self):
        obj = Profile.objects.create(name="profile-1")
        self.assertIsInstance(obj, Profile)
        self.assertEqual("profile-1", obj.name)

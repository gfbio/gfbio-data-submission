# -*- coding: utf-8 -*-
import os
from unittest import mock

import environ
from django.test import TestCase

from config.settings.base import ADMINS, DJANGO_ADMINS

env = environ.Env()


class EnvVariablesDefaultsTest(TestCase):
    def test_django_admins_default(self):
        admins = DJANGO_ADMINS
        self.assertTrue(type(admins) == list)
        self.assertIn("Marc Weber:mweber@gfbio.org", admins)
        self.assertIn("Ivaylo Kostadinov:ikostadi@gfbio.org", admins)
        self.assertIn("Deniss Marinuks:d.marinuks@jacobs-university.de", admins)

    def test_default_admins(self):
        admins = ADMINS
        self.assertListEqual(
            [
                ("Marc Weber", "mweber@gfbio.org"),
                ("Ivaylo Kostadinov", "ikostadi@gfbio.org"),
                ("Deniss Marinuks", "d.marinuks@jacobs-university.de"),
            ],
            admins,
        )


class EnvVariablesTest(TestCase):
    @mock.patch.dict(os.environ, {"DJANGO_ADMINS": "John Doe:jdoe@it.de"})
    def test_django_admins_from_env(self):
        admins = env.list("DJANGO_ADMINS")
        print(admins)

    @mock.patch.dict(os.environ, {"DJANGO_ADMINS": "John Doe:jdoe@it.de"})
    def test_admin_from_env(self):
        admins = env.list("DJANGO_ADMINS")
        admins = [("""{}""".format(x.split(":")[0]), "{}".format(x.split(":")[1])) for x in admins]
        self.assertListEqual([("John Doe", "jdoe@it.de")], admins)

    @mock.patch.dict(os.environ, {"DJANGO_ADMINS": "John Doe:jdoe@it.de,Joe Plumber:jp@pl.com"})
    def test_admins_from_env(self):
        admins = env.list("DJANGO_ADMINS")
        admins = [("""{}""".format(x.split(":")[0]), "{}".format(x.split(":")[1])) for x in admins]
        self.assertListEqual([("John Doe", "jdoe@it.de"), ("Joe Plumber", "jp@pl.com")], admins)

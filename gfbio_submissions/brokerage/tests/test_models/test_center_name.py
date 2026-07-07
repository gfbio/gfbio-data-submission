# -*- coding: utf-8 -*-
from django.core.exceptions import ValidationError
from django.test import TestCase

from ...models.center_name import CenterName


class CenterNameTest(TestCase):
    def test_instance(self):
        cn = CenterName()
        cn.center_name = "A Center"
        cn.save()
        self.assertEqual("A Center", cn.center_name)
        self.assertEqual(1, len(CenterName.objects.all()))

    def test_default_name(self):
        cn = CenterName()
        self.assertEqual("", cn.center_name)

    def test_str_returns_stored_value(self):
        cn, created = CenterName.objects.get_or_create(center_name="GBOL")
        self.assertEqual("GBOL", str(cn))

    def test_clean_rejects_empty_center_name(self):
        with self.assertRaises(ValidationError):
            CenterName(center_name="").full_clean()

    def test_clean_rejects_whitespace_center_name(self):
        with self.assertRaises(ValidationError):
            CenterName(center_name="   ").full_clean()

    def test_clean_accepts_non_empty(self):
        # full_clean must not raise for a curated, non-empty centre.
        CenterName(center_name="GBOL").full_clean()

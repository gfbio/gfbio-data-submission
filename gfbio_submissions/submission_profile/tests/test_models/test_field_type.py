# -*- coding: utf-8 -*-
from django.test import TestCase

from ...models.field_type import FieldType


class TestFieldType(TestCase):


    def test_simple_instance_creation(self):
        obj = FieldType.objects.create(type="any")
        self.assertIsInstance(obj, FieldType)
        self.assertEqual("any", obj.type)

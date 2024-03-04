# -*- coding: utf-8 -*-
from django.test import TestCase

from ...models.field import Field
from ...models.field_type import FieldType


class TestField(TestCase):

    def test_simple_instance_creation(self):
        field_type = FieldType.objects.create(type="any")
        obj = Field.objects.create(title="a title for a field", description="a text", field_type=field_type)
        self.assertIsInstance(obj, Field)
        self.assertGreater(len(obj.title), 0)
        self.assertGreater(len(obj.description), 0)

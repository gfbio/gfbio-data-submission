# -*- coding: utf-8 -*-

from django.test import TestCase

from ...models.field import Field
from ...models.field_type import FieldType


class TestField(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.field_type = FieldType.objects.create(type="any")

    def test_simple_instance_creation(self):
        obj = Field.objects.create(title="a title for a field", description="a text", field_type=self.field_type)
        self.assertIsInstance(obj, Field)
        self.assertGreater(len(obj.title), 0)
        self.assertGreater(len(obj.description), 0)

    def test_multiple_relations(self):
        obj_1 = Field.objects.create(title="field 1", description="", field_type=self.field_type)
        obj_2 = Field.objects.create(title="field 2", description="", field_type=self.field_type)
        self.assertEqual("field 1", obj_1.title)
        self.assertEqual("field 2", obj_2.title)
        self.assertEqual(obj_1.field_type, obj_2.field_type)

    def test_uniqe_id(self):
        obj_1 = Field.objects.create(title="field 1", description="", field_type=self.field_type)
        obj_2 = Field.objects.create(title="field 1", description="", field_type=self.field_type)
        self.assertNotEqual(obj_1.field_id(), obj_2.field_id())

# -*- coding: utf-8 -*-
from unittest import skip

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

    def test_field_type_via_instance(self):
        obj = Field.objects.create(title="a title for a field", description="a text", field_type=self.field_type)
        self.assertIsInstance(obj.field_type, FieldType)

    def test_field_position_default(self):
        obj = Field.objects.create(title="a title for a field", description="a text", field_type=self.field_type)
        self.assertEqual("main", obj.position)

    def test_field_order_default(self):
        obj = Field.objects.create(title="a title for a field", description="a text", field_type=self.field_type)
        self.assertEqual(100, obj.order)

    def test_creation_with_system_wide_mandatory(self):
        obj = Field.objects.create(field_name="mandatory", title="a title for a field", description="a text",
                                   system_wide_mandatory=True, field_type=self.field_type)
        self.assertTrue(obj.system_wide_mandatory)

    def test_multiple_relations(self):
        obj_1 = Field.objects.create(title="field 1", description="", field_type=self.field_type)
        obj_2 = Field.objects.create(title="field 2", description="", field_type=self.field_type)
        self.assertEqual("field 1", obj_1.title)
        self.assertEqual("field 2", obj_2.title)
        self.assertEqual(obj_1.field_type, obj_2.field_type)

    def test_system_wide_mandatory_field_initial_value(self):
        obj = Field.objects.create(title="a title for a field", description="a text", field_type=self.field_type)
        self.assertFalse(obj.system_wide_mandatory)

    def test_system_wide_mandatory_set(self):
        obj = Field.objects.create(title="a title for a field", description="a text", field_type=self.field_type)
        self.assertFalse(obj.system_wide_mandatory)
        obj.system_wide_mandatory = True
        obj.save()
        self.assertTrue(obj.system_wide_mandatory)

    # TODO: adapt test
    @skip("refactored field id")
    def test_unique_id(self):
        obj_1 = Field.objects.create(title="field 1", description="", field_type=self.field_type)
        obj_2 = Field.objects.create(title="field 1", description="", field_type=self.field_type)
        self.assertNotEqual(obj_1.field_id(), obj_2.field_id())

# -*- coding: utf-8 -*-

from django.test import TestCase

from ...serializers.field_type_serializer import FieldTypeSerializer


class TestFieldTypeSerializer(TestCase):

    def test_serializer(self):
        serializer = FieldTypeSerializer(data={"type": "input", })
        valid = serializer.is_valid()
        self.assertTrue(valid)
        serializer.save()

    def test_unique_type(self):
        serializer = FieldTypeSerializer(data={"type": "text-input", })
        serializer.is_valid()
        serializer.save()
        serializer = FieldTypeSerializer(data={"type": "text-input", })
        valid = serializer.is_valid()
        self.assertFalse(valid)

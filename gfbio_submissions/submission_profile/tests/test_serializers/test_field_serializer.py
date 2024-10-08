# -*- coding: utf-8 -*-

from django.test import TestCase

from ...serializers.field_serializer import FieldSerializer


class TestFieldSerializer(TestCase):

    def test_serializer(self):
        serializer = FieldSerializer(
            data={"title": "Title", "description": "Description ...", "field_name": "text", "options": []})
        valid = serializer.is_valid()
        self.assertTrue(valid)

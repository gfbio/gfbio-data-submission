# -*- coding: utf-8 -*-

from django.test import TestCase

from ...models.field_type import FieldType
from ...serializers.field_serializer import FieldSerializer


class TestFieldSerializer(TestCase):

    def test_serializer(self):
        print(FieldType.objects.first())
        serializer = FieldSerializer(data={"title": "Title", "description": "Description ...", })
        valid = serializer.is_valid()
        self.assertTrue(valid)

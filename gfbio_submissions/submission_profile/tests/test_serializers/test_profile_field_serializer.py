# -*- coding: utf-8 -*-

from django.test import TestCase

from ...serializers.profile_field_serializer import ProfileFieldSerializer


class TestProfileFieldSerializer(TestCase):

    def test_serializer(self):
        serializer = ProfileFieldSerializer(
            data={
                "field": {
                    "field_name": "title",
                    "field_type": {
                        "type": "text-field"
                    },
                    "title": "Title",
                    "description": "Field, title description",
                    "placeholder": "Enter a title for your dataset. NOW",
                    "system_wide_mandatory": True,
                    "options": [],
                    "field_id": "title",
                    "order": 5,
                    "position": "main"
                },
                "mandatory": True,
                "visible": True,
                "default": ""
            }
        )
        valid = serializer.is_valid()
        self.assertTrue(valid)

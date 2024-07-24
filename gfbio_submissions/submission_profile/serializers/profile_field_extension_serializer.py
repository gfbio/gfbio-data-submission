# -*- coding: utf-8 -*-
from rest_framework import serializers
from .field_serializer import FieldSerializer
from ..models.profile_field_extension import ProfileFieldExtension


class ProfileFieldExtensionSerializer(serializers.ModelSerializer):
    field = FieldSerializer(read_only=True)
    class Meta:
        model = ProfileFieldExtension
        fields = (
            "default",
            "extra_field_test",
            # "form_fields",
            "field",

        )

# -*- coding: utf-8 -*-
from rest_framework import serializers

from .field_type_serializer import FieldTypeSerializer
from .field_option_serializer import FieldOptionSerializer
# from .profile_field_extension_serializer import ProfileFieldExtensionSerializer
from ..models.field import Field


class FieldSerializer(serializers.ModelSerializer):
    # profile_field = ProfileFieldExtensionSerializer(read_only=True)
    field_type = FieldTypeSerializer(read_only=True)
    options = FieldOptionSerializer(read_only=True, many=True)

    class Meta:
        model = Field
        fields = (
            "field_name",
            "field_type",
            # "profile_field",
            "title",
            "description",
            "mandatory",
            "placeholder",
            "visible",
            "default",
            "options",
            "field_id",
            "order",
            "position",
        )

# -*- coding: utf-8 -*-
from rest_framework import serializers

from .field_type_serializer import FieldTypeSerializer
from .field_option_serializer import FieldOptionSerializer
from ..models.field import Field


class FieldSerializer(serializers.ModelSerializer):
    field_type = FieldTypeSerializer(read_only=True)
    options = FieldOptionSerializer(read_only=True, many=True)

    class Meta:
        model = Field
        fields = (
            "field_name",
            "field_type",
            "title",
            "description",
            "mandatory",
            "placeholder",
            "visible",
            "default",
            "options",
            "field_id",
        )

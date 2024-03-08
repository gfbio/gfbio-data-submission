# -*- coding: utf-8 -*-
from rest_framework import serializers

from .field_type_serializer import FieldTypeSerializer
from ..models.field import Field


class FieldSerializer(serializers.ModelSerializer):
    field_type = FieldTypeSerializer(read_only=True)

    class Meta:
        model = Field
        fields = (
            "title",
            "description",
            "field_type",
            "field_id",
        )

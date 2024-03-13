# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.field_type import FieldType


class FieldTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = FieldType
        fields = (
            "type",
        )

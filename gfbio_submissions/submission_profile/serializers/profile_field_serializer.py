# -*- coding: utf-8 -*-
from rest_framework import serializers

from .field_related_serializer import FieldRelatedSerializer
from ..models.profile_field import ProfileField


class ProfileFieldSerializer(serializers.ModelSerializer):
    field = FieldRelatedSerializer(read_only=True)

    class Meta:
        model = ProfileField
        fields = (
            "field",
            "placeholder",
            "system_wide_mandatory",
            "mandatory",
            "visible",
            "default",
            "order",
        )

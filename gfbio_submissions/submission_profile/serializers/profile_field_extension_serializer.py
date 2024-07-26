# -*- coding: utf-8 -*-
from rest_framework import serializers

from .field_serializer import FieldSerializer
from .field_type_serializer import FieldTypeSerializer
from .field_option_serializer import FieldOptionSerializer
from ..models.profile_field_extension import ProfileFieldExtension
from ..models.field import Field
from .field_related_serializer import FieldRelatedSerializer


class ProfileFieldExtensionSerializer(serializers.ModelSerializer):
    # field_type = FieldTypeSerializer(read_only=True)
    # options = FieldOptionSerializer(read_only=True, many=True)
    field = FieldRelatedSerializer(read_only=True)

    class Meta:
        model = ProfileFieldExtension
        fields = (
            # "field_name",
            "field",
            # "field_type",
            # "title",
            # "description",
            "mandatory",
            "system_wide_mandatory",
            "placeholder",
            "visible",
            "default",
            # "options",
            # "field_id",
            "order",
            # "position",
        )

# -*- coding: utf-8 -*-
from rest_framework import serializers

from .field_related_serializer import FieldRelatedSerializer
from .field_serializer import FieldSerializer
from ..models.profile_field import ProfileField


class ProfileFieldSerializer(serializers.ModelSerializer):
    # only difference is to  omit certain redundant fields
    # field = FieldRelatedSerializer(read_only=True)

    # complete field serialization
    field = FieldSerializer(read_only=True)

    # TODO: add validation for
    #   - if system_wide_mandatory = True
    #       - mandatory must stay True too
    #       - default cannot be changed
    #       - visible always true too
    class Meta:
        model = ProfileField
        fields = (
            "field",
            "mandatory",
            "visible",
            "default",
        )

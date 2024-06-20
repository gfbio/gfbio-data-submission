# -*- coding: utf-8 -*-
from rest_framework import serializers

from .field_serializer import FieldSerializer
from ..models.profile import Profile


class ProfileSerializer(serializers.ModelSerializer):
    form_fields = FieldSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = (
            "name",
            "form_fields",
            "target",
        )

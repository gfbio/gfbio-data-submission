# -*- coding: utf-8 -*-
from rest_framework import serializers

from .profile_field_serializer import ProfileFieldSerializer
from ..configuration.settings import SYSTEM_WIDE_PROFILE_NAME_PREFIX
from ..models.profile import Profile


class ProfileSerializer(serializers.ModelSerializer):
    # FIXME: flatten json if possible. remove redundancies eg. order in field and profilefield
    # FIXME: DASS-2101 adapt fields serialization to refactored models
    form_fields = ProfileFieldSerializer(many=True, read_only=True)

    def validate_name(self, value):
        if value.lower().startswith(SYSTEM_WIDE_PROFILE_NAME_PREFIX):
            raise serializers.ValidationError(
                "Profile names are not allowed to beging with {}".format(SYSTEM_WIDE_PROFILE_NAME_PREFIX))
        return value

    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "form_fields",
            "target",
        )

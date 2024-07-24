# -*- coding: utf-8 -*-
from rest_framework import serializers

from .field_serializer import FieldSerializer
from ..configuration.settings import SYSTEM_WIDE_PROFILE_NAME_PREFIX
from ..models.profile import Profile
from .profile_field_extension_serializer import ProfileFieldExtensionSerializer


class ProfileSerializer(serializers.ModelSerializer):
    form_fields = FieldSerializer(many=True, read_only=True)
    # profile_fields = ProfileFieldExtensionSerializer(many=True, read_only=True)

    def validate_name(self, value):
        if value.lower().startswith(SYSTEM_WIDE_PROFILE_NAME_PREFIX):
            raise serializers.ValidationError(
                "Profile names are not allowed to beging with {}".format(SYSTEM_WIDE_PROFILE_NAME_PREFIX))
        return value

    class Meta:
        model = Profile
        fields = (
            "name",
            "form_fields",
            # "profile_fields",
            "target",
        )

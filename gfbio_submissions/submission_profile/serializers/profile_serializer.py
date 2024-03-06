# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.profile import Profile


class ProfileSerializer(serializers.ModelSerializer):
    fields = serializers.PrimaryKeyRelatedField(many=True)

    class Meta:
        model = Profile

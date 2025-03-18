# -*- coding: utf-8 -*-
from rest_framework import serializers

from gfbio_submissions.submission_profile.models.profile import Profile


class ProfileListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = [
            "id",
            "name",
            "target"
        ]

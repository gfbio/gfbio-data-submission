# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.submission import Submission
from gfbio_submissions.users.models import User


class UserSerializer(serializers.ModelSerializer):
    submission = serializers.PrimaryKeyRelatedField(many=True, queryset=Submission.objects.all())

    class Meta:
        model = User
        fields = ("id", "username", "submission")

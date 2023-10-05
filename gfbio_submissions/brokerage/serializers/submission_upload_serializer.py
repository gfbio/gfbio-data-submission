# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.submission_upload import SubmissionUpload


class SubmissionUploadSerializer(serializers.ModelSerializer):
    # TODO: user field ?
    user = serializers.ReadOnlyField(source='user.username')
    submission = serializers.PrimaryKeyRelatedField(read_only=True)
    attach_to_ticket = serializers.BooleanField(required=False)
    meta_data = serializers.BooleanField(required=False)

    class Meta:
        model = SubmissionUpload
        fields = ('user', 'file', 'submission', 'attach_to_ticket', 'meta_data')

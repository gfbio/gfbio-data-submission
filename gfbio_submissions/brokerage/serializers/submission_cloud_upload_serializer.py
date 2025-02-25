# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.submission_cloud_upload import SubmissionCloudUpload


class SubmissionCloudUploadSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    submission = serializers.PrimaryKeyRelatedField(read_only=True)
    attach_to_ticket = serializers.BooleanField(required=False)
    meta_data = serializers.BooleanField(required=False)
    file_upload = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = SubmissionCloudUpload
        fields = (
            "user", "submission", "attach_to_ticket", "meta_data", "file_upload",
        )

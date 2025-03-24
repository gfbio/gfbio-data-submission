# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.submission_cloud_upload import SubmissionCloudUpload


class SubmissionCloudUploadSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.id")
    submission = serializers.PrimaryKeyRelatedField(read_only=True)
    attach_to_ticket = serializers.BooleanField(required=False)
    meta_data = serializers.BooleanField(required=False)
    file = serializers.FileField(source="file_upload.uploaded_file", read_only=True)
    file_name = serializers.CharField(source="file_upload.original_filename", read_only=True)
    file_size = serializers.IntegerField(source="file_upload.file_size", read_only=True)

    class Meta:
        model = SubmissionCloudUpload
        fields = (
            "user", "file", "submission", "attach_to_ticket", "file_name", "file_size", "meta_data", "pk",
        )

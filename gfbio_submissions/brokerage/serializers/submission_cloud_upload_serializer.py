# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.submission_cloud_upload import SubmissionCloudUpload
from dt_upload.serializers import backend_based_upload_serializers


class SubmissionCloudUploadSerializer(serializers.ModelSerializer):
    # TODO: user field ?
    user = serializers.ReadOnlyField(source="user.username")
    submission = serializers.PrimaryKeyRelatedField(read_only=True)
    attach_to_ticket = serializers.BooleanField(required=False)
    meta_data = serializers.BooleanField(required=False)

    # TODO: like MultipartUploadStartSerializer
    # filename = serializers.CharField()
    # filetype = serializers.CharField()
    # total_size = serializers.IntegerField()
    # part_size = serializers.IntegerField()
    # total_parts = serializers.IntegerField()

    class Meta:
        model = SubmissionCloudUpload
        fields = (
            "user", "submission", "attach_to_ticket", "meta_data",
            # "filetype", "total_parts", "part_size", "total_size", "filename"
        )

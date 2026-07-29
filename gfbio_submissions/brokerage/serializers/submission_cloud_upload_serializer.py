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
    md5 = serializers.CharField(source="file_upload.md5", read_only=True)
    sha256 = serializers.CharField(source="file_upload.sha256", read_only=True)
    file_status = serializers.SerializerMethodField()

    def get_file_status(self, obj):
        file_upload = getattr(obj, "file_upload", None)
        if not file_upload or file_upload.status != "COMPLETED" or obj.status in [SubmissionCloudUpload.STATUS_ACTIVE, SubmissionCloudUpload.STATUS_NEW]:
            return "INCOMPLETE"
        if obj.status in [SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_BAD_CHECKSUM, SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM]:
            return "CHECKSUM MISMATCH"
        return "UPLOADED"


    class Meta:
        model = SubmissionCloudUpload
        fields = (
            "user", "file", "submission", "attach_to_ticket", "file_name", "file_size", "meta_data", "pk", "md5",
            "sha256", "file_status"
        )

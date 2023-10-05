# -*- coding: utf-8 -*-
import os

from rest_framework import serializers

from ..models.submission_upload import SubmissionUpload


class SubmissionUploadListSerializer(serializers.ModelSerializer):
    # my_field = serializers.ReadOnlyField(source='get_file_name')
    # defaults to get_<fieldname> or method_name=
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()

    # TODO: better this way than model method
    def get_file_name(self, obj):
        return os.path.basename(obj.file.name)

    def get_file_size(self, obj):
        return obj.file.size

    class Meta:
        model = SubmissionUpload
        fields = (
            'user', 'file', 'submission', 'attach_to_ticket', 'file_name',
            'file_size', 'meta_data', 'pk')

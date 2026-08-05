# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.metadata_validation_report import (
    MetadataValidationReport,
    ValidationTaskReport,
    ValidationFinding,
)


class ValidationFindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationFinding
        fields = (
            'id',
            'status',
            'row',
            'column',
            'column_name',
            'finding_type',
            'message',
            'help_text',
        )


class ValidationTaskReportSerializer(serializers.ModelSerializer):
    findings = ValidationFindingSerializer(source='validationfinding_set', many=True)

    class Meta:
        model = ValidationTaskReport
        fields = (
            'id',
            'status',
            'task_name',
            'findings',
        )


class MetadataValidationReportSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()
    file_md5_checksum = serializers.CharField()
    task_reports = ValidationTaskReportSerializer(source='validationtaskreport_set', many=True)
    broker_submission_id = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    def get_filename(self, obj):
        if obj.upload_file and obj.upload_file.file_upload:
            return obj.upload_file.file_upload.original_filename
        return None


    def get_status(self, current_report):
        task_reports = current_report.validationtaskreport_set.all()
        if len(task_reports) == 0:
            return 'PENDING'

        validation_status = 'SUCCESS'
        for task_report in task_reports:
            if task_report.status == 'ERROR':
                validation_status = 'ERROR'
                break;
            if task_report.status == 'WARNING':
                validation_status = 'WARNING'
            if task_report.status == 'INFO' and validation_status == 'SUCCESS':
                validation_status = 'INFO'
        return validation_status

    def get_broker_submission_id(self, obj):
        return obj.submission.broker_submission_id

    class Meta:
        model = MetadataValidationReport
        fields = (
            'id',
            'filename',
            'file_md5_checksum',
            'task_reports',
            'created',
            'broker_submission_id',
            'status'
        )

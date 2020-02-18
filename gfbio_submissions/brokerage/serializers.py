# -*- coding: utf-8 -*-
import os

from rest_framework import serializers

from gfbio_submissions.users.models import User
from .models import Submission, \
    SubmissionUpload
from .utils.schema_validation import \
    validate_data_full, validate_data_min


class UserSerializer(serializers.ModelSerializer):
    submission = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Submission.objects.all()
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'submission')


class SubmissionSerializer(serializers.ModelSerializer):
    site = serializers.ReadOnlyField(source='site.username')
    # user = serializers.ReadOnlyField(source='user.username')
    broker_submission_id = serializers.UUIDField(required=False)
    download_url = serializers.URLField(required=False)
    data = serializers.JSONField()
    status = serializers.CharField(read_only=True)

    issue = serializers.SerializerMethodField()

    def get_issue(self, obj):
        ref = obj.get_primary_helpdesk_reference()
        return ref.reference_key if ref else ''

    def validate(self, data):
        if data.get('release', False):
            target = data.get('target', 'NO_TARGET_PROVIDED')
            valid, errors = validate_data_full(data=data.get('data', {}),
                                               target=target)
            if not valid:
                raise serializers.ValidationError(
                    {'data': [e.message for e in errors]})
            else:
                data['status'] = Submission.SUBMITTED
        else:
            valid, errors = validate_data_min(data.get('data', {}))
            if not valid:
                raise serializers.ValidationError(
                    {'data': [e.message for e in errors]})
        return data

    class Meta:
        model = Submission
        fields = (
            'broker_submission_id',
            'issue',
            'site',
            # 'user',
            'submitting_user','target', 'status',
            'release', 'data', 'embargo', 'download_url',
        )


class SubmissionDetailSerializer(SubmissionSerializer):
    def validate(self, data):
        if data.get('release', False):
            target = data.get('target', 'NO_TARGET_PROVIDED')
            valid, errors = validate_data_full(data=data.get('data', {}),
                                               target=target)
            if not valid:
                raise serializers.ValidationError(
                    {'data': [e.message for e in errors]})
            else:
                data['status'] = Submission.SUBMITTED
        else:
            valid, errors = validate_data_min(data.get('data', {}))
            target = data.get('target', 'NO_TARGET_PROVIDED')
            full_valid, full_errors = validate_data_full(
                data=data.get('data', {}),
                target=target)
            if not valid:
                error_messages = [e.message for e in errors]
                optional_validation_messages = list(
                    set([e.message for e in full_errors]) - set(error_messages))
                raise serializers.ValidationError(
                    {
                        'data': error_messages,
                        'optional_validation': optional_validation_messages
                    }
                )
            if not full_valid:
                data['data'].update(
                    {'optional_validation': [e.message for e in full_errors]})
        return data


class SubmissionUploadSerializer(serializers.ModelSerializer):
    # TODO: user field ?
    site = serializers.ReadOnlyField(source='site.username')
    submission = serializers.PrimaryKeyRelatedField(read_only=True)
    attach_to_ticket = serializers.BooleanField(required=False)
    meta_data = serializers.BooleanField(required=False)

    class Meta:
        model = SubmissionUpload
        fields = ('site', 'file', 'submission', 'attach_to_ticket', 'meta_data')


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
            'site', 'file', 'submission', 'attach_to_ticket', 'file_name',
            'file_size', 'meta_data', 'pk')

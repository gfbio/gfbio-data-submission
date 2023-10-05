# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.submission import Submission
from ..utils.schema_validation import validate_data_full, validate_data_min


class SubmissionSerializer(serializers.ModelSerializer):
    # site = serializers.ReadOnlyField(source='site.username')
    user = serializers.ReadOnlyField(source='user.username')
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
            # 'site',
            'user',
            # 'submitting_user',
            'target', 'status',
            'release', 'data', 'embargo', 'download_url',
        )

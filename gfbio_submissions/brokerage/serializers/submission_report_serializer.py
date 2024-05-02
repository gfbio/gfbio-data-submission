# -*- coding: utf-8 -*-


from rest_framework import serializers

from ..models.submission_report import SubmissionReport


class SubmissionReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionReport
        fields = ['id', 'report', 'report_category', 'created', 'modified', ]

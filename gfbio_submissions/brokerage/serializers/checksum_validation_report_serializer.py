# -*- coding: utf-8 -*-
from rest_framework import serializers

from gfbio_submissions.brokerage.models.checksum_validation_report import ChecksumFileResult, ChecksumValidationReport


class ChecksumFileResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecksumFileResult
        fields = "__all__"



class ChecksumValidationReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecksumValidationReport
        fields = "__all__"

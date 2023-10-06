# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.submission import Submission
from .submission_serializer import SubmissionSerializer
from ..utils.schema_validation import (
    validate_contributors,
    validate_embargo,
    validate_data_full,
    validate_data_min,
)


class SubmissionDetailSerializer(SubmissionSerializer):
    def validate(self, data):
        # check contributors
        if data.get("data", {}):
            valid, error = validate_contributors(data=data.get("data", {}))
            if not valid:
                raise serializers.ValidationError({"data": error})

        # check embargo
        if data.get("embargo", None):
            valid, error = validate_embargo(data.get("embargo", None))
            if not valid:
                raise serializers.ValidationError({"data": error})

        if data.get("release", False):
            target = data.get("target", "NO_TARGET_PROVIDED")
            valid, errors = validate_data_full(data=data.get("data", {}), target=target)
            if not valid:
                raise serializers.ValidationError({"data": [e.message for e in errors]})
            else:
                data["status"] = Submission.SUBMITTED
        else:
            valid, errors = validate_data_min(data.get("data", {}))
            target = data.get("target", "NO_TARGET_PROVIDED")
            full_valid, full_errors = validate_data_full(
                data=data.get("data", {}), target=target
            )
            if not valid:
                error_messages = [e.message for e in errors]
                optional_validation_messages = list(
                    set([e.message for e in full_errors]) - set(error_messages)
                )
                raise serializers.ValidationError(
                    {
                        "data": error_messages,
                        "optional_validation": optional_validation_messages,
                    }
                )
            if not full_valid:
                data["data"].update(
                    {"optional_validation": [e.message for e in full_errors]}
                )
        return data

# -*- coding: utf-8 -*-
from rest_framework import serializers

from .submission_serializer import SubmissionSerializer
from ..models.submission import Submission
from ..utils.schema_validation import (
    validate_contributors,
    validate_embargo,
    validate_data_full,
    validate_data_min,
)


class SubmissionDetailSerializer(SubmissionSerializer):
    def validate(self, data):
        target = data.get("target", "NO_TARGET_PROVIDED")
        # check contributors
        if data.get("data", {}):
            # FIXME: this is VERY molecular/submission-ui specific and should not be validated on this general level
            #    if needed anywayy , this should be done via JsonSchema or with dedicated code elsewhere
            valid, error = validate_contributors(data=data.get("data", {}))
            if not valid:
                raise serializers.ValidationError({"data": error})

        # check embargo
        if data.get("embargo", None):
            # FIXME: similar to problem with contributors, this should be done different/elsewhere
            valid, error = validate_embargo(data.get("embargo", None))
            if not valid:
                raise serializers.ValidationError({"data": error})

        if data.get("release", False):
            valid, errors = validate_data_full(data=data.get("data", {}), target=target)
            if not valid:
                raise serializers.ValidationError({"data": [e.message for e in errors]})
            else:
                data["status"] = Submission.SUBMITTED
        else:
            valid, errors = validate_data_min(data.get("data", {}))
            full_valid, full_errors = validate_data_full(data=data.get("data", {}), target=target)
            if not valid:
                error_messages = [e.message for e in errors]
                optional_validation_messages = list(set([e.message for e in full_errors]) - set(error_messages))
                raise serializers.ValidationError(
                    {
                        "data": error_messages,
                        "optional_validation": optional_validation_messages,
                    }
                )
            if not full_valid:
                data["data"].update({"optional_validation": [e.message for e in full_errors]})
        return data

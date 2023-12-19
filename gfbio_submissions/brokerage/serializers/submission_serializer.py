# -*- coding: utf-8 -*-
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample

from ..models.submission import Submission
from ..utils.schema_validation import validate_data_full, validate_data_min


@extend_schema_serializer(
    examples = [
         OpenApiExample(
            'Valid Submission',
            summary='Submission in requests',
            value={
                "target": "GENERIC",
                "release": True,
                "submitting_user": 1,
                "download_url": "https://www.example.de/study",
                "embargo": "2024-12-15",
                "data": {
                    "requirements": {
                        "license": "CC BY-NC 4.0",
                        "legal_requirements": [
                            "Nagoya Protocol"
                        ],
                        "related_publications": [
                            "1234567"
                        ],
                        "dataset_labels": [
                            "Laboratory",
                            "AI-Assissted"
                        ],
                        "categories": [
                            "Zoology",
                            "Geoscience"
                        ],
                        "contributors": [
                            {
                                "firstName": "Jane",
                                "lastName": "Doe",
                                "emailAddress": "jane.doe@example.de",
                                "institution": "Example University",
                                "contribution": "Principal Investigator",
                                "position": 1
                            },
                            {
                                "firstName": "John",
                                "lastName": "Doe",
                                "emailAddress": "john.doe@example.org",
                                "institution": "sample e.g.",
                                "contribution": "Author/Creator,Researcher",
                                "position": 2
                            }
                        ],
                        "data_center": "ENA – European Nucleotide Archive",
                        "download_url": "https://www.example.de/study",
                        "title": "Sample Submission",
                        "description": "Submission of some data for example purposes"
                    }
                }
            },
            request_only=True,
        ),
         OpenApiExample(
            'Valid Existing Submission',
            summary='Submission in requests',
            value={
                "broker_submission_id": "00c0ffee-c0ff-c0ff-c0ff-c0ffeec0ffee",
                "issue": "abc",
                "user": "adminuser",
                "target": "GENERIC",
                "status": "SUBMITTED",
                "release": True,
                "data": {
                    "requirements": {
                        "title": "Sample Submission",
                        "license": "CC0 1.0",
                        "categories": [
                            "Zoology",
                            "Geoscience"
                        ],
                        "data_center": "GFBio Data Centers - our curators will suggest the appropriate one(s)",
                        "description": "Submission of some data for example purposes",
                        "contributors": [
                            {
                                "lastName": "Doe",
                                "position": 1,
                                "firstName": "Jane",
                                "institution": "Example University",
                                "contribution": "Principal Investigator",
                                "emailAddress": "jane.doe@example.de"
                            }
                        ],
                        "download_url": "https://www.example.de/study",
                        "dataset_labels": [
                            "Laboratory",
                            "AI-Assissted"
                        ],
                        "legal_requirements": [],
                        "related_publications": [
                            "1234567"
                        ]
                    }
                },
                "embargo": "2024-12-15",
                "download_url": "https://www.example.de/study",
                "accession_id": []
            },
            response_only=True, # signal that example only applies to requests
        ),
    ]
)
class SubmissionSerializer(serializers.ModelSerializer):
    # site = serializers.ReadOnlyField(source='site.username')
    user = serializers.ReadOnlyField(source="user.username")
    broker_submission_id = serializers.UUIDField(required=False)
    download_url = serializers.URLField(required=False)
    data = serializers.JSONField()
    status = serializers.CharField(read_only=True)

    issue = serializers.SerializerMethodField()

    def get_issue(self, obj):
        ref = obj.get_primary_helpdesk_reference()
        return ref.reference_key if ref else ""

    def validate(self, data):
        if data.get("release", False):
            target = data.get("target", "NO_TARGET_PROVIDED")
            valid, errors = validate_data_full(data=data.get("data", {}), target=target)
            if not valid:
                raise serializers.ValidationError({"data": [e.message for e in errors]})
            else:
                data["status"] = Submission.SUBMITTED
        else:
            valid, errors = validate_data_min(data.get("data", {}))
            if not valid:
                raise serializers.ValidationError({"data": [e.message for e in errors]})
        return data

    class Meta:
        model = Submission
        fields = (
            "broker_submission_id",
            "issue",
            # 'site',
            "user",
            # 'submitting_user',
            "target",
            "status",
            "release",
            "data",
            "embargo",
            "download_url",
        )

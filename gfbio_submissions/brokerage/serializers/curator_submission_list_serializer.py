from rest_framework import serializers

from ..models.submission import Submission
from .submission_serializer import SubmissionSerializer


class CuratorSubmissionListSerializer(SubmissionSerializer):
    created = serializers.DateTimeField(read_only=True)
    modified = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Submission
        fields = (
            "broker_submission_id",
            "issue",
            "user",
            "target",
            "status",
            "release",
            "embargo",
            "download_url",
            "created",
            "modified",
        )

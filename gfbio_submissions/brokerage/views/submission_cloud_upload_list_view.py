# -*- coding: utf-8 -*-
from uuid import uuid4

from rest_framework import generics, parsers, permissions
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiRequest

from ..models.submission_cloud_upload import SubmissionCloudUpload
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_cloud_upload_serializer import SubmissionCloudUploadSerializer


class SubmissionCloudUploadListView(generics.ListAPIView):
    queryset = SubmissionCloudUpload.objects.all()
    serializer_class = SubmissionCloudUploadSerializer
    parser_classes = (
        parsers.MultiPartParser,
        parsers.FormParser,
    )
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    def get_queryset(self):
        broker_submission_id = self.kwargs.get("broker_submission_id", uuid4())
        return SubmissionCloudUpload.objects.filter(
            submission__broker_submission_id=broker_submission_id,
            status='active'
        )

    @extend_schema(
        operation_id="get uploads of a submission",
        description="Returns a list of files, belonging to the given broker_submission_id.",
        request=OpenApiRequest(
            request=SubmissionCloudUploadSerializer(many=False)
        ),
        parameters=[
            OpenApiParameter(
                name="broker_submission_id",
                description="Unique submission ID, which uploads will be returned as a result (A UUID specified by RFC4122).",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            )
        ],
        responses={
            200: OpenApiResponse(
                description="List of submission cloud upload files",
                response=SubmissionCloudUploadSerializer(many=False)
            ),
        }
    )
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

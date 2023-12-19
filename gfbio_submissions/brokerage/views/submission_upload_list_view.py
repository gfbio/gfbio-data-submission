# -*- coding: utf-8 -*-
from uuid import uuid4

from rest_framework import generics, parsers, permissions
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiRequest

from ..models.submission_upload import SubmissionUpload
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_upload_list_serializer import (
    SubmissionUploadListSerializer,
)


class SubmissionUploadListView(generics.ListAPIView):
    queryset = SubmissionUpload.objects.all()
    serializer_class = SubmissionUploadListSerializer
    parser_classes = (
        parsers.MultiPartParser,
        parsers.FormParser,
    )
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    def get_queryset(self):
        broker_submission_id = self.kwargs.get("broker_submission_id", uuid4())
        return SubmissionUpload.objects.filter(submission__broker_submission_id=broker_submission_id)

    @extend_schema(
        operation_id="get uploads of a submission",
        description="Returns a list of files, belonging to the given broker_submission_id.",
        request=OpenApiRequest(
            request=SubmissionUploadListSerializer(many=False)
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
                description="List of submission upload files",
                response=SubmissionUploadListSerializer(many=False)
            ),
        }
    )
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
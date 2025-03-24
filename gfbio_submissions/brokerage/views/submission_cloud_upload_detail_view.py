# -*- coding: utf-8 -*-
from uuid import uuid4, UUID

from django.db import transaction
from rest_framework import mixins, generics, parsers, permissions, status
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from gfbio_submissions.generic.models.request_log import RequestLog
from ..configuration.settings import SUBMISSION_DELAY
from ..models import SubmissionCloudUpload
from ..models.submission import Submission
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_cloud_upload_serializer import SubmissionCloudUploadSerializer


class SubmissionCloudUploadDetailView(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    queryset = SubmissionCloudUpload.objects.all()
    serializer_class = SubmissionCloudUploadSerializer
    parser_classes = (
        parsers.MultiPartParser,
        parsers.FormParser,
    )
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    @extend_schema(
        operation_id="update submission upload",
        description="Updates an existing file associated with a submission.",
        parameters=[
            OpenApiParameter(
                name="broker_submission_id",
                description="Unique submission ID of the submission whose file is to be updated (A UUID specified by RFC4122).",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            ),
            OpenApiParameter(
                name="primary_key",
                description="Unique id of file associated with a submission.",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            )
        ],
        responses={
            200: OpenApiResponse(
                description="SubmissionUpload response",
                response=SubmissionCloudUploadSerializer(many=False)
            ),
            400: OpenApiResponse(
                description="Validation error",
            ),
            404: OpenApiResponse(
                description="No submission with given submission id",
            )
        }
    )
    def put(self, request, *args, **kwargs):
        broker_submission_id = kwargs.get("broker_submission_id", uuid4())
        instance = self.get_object()
        if instance.submission.broker_submission_id != UUID(broker_submission_id):
            response = Response(
                {"submission": "No link to this " "broker_submission_id " "{0}".format(broker_submission_id)},
                status=status.HTTP_400_BAD_REQUEST,
            )
            with transaction.atomic():
                RequestLog.objects.create(
                    type=RequestLog.INCOMING,
                    url="brokerage:submissions_upload_detail",
                    method=RequestLog.PUT,
                    user=instance.user,
                    submission_id=instance.submission.broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )
            return response
        try:
            Submission.objects.get(broker_submission_id=broker_submission_id)
        except Submission.DoesNotExist as e:
            response = Response(
                {"submission": "No submission for this " "broker_submission_id " "{0}".format(broker_submission_id)},
                status=status.HTTP_404_NOT_FOUND,
            )
            with transaction.atomic():
                RequestLog.objects.create(
                    type=RequestLog.INCOMING,
                    url="brokerage:submissions_upload_detail",
                    method=RequestLog.PUT,
                    user=instance.user,
                    submission_id=instance.submission.broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )
            return response
        response = self.update(request, *args, **kwargs)
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                url="brokerage:submissions_upload_detail",
                method=RequestLog.PUT,
                user=instance.user,
                submission_id=instance.submission.broker_submission_id,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response

    @extend_schema(
        operation_id="delete submission upload",
        description="Deletes a file associated with a submission",
        parameters=[
            OpenApiParameter(
                name="broker_submission_id",
                description="Unique submission ID of the submission to delete the file from (A UUID specified by RFC4122).",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            ),
            OpenApiParameter(
                name="primary_key",
                description="Unique id of file to delete.",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            )
        ],
        responses={
            204: OpenApiResponse(
                description="File was successfully deleted"
            )
        }
    )
    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        from ..tasks.jira_tasks.delete_submission_issue_attachment import (
            delete_submission_issue_attachment_task,
        )

        delete_submission_issue_attachment_task.apply_async(
            kwargs={
                "submission_id": obj.submission.pk,
                "attachment_id": obj.attachment_id,
            },
            countdown=SUBMISSION_DELAY,
        )
        return self.destroy(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        instance.status = 'deleted'
        instance.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

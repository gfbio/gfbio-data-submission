# -*- coding: utf-8 -*-
from uuid import uuid4

from django.db import transaction
from rest_framework import mixins, generics, parsers, permissions, status
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.response import Response

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from gfbio_submissions.generic.models.request_log import RequestLog
from ..configuration.settings import ATAX
from ..models.submission import Submission
from ..models.submission_upload import SubmissionUpload
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_upload_serializer import SubmissionUploadSerializer


class SubmissionUploadView(mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = SubmissionUpload.objects.all()
    serializer_class = SubmissionUploadSerializer
    parser_classes = (
        parsers.MultiPartParser,
        parsers.FormParser,
    )
    authentication_classes = (TokenAuthentication, BasicAuthentication)

    # TODO: add permission class that checks if access to associated
    #  submission is granted for request.user (this request, upload only)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    def perform_create(self, serializer, submission):
        return serializer.save(user=self.request.user, submission=submission)

    def create(self, request, *args, **kwargs):
        broker_submission_id = kwargs.get("broker_submission_id", uuid4())

        try:
            sub = Submission.objects.get(broker_submission_id=broker_submission_id)
        except Submission.DoesNotExist as e:
            response = Response(
                {"submission": "No submission for this " "broker_submission_id:" " {0}".format(broker_submission_id)},
                status=status.HTTP_404_NOT_FOUND,
            )

            with transaction.atomic():
                RequestLog.objects.create(
                    type=RequestLog.INCOMING,
                    url="brokerage:submissions_upload",
                    method=RequestLog.POST,
                    submission_id=broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )

            return response

        # TODO: worklflow specific checks, like this one should be moved elsewhere, when introducing a more general
        #   check for workflow rules that are checked here
        # TODO: clarify statuses, since 06.06.2019 edit on SUBMITTED Submission is allowed in general. Here we need
        #   the SUBMITTED constraint to realize the intended workflow
        if sub.target == ATAX and sub.status == Submission.SUBMITTED:
            return Response(
                data={
                    "broker_submission_id": sub.broker_submission_id,
                    "status": sub.status,
                    "embargo": sub.embargo,
                    "error": "no uploads allowed with current submission status",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = self.perform_create(serializer, sub)

        headers = self.get_success_headers(serializer.data)
        data_content = dict(serializer.data)
        data_content.pop("submission", 0)
        data_content["id"] = obj.pk
        data_content["broker_submission_id"] = sub.broker_submission_id

        response = Response(data_content, status=status.HTTP_201_CREATED, headers=headers)

        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                url="brokerage:submissions_upload",
                method=RequestLog.POST,
                user=sub.user,
                submission_id=sub.broker_submission_id,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response

    @extend_schema(
        operation_id="create submission upload",
        description="Upload a file associated to an existing submission",
        parameters=[
            OpenApiParameter(
                name="broker_submission_id",
                description="Unique submission ID of submission to upload a file to (A UUID specified by RFC4122).",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            )
        ],
        responses={
            201: OpenApiResponse(
                description="Submission upload successfull",
                response=SubmissionUploadSerializer(many=False)
            ),
            400: OpenApiResponse(
                description="Validation error",
            )
        }
    )
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

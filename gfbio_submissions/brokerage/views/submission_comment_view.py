# -*- coding: utf-8 -*-
import json
from uuid import uuid4

from django.db import transaction
from rest_framework import generics, permissions, status, serializers
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse, OpenApiRequest, inline_serializer


from gfbio_submissions.generic.models.request_log import RequestLog
from gfbio_submissions.users.models import User
from ..configuration.settings import SUBMISSION_UPLOAD_RETRY_DELAY
from ..forms.submission_comment_form import SubmissionCommentForm
from ..models.submission import Submission
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_detail_serializer import SubmissionDetailSerializer


class SubmissionCommentView(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)
    lookup_field = "broker_submission_id"
    queryset = Submission.objects.all()
    serializer_class = SubmissionDetailSerializer

    @staticmethod
    def _process_post_comment(broker_submission_id, comment):
        try:
            submission_values = Submission.objects.get_submission_values(broker_submission_id=broker_submission_id)
            user_values = User.get_user_values_safe(user_id=submission_values["user"])
            from ..tasks.jira_tasks.add_posted_comment_to_issue import (
                add_posted_comment_to_issue_task,
            )

            add_posted_comment_to_issue_task.apply_async(
                kwargs={
                    "submission_id": "{0}".format(submission_values["pk"]),
                    "comment": comment,
                    "user_values": user_values,
                },
                countdown=SUBMISSION_UPLOAD_RETRY_DELAY,
            )
            return Response({"comment": comment}, status=status.HTTP_201_CREATED)
        except Submission.DoesNotExist as e:
            return Response(
                {"submission": "No submission for this " "broker_submission_id: {0}".format(broker_submission_id)},
                status=status.HTTP_404_NOT_FOUND,
            )

    @extend_schema(
        operation_id="add comment to submission",
        description="Adds a comment to the referenced submission.",
        request=OpenApiRequest(
            request=inline_serializer(
                name="Comment-model",
                fields={
                    "comment": serializers.CharField(),
                }
            ),
        ),
        examples=[
            OpenApiExample(
                "Nice comment",
                value={
                    "comment": "Thank you for doing what you doing!"
                }
            )
        ],
        parameters=[
            OpenApiParameter(
                name="broker_submission_id",
                description="Unique submission ID of submission to retrieve (A UUID specified by RFC4122).",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            )
        ],
        responses={
            201: OpenApiResponse(
                description="Comment successfull created",
            ),
            400: OpenApiResponse(
                description="Validation error",
            ),
            404: OpenApiResponse(
                description="Submission not found",
            )
        }
    )
    def post(self, request, *args, **kwargs):
        print(request.data)
        form = SubmissionCommentForm(request.POST)
        print("SubmissionCommentView.post: form.is_valid={0}".format(form.is_valid()))
        print(request.POST)
        print(form.data)
        if form.is_valid():
            broker_submission_id = kwargs.get("broker_submission_id", uuid4())
            response = self._process_post_comment(broker_submission_id, form.cleaned_data["comment"])
        else:
            response = Response(
                json.loads(form.errors.as_json()),
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                url="brokerage:submission_comment",
                method=RequestLog.POST,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response

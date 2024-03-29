# -*- coding: utf-8 -*-
import logging

from django.urls import reverse
from rest_framework import mixins, generics, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiRequest

from gfbio_submissions.generic.models.request_log import RequestLog
from gfbio_submissions.generic.serializers import JiraHookRequestSerializer
from ..forms.jira_issue_update_query_form import JiraIssueUpdateQueryForm
from ..permissions.api_allowed_hosts import APIAllowedHosts


logger = logging.getLogger(__name__)

class JiraIssueUpdateView(mixins.CreateModelMixin, generics.GenericAPIView):
    permission_classes = (APIAllowedHosts,)
    serializer_class = JiraHookRequestSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        is_valid = serializer.is_valid()

        form = JiraIssueUpdateQueryForm(request.GET)
        form_is_valid = form.is_valid()

        details = {
            "serializer_errors": serializer.errors,
            "form_errors": form.errors.as_json(),
        }

        RequestLog.objects.create(
            type=RequestLog.INCOMING,
            method=RequestLog.POST,
            url=reverse("brokerage:submissions_jira_update"),
            data=request.data,
            response_status=status.HTTP_201_CREATED if is_valid else status.HTTP_400_BAD_REQUEST,
            request_details=details,
        )

        headers = self.get_success_headers(serializer.data)

        if not is_valid:
            # in case of JiraHookRequestSerializer  errors:
            logger.warn(
                "JiraIssueUpdateView | not is_valid | errors={0} | "
                "".format(serializer.errors)
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST, headers=headers)

        if not form_is_valid:
            # request came from blacklisted users
            # blacklist users: brokeragent
            logger.warn(
                "JiraIssueUpdateView | not form_is_valid | errors={0} | "
                "".format(form.errors)
            )
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST, headers=headers)

        obj = self.perform_create(serializer)

        data_content = dict(serializer.data)
        return Response(data_content, status=status.HTTP_201_CREATED, headers=headers)

    @extend_schema(
        operation_id="jira issue update",
        description="Endpoint for hook to handle updates in the corresponding jira issues of submissions.",
        request=OpenApiRequest(
            request=JiraHookRequestSerializer(many=False)
        ),
        responses={
            201: OpenApiResponse(
                description="Update from jira successful"
            ),
            400: OpenApiResponse(
                description="Validation error",
            )
        }
    )
    def post(self, request, *args, **kwargs):
        response = self.create(request, *args, **kwargs)
        return response

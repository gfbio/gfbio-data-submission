# -*- coding: utf-8 -*-
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, TokenAuthentication, BasicAuthentication
from rest_framework.generics import ListAPIView
from drf_spectacular.utils import extend_schema

from ..models import SubmissionReport
from ..permissions.is_submission_owner import IsSubmissionOwner
from ..serializers.submission_report_serializer import SubmissionReportSerializer

@extend_schema(exclude=True)
class SubmissionReportView(ListAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsSubmissionOwner)
    serializer_class = SubmissionReportSerializer

    def get_queryset(self):
        user = self.request.user
        return SubmissionReport.objects.filter(
            submission__broker_submission_id=self.kwargs['broker_submission_id']
        ).filter(submission__user=user)


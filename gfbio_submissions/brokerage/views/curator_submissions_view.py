from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.authentication import BasicAuthentication, TokenAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import DjangoModelPermissions

from ..models.submission import Submission
from ..models.submission_cloud_upload import SubmissionCloudUpload
from ..models.submission_report import SubmissionReport
from ..serializers.curator_submission_list_serializer import (
    CuratorSubmissionListSerializer,
)
from ..serializers.submission_cloud_upload_serializer import (
    SubmissionCloudUploadSerializer,
)
from ..serializers.submission_detail_serializer import SubmissionDetailSerializer
from ..serializers.submission_report_serializer import SubmissionReportSerializer


class CuratorSubmissionPagination(PageNumberPagination):
    page_size = 25
    max_page_size = 100


class CuratorSubmissionsView(generics.ListAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, DjangoModelPermissions)
    serializer_class = CuratorSubmissionListSerializer
    pagination_class = CuratorSubmissionPagination

    def get_queryset(self):
        queryset = Submission.objects.select_related("user").all()

        status = self.request.query_params.get("status")
        if status:
            status_list = [s.strip() for s in status.split(",") if s.strip()]
            if status_list:
                queryset = queryset.filter(status__in=status_list)

        target = self.request.query_params.get("target")
        if target:
            target_list = [t.strip() for t in target.split(",") if t.strip()]
            if target_list:
                queryset = queryset.filter(target__in=target_list)

        user = self.request.query_params.get("user")
        if user:
            queryset = queryset.filter(Q(user__username__icontains=user) | Q(user__email__icontains=user))

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(broker_submission_id__icontains=search)
                | Q(user__username__icontains=search)
                | Q(user__email__icontains=search)
                | Q(additionalreference__reference_key__icontains=search)
            ).distinct()

        ordering = self.request.query_params.get("ordering", "-modified")
        ordering_map = {
            "created": "created",
            "-created": "-created",
            "modified": "modified",
            "-modified": "-modified",
            "status": "status",
            "-status": "-status",
            "target": "target",
            "-target": "-target",
            "user": "user__username",
            "-user": "-user__username",
        }
        queryset = queryset.order_by(ordering_map.get(ordering, "-modified"))

        return queryset


class CuratorSubmissionDetailView(generics.RetrieveAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, DjangoModelPermissions)
    serializer_class = SubmissionDetailSerializer
    queryset = Submission.objects.all()
    lookup_field = "broker_submission_id"

    def get(self, request, *args, **kwargs):
        response = self.retrieve(request, *args, **kwargs)
        response.data["accession_id"] = self.get_object().get_accession_id()
        return response


class CuratorSubmissionReportView(generics.ListAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, DjangoModelPermissions)
    serializer_class = SubmissionReportSerializer

    def get_queryset(self):
        return SubmissionReport.objects.filter(
            submission__broker_submission_id=self.kwargs["broker_submission_id"]
        ).order_by("-created")


class CuratorSubmissionCloudUploadListView(generics.ListAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, DjangoModelPermissions)
    serializer_class = SubmissionCloudUploadSerializer

    def get_queryset(self):
        return (
            SubmissionCloudUpload.objects.filter(submission__broker_submission_id=self.kwargs["broker_submission_id"])
            .exclude(status=SubmissionCloudUpload.STATUS_DELETED)
            .order_by("-modified")
        )

from django.db.models import Q
from django.http import HttpResponse
from rest_framework import generics, permissions, serializers, status
from rest_framework.authentication import BasicAuthentication, TokenAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.views import APIView

from ..admin import (
    cancel_selected_submissions,
    combine_cloud_uploaded_csvs_to_abcd,
    combine_csvs_to_abcd,
    continue_release_submissions,
    create_broker_objects_and_ena_xml,
    create_helpdesk_issue_manually,
    delete_broker_objects_and_ena_xml,
    download_auditable_text_data,
    modify_ena_objects_with_current_xml,
    perform_targeted_sequence_submission,
    prepare_manifest,
    re_create_ena_xml,
    register_study_at_ena,
    release_submission_study_on_ena,
    submit_manifest_to_ena,
    submit_to_ena_test,
    transfer_submission_cloud_uploads_to_ena,
    validate_against_ena,
    validate_manifest_at_ena,
)
from ..models.submission import Submission
from ..models.submission_cloud_upload import SubmissionCloudUpload
from ..models.task_progress_report import TaskProgressReport
from ..serializers.curator_submission_list_serializer import (
    CuratorSubmissionListSerializer,
)
from ..serializers.submission_cloud_upload_serializer import (
    SubmissionCloudUploadSerializer,
)
from ..serializers.submission_detail_serializer import SubmissionDetailSerializer
from ..serializers.task_progress_report_serializer import TaskProgressReportSerializer


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

        status_value = self.request.query_params.get("status")
        if status_value:
            status_list = [s.strip() for s in status_value.split(",") if s.strip()]
            if status_list:
                queryset = queryset.filter(status__in=status_list)

        target_value = self.request.query_params.get("target")
        if target_value:
            target_list = [t.strip() for t in target_value.split(",") if t.strip()]
            if target_list:
                queryset = queryset.filter(target__in=target_list)

        user_value = self.request.query_params.get("user")
        if user_value:
            queryset = queryset.filter(Q(user__username__icontains=user_value) | Q(user__email__icontains=user_value))

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


class CuratorSubmissionTaskProgressReportView(generics.ListAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, DjangoModelPermissions)
    serializer_class = TaskProgressReportSerializer

    def get_queryset(self):
        return TaskProgressReport.objects.filter(
            submission__broker_submission_id=self.kwargs["broker_submission_id"]
        ).order_by("-modified")


class CuratorSubmissionActionPermissions(DjangoModelPermissions):
    perms_map = {
        **DjangoModelPermissions.perms_map,
        "POST": ["%(app_label)s.change_%(model_name)s"],
    }


ACTION_DEFINITIONS = [
    {
        "key": "continue_release_submissions",
        "label": "Continue submission",
        "group": "Lifecycle",
        "callable": continue_release_submissions,
    },
    {
        "key": "cancel_selected_submissions",
        "label": "Cancel submission",
        "group": "Lifecycle",
        "callable": cancel_selected_submissions,
        "danger": True,
    },
    {
        "key": "create_helpdesk_issue_manually",
        "label": "Create helpdesk issue",
        "group": "Tickets",
        "callable": create_helpdesk_issue_manually,
    },
    {
        "key": "create_broker_objects_and_ena_xml",
        "label": "Create BrokerObjects & XML",
        "group": "XML / Broker Objects",
        "callable": create_broker_objects_and_ena_xml,
    },
    {
        "key": "re_create_ena_xml",
        "label": "Re-Create ENA XML",
        "group": "XML / Broker Objects",
        "callable": re_create_ena_xml,
    },
    {
        "key": "delete_broker_objects_and_ena_xml",
        "label": "Delete BrokerObjects & XML",
        "group": "XML / Broker Objects",
        "callable": delete_broker_objects_and_ena_xml,
        "danger": True,
    },
    {
        "key": "validate_against_ena",
        "label": "Validate against ENA",
        "group": "ENA",
        "callable": validate_against_ena,
    },
    {
        "key": "submit_to_ena_test",
        "label": "Submit to ENA test",
        "group": "ENA",
        "callable": submit_to_ena_test,
    },
    {
        "key": "modify_ena_objects_with_current_xml",
        "label": "Modify ENA objects",
        "group": "ENA",
        "callable": modify_ena_objects_with_current_xml,
    },
    {
        "key": "release_submission_study_on_ena",
        "label": "Release study on ENA",
        "group": "ENA",
        "callable": release_submission_study_on_ena,
    },
    {
        "key": "perform_targeted_sequence_submission",
        "label": "Perform targeted sequence submission",
        "group": "ENA",
        "callable": perform_targeted_sequence_submission,
    },
    {
        "key": "register_study_at_ena",
        "label": "Register study at ENA",
        "group": "ENA",
        "callable": register_study_at_ena,
    },
    {
        "key": "prepare_manifest",
        "label": "Prepare MANIFEST",
        "group": "MANIFEST",
        "callable": prepare_manifest,
    },
    {
        "key": "validate_manifest_at_ena",
        "label": "Validate MANIFEST at ENA",
        "group": "MANIFEST",
        "callable": validate_manifest_at_ena,
    },
    {
        "key": "submit_manifest_to_ena",
        "label": "Submit MANIFEST to ENA",
        "group": "MANIFEST",
        "callable": submit_manifest_to_ena,
    },
    {
        "key": "transfer_submission_cloud_uploads_to_ena",
        "label": "Transfer cloud uploads to ENA",
        "group": "Uploads",
        "callable": transfer_submission_cloud_uploads_to_ena,
    },
    {
        "key": "combine_csvs_to_abcd",
        "label": "Combine CSVs to ABCD",
        "group": "Conversion",
        "callable": combine_csvs_to_abcd,
    },
    {
        "key": "combine_cloud_uploaded_csvs_to_abcd",
        "label": "Combine cloud CSVs to ABCD",
        "group": "Conversion",
        "callable": combine_cloud_uploaded_csvs_to_abcd,
    },
    {
        "key": "download_auditable_text_data",
        "label": "Download XMLs",
        "group": "Downloads",
        "callable": download_auditable_text_data,
        "responseType": "file",
    },
]


class CuratorSubmissionActionSerializer(serializers.Serializer):
    action = serializers.CharField()

    def validate_action(self, value):
        action_keys = {action["key"] for action in ACTION_DEFINITIONS}
        if value not in action_keys:
            raise serializers.ValidationError("Unsupported action.")
        return value


class CuratorSubmissionActionView(APIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, CuratorSubmissionActionPermissions)
    queryset = Submission.objects.all()

    def get(self, request, broker_submission_id):
        actions = [
            {
                "key": action["key"],
                "label": action["label"],
                "group": action["group"],
                "danger": action.get("danger", False),
                "responseType": action.get("responseType", "json"),
            }
            for action in ACTION_DEFINITIONS
        ]
        return Response({"actions": actions})

    def post(self, request, broker_submission_id):
        serializer = CuratorSubmissionActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action_key = serializer.validated_data["action"]

        submission = Submission.objects.filter(broker_submission_id=broker_submission_id).first()
        if not submission:
            return Response({"detail": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)

        action = next(item for item in ACTION_DEFINITIONS if item["key"] == action_key)
        queryset = Submission.objects.filter(pk=submission.pk)

        result = action["callable"](None, request, queryset)
        if isinstance(result, HttpResponse):
            return result

        return Response({"status": "queued", "action": action_key})


STATE_DEFINITIONS = [
    Submission.SUBMITTED,
    Submission.OPEN,
    Submission.CANCELLED,
    Submission.CLOSED,
    Submission.ERROR,
]


class CuratorSubmissionStateSerializer(serializers.Serializer):
    state = serializers.CharField()

    def validate_state(self, value):
        if value not in STATE_DEFINITIONS:
            raise serializers.ValidationError("Unsupported state.")
        return value


class CuratorSubmissionStateView(APIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, CuratorSubmissionActionPermissions)
    queryset = Submission.objects.all()

    def post(self, request, broker_submission_id):
        serializer = CuratorSubmissionStateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_state = serializer.validated_data["state"]

        submission = Submission.objects.filter(broker_submission_id=broker_submission_id).first()
        if not submission:
            return Response({"detail": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)

        submission.status = new_state
        submission.save()

        return Response({"state": new_state})

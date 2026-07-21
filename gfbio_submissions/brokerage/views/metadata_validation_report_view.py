# -*- coding: utf-8 -*-
from django.http import Http404
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, TokenAuthentication, BasicAuthentication
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.response import Response
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload

from ..permissions.is_submission_owner import IsSubmissionOwner
from ..serializers.metadata_validation_report_serializer import MetadataValidationReportSerializer


class MetadataValidationReportView(RetrieveAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsSubmissionOwner)
    serializer_class = MetadataValidationReportSerializer
    queryset = MetadataValidationReport.objects.all()
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        submission_id = self.kwargs.get('broker_submission_id')
        
        # Filter reports by submission and ensure user is the submission owner
        return MetadataValidationReport.objects.filter(
            submission__broker_submission_id=submission_id,
            submission__user=user
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class LatestMetadataValidationReportView(GenericAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication)
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = MetadataValidationReportSerializer


    def get_latest_report_for_submission(self, submission_id):
        current_meta_data_upload = SubmissionCloudUpload.objects.filter(
            submission__broker_submission_id=submission_id,
            meta_data=True,
        ).exclude(
            status=SubmissionCloudUpload.STATUS_DELETED
        ).order_by('-created').first()

        if not current_meta_data_upload or not current_meta_data_upload.file_upload:
            return None

        return MetadataValidationReport.objects.filter(
            submission__broker_submission_id=submission_id,
            upload_file=current_meta_data_upload,
            file_md5_checksum=current_meta_data_upload.file_upload.md5,
        ).order_by('-created').first()


    def get(self, request, *args, **kwargs):
        submission_id = self.kwargs.get('broker_submission_id')
        latest_report = self.get_latest_report_for_submission(submission_id)

        if latest_report is None:
            raise Http404

        self.check_object_permissions(request, latest_report)
        serializer = self.get_serializer(latest_report)
        return Response(serializer.data)

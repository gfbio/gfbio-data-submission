# -*- coding: utf-8 -*-
from django.http import Http404
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, TokenAuthentication, BasicAuthentication
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.response import Response
from gfbio_submissions.brokerage.models.checksum_validation_report import ChecksumFileResult, ChecksumValidationReport
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.serializers.checksum_validation_report_serializer import ChecksumValidationReportSerializer

from ..serializers.metadata_validation_report_serializer import MetadataValidationReportSerializer


class ChecksumValidationReportView(RetrieveAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication)
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ChecksumValidationReportSerializer


    def get(self, request, *args, **kwargs):
        submission_id = self.kwargs.get('broker_submission_id')
        latest_report = self.get_latest_report_for_submission(submission_id)

        uploads = SubmissionCloudUpload.objects.filter(
            submission__broker_submission_id=submission_id,
        ).exclude(
            status=SubmissionCloudUpload.STATUS_DELETED
        )
        
        checksum_report = ChecksumValidationReport()
        checksumfileresult_set = []
        
        error_count = 0
        warning_count = 0
        success_count = 0

        for upload in uploads:
            if upload.status == SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM:
                error_count = error_count + 1
                checksumfileresult_set.append(
                    ChecksumFileResult(
                        upload_pk = upload.pk,
                        file_name = upload.file.original_filename,
                        file_md5_checksum = upload.file.md5,
                        status = "ERROR",
                        message = "The checksum missmatched."
                    )
                )
            elif upload.status in [SubmissionCloudUpload.STATUS_UPLOADED, SubmissionCloudUpload.STATUS_ACTIVE, SubmissionCloudUpload.STATUS_NEW]
                warning_count = warning_count + 1
                checksumfileresult_set.append(
                    ChecksumFileResult(
                        upload_pk = upload.pk,
                        file_name = upload.file.original_filename,
                        file_md5_checksum = upload.file.md5,
                        status = "PENDING",
                        message = "The checksum-calculation was not executed now."
                    )
                )
            else:
                success_count = success_count + 1

        self.check_object_permissions(request, checksum_report)
        serializer = self.get_serializer(latest_report)
        return Response(serializer.data)

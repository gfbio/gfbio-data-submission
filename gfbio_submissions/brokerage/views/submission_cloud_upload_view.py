# -*- coding: utf-8 -*-
from pprint import pprint
from uuid import uuid4

from django.db import transaction
from dt_upload.models import MultiPartUpload
from dt_upload.serializers import backend_based_upload_serializers
from dt_upload.views import backend_based_upload_mixins, backend_based_upload_views
from rest_framework import mixins, generics, permissions, status
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.response import Response

from gfbio_submissions.generic.models.request_log import RequestLog
from ..configuration.settings import ATAX
from ..models.submission import Submission
from ..models.submission_cloud_upload import SubmissionCloudUpload
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_cloud_upload_serializer import SubmissionCloudUploadSerializer


class SubmissionCloudUploadView(mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = SubmissionCloudUpload.objects.all()
    serializer_class = SubmissionCloudUploadSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    def perform_create(self, serializer, submission, file_upload_request, meta_data, attach_to_ticket):
        return serializer.save(user=self.request.user, submission=submission, file_upload=file_upload_request,
                               meta_data=meta_data, attach_to_ticket=attach_to_ticket)

    # TODO: almost the same as in std SubmissionUpload, worker code has to be extracted into dedicated methods
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
                    url="brokerage:submissions_cloud_upload",
                    method=RequestLog.POST,
                    submission_id=broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )

            return response

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
        meta_data = serializer.validated_data.get("meta_data", False)
        attach_to_ticket = serializer.validated_data.get("attach_to_ticket", False)

        # TODO: try and except block
        # TODO: refactor worker code to dedicated methods

        upload_serializer = backend_based_upload_serializers.MultipartUploadStartSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)

        prefix_with_folder = f"{broker_submission_id}/"
        dt_upload_response_status, dt_upload_data, file_upload_request = backend_based_upload_mixins.generate_multipart_upload_objects(
            request,
            upload_serializer,
            file_key_prefix=prefix_with_folder
        )

        obj = self.perform_create(serializer, sub, file_upload_request, meta_data=meta_data, attach_to_ticket=attach_to_ticket)

        headers = self.get_success_headers(serializer.data)
        data_content = dict(serializer.data)
        data_content.pop("submission", 0)
        data_content["id"] = obj.pk
        data_content["broker_submission_id"] = sub.broker_submission_id

        reponse_status = status.HTTP_201_CREATED
        if dt_upload_response_status > reponse_status:
            reponse_status = dt_upload_response_status

        response = Response(data_content | dt_upload_data, status=reponse_status, headers=headers)

        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                url="brokerage:submissions_cloud_upload",
                method=RequestLog.POST,
                user=sub.user,
                submission_id=sub.broker_submission_id,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


# TODO: this is a test for potential custom code that could be inserted into dt_upload workflows. can be
#  replaced by the dt_upload view for this via urls.py
class SubmissionCloudUploadPartURLView(backend_based_upload_views.GetUploadPartURLView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    def create(self, request, *args, **kwargs):
        response = super(SubmissionCloudUploadPartURLView, self).create(request, *args, **kwargs)
        upload = MultiPartUpload.objects.get(upload_id=kwargs["upload_id"])
        upload.file_upload_request.s3_presigned_url = response.data["presigned_url"]
        upload.file_upload_request.save()        
        
        return response


class SubmissionCloudUploadUpdatePartView(backend_based_upload_views.UpdateUploadPartView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)


class SubmissionCloudUploadCompleteView(backend_based_upload_views.CompleteMultiPartUploadView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    def put(self, request, *args, **kwargs):
        response = self.update(request, *args, **kwargs)
        try:
            mpu = MultiPartUpload.objects.get(upload_id=kwargs.get("upload_id"))
        except MultiPartUpload.DoesNotExist as e:
            mpu = None
        if mpu is not None:
            if hasattr(mpu.file_upload_request, "submissioncloudupload"):
                mpu.file_upload_request.submissioncloudupload.trigger_attach_to_issue()
        return response


class SubmissionCloudUploadAbortView(backend_based_upload_views.AbortMultiPartUploadView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

# -*- coding: utf-8 -*-
from uuid import uuid4

from django.db import transaction
from dt_upload.serializers import backend_based_upload_serializers
from dt_upload.views import backend_based_upload_mixins, backend_based_upload_views
from rest_framework import mixins, generics, permissions, status
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.response import Response

from gfbio_submissions.generic.models.request_log import RequestLog
from ..models.submission import Submission
from ..models.submission_cloud_upload import SubmissionCloudUpload
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_cloud_upload_serializer import SubmissionCloudUploadSerializer


class SubmissionCloudUploadView(mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = SubmissionCloudUpload.objects.all()
    serializer_class = SubmissionCloudUploadSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    def perform_create(self, serializer, submission, file_upload_request):
        return serializer.save(user=self.request.user, submission=submission, file_upload=file_upload_request)

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

        # TODO: integrate ATAX specific workflows
        # if sub.target == ATAX and sub.status == Submission.SUBMITTED:
        #     return Response(
        #         data={
        #             "broker_submission_id": sub.broker_submission_id,
        #             "status": sub.status,
        #             "embargo": sub.embargo,
        #             "error": "no uploads allowed with current submission status",
        #         },
        #         status=status.HTTP_400_BAD_REQUEST,
        #     )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # TODO: try and except block
        # TODO: refactor worker code to dedicated methods
        upload_serializer = backend_based_upload_serializers.MultipartUploadStartSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)

        dt_upload_response_status, dt_upload_data, file_upload_request = backend_based_upload_mixins.generate_multipart_upload_objects(
            request,
            upload_serializer,
            file_key_prefix=broker_submission_id
        )

        obj = self.perform_create(serializer, sub, file_upload_request)

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
    def create(self, request, *args, **kwargs):
        response = super(SubmissionCloudUploadPartURLView, self).create(request, *args, **kwargs)
        return response

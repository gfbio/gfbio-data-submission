# -*- coding: utf-8 -*-
from pprint import pprint
from uuid import uuid4

from django.db import transaction
from rest_framework import mixins, generics, permissions, status
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.response import Response

from gfbio_submissions.generic.models.request_log import RequestLog
from ..models.submission import Submission
from ..models.submission_cloud_upload import SubmissionCloudUpload
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_cloud_upload_serializer import SubmissionCloudUploadSerializer

from dt_upload.views import backend_based_upload_mixins
from dt_upload.serializers import backend_based_upload_serializers


class SubmissionCloudUploadView(mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = SubmissionCloudUpload.objects.all()
    serializer_class = SubmissionCloudUploadSerializer
    # parser_classes = (
    #     parsers.MultiPartParser,
    #     parsers.FormParser,
    # )
    authentication_classes = (TokenAuthentication, BasicAuthentication)
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
                    url="brokerage:submissions_cloud_upload",
                    method=RequestLog.POST,
                    submission_id=broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )

            return response

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

        upload_serializer = backend_based_upload_serializers.MultipartUploadStartSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)

        response_status, data = backend_based_upload_mixins.generate_multipart_upload_objects(request,
                                                                                              upload_serializer,
                                                                                              file_key_prefix=broker_submission_id)
        print(response_status)
        pprint(data)

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

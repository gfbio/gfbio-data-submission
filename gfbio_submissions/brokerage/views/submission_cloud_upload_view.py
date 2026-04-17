# -*- coding: utf-8 -*-
import hashlib
import math
import os
from uuid import uuid4

from django.db import transaction
from dt_upload.models import backend_based_upload_models, MultiPartUpload
from dt_upload.serializers import backend_based_upload_serializers
from dt_upload.views import backend_based_upload_mixins, backend_based_upload_views
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, inline_serializer
from rest_framework import mixins, generics, permissions, status, parsers, serializers
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.response import Response

from gfbio_submissions.generic.models.request_log import RequestLog
from gfbio_submissions.brokerage.tasks.process_tasks.verify_file_upload_request_checksum_in_bucket import \
    verify_file_upload_request_checksum_in_bucket_task
from ..configuration.settings import ATAX, SUBMISSION_DELAY
from ..models.submission import Submission
from ..models.submission_cloud_upload import SubmissionCloudUpload
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_cloud_upload_serializer import SubmissionCloudUploadSerializer


@extend_schema(tags=["upload-multipart"])
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

    @extend_schema(
        operation_id="upload multipart 1 initialize",
        summary="Advanced multipart step 1: initialize upload",
        description="Start a multipart upload for a submission and create upload metadata.",
        parameters=[
            OpenApiParameter(
                name="broker_submission_id",
                description="Unique submission ID of submission to upload a file to (UUID, RFC4122).",
                location="path",
                required=True,
                type=OpenApiTypes.UUID,
            )
        ],
        request=SubmissionCloudUploadSerializer,
        responses={
            201: OpenApiResponse(
                description="Cloud upload initialized successfully.",
                response=SubmissionCloudUploadSerializer(many=False),
            ),
            400: OpenApiResponse(description="Validation error."),
            404: OpenApiResponse(description="Submission does not exist."),
        },
    )
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


# TODO: this is a test for potential custom code that could be inserted into dt_upload workflows. can be
#  replaced by the dt_upload view for this via urls.py
@extend_schema(tags=["upload-multipart"])
class SubmissionCloudUploadPartURLView(backend_based_upload_views.GetUploadPartURLView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    def create(self, request, *args, **kwargs):
        response = super(SubmissionCloudUploadPartURLView, self).create(request, *args, **kwargs)
        upload = MultiPartUpload.objects.filter(upload_id=kwargs["upload_id"]).first()
        if upload:
            upload.file_upload_request.s3_presigned_url = response.data["presigned_url"]
            upload.file_upload_request.save()
        
        return response

    @extend_schema(
        operation_id="upload multipart 2 create part url",
        summary="Advanced multipart step 2: create pre-signed part URL",
        description="Create a pre-signed URL for uploading the next multipart chunk.",
        responses={
            200: OpenApiResponse(description="Pre-signed URL returned."),
            400: OpenApiResponse(description="Validation error."),
            404: OpenApiResponse(description="Upload id not found."),
        },
    )
    def post(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


@extend_schema(tags=["upload-multipart"])
class SubmissionCloudUploadUpdatePartView(backend_based_upload_views.UpdateUploadPartView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        operation_id="upload multipart 3 confirm part",
        summary="Advanced multipart step 3: confirm uploaded part",
        description="Mark an uploaded multipart chunk as completed and store its ETag.",
        responses={
            200: OpenApiResponse(description="Part status updated."),
            400: OpenApiResponse(description="Validation error."),
            404: OpenApiResponse(description="Upload id or part not found."),
        },
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)


@extend_schema(tags=["upload-multipart"])
class SubmissionCloudUploadCompleteView(backend_based_upload_views.CompleteMultiPartUploadView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    @extend_schema(
        operation_id="upload multipart 4 complete",
        summary="Advanced multipart step 4: complete upload",
        description="Finalize multipart upload and trigger checksum verification workflow.",
        responses={
            200: OpenApiResponse(description="Multipart upload completed."),
            400: OpenApiResponse(description="Validation error."),
            404: OpenApiResponse(description="Upload id not found."),
        },
    )
    def put(self, request, *args, **kwargs):
        response = self.update(request, *args, **kwargs)
        try:
            mpu = MultiPartUpload.objects.get(upload_id=kwargs.get("upload_id"))
        except MultiPartUpload.DoesNotExist as e:
            mpu = None
        if mpu is not None:
            #submission_cloud_upload = mpu.file_upload_request.submissioncloudupload
            submission_cloud_upload = SubmissionCloudUpload.objects.get(pk=mpu.file_upload_request.submissioncloudupload.pk)
            submission_cloud_upload.status = SubmissionCloudUpload.STATUS_UPLOADED
            submission_cloud_upload.save()
            submission_cloud_upload.log_change([{"changed": {"fields": [f"status changed to {submission_cloud_upload.status}"]}}], self.request.user.id)
            verify_file_upload_request_checksum_in_bucket_task.apply_async(
                kwargs={
                    "submission_id": mpu.file_upload_request.submissioncloudupload.submission.pk,
                    "submission_cloud_upload_id": mpu.file_upload_request.submissioncloudupload.pk
                },
                countdown=SUBMISSION_DELAY,
            )
            if hasattr(mpu.file_upload_request, "submissioncloudupload"):
                mpu.file_upload_request.submissioncloudupload.trigger_attach_to_issue()
        return response


@extend_schema(tags=["upload-multipart"])
class SubmissionCloudUploadAbortView(backend_based_upload_views.AbortMultiPartUploadView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    @extend_schema(
        operation_id="upload multipart 5 abort",
        summary="Advanced multipart optional step: abort upload",
        description="Abort an active multipart upload and release temporary upload state.",
        responses={
            204: OpenApiResponse(description="Multipart upload aborted."),
            404: OpenApiResponse(description="Upload id not found."),
        },
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


class SubmissionCloudUploadSingleCallSerializer(serializers.Serializer):
    files = serializers.ListField(child=serializers.FileField(), required=True, allow_empty=False)
    attach_to_ticket = serializers.BooleanField(required=False, default=False)
    meta_data = serializers.BooleanField(required=False, default=False)
    part_size = serializers.IntegerField(required=False, default=100 * 1024 * 1024, min_value=5 * 1024 * 1024)


@extend_schema(tags=["upload"])
class SubmissionCloudUploadSingleCallView(generics.GenericAPIView):
    queryset = SubmissionCloudUpload.objects.all()
    serializer_class = SubmissionCloudUploadSingleCallSerializer
    parser_classes = (
        parsers.MultiPartParser,
        parsers.FormParser,
    )
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    def _get_submission_or_response(self, broker_submission_id):
        try:
            return Submission.objects.get(broker_submission_id=broker_submission_id), None
        except Submission.DoesNotExist:
            response = Response(
                {"submission": "No submission for this broker_submission_id: {0}".format(broker_submission_id)},
                status=status.HTTP_404_NOT_FOUND,
            )
            with transaction.atomic():
                RequestLog.objects.create(
                    type=RequestLog.INCOMING,
                    url="brokerage:submissions_cloud_upload_single_call",
                    method=RequestLog.POST,
                    submission_id=broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )
            return None, response

    @staticmethod
    def _calculate_hashes(uploaded_file):
        md5_hash = hashlib.md5()
        sha256_hash = hashlib.sha256()
        for chunk in uploaded_file.chunks():
            md5_hash.update(chunk)
            sha256_hash.update(chunk)
        uploaded_file.seek(0)
        return md5_hash.hexdigest(), sha256_hash.hexdigest()

    def _upload_single_file(self, submission, uploaded_file, part_size, attach_to_ticket=False, meta_data=False):
        file_name = os.path.basename(uploaded_file.name)
        file_size = uploaded_file.size
        file_type = getattr(uploaded_file, "content_type", None) or "application/octet-stream"
        total_parts = max(1, math.ceil(file_size / part_size))
        md5, sha256 = self._calculate_hashes(uploaded_file)

        key_prefix = f"{submission.broker_submission_id}/"

        start_payload = {
            "filename": file_name,
            "filetype": file_type,
            "total_size": file_size,
            "part_size": part_size,
            "total_parts": total_parts,
            "md5": md5,
            "sha256": sha256,
        }
        upload_serializer = backend_based_upload_serializers.MultipartUploadStartSerializer(data=start_payload)
        upload_serializer.is_valid(raise_exception=True)

        dt_upload_response_status, dt_upload_data, file_upload_request = backend_based_upload_mixins.generate_multipart_upload_objects(
            self.request,
            upload_serializer,
            file_key_prefix=key_prefix
        )

        submission_cloud_upload = SubmissionCloudUpload.objects.create(
            user=self.request.user,
            submission=submission,
            file_upload=file_upload_request,
            meta_data=meta_data,
            attach_to_ticket=attach_to_ticket,
        )
        upload_id = dt_upload_data["upload_id"]
        bucket_name, s3_client = backend_based_upload_mixins.get_s3_client()
        completed_parts = []

        try:
            part_number = 1
            for chunk in uploaded_file.chunks(chunk_size=part_size):
                s3_response = s3_client.upload_part(
                    Bucket=bucket_name,
                    Key=file_upload_request.file_key,
                    PartNumber=part_number,
                    UploadId=upload_id,
                    Body=chunk,
                )
                etag = s3_response["ETag"]
                completed_parts.append({"PartNumber": part_number, "ETag": etag})
                backend_based_upload_models.UploadPart.objects.filter(
                    multipart_upload__upload_id=upload_id,
                    part_number=part_number,
                ).update(completed=True, etag=etag)
                part_number += 1

            completed_parts.sort(key=lambda p: p["PartNumber"])
            complete_serializer = backend_based_upload_serializers.CompleteMultipartUploadSerializer(
                data={"parts": completed_parts}
            )
            complete_serializer.is_valid(raise_exception=True)
            complete_status, complete_data = backend_based_upload_mixins.complete_multipart_upload(
                complete_serializer, upload_id
            )
            if complete_status >= status.HTTP_400_BAD_REQUEST:
                s3_client.abort_multipart_upload(
                    Bucket=bucket_name,
                    Key=file_upload_request.file_key,
                    UploadId=upload_id,
                )
                file_upload_request.status = "FAILED"
                file_upload_request.save(update_fields=["status"])
                payload = complete_data if isinstance(complete_data, dict) else {"detail": complete_data}
                return payload, complete_status

        except Exception:
            s3_client.abort_multipart_upload(
                Bucket=bucket_name,
                Key=file_upload_request.file_key,
                UploadId=upload_id,
            )
            file_upload_request.status = "FAILED"
            file_upload_request.save(update_fields=["status"])
            raise

        file_upload_request.refresh_from_db()
        submission_cloud_upload.status = SubmissionCloudUpload.STATUS_UPLOADED
        submission_cloud_upload.save(update_fields=["status"])
        submission_cloud_upload.log_change(
            [{"changed": {"fields": [f"status changed to {submission_cloud_upload.status}"]}}],
            self.request.user.id
        )
        verify_file_upload_request_checksum_in_bucket_task.apply_async(
            kwargs={
                "submission_id": submission_cloud_upload.submission.pk,
                "submission_cloud_upload_id": submission_cloud_upload.pk
            },
            countdown=SUBMISSION_DELAY,
        )
        submission_cloud_upload.trigger_attach_to_issue()

        response_data = {
            "id": submission_cloud_upload.pk,
            "broker_submission_id": submission.broker_submission_id,
            "upload_id": upload_id,
            "file_name": file_upload_request.original_filename,
            "file_size": file_upload_request.file_size,
            "md5": file_upload_request.md5,
            "sha256": file_upload_request.sha256,
            "meta_data": meta_data,
            "attach_to_ticket": attach_to_ticket,
            "status": submission_cloud_upload.status,
            "location": complete_data.get("location"),
        }
        response_status = max(status.HTTP_201_CREATED, dt_upload_response_status)
        return response_data, response_status

    @extend_schema(
        operation_id="create submission cloud upload single request",
        summary="Recommended: request-based cloud upload",
        description=(
                "Upload one or multiple files via a single API request. This is the recommended endpoint for clients. "
                "It internally performs the multipart flow (initialize upload, upload parts, confirm parts, and complete upload). "
                "Use the `cloud-upload-multipart` endpoints only if you need manual control over those steps."
        ),
        parameters=[
            OpenApiParameter(
                name="broker_submission_id",
                description="Unique submission ID of the submission to upload to (UUID, RFC4122).",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            )
        ],
        request=SubmissionCloudUploadSingleCallSerializer,
        responses={
            201: OpenApiResponse(
                description="Upload completed successfully.",
                response=inline_serializer(
                    name="SubmissionCloudUploadBatchResponse",
                    fields={
                        "broker_submission_id": serializers.UUIDField(),
                        "total_files": serializers.IntegerField(),
                        "uploaded_files": serializers.IntegerField(),
                        "failed_files": serializers.IntegerField(),
                        "results": serializers.ListField(
                            child=inline_serializer(
                                name="SubmissionCloudUploadBatchResultItem",
                                fields={
                                    "file_name": serializers.CharField(),
                                    "status_code": serializers.IntegerField(),
                                    "result": serializers.JSONField(required=False),
                                    "error": serializers.CharField(required=False),
                                },
                            ),
                        ),
                    }
                )
            ),
            207: OpenApiResponse(description="Partial success: at least one file failed."),
            400: OpenApiResponse(description="Validation or workflow constraint error."),
            404: OpenApiResponse(description="Submission does not exist."),
        },
    )
    def post(self, request, *args, **kwargs):
        broker_submission_id = kwargs.get("broker_submission_id", uuid4())
        sub, not_found_response = self._get_submission_or_response(broker_submission_id)
        if not_found_response is not None:
            return not_found_response

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

        uploaded_files = serializer.validated_data["files"]
        part_size = serializer.validated_data["part_size"]
        attach_to_ticket = serializer.validated_data["attach_to_ticket"]
        meta_data = serializer.validated_data["meta_data"]

        results = []
        has_failures = False
        for item in uploaded_files:
            try:
                item_data, item_status = self._upload_single_file(
                    submission=sub,
                    uploaded_file=item,
                    part_size=part_size,
                    attach_to_ticket=attach_to_ticket,
                    meta_data=meta_data,
                )
                has_failures = has_failures or item_status >= status.HTTP_400_BAD_REQUEST
                results.append({
                    "file_name": item.name,
                    "status_code": item_status,
                    "result": item_data,
                })
            except Exception as exc:
                has_failures = True
                results.append({
                    "file_name": item.name,
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "error": str(exc),
                })

        response_status = status.HTTP_207_MULTI_STATUS if has_failures else status.HTTP_201_CREATED
        response_data = {
            "broker_submission_id": sub.broker_submission_id,
            "total_files": len(uploaded_files),
            "uploaded_files": len([item for item in results if item["status_code"] < status.HTTP_400_BAD_REQUEST]),
            "failed_files": len([item for item in results if item["status_code"] >= status.HTTP_400_BAD_REQUEST]),
            "results": results,
        }
        response = Response(response_data, status=response_status)

        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                url="brokerage:submissions_cloud_upload_single_call",
                method=RequestLog.POST,
                user=sub.user,
                submission_id=sub.broker_submission_id,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response

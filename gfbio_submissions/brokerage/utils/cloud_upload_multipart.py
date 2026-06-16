# -*- coding: utf-8 -*-
"""Helpers to restart multipart uploads on an existing FileUploadRequest (same S3 key)."""
from __future__ import annotations

import logging

from botocore.exceptions import ClientError
from django.db import transaction
from dt_upload.models import MultiPartUpload, backend_based_upload_models
from dt_upload.views import backend_based_upload_mixins
from rest_framework import status

logger = logging.getLogger(__name__)


def abort_multipart_uploads_for_file_upload(file_upload_request) -> None:
    """Abort all in-progress multipart sessions for this file upload request."""
    for multipart in MultiPartUpload.objects.filter(file_upload_request=file_upload_request):
        if not multipart.upload_id:
            continue
        try:
            backend_based_upload_mixins.abort_multipart_upload(multipart.upload_id)
        except Exception:
            logger.warning(
                "Failed to abort multipart upload_id=%s for file_upload=%s",
                multipart.upload_id,
                file_upload_request.pk,
                exc_info=True,
            )


def _replace_multipart_upload_parts(multipart_upload: MultiPartUpload, total_parts: int) -> list:
    backend_based_upload_models.UploadPart.objects.filter(multipart_upload=multipart_upload).delete()
    upload_parts = [
        backend_based_upload_models.UploadPart(
            multipart_upload=multipart_upload,
            part_number=i + 1,
        )
        for i in range(total_parts)
    ]
    backend_based_upload_models.UploadPart.objects.bulk_create(upload_parts)
    return upload_parts


def _reuse_or_create_multipart_upload(
    file_upload_request,
    *,
    upload_id: str,
    total_parts: int,
) -> tuple[MultiPartUpload, list]:
    """
    Keep the single ``MultiPartUpload`` row per ``FileUploadRequest`` (DB unique constraint).

    Updates ``upload_id`` / ``parts_expected`` in place and replaces all ``UploadPart`` rows.
    """
    multipart_upload = MultiPartUpload.objects.filter(file_upload_request=file_upload_request).first()
    if multipart_upload is None:
        multipart_upload = MultiPartUpload.objects.create(
            upload_id=upload_id,
            file_upload_request=file_upload_request,
            parts_expected=total_parts,
        )
    else:
        multipart_upload.upload_id = upload_id
        multipart_upload.parts_expected = total_parts
        if hasattr(multipart_upload, "completed_at"):
            multipart_upload.completed_at = None
        multipart_upload.save()
    upload_parts = _replace_multipart_upload_parts(multipart_upload, total_parts)
    return multipart_upload, upload_parts


@transaction.atomic
def restart_multipart_on_file_upload_request(request, file_upload_request, upload_serializer) -> tuple[int, dict, str]:
    """
    Start a new S3 multipart upload on an existing FileUploadRequest (same ``file_key``).

    Returns ``(http_status, response_data, upload_id)``.
    """
    validated = upload_serializer.validated_data
    abort_multipart_uploads_for_file_upload(file_upload_request)

    file_upload_request.file_type = validated["filetype"]
    file_upload_request.file_size = validated["total_size"]
    if validated.get("md5"):
        file_upload_request.md5 = validated["md5"]
    if validated.get("sha256"):
        file_upload_request.sha256 = validated["sha256"]
    file_upload_request.status = "PENDING"
    file_upload_request.s3_location = ""
    file_upload_request.save()

    bucket_name, s3_client = backend_based_upload_mixins.get_s3_client()
    try:
        s3_response = s3_client.create_multipart_upload(
            Bucket=bucket_name,
            Key=file_upload_request.file_key,
            ContentType=validated["filetype"],
        )
    except ClientError as exc:
        logger.exception("create_multipart_upload failed for file_upload=%s", file_upload_request.pk)
        return status.HTTP_500_INTERNAL_SERVER_ERROR, {"error": str(exc)}, ""

    upload_id = s3_response["UploadId"]
    multipart_upload, upload_parts = _reuse_or_create_multipart_upload(
        file_upload_request,
        upload_id=upload_id,
        total_parts=validated["total_parts"],
    )

    response_data = {
        "upload_id": upload_id,
        "file_key": file_upload_request.file_key,
        "parts": [{"part_number": p.part_number} for p in upload_parts],
    }
    return status.HTTP_201_CREATED, response_data, upload_id

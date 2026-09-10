# -*- coding: utf-8 -*-
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseForbidden, StreamingHttpResponse
from django.views import View
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, TokenAuthentication, BasicAuthentication

from ..models.submission_cloud_upload import SubmissionCloudUpload
from ..utils.cloud_upload_download import (
    create_incoming_download_request_log,
    iter_tracked_download,
    stream_file_upload,
    stream_submission_zip,
)

_SINGLE_DOWNLOAD_URL = "brokerage:submissions_cloud_file_download"
_ZIP_DOWNLOAD_URL = "brokerage:submissions_cloud_zip_download"


def _cloud_upload_download_filename(cloud_upload):
    file_upload = cloud_upload.file_upload
    if file_upload and file_upload.original_filename:
        return file_upload.original_filename
    return f"cloud upload {cloud_upload.pk}"


def _is_cloud_upload_downloadable(cloud_upload):
    file_upload = cloud_upload.file_upload
    return file_upload is not None and file_upload.status == "COMPLETED"


def _non_downloadable_cloud_uploads(cloud_uploads):
    return [
        cloud_upload
        for cloud_upload in cloud_uploads
        if not _is_cloud_upload_downloadable(cloud_upload)
    ]


def _cloud_upload_file_recency(cloud_upload):
    file_upload = getattr(cloud_upload, "file_upload", None)
    if file_upload is not None and file_upload.modified is not None:
        return (file_upload.modified, cloud_upload.pk)
    return (cloud_upload.modified, cloud_upload.pk)


def _pick_newest_cloud_upload_per_original_filename(cloud_uploads):
    newest_by_filename = {}
    for cloud_upload in sorted(
        cloud_uploads,
        key=_cloud_upload_file_recency,
        reverse=True,
    ):
        filename = _cloud_upload_download_filename(cloud_upload)
        if filename not in newest_by_filename:
            newest_by_filename[filename] = cloud_upload
    return list(newest_by_filename.values())


def _authenticated_user(request):
    user = getattr(request, "user", None)
    if user is not None and getattr(user, "is_authenticated", False):
        return user
    return None


def _log_download_request(
    request,
    *,
    url,
    broker_submission_id,
    response_status,
    mode,
    filenames,
    status,
    response_content="",
    error=None,
):
    details = {
        "mode": mode,
        "filenames": list(filenames),
        "status": status,
    }
    if error is not None:
        details["error"] = str(error)
    return create_incoming_download_request_log(
        url=url,
        user=_authenticated_user(request),
        submission_id=broker_submission_id,
        response_status=response_status,
        response_content=response_content,
        request_details=details,
    )


class SubmissionCloudGetDownloadLinkView(View):
    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication)
    permission_classes = (permissions.IsAuthenticated)

    
    def get(self, request, broker_submission_id, file_id):
        cloud_upload = SubmissionCloudUpload.objects.get(pk=file_id)
        file_upload = cloud_upload.file_upload
        try:
            if str(cloud_upload.submission.broker_submission_id) != broker_submission_id:
                message = "The requested file is not part of the submission the the file is requested for."
                _log_download_request(
                    request,
                    url=_SINGLE_DOWNLOAD_URL,
                    broker_submission_id=broker_submission_id,
                    response_status=403,
                    mode="single",
                    filenames=[_cloud_upload_download_filename(cloud_upload)],
                    status="rejected",
                    response_content=message,
                )
                return HttpResponseForbidden(message)
            if not _is_cloud_upload_downloadable(cloud_upload):
                message = "The requested file was not completely uploaded in the first place."
                _log_download_request(
                    request,
                    url=_SINGLE_DOWNLOAD_URL,
                    broker_submission_id=broker_submission_id,
                    response_status=409,
                    mode="single",
                    filenames=[_cloud_upload_download_filename(cloud_upload)],
                    status="rejected",
                    response_content=message,
                )
                return HttpResponse(message, status=409)
            filename = file_upload.original_filename
            log = _log_download_request(
                request,
                url=_SINGLE_DOWNLOAD_URL,
                broker_submission_id=broker_submission_id,
                response_status=200,
                mode="single",
                filenames=[filename],
                status="started",
            )
            request_id = str(log.request_id) if log is not None else None
            stream = stream_file_upload(
                file_upload,
                request_id=request_id,
                broker_submission_id=broker_submission_id,
            )
            if log is not None:
                stream = iter_tracked_download(stream, request_log_id=log.request_id)
            response = StreamingHttpResponse(stream, content_type='application/data')
            response['Content-Disposition'] = f'attachment; filename={filename}'
            return response
        except Exception as e:
            raise Exception(f"Error getting download-info for file! {e}")


class SubmissionCloudZipAllFilesAndDownload(View):
    def get(self, request, broker_submission_id):
        files = SubmissionCloudUpload.objects.filter(
            submission__broker_submission_id=broker_submission_id
        ).exclude(
            status=SubmissionCloudUpload.STATUS_DELETED
        ).select_related("file_upload")

        files_for_zip = _pick_newest_cloud_upload_per_original_filename(files)

        if any(cloud_upload.file_upload is None for cloud_upload in files_for_zip):
            message = "There are empty files with no upload. Please delete these files first."
            _log_download_request(
                request,
                url=_ZIP_DOWNLOAD_URL,
                broker_submission_id=broker_submission_id,
                response_status=409,
                mode="zip",
                filenames=[_cloud_upload_download_filename(cloud_upload) for cloud_upload in files_for_zip],
                status="rejected",
                response_content=message,
            )
            return HttpResponse(message, status=409)

        non_downloadable = _non_downloadable_cloud_uploads(files_for_zip)
        if non_downloadable:
            error_msg = "Some files were not completely uploaded in the first place. Please delete or reupload the files: "
            error_msg += ", ".join(_cloud_upload_download_filename(cloud_upload) for cloud_upload in non_downloadable)
            _log_download_request(
                request,
                url=_ZIP_DOWNLOAD_URL,
                broker_submission_id=broker_submission_id,
                response_status=409,
                mode="zip",
                filenames=[_cloud_upload_download_filename(cloud_upload) for cloud_upload in non_downloadable],
                status="rejected",
                response_content=error_msg,
            )
            return HttpResponse(error_msg, status=409)

        downloadable_files = [cloud_upload for cloud_upload in files_for_zip if _is_cloud_upload_downloadable(cloud_upload)]
        if not downloadable_files:
            message = "There are no files available for download."
            _log_download_request(
                request,
                url=_ZIP_DOWNLOAD_URL,
                broker_submission_id=broker_submission_id,
                response_status=409,
                mode="zip",
                filenames=[],
                status="rejected",
                response_content=message,
            )
            return HttpResponse(message, status=409)

        filenames = [_cloud_upload_download_filename(cloud_upload) for cloud_upload in downloadable_files]
        log = _log_download_request(
            request,
            url=_ZIP_DOWNLOAD_URL,
            broker_submission_id=broker_submission_id,
            response_status=200,
            mode="zip",
            filenames=filenames,
            status="started",
        )
        filename = f"submission_{broker_submission_id}.zip"
        stream = stream_submission_zip(
            downloadable_files,
            request_id=str(log.request_id) if log is not None else None,
            broker_submission_id=broker_submission_id,
        )
        if log is not None:
            stream = iter_tracked_download(stream, request_log_id=log.request_id)
        response = StreamingHttpResponse(stream, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename={filename}'
        response["X-Accel-Buffering"] = "no"
        return response

    
class SubmissionCloudZipAllFilesAndDownloadRedirect(View):
    def get(self, request, broker_submission_id):
        return HttpResponseRedirect(f"/api/downloads/submissions/{broker_submission_id}/uploads/zip/")

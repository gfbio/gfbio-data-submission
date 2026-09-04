# -*- coding: utf-8 -*-
from django.conf import settings
from django.views import View
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseForbidden, StreamingHttpResponse
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, TokenAuthentication, BasicAuthentication
from zipstream import ZipStream

from ..models.submission_cloud_upload import SubmissionCloudUpload
from ..utils.cloud_upload_download import build_zip_file_entries, stream_file_upload


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


class SubmissionCloudGetDownloadLinkView(View):
    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication)
    permission_classes = (permissions.IsAuthenticated)

    
    def get(self, request, broker_submission_id, file_id):
        cloud_upload = SubmissionCloudUpload.objects.get(pk=file_id)
        file_upload = cloud_upload.file_upload
        try:
            if str(cloud_upload.submission.broker_submission_id) != broker_submission_id:
                return HttpResponseForbidden("The requested file is not part of the submission the the file is requested for.")
            if not _is_cloud_upload_downloadable(cloud_upload):
                return HttpResponse(
                    "The requested file was not completely uploaded in the first place.",
                    status=409,
                )
            response = StreamingHttpResponse(stream_file_upload(file_upload), content_type='application/data')
            response['Content-Disposition'] = f'attachment; filename={file_upload.original_filename}'
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
            return HttpResponse("There are empty files with no upload. Please delete these files first.", status=409)

        non_downloadable = _non_downloadable_cloud_uploads(files_for_zip)
        if non_downloadable:
            error_msg = "Some files were not completely uploaded in the first place. Please delete or reupload the files: "
            error_msg += ", ".join(_cloud_upload_download_filename(cloud_upload) for cloud_upload in non_downloadable)
            return HttpResponse(error_msg, status=409)

        downloadable_files = [cloud_upload for cloud_upload in files_for_zip if _is_cloud_upload_downloadable(cloud_upload)]
        if not downloadable_files:
            return HttpResponse("There are no files available for download.", status=409)

        filename = f"submission_{broker_submission_id}.zip"
        zip_chunk_size = settings.MAX_USER_DOWNLOAD_SPEED
        zip_entries, stream_zip = build_zip_file_entries(downloadable_files)
        zf = ZipStream(zip_entries, zip_chunk_size)
        response = StreamingHttpResponse(stream_zip(zf.stream()), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename={filename}'
        return response

    
class SubmissionCloudZipAllFilesAndDownloadRedirect(View):
    def get(self, request, broker_submission_id):
        return HttpResponseRedirect(f"/api/downloads/submissions/{broker_submission_id}/uploads/zip/")

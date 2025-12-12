# -*- coding: utf-8 -*-
from django.urls import reverse
import requests

from django.conf import settings
from django.views import View
from django.http import HttpResponseRedirect, HttpResponseForbidden, StreamingHttpResponse
from rest_framework import permissions
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from zipstream import ZipStream
from ..models.submission_cloud_upload import SubmissionCloudUpload


def get_file_stream(url):
    chunk_size = 1024 * 1024
    max_chunk_size = settings.MAX_BUCKET_DOWNLOAD_SPEED
    try:
        res = requests.get(url, stream=True)
        for chunk in res.iter_content(chunk_size):
            #increase chunk_size gradually to allow user-download to start immediately and increase while user-download has gotten busy
            chunk_size = min(chunk_size * 2, max_chunk_size)
            yield chunk
    finally:
        res.close()


class SubmissionCloudGetDownloadLinkView(View):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated)

    
    def get(self, request, broker_submission_id, file_id):
        cloud_upload = SubmissionCloudUpload.objects.get(pk=file_id)
        file_upload = cloud_upload.file_upload
        try:
            if str(cloud_upload.submission.broker_submission_id) != broker_submission_id:
                return HttpResponseForbidden("The requested file is not part of the submission the the file is requested for.")
            response = StreamingHttpResponse(get_file_stream(file_upload.uploaded_file.url), content_type='application/data')
            response['Content-Disposition'] = f'attachment; filename={file_upload.original_filename}'
            return response
        except Exception as e:
            raise Exception(f"Error getting download-info for file! {e}")


class SubmissionCloudZipAllFilesAndDownload(View):

    def get(self, request, broker_submission_id):
        files = SubmissionCloudUpload.objects.filter(submission__broker_submission_id=broker_submission_id).all()

        filename = f"submission_{broker_submission_id}.zip"
        zip_chunk_size = settings.MAX_USER_DOWNLOAD_SPEED
        the_files = [{'stream': get_file_stream(file.file_upload.uploaded_file.url), 'name': file.file_upload.original_filename} for file in files]
        zf = ZipStream(the_files, zip_chunk_size)
        response = StreamingHttpResponse(zf.stream(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename={filename}'
        return response
    
class SubmissionCloudZipAllFilesAndDownloadRedirect(View):
    def get(self, request, broker_submission_id):
        return HttpResponseRedirect(f"/api/downloads/submissions/{broker_submission_id}/cloudupload/zip/")
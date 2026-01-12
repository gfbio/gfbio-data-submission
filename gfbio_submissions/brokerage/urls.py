# -*- coding: utf-8 -*-
from django.urls import re_path, path
from django.views.generic import TemplateView
from dt_upload.views import backend_based_upload_views

from .views.jira_issue_update_view import JiraIssueUpdateView
from .views.submission_cloud_upload_detail_view import SubmissionCloudUploadDetailView
from .views.submission_cloud_upload_list_view import SubmissionCloudUploadListView
from .views.submission_cloud_upload_patch_view import SubmissionCloudUploadPatchView
from .views.submission_cloud_upload_view import SubmissionCloudUploadAbortView
from .views.submission_cloud_upload_view import SubmissionCloudUploadCompleteView
from .views.submission_cloud_upload_view import SubmissionCloudUploadUpdatePartView
from .views.submission_cloud_upload_view import SubmissionCloudUploadView, SubmissionCloudUploadPartURLView
from .views.submission_cloud_upload_download_view import SubmissionCloudGetDownloadLinkView, SubmissionCloudZipAllFilesAndDownload, SubmissionCloudZipAllFilesAndDownloadRedirect
from .views.submission_comment_view import SubmissionCommentView
from .views.submission_detail_view import SubmissionDetailView
from .views.submission_report_view import SubmissionReportView
from .views.submission_upload_detail_view import SubmissionUploadDetailView
from .views.submission_upload_list_view import SubmissionUploadListView
from .views.submission_upload_patch_view import SubmissionUploadPatchView
from .views.submission_upload_view import SubmissionUploadView
from .views.submissions_view import SubmissionsView

app_name = "brokerage"
urlpatterns = [
    re_path(route=r"submissions/$", view=SubmissionsView.as_view(), name="submissions"),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/$",
        view=SubmissionDetailView.as_view(),
        name="submissions_detail",
    ),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/$",
        view=SubmissionUploadView.as_view(),
        name="submissions_upload",
    ),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/cloudupload/$",
        view=SubmissionCloudUploadView.as_view(),
        name="submissions_cloud_upload",
    ),
    path(
        route="submissions/cloudupload/<str:upload_id>/part/",
        view=SubmissionCloudUploadPartURLView.as_view(),
        name="submissions_cloud_upload_part",
    ),
    path(
        route="submissions/cloudupload/<str:upload_id>/update-part/",
        view=SubmissionCloudUploadUpdatePartView.as_view(),
        name="submissions_cloud_upload_part_update",
    ),
    path(
        route="submissions/cloudupload/<str:upload_id>/complete/",
        view=SubmissionCloudUploadCompleteView.as_view(),
        name="submissions_cloud_upload_complete"
    ),
    path(
        route="submissions/cloudupload/<str:upload_id>/abort/",
        view=SubmissionCloudUploadAbortView.as_view(),
        name="submissions_cloud_upload_abort"
    ),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/uploads/$",
        view=SubmissionUploadListView.as_view(),
        name="submissions_uploads",
    ),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/cloud-uploads/$",
        view=SubmissionCloudUploadListView.as_view(),
        name="submissions_cloud_uploads",
    ),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/(?P<pk>[0-9]+)$",
        view=SubmissionUploadDetailView.as_view(),
        name="submissions_upload_detail",
    ),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/cloud-upload/(?P<pk>[0-9]+)$",
        view=SubmissionCloudUploadDetailView.as_view(),
        name="submissions_clou_upload_detail",
    ),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/patch/(?P<pk>[0-9]+)/$",
        view=SubmissionUploadPatchView.as_view(),
        name="submissions_upload_patch",
    ),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/cloud-upload/patch/(?P<pk>[0-9]+)/$",
        view=SubmissionCloudUploadPatchView.as_view(),
        name="submissions_cloud_upload_patch",
    ),
    re_path(
        route="downloads/submissions/(?P<broker_submission_id>[0-9a-z-]+)/cloudupload/download_file/(?P<file_id>[0-9]+)/$",
        view=SubmissionCloudGetDownloadLinkView.as_view(),
        name="submissions_cloud_file_download"
    ),
    re_path(
        route="submissions/(?P<broker_submission_id>[0-9a-z-]+)/cloudupload/zip/$",
        view=SubmissionCloudZipAllFilesAndDownloadRedirect.as_view(),
        name="submissions_cloud_zip_download_redirect"
    ),
    re_path(
        route="downloads/submissions/(?P<broker_submission_id>[0-9a-z-]+)/cloudupload/zip/$",
        view=SubmissionCloudZipAllFilesAndDownload.as_view(),
        name="submissions_cloud_zip_download"
    ),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/comment/$",
        view=SubmissionCommentView.as_view(),
        name="submission_comment",
    ),
    re_path(
        route=r"submissions/(?P<broker_submission_id>[0-9a-z-]+)/reports/$",
        view=SubmissionReportView.as_view(),
        name="submission_comment",
    ),
    re_path(
        route=r"submissions/jira/update(/)?$",
        view=JiraIssueUpdateView.as_view(),
        name="submissions_jira_update",
    ),
    re_path(
        r"molecular/$",
        TemplateView.as_view(
            template_name="pages/api_molecular.html",
            extra_context={"schema_url": "generic:brokerage_schema_molecular"},
        ),
        name="api_molecular_documentation",
    ),
    re_path(
        "",
        TemplateView.as_view(
            template_name="pages/api.html",
            extra_context={"schema_url": "api-schema"},
        ),
        name="api_documentation",
    ),
    re_path(r'molecular/$', TemplateView.as_view(
        template_name='pages/api_molecular.html',
        extra_context={'schema_url': 'generic:brokerage_schema_molecular'}
    ), name='api_molecular_documentation'),
    re_path('', TemplateView.as_view(
        template_name='pages/api.html',
        extra_context={'schema_url': 'api-schema'}
    ), name='api_documentation'),

]

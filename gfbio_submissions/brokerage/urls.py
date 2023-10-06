# -*- coding: utf-8 -*-
from django.urls import re_path
from django.views.generic import TemplateView

from .views.jira_issue_update_view import JiraIssueUpdateView
from .views.submission_comment_view import SubmissionCommentView
from .views.submission_detail_view import SubmissionDetailView
from .views.submission_upload_detail_view import SubmissionUploadDetailView
from .views.submission_upload_list_view import SubmissionUploadListView
from .views.submission_upload_patch_view import SubmissionUploadPatchView
from .views.submission_upload_view import SubmissionUploadView
from .views.submissions_view import SubmissionsView

app_name = "brokerage"
urlpatterns = [
    re_path(
        route=r'submissions/$',
        view=SubmissionsView.as_view(),
        name='submissions'
    ),
    re_path(
        route=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/$',
        view=SubmissionDetailView.as_view(),
        name='submissions_detail'
    ),
    re_path(
        route=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/$',
        view=SubmissionUploadView.as_view(),
        name='submissions_upload'
    ),
    re_path(
        route=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/uploads/$',
        view=SubmissionUploadListView.as_view(),
        name='submissions_uploads'
    ),
    re_path(
        route=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/(?P<pk>[0-9]+)$',
        view=SubmissionUploadDetailView.as_view(),
        name='submissions_upload_detail'
    ),
    re_path(
        route=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/patch/(?P<pk>[0-9]+)/$',
        view=SubmissionUploadPatchView.as_view(),
        name='submissions_upload_patch'
    ),

    re_path(
        route=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/comment/$',
        view=SubmissionCommentView.as_view(),
        name='submission_comment'
    ),
    re_path(
        route=r'submissions/jira/update(/)?$',
        view=JiraIssueUpdateView.as_view(),
        name='submissions_jira_update'
    ),
    re_path(r'molecular/$', TemplateView.as_view(
        template_name='pages/api_molecular.html',
        extra_context={'schema_url': 'generic:brokerage_schema_molecular'}
    ), name='api_molecular_documentation'),
    re_path('', TemplateView.as_view(
        template_name='pages/api.html',
        extra_context={'schema_url': 'generic:brokerage_schema'}
    ), name='api_documentation'),

]

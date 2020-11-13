# -*- coding: utf-8 -*-
from django.conf.urls import url
from django.views.generic import TemplateView

from .api import submission_views as views, issue_update_views

app_name = "brokerage"
urlpatterns = [
    url(
        regex=r'submissions/$',
        view=views.SubmissionsView.as_view(),
        name='submissions'
    ),
    url(
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/$',
        view=views.SubmissionDetailView.as_view(),
        name='submissions_detail'
    ),
    url(
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/$',
        view=views.SubmissionUploadView.as_view(),
        name='submissions_upload'
    ),
    url(
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/uploads/$',
        view=views.SubmissionUploadListView.as_view(),
        name='submissions_uploads'
    ),
    url(
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/(?P<pk>[0-9]+)/$',
        view=views.SubmissionUploadDetailView.as_view(),
        name='submissions_upload_detail'
    ),
    url(
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/patch/(?P<pk>[0-9]+)/$',
        view=views.SubmissionUploadPatchView.as_view(),
        name='submissions_upload_patch'
    ),

    url(
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/comment/$',
        view=views.SubmissionCommentView.as_view(),
        name='submission_comment'
    ),
    url(
        regex=r'submissions/jira/update(/)?$',
        view=issue_update_views.JiraIssueUpdateView.as_view(),
        name='submissions_jira_update'
    ),
    url(r'molecular/$', TemplateView.as_view(
        template_name='pages/api_molecular.html',
        extra_context={'schema_url': 'generic:brokerage_schema_molecular'}
    ), name='api_molecular_documentation'),
    url('', TemplateView.as_view(
        template_name='pages/api.html',
        extra_context={'schema_url': 'generic:brokerage_schema'}
    ), name='api_documentation'),

]

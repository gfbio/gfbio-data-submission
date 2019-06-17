# -*- coding: utf-8 -*-
from django.conf.urls import url

from . import views

urlpatterns = [
    # TODO: use '/' since viewset will do the same
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
        regex=r'submissions/user/(?P<submitting_user>.+)/$',
        view=views.UserSubmissionDetailView.as_view(),
        name='submissions_user_detail'
    ),

    # TODO: rename/remove
    # url(
    #     regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/$',
    #     view=views.SubmissionFileUploadView.as_view(),
    #     name='submissions_upload'
    # ),
    # TODO: rename/remove
    # url(
    #     regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/primarydata/$',
    #     view=views.PrimaryDataFileView.as_view(),
    #     name='submissions_primary_data'
    # ),
    # TODO: rename/remove
    # url(
    #     regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/primarydata/(?P<pk>[0-9]+)/$',
    #     view=views.PrimaryDataFileDetailView.as_view(),
    #     name='submissions_primary_data_detail'
    # ),
    # TODO: keep only as long as views above exist, then add proper url and rename
    url(
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/$',
        view=views.SubmissionUploadView.as_view(),
        # name='submissions_new_upload'
        name='submissions_upload'
    ),
    url(
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/uploads/$',
        view=views.SubmissionUploadListView.as_view(),
        # name='submissions_new_upload'
        name='submissions_uploads'
    ),
    # TODO: keep only as long as views above exist, then add proper url and rename
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
    # http://0.0.0.0:8000/api/docs/?format=openapi
    # url(r'^docs/$', schema_view, name='rest_api_documentation'),
]

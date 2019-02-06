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
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/$',
        view=views.SubmissionFileUploadView.as_view(),
        name='submissions_upload'
    ),
    url(
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/primarydata/$',
        view=views.PrimaryDataFileView.as_view(),
        name='submissions_primary_data'
    ),
    url(
        regex=r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/primarydata/(?P<pk>[0-9]+)/$',
        view=views.PrimaryDataFileDetailView.as_view(),
        name='submissions_primary_data_detail'
    ),
    # http://0.0.0.0:8000/api/docs/?format=openapi
    # url(r'^docs/$', schema_view, name='rest_api_documentation'),
]

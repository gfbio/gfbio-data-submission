# -*- coding: utf-8 -*-
from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView

from . import views

# from rest_framework_swagger.views import get_swagger_view

# TODO: take care of proper documentation for available services
# schema_view = get_swagger_view(title='GFBio Data Submission API')

# TODO: check ViewSet
# router = DefaultRouter()
# router.register(r'submissions', views.SubmissionsViewSet)

urlpatterns = [
    # url(
    #     regex=r'submissions/ena/form/showcase$',
    #     view=TemplateView.as_view(template_name='ena_widget.html'),
    #     name='ena_showcase'
    # ),
    # url(
    #     regex=r'submissions/ena/form/showcase/integrated$',
    #     view=login_required(
    #         TemplateView.as_view(template_name='ena_widget_integrated.html')),
    #     name='ena_showcase'
    # ),

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

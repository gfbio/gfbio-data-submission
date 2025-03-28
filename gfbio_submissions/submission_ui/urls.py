# -*- coding: utf-8 -*-
from django.urls import re_path

from . import views
from ..submission_profile.views.profile_frontend_view import ProfileFrontendView

app_name = "submission_ui"
urlpatterns = [
    re_path(
        # by omitting the '$' in the url,
        # the react app in this template will take care of every url below
        # more specific: the react-router checks for matches.
        route=r"submission/",
        # view=login_required(TemplateView.as_view(
        #     template_name='submission_ui/submission.html')),
        view=views.SubmissionFrontendView.as_view(),
        name="create_submission",
    ),
    # re_path(
    #     route=r"submission/",  # TODO: needed to shorten url to this, otherwise conflict with url above.
    #     view=ProfileFrontendView.as_view(),
    #     name="profile_ui",
    # ),
    # FIXME: remove once submission.org is in production
    # url(
    #     regex=r'molecular/full_template\.csv',
    #     view=views.CsvTemplateDownloadView.as_view(),
    #     name='molecular_csv_template'
    #
    # ),
]

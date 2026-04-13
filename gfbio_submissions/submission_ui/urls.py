# -*- coding: utf-8 -*-
from django.urls import path, re_path
from django.views.generic.base import RedirectView

from gfbio_submissions.submission_profile.views.profile_view_redirect import submission_update_ui_redirect_view

from . import views

app_name = "submission_ui"
urlpatterns = [
    re_path(
        # by omitting the '$' in the url,
        # the react app in this template will take care of every url below
        # more specific: the react-router checks for matches.
        route=r"legacy/submission/",
        view=views.SubmissionFrontendView.as_view(),
        name="create_submission",
    ),
    path(
        route="submission/form/",
        view=RedirectView.as_view(pattern_name='create_submission_ui', permanent=True),
    ),
    path(
        route="submission/list/",
        view=RedirectView.as_view(pattern_name='list_submission_ui', permanent=True),
    ),
    path(
        route="submission/form/<uuid:submission_id>",
        view=submission_update_ui_redirect_view,
    ),
]

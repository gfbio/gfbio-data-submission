# -*- coding: utf-8 -*-
from django.urls import path, re_path, reverse

from .views.profile_list_view import ProfileListView
from .views.profile_select_and_activate_view import ProfileSelectAndActivateView
from .views.profile_view import ProfileDetailView
from django.views.generic.base import RedirectView
from .views.profile_view_redirect import submission_update_ui_redirect_view

app_name = "profile"

urlpatterns = [
    path(
        route=r"profiles/",
        view=ProfileListView.as_view(),
        name="profile_list",
    ),
    path(
        route=r"profile/<slug:name>/",
        view=ProfileDetailView.as_view(),
        name="profile_detail",
    ),
    path(
        route="profile/<int:pk>/select/",
        view=ProfileSelectAndActivateView.as_view(),
        name="profile_select_and_activate",
    ),
    path(
        route="ui/form/",
        view=RedirectView.as_view(pattern_name='create_submission_ui', permanent=True),
    ),
    path(
        route="ui/",
        view=RedirectView.as_view(pattern_name='list_submission_ui', permanent=True),
    ),
    path(
        route="ui/form/<uuid:submission_id>/",
        view=submission_update_ui_redirect_view,
    ),
]

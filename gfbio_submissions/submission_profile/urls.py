# -*- coding: utf-8 -*-
from django.urls import path, re_path

from .views.profile_frontend_view import ProfileFrontendView
from .views.profile_list_view import ProfileListView
from .views.profile_select_and_activate_view import ProfileSelectAndActivateView
from .views.profile_view import ProfileDetailView

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
    re_path(
        route=r"^ui/",  # TODO: needed to shorten url to this, otherwise conflict with url above.
        view=ProfileFrontendView.as_view(),
        name="profile_ui",
    ),
]

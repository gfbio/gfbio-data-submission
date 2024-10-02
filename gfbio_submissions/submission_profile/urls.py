# -*- coding: utf-8 -*-
from django.contrib.admin.views.decorators import staff_member_required
from django.urls import path, re_path

from .views.profile_frontend_view import ProfileFrontendView
from .views.profile_view import ProfileDetailView
from .views.profile_list_view import ProfileListView

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
    re_path(
        route=r"^ui/",  # TODO: needed to shorten url to this, otherwise conflict with url above.
        view=staff_member_required(ProfileFrontendView.as_view()),
        name="profile_ui",
    ),
]

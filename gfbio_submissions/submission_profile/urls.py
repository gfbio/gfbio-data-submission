# -*- coding: utf-8 -*-
from django.contrib.admin.views.decorators import staff_member_required
from django.urls import path, re_path

from .views.profile_frontend_view import ProfileFrontendView
from .views.profile_view import ProfileDetailView

app_name = "profile"

urlpatterns = [
    path(
        route=r"profile/<slug:name>/",
        view=ProfileDetailView.as_view(),
        name="profile_detail",
    ),
    re_path(
        route=r"^profile/(?P<name>\w+)/ui/",
        view=staff_member_required(ProfileFrontendView.as_view()),
        name="profile_ui",
    ),
]

# -*- coding: utf-8 -*-
from django.urls import path

from .views.profile_view import ProfileDetailView

app_name = "profile"

urlpatterns = [
    path(
        route=r"profile/<slug:name>/",
        view=ProfileDetailView.as_view(),
        name="profile_detail",
    ),
]

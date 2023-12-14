# -*- coding: utf-8 -*-
from django.urls import re_path

from . import views

app_name = "resolve"
urlpatterns = [
    re_path(
        route=r"api/insdc/(?P<identifier>[0-9a-zA-Z-]+)$",
        view=views.AccessionResolveView.as_view(),
        name="api_resolve_insdc",
    ),
    re_path(
        route=r"insdc/(?P<identifier>[0-9a-zA-Z-]+)$", view=views.AccessionRedirectView.as_view(), name="resolve_insdc"
    ),
]

# -*- coding: utf-8 -*-
from django.conf.urls import url

from . import views

app_name = "resolve"
urlpatterns = [
    url(
        regex=r'api/insdc/(?P<identifier>[0-9a-zA-Z-]+)$',
        view=views.AccessionResolveView.as_view(),
        name='api_resolve_insdc'
    ),
    url(
        regex=r'insdc/(?P<identifier>[0-9a-zA-Z-]+)$',
        view=views.AccessionRedirectView.as_view(),
        name='resolve_insdc'
    ),
]

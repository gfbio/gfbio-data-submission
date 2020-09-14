# -*- coding: utf-8 -*-
from django.conf.urls import url

from . import views

app_name = "resolve"
urlpatterns = [
    url(
        regex=r'insdc/(?P<pid>[0-9a-zA-Z-]+)$',
        view=views.PersistentIdentifierResolveView.as_view(),
        name='resolve_insdc'
    ),
url(
        regex=r'insdc2/(?P<pid>[0-9a-zA-Z-]+)$',
        view=views.PersistentIdentifierRedirectView.as_view(),
        name='resolve_insdc2'
    ),
]

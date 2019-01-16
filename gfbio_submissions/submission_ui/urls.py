# -*- coding: utf-8 -*-
from django.conf.urls import url
from django.views.generic import TemplateView

urlpatterns = [
    url(
        # by omitting the '$' in the url,
        # the react app in this template will take care of every url below
        # more specific: the react-router checks for matches.
        r'test/',
        TemplateView.as_view(template_name='submission_ui/test_react.html'),
        name='test_react'
    ),
]

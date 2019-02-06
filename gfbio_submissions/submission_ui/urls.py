# -*- coding: utf-8 -*-
from django.conf.urls import url
from django.views.generic import TemplateView

urlpatterns = [
    url(
        r'submission/mock/$',
        TemplateView.as_view(
            template_name='submission_ui/submission_mock.html'),
        name='submission_mock'
    ),
    url(
        # by omitting the '$' in the url,
        # the react app in this template will take care of every url below
        # more specific: the react-router checks for matches.
        r'submission/',
        TemplateView.as_view(template_name='submission_ui/submission.html'),
        name='test_react'
    ),
]

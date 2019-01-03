# -*- coding: utf-8 -*-
from django.conf.urls import url
from django.views.generic import TemplateView

urlpatterns = [
    url(r'^test/$', TemplateView.as_view(template_name='submission_ui/test_react.html'), name='home'),
]

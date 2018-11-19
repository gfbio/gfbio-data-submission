# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from django.conf.urls import url
from django.views.generic import TemplateView

from . import views

urlpatterns = [

    # TODO: move this here elsewhere
    # url(
    #     regex=r'^widget$',
    #     view=TemplateView.as_view(template_name='widget.html'),
    #     name='widget'
    # ),
    # # TODO: refer to todo in views
    # url(
    #     regex=r'^validate_widget$',
    #     view=views.check_list_validation_view,
    #     name='validate_widget'
    # ),
    # TODO: rename app to gds_static or simial
    # TODO: nginx or views for js and css at concrete url
    #  url(
    #      regex=r'^widget_schemas/(?P<schema_name>[a-z\-_]+)$',
    #      view=views.GcdjWidgetDeliverSchemaView.as_view(),
    #      name='gcdj_widget_schemas'
    #  ),
    #  url(regex=r'^widget_options/(?P<options_name>[a-z\-_]+)$',
    #      view=views.GcdjWidgetDeliverOptionsView.as_view(),
    #      name='gcdj_widget_options'
    #  ),
    url(
        regex=r'^brokerage/submissions/ena/form/schema/(?P<schema_name>[a-z\-_]+)$',
        view=views.EnaWidgetDeliverSchemaView.as_view(),
        name='ena_widget_schemas'
    ),
    url(
        regex=r'^brokerage/submissions/ena/form/options/(?P<options_name>[a-z\-_]+)$',
        view=views.EnaWidgetDeliverOptionsView.as_view(),
        name='ena_widget_options'
    ),
]

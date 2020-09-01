# -*- coding: utf-8 -*-
from django.conf.urls import url

from . import views

app_name = "generic"

urlpatterns = [
    url(
        regex=r'schema/brokerage_api/(?P<schema>[a-z-_\.json]+)',
        view=views.BrokerageValidationSchemaView.as_view(),
        name='brokerage_validation'
    ),
    url(
        regex=r'schema/brokerage_api/$',
        view=views.BrokerageAPISchemaView.as_view(),
        name='brokerage_schema'
    ),

]

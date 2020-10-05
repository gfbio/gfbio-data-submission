# -*- coding: utf-8 -*-
from django.conf.urls import url

from . import views

app_name = "generic"

urlpatterns = [
    url(
        regex=r'schema/brokerage_api[_\w]*/(?P<schema>[a-z-_\.json]+)',
        view=views.BrokerageValidationSchemaView.as_view(),
        name='brokerage_validation'
    ),
    url(
        regex=r'schema/brokerage_api/$',
        view=views.BrokerageAPISchemaView.as_view(),
        name='brokerage_schema'
    ),
    url(
        regex=r'schema/brokerage_api_molecular/$',
        view=views.BrokerageMolecularAPISchemaView.as_view(),
        name='brokerage_schema_molecular'
    ),

]

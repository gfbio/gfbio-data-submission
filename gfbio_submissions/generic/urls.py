# -*- coding: utf-8 -*-
from django.urls import re_path

from . import views

app_name = "generic"

urlpatterns = [
    re_path(
        route=r"schema/brokerage_api[_\w]*/(?P<schema>[a-z-_\.json]+)",
        view=views.BrokerageValidationSchemaView.as_view(),
        name="brokerage_validation",
    ),
    re_path(
        route=r"schema/brokerage_api/$",
        view=views.BrokerageAPISchemaView.as_view(),
        name="brokerage_schema",
    ),
    re_path(
        route=r"schema/brokerage_api_molecular/$",
        view=views.BrokerageMolecularAPISchemaView.as_view(),
        name="brokerage_schema_molecular",
    ),
]

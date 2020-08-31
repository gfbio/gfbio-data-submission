# -*- coding: utf-8 -*-
from django.conf.urls import url

from . import views

app_name = "generic"

urlpatterns = [
    url(
        regex=r'schema/brokerage/$',
        view=views.BrokerageSchemaView.as_view(),
        name='brokerage_schema'
    ),
]

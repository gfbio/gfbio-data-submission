# -*- coding: utf-8 -*-
import os

from django.http import HttpResponse
from django.views import View
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from config.settings.base import STATIC_ROOT
from gfbio_submissions.generic.forms import ValidationSchemaSelectionForm


class BrokerageAPISchemaView(View):

    def get(self, request):
        path = os.path.join(STATIC_ROOT, 'schemas', 'api_documentation.json')
        return HttpResponse(status=HTTP_200_OK,
                            content=(open(path).read()),
                            content_type='application/vnd.oai.openapi')


class BrokerageValidationSchemaView(View):

    def get(self, request, *args, **kwargs):
        form = ValidationSchemaSelectionForm(kwargs)
        if form.is_valid():
            file_name = form.cleaned_data.get('schema')
            path = os.path.join(STATIC_ROOT, 'schemas', file_name)
            return HttpResponse(status=HTTP_200_OK,
                                content=(open(path).read()),
                                content_type='application/json')
        else:
            return HttpResponse(form.errors.as_json(),
                                status=HTTP_400_BAD_REQUEST)

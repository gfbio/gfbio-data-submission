# -*- coding: utf-8 -*-
import os

from django.http import HttpResponse
from django.views import View
from rest_framework.status import HTTP_200_OK

from config.settings.base import STATIC_ROOT


class BrokerageSchemaView(View):

    def get(self, request):
        response = HttpResponse(content_type='application/vnd.oai.openapi')
        response.status_code = HTTP_200_OK
        content = ''
        with open('{0}{1}{2}{1}{3}'.format(STATIC_ROOT, os.sep, 'documentation',
                                        'brokerage.yml')) as schema:
            content = schema.read()
        response.content = content
        return response

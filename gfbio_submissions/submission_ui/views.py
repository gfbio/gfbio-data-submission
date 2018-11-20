# -*- coding: utf-8 -*-
import collections
import json
import os

from django.conf import settings
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView


# TODO: almost redundant to gcdj view, merge when refactor to new url schema
class EnaWidgetDeliverSchemaView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, schema_name):
        sub_path = 'ena_widget/assets/schemas/{0}.json'.format(schema_name)
        try:
            text = open(os.path.join(settings.STATIC_ROOT, sub_path),
                        'rb').read()
        except IOError as e:
            text = b'{}'
        return Response(json.loads(text.decode('utf-8'),
                                   object_pairs_hook=collections.OrderedDict))


class EnaWidgetDeliverOptionsView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, options_name):
        sub_path = 'ena_widget/assets/options/{0}.json'.format(options_name)
        try:
            text = open(os.path.join(settings.STATIC_ROOT, sub_path),
                        'rb').read()
        except IOError as e:
            text = b'{}'
        return Response(json.loads(text.decode('utf-8'),
                                   object_pairs_hook=collections.OrderedDict))

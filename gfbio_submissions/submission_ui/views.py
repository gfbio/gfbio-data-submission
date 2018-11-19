# -*- coding: utf-8 -*-
import collections
import json
import os

from django.conf import settings
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView


# TODO: check usage and find a better name that more reflects purpose
# def check_list_validation_view(request):
#     if request.method == 'POST':
#         post_content = request.POST.dict()
#         gcdj = {'gcdjson': json.loads(post_content['gcdjson'])}
#         response = HttpResponse(json.dumps(gcdj), content_type='text/plain')
#         response['Content-Disposition'] = 'attachment; filename="gcdj.json"'
#         return response
#     else:
#         return HttpResponseRedirect('/widget')


# used to deliver static file
# compare :
#     url(r'^widget/schema/select$'
#     url(r'^widget/options/select$',
#     url(r'^widget/schema/checklists$',
#     url(r'^widget/options/checklists$',
# class GcdjWidgetDeliverSchemaView(APIView):
#     renderer_classes = (JSONRenderer,)
#
#     def get(self, request, schema_name):
#         sub_path = 'gcdj_widget/data/schemas/{0}.json'.format(schema_name)
#         try:
#             text = open(os.path.join(settings.STATIC_ROOT, sub_path), 'rb').read()
#         except IOError, e:
#             text = '{}'
#         return Response(json.loads(text,
#                                    object_pairs_hook=collections.OrderedDict))
#
#
# class GcdjWidgetDeliverOptionsView(APIView):
#     renderer_classes = (JSONRenderer,)
#
#     def get(self, request, options_name):
#         sub_path = 'gcdj_widget/data/options/{0}.json'.format(options_name)
#         try:
#             text = open(os.path.join(settings.STATIC_ROOT, sub_path),
#                         'rb').read()
#         except IOError, e:
#             text = '{}'
#         return Response(json.loads(text,
#                                    object_pairs_hook=collections.OrderedDict))


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

# class DummyConfigView(APIView):
#     def get(self, request, format=None):
#         return Response(data={
#             'site_project_id': 23,
#             'extra': True
#         }, status=status.HTTP_200_OK)
#
#
# class TestMailView(APIView):
#     def get(self, request, format=None):
#         mail_admins(subject='test mail via mail_admins', message='This is a test !')
#         return Response(status=status.HTTP_200_OK)

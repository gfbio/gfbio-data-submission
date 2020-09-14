# -*- coding: utf-8 -*-
from pprint import pprint

from rest_framework import mixins, generics, permissions
from rest_framework.renderers import TemplateHTMLRenderer

from gfbio_submissions.brokerage.models import PersistentIdentifier
from gfbio_submissions.resolve.serializer import \
    PersistentIdentifierResolveSerializer


class PersistentIdentifierResolveView(mixins.RetrieveModelMixin,
                                      generics.GenericAPIView):
    queryset = PersistentIdentifier.objects.filter(status='PUBLIC')
    serializer_class = PersistentIdentifierResolveSerializer
    lookup_field = 'pid'
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        response = self.retrieve(request, *args, **kwargs)
        pprint(response.status_code)
        pprint(response.data)
        return response


class PersistentIdentifierRedirectView(generics.RetrieveAPIView):
    queryset = PersistentIdentifier.objects.filter(status='PUBLIC')
    serializer_class = PersistentIdentifierResolveSerializer
    lookup_field = 'pid'
    permission_classes = (permissions.AllowAny,)
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'resolve/resolve_redirect.html'

    def get(self, request, *args, **kwargs):
        response = self.retrieve(request, *args, **kwargs)
        print('\n\nresponse ', response.status_code)
        return response

# -*- coding: utf-8 -*-

from django.shortcuts import redirect
from rest_framework import mixins, generics, permissions
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response

from gfbio_submissions.brokerage.configuration.settings import \
    ENA_STUDY_URL_PREFIX
from gfbio_submissions.brokerage.models import PersistentIdentifier
from gfbio_submissions.resolve.serializer import \
    PersistentIdentifierResolveSerializer


class PersistentIdentifierResolveView(mixins.RetrieveModelMixin,
                                      generics.GenericAPIView):
    queryset = PersistentIdentifier.objects.all()
    serializer_class = PersistentIdentifierResolveSerializer
    lookup_field = 'pid'
    permission_classes = (permissions.AllowAny,)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status == 'PUBLIC':
            # TODO: add constant template for ena-url
            return redirect('{}{}'.format(ENA_STUDY_URL_PREFIX, instance.pid))
        else:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class PersistentIdentifierRedirectView(PersistentIdentifierResolveView,
                                       generics.RetrieveAPIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'resolve/resolve_redirect.html'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

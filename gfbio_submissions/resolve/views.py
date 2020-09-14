# -*- coding: utf-8 -*-
from pprint import pprint

from rest_framework import mixins, generics, permissions

from gfbio_submissions.brokerage.models import PersistentIdentifier
from gfbio_submissions.resolve.serializer import \
    PersistentIdentifierResolveSerializer


class PersistentIdentifierResolveView(mixins.RetrieveModelMixin,
                                      generics.GenericAPIView):
    queryset = PersistentIdentifier.objects.all()
    serializer_class = PersistentIdentifierResolveSerializer
    lookup_field = 'pid'
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        response = self.retrieve(request, *args, **kwargs)
        pprint(response.status_code)
        pprint(response.data)
        return response

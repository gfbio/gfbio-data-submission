# -*- coding: utf-8 -*-
from rest_framework import generics, permissions

from gfbio_submissions.brokerage.models import PersistentIdentifier
from gfbio_submissions.resolve.serializer import \
    PersistentIdentifierResolveSerializer


class PersistentIdentifierResolveView(generics.RetrieveAPIView):
    queryset = PersistentIdentifier.objects.all()
    serializer_class = PersistentIdentifierResolveSerializer
    lookup_field = 'pid'
    permission_classes = (permissions.AllowAny,)

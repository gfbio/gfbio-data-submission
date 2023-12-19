# -*- coding: utf-8 -*-
import logging

from django.shortcuts import redirect
from rest_framework import mixins, generics, permissions
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.status import HTTP_403_FORBIDDEN

from gfbio_submissions.brokerage.configuration.settings import ENA_STUDY_URL_PREFIX
from gfbio_submissions.resolve.models import Accession

logger = logging.getLogger(__name__)


class AccessionResolveView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def retrieve(self, request, *args, **kwargs):
        identifier = kwargs.get("identifier", "")
        try:
            acc = Accession.objects.get(identifier=identifier)
            return Response(
                {
                    "identifier": acc.identifier,
                    "message": "The accession you requested was registered via GFBio "
                    "but is currently not publicly available. Please "
                    "contact us if you wish to get in touch with the "
                    "data submitter.",
                },
                status=HTTP_403_FORBIDDEN,
            )
        except Accession.DoesNotExist:
            return redirect("{}{}".format(ENA_STUDY_URL_PREFIX, identifier))

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class AccessionRedirectView(AccessionResolveView, generics.RetrieveAPIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = "resolve/resolve_redirect.html"

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

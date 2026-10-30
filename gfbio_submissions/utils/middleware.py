import contextlib
import logging

from auditlog.context import set_actor
from auditlog.middleware import AuditlogMiddleware
from django.conf import settings
from django.http import HttpResponse
from django.middleware.common import BrokenLinkEmailsMiddleware
from rest_framework.authentication import BasicAuthentication, TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)


class RestrictedMediaMiddleware:

    def defaultHandling(self, request):
        response = self.get_response(request)
        return response

    def restrict_media_to_auth(self, request):
        if request.path.startswith("/media"):
            if request.user.is_authenticated:
                return self.defaultHandling(request)
            else:
                return HttpResponse('Please log in to receive media files', status=401)
        else:
            return self.defaultHandling(request)

    handle = defaultHandling

    def __init__(self, get_response):
        self.get_response = get_response
        if not settings.DEBUG:
            self.handle = self.restrict_media_to_auth

    def __call__(self, request):
        return self.handle(request)


class AuditlogActorMiddleware(AuditlogMiddleware):
    """Attach the request user to auditlog entries without storing an IP address.

    ``__call__`` does not call the base implementation. Auditlog 2.3 clears the
    thread-local actor when a nested ``set_actor`` exits, and DRF token users are
    not authenticated until the view runs.
    """

    def __call__(self, request):
        actor = self._actor(request)
        if actor is not None:
            context = set_actor(actor=actor)
        else:
            context = contextlib.nullcontext()
        with context:
            return self.get_response(request)

    def _actor(self, request):
        user = getattr(request, "user", None)
        if user is not None and user.is_authenticated:
            return user
        for authenticator in (TokenAuthentication(), BasicAuthentication()):
            try:
                result = authenticator.authenticate(request)
            except AuthenticationFailed:
                return None
            if result is not None:
                return result[0]
        return None


class LogBrokenLinksMiddleware(BrokenLinkEmailsMiddleware):
    def process_response(self, request, response):
        if response.status_code == 404:
            logger.warning(
                "middleware.py | BrokenLinkEmailsMiddleware - LogBrokenLinksMiddleware | Broken link: %s (Referer: %s)",
                request.build_absolute_uri(),
                request.META.get("HTTP_REFERER", "-"),
            )
        return response

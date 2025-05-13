import logging

from django.conf import settings
from django.http import HttpResponse
from django.middleware.common import BrokenLinkEmailsMiddleware

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


class LogBrokenLinksMiddleware(BrokenLinkEmailsMiddleware):
    def process_response(self, request, response):
        if response.status_code == 404 and self.is_ignorable_404(request, response):
            # Do not log ignorable 404s
            return response
        if response.status_code == 404:
            logger.warning(
                "middleware.py | BrokenLinkEmailsMiddleware - LogBrokenLinksMiddleware | Broken link: %s (Referer: %s)",
                request.build_absolute_uri(),
                request.META.get("HTTP_REFERER", "-"),
            )
        return response

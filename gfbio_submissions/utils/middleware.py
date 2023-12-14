from django.conf import settings
from django.http import HttpResponse

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

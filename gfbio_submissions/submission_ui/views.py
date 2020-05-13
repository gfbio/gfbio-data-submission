import logging

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import generics, mixins
from rest_framework.authtoken.models import Token

logger = logging.getLogger(__name__)


class HomeView(mixins.CreateModelMixin,
               generics.GenericAPIView):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL)
        else:
            return render(request, 'pages/home.html', None)


class SubmissionFrontendView(LoginRequiredMixin, TemplateView):
    template_name = 'submission_ui/submission.html'

    def get_context_data(self, *args, **kwargs):
        context = super(
            SubmissionFrontendView, self).get_context_data(*args, **kwargs)

        user = self.request.user
        user_name = user.get_username()
        user_email = user.email

        token, created = Token.objects.get_or_create(user_id=user.id)

        context['parameters'] = {
            'userName': user_name,
            'userRealName': user.name,  # if user.name != '' else user_name,
            'userEmail': user_email,
            'userId': user.id,
            'token': str(token),
        }
        return context

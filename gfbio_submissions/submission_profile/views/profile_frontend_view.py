# -*- coding: utf-8 -*-
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from rest_framework.authtoken.models import Token

from ..configuration.settings import DEFAULT_PROFILE_NAME


class ProfileFrontendView(LoginRequiredMixin, TemplateView):
    template_name = "submission_profile/profile_frontend.html"

    def get_context_data(self, *args, **kwargs):
        context = super(ProfileFrontendView, self).get_context_data(*args, **kwargs)

        user = self.request.user
        token, _ = Token.objects.get_or_create(user_id=user.id)
        # active_profile_name = Profile.objects.get_active_user_profile_name(user=user)
        active_profile_name = DEFAULT_PROFILE_NAME

        context["parameters"] = {
            "token": str(token),
            "profile_name": active_profile_name,
        }
        return context

# -*- coding: utf-8 -*-
from django.views.generic import TemplateView
from rest_framework.authtoken.models import Token

from ..models.profile import Profile


class ProfileFrontendView(TemplateView):
    template_name = "submission_profile/profile_frontend.html"

    def get_context_data(self, *args, **kwargs):
        context = super(ProfileFrontendView, self).get_context_data(*args, **kwargs)

        user = self.request.user
        token, _ = Token.objects.get_or_create(user_id=user.id)
        active_profile_name = Profile.objects.get_active_user_profile_name(user=user)

        context["parameters"] = {
            "token": str(token),
            "profile_name": active_profile_name,
        }
        return context

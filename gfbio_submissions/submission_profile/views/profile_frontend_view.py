# -*- coding: utf-8 -*-
from django.views.generic import TemplateView
from rest_framework.authtoken.models import Token

class ProfileFrontendView(TemplateView):
    template_name = "submission_profile/profile_frontend.html"

    def get_context_data(self, *args, **kwargs):
        context = super(ProfileFrontendView, self).get_context_data(*args, **kwargs)

        # print('KWARGS ', self.kwargs)
        # TODO: anstatt namen des Profiesl aus der url/ req. zu holen
        #   wird das Profil des users geladen (das gerade acitve ist).
        #   Falls keines active ist oder der Nutzer keines hat  wird das "default" profile geladen.

        user = self.request.user
        # user_name = user.get_username()
        # user_email = user.email

        token, _ = Token.objects.get_or_create(user_id=user.id)

        context["parameters"] = {
            # "userName": user_name,
            # "userRealName": user.name,
            # "userEmail": user_email,
            # "userId": user.id,
            "token": str(token),
            "profile_name": str(self.kwargs.get("name", "default")),
        }
        return context

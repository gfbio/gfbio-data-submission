import logging

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.utils.safestring import mark_safe
from django.views.generic import TemplateView
from rest_framework.authtoken.models import Token

logger = logging.getLogger(__name__)


class HomeView(TemplateView):
    template_name = "pages/home.html"

    def get(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect("/ui/submission/list")
        return super().get(request, *args, **kwargs)


class SubmissionFrontendView(LoginRequiredMixin, TemplateView):
    template_name = "submission_ui/submission.html"

    def get_context_data(self, *args, **kwargs):
        context = super(SubmissionFrontendView, self).get_context_data(*args, **kwargs)

        user = self.request.user
        user_name = user.get_username()
        user_email = user.email

        token, _ = Token.objects.get_or_create(user_id=user.id)

        messages.info(
            self.request,
            mark_safe(
                "2024-03-06: The submission service is currently unavailable for submissions involving molecular "
                "data. This includes creating new molecular submissions, setting or modifying embargo dates of "
                "brokered molecular submissions, and working on processing molecular submissions. <br /><br />"
                "We apologize for any inconvenience and are working to have the service running soon."
            ),
        )

        context["parameters"] = {
            "userName": user_name,
            "userRealName": user.name,
            "userEmail": user_email,
            "userId": user.id,
            "token": str(token),
        }
        return context

import logging

from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.views.generic import TemplateView
from rest_framework.authtoken.models import Token


logger = logging.getLogger(__name__)


class CuratorFrontendView(LoginRequiredMixin, PermissionRequiredMixin, TemplateView):
    template_name = "curator_ui/curator.html"
    permission_required = ("brokerage.view_submission",)
    raise_exception = True

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        user = self.request.user
        token, _ = Token.objects.get_or_create(user_id=user.id)

        context["parameters"] = {
            "userName": user.get_username(),
            "userRealName": user.name,
            "userEmail": user.email,
            "userId": user.id,
            "token": str(token),
        }
        return context

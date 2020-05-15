import logging

from django.contrib.auth.mixins import LoginRequiredMixin, AccessMixin
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.views.generic import TemplateView
from rest_framework.authtoken.models import Token

logger = logging.getLogger(__name__)


# class LPView(TemplateView):
#     template_name = 'pages/home.html'

# LoginRequiredMixin, AccessMixin
class HomeView(TemplateView):
    template_name = 'pages/home.html'
    logger.debug('HOMEVIEW -> ', )

    # def get_redirect_field_name(self):
    #     print('get redir field name ', self.request.user.is_authenticated)
    #     """
    #     Override this method to override the redirect_field_name attribute.
    #     """
    #     return self.redirect_field_name

    def get(self, request, *args, **kwargs):
        logger.debug('GET ', request)
        if self.request.user.is_authenticated:
            # return redirect('/ui/submission/list')
            return HttpResponseRedirect('/ui/submission/list')
        return super().get(request, *args, **kwargs)


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
            'userRealName': user.name,
            'userEmail': user_email,
            'userId': user.id,
            'token': str(token),
        }
        return context

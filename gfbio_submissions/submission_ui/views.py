import logging
import os

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponse
from django.views import View
from django.views.generic import TemplateView
from rest_framework.authtoken.models import Token

from gfbio_submissions.users.models import User
from .configuration.settings import CSV_TEMPLATE_STATIC_PATH, HOSTING_SITE

logger = logging.getLogger(__name__)


# FIXME: artefact of old server. As long as react widget is active on
#   gfbio.org, the csv template has to be hosted under
#   https://c103-171.cloud.gwdg.de/ui/molecular/full_template.csv
class CsvTemplateDownloadView(View):
    def get(self, request):
        try:
            csv_content = open(
                os.path.join(settings.STATIC_ROOT, CSV_TEMPLATE_STATIC_PATH),
                'r').read()
        except IOError as e:
            csv_content = 'oops, an internal error occured ...'
        response = HttpResponse(content_type='text/csv')
        # TODO: compare or consider this
        # response = HttpResponse(content_type='application/octet-stream')
        response[
            'Content-Disposition'] = 'attachment; filename="full_template.csv"'
        response.write(csv_content)
        return response


class SubmissionFrontendView(LoginRequiredMixin, TemplateView):
    template_name = 'submission_ui/submission.html'

    def get_context_data(self, *args, **kwargs):
        context = super(
            SubmissionFrontendView, self).get_context_data(*args, **kwargs)
        user = self.request.user
        user_name = user.get_username()
        user_email = user.email
        # TODO: refactor/extract to other position
        # TODO: render warning if no token available
        # User-name that identifies local site that (self-)hosts react app
        # User object with this name has to exist, has to be site, token has
        # to be generated
        token = ''
        try:
            token = Token.objects.get(
                user=User.objects.get(username=HOSTING_SITE, is_site=True))
        except User.DoesNotExist as e:
            logger.warning('Error getting token for SubmissionFrontendView. '
                           'User {0} does not exist:  '
                           '{1}'.format(HOSTING_SITE, e))
        except Token.DoesNotExist as e:
            logger.warning('Error getting token for SubmissionFrontendView. '
                           'Token for User {0} does not exist:  '
                           '{1}'.format(HOSTING_SITE, e))
        context['parameters'] = {
            'userName': user_name,
            'userRealName': user.name,
            'userEmail': user_email,
            'userId': user.id,
            'token': str(token),
        }
        return context

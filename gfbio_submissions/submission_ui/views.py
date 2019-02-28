import json
import os

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render
from django.views import View
from django.views.generic import TemplateView

from .configuration.settings import CSV_TEMPLATE_STATIC_PATH


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


class SubmissionFrontendView(TemplateView):
    template_name = 'submission_ui/submission.html'

    def get_context_data(self, *args, **kwargs):
        context = super(
            SubmissionFrontendView, self).get_context_data(*args, **kwargs)
        user = self.request.user
        context['parameters'] = {
            'userName': user.get_username(),
            'userId': user.id,
            # TODO: token of site. rethink once IDM is in place
            # TODO: get token dynamically ? or from .env ? -> settings?
            'token': '5639b56bd077fb3e12d7e4a0ada244aaa970c2fd',
        }
        return context


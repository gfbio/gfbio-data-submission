import os

from django.conf import settings
from django.http import HttpResponse
from django.views import View

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

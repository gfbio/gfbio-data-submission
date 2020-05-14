import json
import logging

from django.urls import reverse
from rest_framework import status, mixins, generics
from rest_framework.response import Response

from gfbio_submissions.brokerage import permissions
from gfbio_submissions.generic.models import RequestLog
from gfbio_submissions.generic.serializers import JiraHookRequestSerializer

logger = logging.getLogger(__name__)


# "webhookEvent": "jira:issue_updated",
# "issue_event_type_name": "issue_updated",

# TODO: present when logged in ? test when logged in as brokeragent
# tODO: release to develop. maybe issues whith host permissions
# "user": {
#     "self": "https://helpdesk.gfbio.org/rest/api/2/user?username=maweber%40mpi-bremen.de",
#     "name": "maweber@mpi-bremen.de",
#     "key": "maweber@mpi-bremen.de",
#     "emailAddress": "maweber@mpi-bremen.de",
#     "avatarUrls": {
#         "48x48": "https://helpdesk.gfbio.org/secure/useravatar?avatarId=10335",
#         "24x24": "https://helpdesk.gfbio.org/secure/useravatar?size=small&avatarId=10335",
#         "16x16": "https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&avatarId=10335",
#         "32x32": "https://helpdesk.gfbio.org/secure/useravatar?size=medium&avatarId=10335"
#     },
#     "displayName": "Marc Weber",
#     "active": true,
#     "timeZone": "Europe/Berlin"
# },

# ------------------

# ""user": {
#         "self": "https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent",
#         "name": "brokeragent",
#         "key": "brokeragent@gfbio.org",
#         "emailAddress": "brokeragent@gfbio.org",
#         "avatarUrls": {
#             "48x48": "https://helpdesk.gfbio.org/secure/useravatar?ownerId=brokeragent%40gfbio.org&avatarId=11100",
#             "24x24": "https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.org&avatarId=11100",
#             "16x16": "https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=11100",
#             "32x32": "https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"
#         },
#         "displayName": "Broker Agent",
#         "active": true,
#         "timeZone": "Europe/Berlin"
#     },


class JiraIssueUpdateView(mixins.CreateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.APIAllowedHosts,)
    serializer_class = JiraHookRequestSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        is_valid = serializer.is_valid()

        details = {
            'serializer_errors': serializer.errors
        }

        logger.debug('#############################')#
        logger.debug(request.GET)
        logger.debug(request.user)
        logger.debug(request.META)

        RequestLog.objects.create(
            type=RequestLog.INCOMING,
            url=reverse('brokerage:submissions_jira_update'),
            data=request.data,
            # data=json.dumps({"request_data": request.data,
            #                  "request_body": request.body}) if isinstance(
            #     request.data, dict) else request.data,
            response_status=status.HTTP_201_CREATED if is_valid else status.HTTP_400_BAD_REQUEST,
            request_details=details
        )

        headers = self.get_success_headers(serializer.data)

        if not is_valid:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST,
                            headers=headers)

        obj = self.perform_create(serializer)

        data_content = dict(serializer.data)
        return Response(data_content, status=status.HTTP_201_CREATED,
                        headers=headers)

    def post(self, request, *args, **kwargs):
        response = self.create(request, *args, **kwargs)
        return response

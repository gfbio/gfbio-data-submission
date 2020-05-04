from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from gfbio_submissions.generic.models import RequestLog
from django.db import transaction
import json

# receive JIRA ticket updates
@api_view(['POST'])
def jira_ticket_change(request):
    response = {}
    remote_host = request.META['REMOTE_ADDR']
    # allow only 'helpdesk.gfbio.org = 134.102.43.67' and  'issues.pangaea.de = 134.1.2.171'
    allowed_hosts = ['134.102.43.67', '134.1.2.171']
    if remote_host not in allowed_hosts:
        response["detail"] = "Unauthorized"
        return Response(response, status=status.HTTP_401_UNAUTHORIZED)

    try:
        data = json.loads(request.body)
    except ValueError as e:
        response["error"] = str(e)
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # TODO add data processing logic
    with transaction.atomic():
        RequestLog.objects.create(
            type=RequestLog.INCOMING,
            site_user='',
            submission_id=None,
            data=data,
            response_status=201,
            triggered_by=None,
        )

    response["detail"] = "data received"
    return Response(response, status=status.HTTP_201_CREATED)

from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from gfbio_submissions.generic.models import RequestLog
from django.db import transaction
from .permissions import APIAllowedHosts
import json

# receive JIRA ticket updates
@api_view(['POST'])
@permission_classes([APIAllowedHosts])
def jira_ticket_change(request):
    response = {}
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

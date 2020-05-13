import json

from rest_framework import status, mixins, generics
from rest_framework.response import Response

from gfbio_submissions.brokerage import permissions
from gfbio_submissions.generic.models import RequestLog
from gfbio_submissions.generic.serializers import JiraHookRequestSerializer


class JiraIssueUpdateView(mixins.CreateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.APIAllowedHosts,)
    serializer_class = JiraHookRequestSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        is_valid = serializer.is_valid()

        details = {
            'serializer_errors': serializer.errors
        }

        RequestLog.objects.create(
            type=RequestLog.INCOMING,
            data=json.dumps(request.data) if isinstance(
                request.data, dict) else request.data,
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

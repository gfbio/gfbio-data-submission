import logging

from django.urls import reverse
from rest_framework import status, mixins, generics, permissions
from rest_framework.response import Response

from gfbio_submissions.generic.models import RequestLog
from gfbio_submissions.generic.serializers import JiraHookRequestSerializer
from ..forms import JiraIssueUpdateQueryForm
from ..permissions import IsOwnerOrReadOnly

logger = logging.getLogger(__name__)


class JiraIssueUpdateView(mixins.CreateModelMixin, generics.GenericAPIView):
    print('JiraIssueUpdateView --- ')
    # permission_classes = (permissions.APIAllowedHosts,)
    permission_classes = (permissions.IsAuthenticated,
                          IsOwnerOrReadOnly)
    serializer_class = JiraHookRequestSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        is_valid = serializer.is_valid()

        form = JiraIssueUpdateQueryForm(request.GET)
        form_is_valid = form.is_valid()

        details = {
            'serializer_errors': serializer.errors,
            'form_errors': form.errors.as_json()
        }

        RequestLog.objects.create(
            type=RequestLog.INCOMING,
            url=reverse('brokerage:submissions_jira_update'),
            data=request.data,
            response_status=status.HTTP_201_CREATED if is_valid else status.HTTP_400_BAD_REQUEST,
            request_details=details
        )

        headers = self.get_success_headers(serializer.data)

        if not is_valid:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST,
                            headers=headers)
        if not form_is_valid:
            return Response(form.errors,
                            status=status.HTTP_400_BAD_REQUEST,
                            headers=headers)

        obj = self.perform_create(serializer)

        data_content = dict(serializer.data)
        return Response(data_content, status=status.HTTP_201_CREATED,
                        headers=headers)

    # @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        print('POST ------------')
        response = self.create(request, *args, **kwargs)
        return response

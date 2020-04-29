from rest_framework import status, mixins, generics

from gfbio_submissions.generic.models import RequestLog
from gfbio_submissions.generic.serializers import JiraRequestLogSerializer


class JiraIssueUpdate(mixins.CreateModelMixin, generics.GenericAPIView):
    serializer_class = JiraRequestLogSerializer

    def perform_create(self, serializer):
        serializer.save(
            type=RequestLog.INCOMING,
            data=self.request.data,
            response_status=status.HTTP_201_CREATED
        )

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

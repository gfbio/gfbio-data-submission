# -*- coding: utf-8 -*-
from uuid import uuid4

from rest_framework import generics, parsers, permissions
from rest_framework.authentication import TokenAuthentication, BasicAuthentication

from ..models.submission_upload import SubmissionUpload
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_upload_list_serializer import SubmissionUploadListSerializer


class SubmissionUploadListView(generics.ListAPIView):
    queryset = SubmissionUpload.objects.all()
    serializer_class = SubmissionUploadListSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser,)
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          IsOwnerOrReadOnly)

    def get_queryset(self):
        broker_submission_id = self.kwargs.get('broker_submission_id', uuid4())
        return SubmissionUpload.objects.filter(
            submission__broker_submission_id=broker_submission_id)

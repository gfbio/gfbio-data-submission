# -*- coding: utf-8 -*-
import json
from pprint import pprint
from uuid import uuid4, UUID

from django.db import transaction
from rest_framework import generics, mixins, permissions, parsers
from rest_framework import status
from rest_framework.authentication import TokenAuthentication, \
    BasicAuthentication
from rest_framework.response import Response

from gfbio_submissions.users.models import User
from .configuration.settings import SUBMISSION_UPLOAD_RETRY_DELAY, \
    SUBMISSION_DELAY
from .forms import SubmissionCommentForm
from .models import Submission, RequestLog, SubmissionUpload
from .permissions import IsOwnerOrReadOnly
from .serializers import SubmissionUploadListSerializer, \
    SubmissionDetailSerializer, SubmissionUploadSerializer


class SubmissionsView(mixins.ListModelMixin,
                      mixins.CreateModelMixin,
                      generics.GenericAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionDetailSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions,
                          IsOwnerOrReadOnly)

    def perform_create(self, serializer):
        submission = serializer.save(site=self.request.user, )
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                site_user=submission.submitting_user if submission.submitting_user is not None else '',
                submission_id=submission.broker_submission_id,
                response_content=submission.data,
                response_status=201,
                triggered_by=None,
            )

        from gfbio_submissions.brokerage.tasks import \
            check_for_molecular_content_in_submission_task, \
            trigger_submission_transfer
        chain = check_for_molecular_content_in_submission_task.s(
            submission_id=submission.pk
        ).set(countdown=SUBMISSION_DELAY) | trigger_submission_transfer.s(
            submission_id=submission.pk
        ).set(countdown=SUBMISSION_DELAY)
        chain()

    def get_queryset(self):
        user = self.request.user
        return Submission.objects.filter(user=user)

    # http://www.django-rest-framework.org/api-guide/filtering/
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        print('POST -----------')
        pprint(request.__dict__)
        user = User.objects.get(username=request.user)
        print(user.__dict__)
        pprint(user.site_configuration.__dict__)
        print('------------------------')
        return self.create(request, *args, **kwargs)


class SubmissionDetailView(mixins.RetrieveModelMixin,
                           mixins.UpdateModelMixin,
                           mixins.DestroyModelMixin,
                           generics.GenericAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionDetailSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions,
                          IsOwnerOrReadOnly)

    lookup_field = 'broker_submission_id'

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get(self, request, *args, **kwargs):
        response = self.retrieve(request, *args, **kwargs)
        response.data['accession_id'] = self.get_object().get_accession_id()
        return response

    def put(self, request, *args, **kwargs):
        instance = self.get_object()

        # TODO: 06.06.2019 allow edit of submissions with status SUBMITTED ...
        if instance.status == Submission.OPEN or instance.status == Submission.SUBMITTED:
            response = self.update(request, *args, **kwargs)

            # FIXME: updates to submission download url are not covered here
            # affected_submissions = instance.submission_set.filter(broker_submission_id=instance.broker_submission_id)

            from gfbio_submissions.brokerage.tasks import \
                check_for_molecular_content_in_submission_task, \
                trigger_submission_transfer_for_updates, \
                update_submission_issue_task, get_gfbio_helpdesk_username_task

            update_chain = get_gfbio_helpdesk_username_task.s(
                submission_id=instance.pk).set(
                countdown=SUBMISSION_DELAY) \
                           | update_submission_issue_task.s(
                submission_id=instance.pk).set(countdown=SUBMISSION_DELAY)
            update_chain()

            chain = check_for_molecular_content_in_submission_task.s(
                submission_id=instance.pk
            ).set(countdown=SUBMISSION_DELAY) | \
                    trigger_submission_transfer_for_updates.s(
                        broker_submission_id='{0}'.format(
                            instance.broker_submission_id)
                    ).set(countdown=SUBMISSION_DELAY)
            chain()

            return response
        else:
            return Response(
                data={
                    'broker_submission_id': instance.broker_submission_id,
                    'status': instance.status,
                    'embargo': instance.embargo,
                    'error': 'no modifications allowed with current status'
                }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = Submission.CANCELLED
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserSubmissionDetailView(generics.ListAPIView):
    serializer_class = SubmissionDetailSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions,
                          IsOwnerOrReadOnly)

    # TODO: test for real django user here
    # TODO: test for ownership additional to site permissions
    def get_queryset(self):
        submitting_user = self.kwargs['submitting_user']
        return Submission.objects.filter(
            submitting_user=submitting_user).order_by('-modified')


class SubmissionUploadView(mixins.CreateModelMixin,
                           generics.GenericAPIView):
    queryset = SubmissionUpload.objects.all()
    serializer_class = SubmissionUploadSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser,)
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions,
                          IsOwnerOrReadOnly)

    def perform_create(self, serializer, submission):
        return serializer.save(user=self.request.user, submission=submission)

    def create(self, request, *args, **kwargs):
        broker_submission_id = kwargs.get('broker_submission_id', uuid4())
        try:
            sub = Submission.objects.get(
                broker_submission_id=broker_submission_id
            )
        except Submission.DoesNotExist as e:
            return Response({'submission': 'No submission for this '
                                           'broker_submission_id:'
                                           ' {0}'.format(broker_submission_id)},
                            status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = self.perform_create(serializer, sub)

        headers = self.get_success_headers(serializer.data)
        data_content = dict(serializer.data)
        data_content.pop('submission', 0)
        data_content['id'] = obj.pk
        data_content['broker_submission_id'] = sub.broker_submission_id

        return Response(data_content, status=status.HTTP_201_CREATED,
                        headers=headers)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class SubmissionUploadListView(generics.ListAPIView):
    queryset = SubmissionUpload.objects.all()
    serializer_class = SubmissionUploadListSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser,)
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions,
                          IsOwnerOrReadOnly)

    def get_queryset(self):
        broker_submission_id = self.kwargs.get('broker_submission_id', uuid4())
        return SubmissionUpload.objects.filter(
            submission__broker_submission_id=broker_submission_id)


class SubmissionUploadDetailView(mixins.RetrieveModelMixin,
                                 mixins.UpdateModelMixin,
                                 # generics.DestroyAPIView,
                                 mixins.DestroyModelMixin,
                                 generics.GenericAPIView):
    queryset = SubmissionUpload.objects.all()
    serializer_class = SubmissionUploadSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser,)
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions,
                          IsOwnerOrReadOnly)

    def put(self, request, *args, **kwargs):
        broker_submission_id = kwargs.get('broker_submission_id', uuid4())
        instance = self.get_object()
        if instance.submission.broker_submission_id != UUID(
                broker_submission_id):
            return Response({'submission': 'No link to this '
                                           'broker_submission_id '
                                           '{0}'.format(broker_submission_id)},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            Submission.objects.get(
                broker_submission_id=broker_submission_id
            )
        except Submission.DoesNotExist as e:
            return Response({'submission': 'No submission for this '
                                           'broker_submission_id '
                                           '{0}'.format(broker_submission_id)},
                            status=status.HTTP_404_NOT_FOUND)
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        from gfbio_submissions.brokerage.tasks import \
            delete_submission_issue_attachment_task
        delete_submission_issue_attachment_task.apply_async(
            kwargs={
                'submission_id': obj.submission.pk,
                'attachment_id': obj.attachment_id,
            },
            countdown=SUBMISSION_DELAY
        )
        return self.destroy(request, *args, **kwargs)


class SubmissionUploadPatchView(mixins.UpdateModelMixin,
                                generics.GenericAPIView):
    queryset = SubmissionUpload.objects.all()
    serializer_class = SubmissionUploadSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser,)
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          permissions.DjangoModelPermissions,
                          IsOwnerOrReadOnly)

    def patch(self, request, *args, **kwargs):
        broker_submission_id = kwargs.get('broker_submission_id', uuid4())
        instance = self.get_object()
        if instance.submission.broker_submission_id != UUID(
                broker_submission_id):
            return Response({'submission': 'No link to this '
                                           'broker_submission_id '
                                           '{0}'.format(broker_submission_id)},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            Submission.objects.get(
                broker_submission_id=broker_submission_id
            )
        except Submission.DoesNotExist as e:
            return Response({'submission': 'No submission for this '
                                           'broker_submission_id '
                                           '{0}'.format(broker_submission_id)},
                            status=status.HTTP_404_NOT_FOUND)
        return self.partial_update(request, *args, **kwargs)


class SubmissionCommentView(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          IsOwnerOrReadOnly)
    lookup_field = 'broker_submission_id'
    queryset = Submission.objects.all()
    serializer_class = SubmissionDetailSerializer

    @staticmethod
    def _process_post_comment(broker_submission_id, comment):
        try:
            submission_values = Submission.objects.get_submission_values(
                broker_submission_id=broker_submission_id
            )
            user_values = User.get_user_values_safe(
                submitting_user_id=submission_values['submitting_user']
            )
            from gfbio_submissions.brokerage.tasks import \
                add_posted_comment_to_issue_task
            add_posted_comment_to_issue_task.apply_async(
                kwargs={
                    'submission_id': '{0}'.format(submission_values['pk']),
                    'comment': comment,
                    'user_values': user_values,
                },
                countdown=SUBMISSION_UPLOAD_RETRY_DELAY
            )
            return Response(
                {'comment': comment},
                status=status.HTTP_201_CREATED
            )
        except Submission.DoesNotExist as e:
            return Response(
                {'submission': 'No submission for this '
                               'broker_submission_id: {0}'.format(
                    broker_submission_id)},
                status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        form = SubmissionCommentForm(request.POST)
        if form.is_valid():
            broker_submission_id = kwargs.get('broker_submission_id', uuid4())
            return self._process_post_comment(broker_submission_id,
                                              form.cleaned_data['comment'])
        else:
            return Response(
                json.loads(form.errors.as_json()),
                status=status.HTTP_400_BAD_REQUEST,
            )

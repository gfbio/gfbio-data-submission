# -*- coding: utf-8 -*-
import json
from uuid import uuid4, UUID

from django.db import transaction
from django.urls import reverse
from rest_framework import generics, mixins, permissions, parsers
from rest_framework import status
from rest_framework.authentication import TokenAuthentication, \
    BasicAuthentication
from rest_framework.response import Response

from gfbio_submissions.generic.models import RequestLog
from gfbio_submissions.users.models import User
from ..configuration.settings import SUBMISSION_UPLOAD_RETRY_DELAY, \
    SUBMISSION_DELAY
from ..forms import SubmissionCommentForm
from ..models import Submission, SubmissionUpload
from ..permissions import IsOwnerOrReadOnly
from ..serializers import SubmissionUploadListSerializer, \
    SubmissionDetailSerializer, SubmissionUploadSerializer
from ..utils.submission_tools import get_embargo_from_request
from ..utils.task_utils import jira_cancel_issue


class SubmissionsView(mixins.ListModelMixin,
                      mixins.CreateModelMixin,
                      generics.GenericAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionDetailSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          IsOwnerOrReadOnly)

    def perform_create(self, serializer):
        submission = serializer.save(user=self.request.user, )
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                method=RequestLog.POST,
                url=reverse('brokerage:submissions'),
                user=submission.user,
                submission_id=submission.broker_submission_id,
                response_content=submission.data,
                response_status=status.HTTP_201_CREATED,
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
        return Submission.objects.filter(user=user).order_by('-modified')

    # http://www.django-rest-framework.org/api-guide/filtering/
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        # TODO: is this still needed ? user is not used
        # user = User.objects.get(username=request.user)
        return self.create(request, *args, **kwargs)


class SubmissionDetailView(mixins.RetrieveModelMixin,
                           mixins.UpdateModelMixin,
                           mixins.DestroyModelMixin,
                           generics.GenericAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionDetailSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
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
        new_embargo = get_embargo_from_request(request)

        # TODO: 06.06.2019 allow edit of submissions with status SUBMITTED ...
        if instance.status == Submission.OPEN or instance.status == Submission.SUBMITTED:
            response = self.update(request, *args, **kwargs)

            # FIXME: updates to submission download url are not covered here
            # affected_submissions = instance.submission_set.filter(broker_submission_id=instance.broker_submission_id)

            from gfbio_submissions.brokerage.tasks import \
                check_for_molecular_content_in_submission_task, \
                trigger_submission_transfer_for_updates, \
                update_submission_issue_task, get_gfbio_helpdesk_username_task, \
                update_ena_embargo_task, notify_user_embargo_changed_task

            update_chain = get_gfbio_helpdesk_username_task.s(
                submission_id=instance.pk).set(
                countdown=SUBMISSION_DELAY) \
                           | update_submission_issue_task.s(
                submission_id=instance.pk).set(countdown=SUBMISSION_DELAY)
            if new_embargo and instance.embargo != new_embargo:
                update_chain = update_chain | update_ena_embargo_task.s(
                submission_id=instance.pk).set(countdown=SUBMISSION_DELAY) \
                               | notify_user_embargo_changed_task.s(
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
        elif instance.status == Submission.CLOSED and new_embargo:
            response = Response(
                data={
                    'message': 'Embargo updated'
                }, status=status.HTTP_200_OK)
            # check for ena embargo update
            if instance.embargo != new_embargo:
                instance.embargo = new_embargo
                instance.save()
                # update helpdesk
                from gfbio_submissions.brokerage.tasks import \
                    update_submission_issue_task, get_gfbio_helpdesk_username_task, \
                    update_ena_embargo_task, notify_user_embargo_changed_task

                update_chain = get_gfbio_helpdesk_username_task.s(
                    submission_id=instance.pk).set(
                    countdown=SUBMISSION_DELAY) \
                               | update_submission_issue_task.s(
                    submission_id=instance.pk).set(countdown=SUBMISSION_DELAY) \
                    | update_ena_embargo_task.s(
                        submission_id=instance.pk).set(countdown=SUBMISSION_DELAY) \
                                   | notify_user_embargo_changed_task.s(
                        submission_id=instance.pk).set(countdown=SUBMISSION_DELAY)
                update_chain()
        else:
            response = Response(
                data={
                    'broker_submission_id': instance.broker_submission_id,
                    'status': instance.status,
                    'embargo': instance.embargo,
                    'error': 'no modifications allowed with current status'
                }, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                method=RequestLog.PUT,
                url=reverse('brokerage:submissions'),
                user=instance.user,
                submission_id=instance.broker_submission_id,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = Submission.CANCELLED
        instance.save()
        jira_cancel_issue(submission_id=instance.pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


class SubmissionUploadView(mixins.CreateModelMixin,
                           generics.GenericAPIView):
    queryset = SubmissionUpload.objects.all()
    serializer_class = SubmissionUploadSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser,)
    authentication_classes = (TokenAuthentication, BasicAuthentication)

    # TODO: add permission class that checks if access to associated
    #  submission is granted for request.user (this request, upload only)
    permission_classes = (permissions.IsAuthenticated,
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
            response = Response({'submission': 'No submission for this '
                                               'broker_submission_id:'
                                               ' {0}'.format(
                broker_submission_id)},
                status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                RequestLog.objects.create(
                    type=RequestLog.INCOMING,
                    url='brokerage:submissions_upload',
                    method=RequestLog.POST,
                    submission_id=broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )

            return response

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = self.perform_create(serializer, sub)

        headers = self.get_success_headers(serializer.data)
        data_content = dict(serializer.data)
        data_content.pop('submission', 0)
        data_content['id'] = obj.pk
        data_content['broker_submission_id'] = sub.broker_submission_id

        response = Response(data_content, status=status.HTTP_201_CREATED,
                            headers=headers)

        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                url='brokerage:submissions_upload',
                method=RequestLog.POST,
                user=sub.user,
                submission_id=sub.broker_submission_id,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


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


class SubmissionUploadDetailView(mixins.RetrieveModelMixin,
                                 mixins.UpdateModelMixin,
                                 mixins.DestroyModelMixin,
                                 generics.GenericAPIView):
    queryset = SubmissionUpload.objects.all()
    serializer_class = SubmissionUploadSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser,)
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,
                          IsOwnerOrReadOnly)

    def put(self, request, *args, **kwargs):
        broker_submission_id = kwargs.get('broker_submission_id', uuid4())
        instance = self.get_object()
        if instance.submission.broker_submission_id != UUID(
                broker_submission_id):
            response = Response({'submission': 'No link to this '
                                               'broker_submission_id '
                                               '{0}'.format(
                broker_submission_id)},
                status=status.HTTP_400_BAD_REQUEST)
            with transaction.atomic():
                RequestLog.objects.create(
                    type=RequestLog.INCOMING,
                    url='brokerage:submissions_upload_detail',
                    method=RequestLog.PUT,
                    user=instance.user,
                    submission_id=instance.submission.broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )
            return response
        try:
            Submission.objects.get(
                broker_submission_id=broker_submission_id
            )
        except Submission.DoesNotExist as e:
            response = Response({'submission': 'No submission for this '
                                               'broker_submission_id '
                                               '{0}'.format(
                broker_submission_id)},
                status=status.HTTP_404_NOT_FOUND)
            with transaction.atomic():
                RequestLog.objects.create(
                    type=RequestLog.INCOMING,
                    url='brokerage:submissions_upload_detail',
                    method=RequestLog.PUT,
                    user=instance.user,
                    submission_id=instance.submission.broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )
            return response
        response = self.update(request, *args, **kwargs)
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                url='brokerage:submissions_upload_detail',
                method=RequestLog.PUT,
                user=instance.user,
                submission_id=instance.submission.broker_submission_id,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response

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
                          IsOwnerOrReadOnly)

    def patch(self, request, *args, **kwargs):
        broker_submission_id = kwargs.get('broker_submission_id', uuid4())
        instance = self.get_object()
        if instance.submission.broker_submission_id != UUID(
                broker_submission_id):
            response = Response({'submission': 'No link to this '
                                               'broker_submission_id '
                                               '{0}'.format(
                broker_submission_id)},
                                status=status.HTTP_400_BAD_REQUEST)
            with transaction.atomic():
                RequestLog.objects.create(
                    type=RequestLog.INCOMING,
                    url='brokerage:submissions_upload_patch',
                    method=RequestLog.PATCH,
                    user=instance.user,
                    submission_id=instance.submission.broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )
            return response
        try:
            Submission.objects.get(
                broker_submission_id=broker_submission_id
            )
        except Submission.DoesNotExist as e:
            response = Response({'submission': 'No submission for this '
                                               'broker_submission_id '
                                               '{0}'.format(
                broker_submission_id)},
                                status=status.HTTP_404_NOT_FOUND)
            with transaction.atomic():
                RequestLog.objects.create(
                    type=RequestLog.INCOMING,
                    url='brokerage:submissions_upload_patch',
                    method=RequestLog.PATCH,
                    user=instance.user,
                    submission_id=instance.submission.broker_submission_id,
                    response_content=response.data,
                    response_status=response.status_code,
                )
            return response
        response = self.partial_update(request, *args, **kwargs)
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                url='brokerage:submissions_upload_patch',
                method=RequestLog.PATCH,
                user=instance.user,
                submission_id=instance.submission.broker_submission_id,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response


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
            response = self._process_post_comment(broker_submission_id,
                                              form.cleaned_data['comment'])
        else:
            response = Response(
                json.loads(form.errors.as_json()),
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                url='brokerage:submission_comment',
                method=RequestLog.POST,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response

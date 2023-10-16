# -*- coding: utf-8 -*-
from django.db import transaction
from django.urls import reverse
from rest_framework import mixins, generics, permissions, status
from rest_framework.authentication import TokenAuthentication, BasicAuthentication

from gfbio_submissions.generic.models.request_log import RequestLog
from ..configuration.settings import SUBMISSION_DELAY, SUBMISSION_ISSUE_CHECK_DELAY
from ..models.submission import Submission
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_detail_serializer import SubmissionDetailSerializer


class SubmissionsView(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionDetailSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    def perform_create(self, serializer):
        submission = serializer.save(
            user=self.request.user,
        )
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                method=RequestLog.POST,
                url=reverse("brokerage:submissions"),
                user=submission.user,
                submission_id=submission.broker_submission_id,
                response_content=submission.data,
                response_status=status.HTTP_201_CREATED,
            )

        from ..tasks.jira_tasks.get_gfbio_helpdesk_username import (
            get_gfbio_helpdesk_username_task,
        )
        from ..tasks.jira_tasks.create_submission_issue import (
            create_submission_issue_task,
        )
        from ..tasks.jira_tasks.jira_initial_comment import jira_initial_comment_task
        from ..tasks.submission_tasks.check_for_molecular_content_in_submission import (
            check_for_molecular_content_in_submission_task,
        )
        from ..tasks.transfer_tasks.trigger_submission_transfer import (
            trigger_submission_transfer_task,
        )
        from ..tasks.submission_tasks.check_issue_existing_for_submission import (
            check_issue_existing_for_submission_task,
        )

        chain = (
            get_gfbio_helpdesk_username_task.s(submission_id=submission.pk).set(countdown=SUBMISSION_DELAY)
            | create_submission_issue_task.s(submission_id=submission.pk).set(countdown=SUBMISSION_DELAY)
            | jira_initial_comment_task.s(submission_id=submission.pk).set(countdown=SUBMISSION_DELAY)
            | check_for_molecular_content_in_submission_task.s(submission_id=submission.pk).set(
                countdown=SUBMISSION_DELAY
            )
            | trigger_submission_transfer_task.s(submission_id=submission.pk).set(countdown=SUBMISSION_DELAY)
        )

        chain()

        check_issue_existing_for_submission_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
            },
            countdown=SUBMISSION_ISSUE_CHECK_DELAY,
        )

    def get_queryset(self):
        user = self.request.user
        return Submission.objects.filter(user=user).order_by("-modified")

    # http://www.django-rest-framework.org/api-guide/filtering/
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        # TODO: is this still needed ? user is not used
        # user = User.objects.get(username=request.user)
        return self.create(request, *args, **kwargs)

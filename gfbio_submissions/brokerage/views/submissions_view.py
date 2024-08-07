# -*- coding: utf-8 -*-
from django.db import transaction
from django.urls import reverse
from rest_framework import mixins, generics, permissions, status
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiRequest

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
        from ..tasks.process_tasks.trigger_submission_process import (
            trigger_submission_process_task,
        )
        from ..tasks.submission_tasks.check_issue_existing_for_submission import (
            check_issue_existing_for_submission_task,
        )

        # FIXME: check_for_molecular_content_in_submission_task has to be done elsewhere, this breaks the general
        #   workflow, OR add a general test stage where checks of GENERIC submissions for different content flavours are made
        chain = (
            get_gfbio_helpdesk_username_task.s(submission_id=submission.pk).set(countdown=SUBMISSION_DELAY)
            | create_submission_issue_task.s(submission_id=submission.pk).set(countdown=SUBMISSION_DELAY)
            | jira_initial_comment_task.s(submission_id=submission.pk).set(countdown=SUBMISSION_DELAY)
            | check_for_molecular_content_in_submission_task.s(submission_id=submission.pk).set(
                countdown=SUBMISSION_DELAY
            )
            | trigger_submission_process_task.s(submission_id=submission.pk).set(countdown=SUBMISSION_DELAY)
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

    @extend_schema(
        operation_id="list submissions",
        description="List all submissions you have permission to access.",
        responses={
            200: OpenApiResponse(
                response=SubmissionDetailSerializer(many=True),
                description="List of all submissions you are permitted to access."
            )
        }
    )
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    @extend_schema(
        operation_id="create submission",
        description="Create a new Submission. Below you find a list of required (and non-required) fields needed to create a new submission.</br><ul><li>In its simplest form you would only need to choose target='GENERIC' and provide a title and an abstract to your submission, and thus start the whole submission process when posting this data.</li><li>One way to submit molecular data would be to follow the same principle, and to additionally upload a CSV file containing the needed meta-data. To perform the upload refer to the <a href='#operation/create%20submission%20upload'>'create submission upload'</a> documentation below.</br>Additional information and the template can be found here:<ul><li><a href='https://gitlab-pe.gwdg.de/gfbio/molecular-submission-templates/-/blob/master/full_template.csv'>Molecular CSV Template</a></li><li><a href='xxx'>WIKI ?</a></li></ul></li><li>It is also possible to submit molecular data without uploading a template, by directly providing all meta-data as json also using this endpoint.</br>For dedicated information on this, please refer to:<ul><li><a href='/api/molecular/'>Submit molecular data in pure JSON</a></li></ul></li></ul>",
        request=OpenApiRequest(
            request=SubmissionDetailSerializer(many=False)
        ),
        responses={
            201: OpenApiResponse(
                description="Submission response",
                response=SubmissionDetailSerializer(many=False)
            ),
            400: OpenApiResponse(
                description="Validation error",
            )
        }
    )
    def post(self, request, *args, **kwargs):
        # TODO: is this still needed ? user is not used
        # user = User.objects.get(username=request.user)
        return self.create(request, *args, **kwargs)

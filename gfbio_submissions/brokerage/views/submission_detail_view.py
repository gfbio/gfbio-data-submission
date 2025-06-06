# -*- coding: utf-8 -*-

from django.db import transaction
from django.urls import reverse
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiRequest
from rest_framework import mixins, generics, permissions, status
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.response import Response

from ..configuration.settings import SUBMISSION_DELAY
from ..models.submission import Submission
from ..permissions.is_owner_or_readonly import IsOwnerOrReadOnly
from ..serializers.submission_detail_serializer import SubmissionDetailSerializer
from ..utils.submission_tools import get_embargo_from_request
from ..utils.task_utils import jira_cancel_issue
from ...generic.models.request_log import RequestLog


class SubmissionDetailView(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    queryset = Submission.objects.all()
    serializer_class = SubmissionDetailSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

    lookup_field = "broker_submission_id"

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        merged = instance.data.get('requirements', {}) | serializer.validated_data.get("data", {}).get('requirements',
                                                                                                       {})
        serializer.validated_data.get("data", {})["requirements"] = merged
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    @extend_schema(
        operation_id="get submission by id",
        description="Retrieve the Submission with the given submission_id",
        parameters=[
            OpenApiParameter(
                name="broker_submission_id",
                description="Unique submission ID of submission to retrieve (A UUID specified by RFC4122).",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            )
        ],
        responses={
            200: OpenApiResponse(
                description="requested submission",
                response=SubmissionDetailSerializer()
            )
        }
    )
    def get(self, request, *args, **kwargs):
        response = self.retrieve(request, *args, **kwargs)
        response.data["accession_id"] = self.get_object().get_accession_id()
        return response

    @extend_schema(
        operation_id="update submission",
        description="Updates the referenced submission.",
        parameters=[
            OpenApiParameter(
                name="broker_submission_id",
                description="Unique submission ID of submission to update (A UUID specified by RFC4122).",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            )
        ],
        request=OpenApiRequest(
            request=SubmissionDetailSerializer(many=False)
        ),
        responses={
            200: OpenApiResponse(
                description="Updated submission",
                response=SubmissionDetailSerializer()
            ),
            400: OpenApiResponse(
                description="Validation error"
            )
        }
    )
    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        new_embargo = get_embargo_from_request(request)

        # TODO: 06.06.2019 allow edit of submissions with status SUBMITTED ...
        if instance.status == Submission.OPEN or instance.status == Submission.SUBMITTED:
            response = self.update(request, *args, **kwargs)

            # FIXME: updates to submission download url are not covered here
            # affected_submissions = instance.submission_set.filter(broker_submission_id=instance.broker_submission_id)

            from ..tasks.submission_tasks.check_for_molecular_content_in_submission import (
                check_for_molecular_content_in_submission_task,
            )
            from ..tasks.process_tasks.trigger_submission_process_for_updates import (
                trigger_submission_process_for_updates_task,
            )
            from ..tasks.jira_tasks.update_submission_issue import (
                update_submission_issue_task,
            )
            from ..tasks.jira_tasks.get_gfbio_helpdesk_username import (
                get_gfbio_helpdesk_username_task,
            )
            from ..tasks.process_tasks.update_ena_embargo import (
                update_ena_embargo_task,
            )
            from ..tasks.jira_tasks.notify_user_embargo_changed import (
                notify_user_embargo_changed_task,
            )

            update_chain = get_gfbio_helpdesk_username_task.s(submission_id=instance.pk).set(
                countdown=SUBMISSION_DELAY
            ) | update_submission_issue_task.s(submission_id=instance.pk).set(countdown=SUBMISSION_DELAY)

            if new_embargo and instance.embargo != new_embargo:
                update_chain = (
                    update_chain
                    | update_ena_embargo_task.s(submission_id=instance.pk).set(countdown=SUBMISSION_DELAY)
                    | notify_user_embargo_changed_task.s(submission_id=instance.pk).set(countdown=SUBMISSION_DELAY)
                )
            update_chain()

            chain = check_for_molecular_content_in_submission_task.s(submission_id=instance.pk).set(
                countdown=SUBMISSION_DELAY
            ) | trigger_submission_process_for_updates_task.s(
                broker_submission_id="{0}".format(instance.broker_submission_id)
            ).set(
                countdown=SUBMISSION_DELAY
            )
            chain()
        elif instance.status == Submission.CLOSED and new_embargo:
            response = Response(data={"message": "Embargo updated"}, status=status.HTTP_200_OK)
            # check for ena embargo update
            if instance.embargo != new_embargo:
                instance.embargo = new_embargo
                instance.save()
                from ..tasks.jira_tasks.update_submission_issue import update_submission_issue_task
                from ..tasks.jira_tasks.get_gfbio_helpdesk_username import get_gfbio_helpdesk_username_task
                from ..tasks.process_tasks.update_ena_embargo import update_ena_embargo_task
                from ..tasks.jira_tasks.notify_user_embargo_changed import notify_user_embargo_changed_task

                update_chain = (
                    get_gfbio_helpdesk_username_task.s(submission_id=instance.pk).set(countdown=SUBMISSION_DELAY)
                    | update_submission_issue_task.s(submission_id=instance.pk).set(countdown=SUBMISSION_DELAY)
                    | update_ena_embargo_task.s(submission_id=instance.pk).set(countdown=SUBMISSION_DELAY)
                    | notify_user_embargo_changed_task.s(submission_id=instance.pk).set(countdown=SUBMISSION_DELAY)
                )
                update_chain()
        else:
            response = Response(
                data={
                    "broker_submission_id": instance.broker_submission_id,
                    "status": instance.status,
                    "embargo": instance.embargo,
                    "error": "no modifications allowed with current status",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.INCOMING,
                method=RequestLog.PUT,
                url=reverse("brokerage:submissions"),
                user=instance.user,
                submission_id=instance.broker_submission_id,
                response_content=response.data,
                response_status=response.status_code,
            )
        return response

    @extend_schema(
        operation_id="cancel submission",
        description="Cancels a Submission",
        parameters=[
            OpenApiParameter(
                name="broker_submission_id",
                description="Unique submission ID of submission to delete (A UUID specified by RFC4122).",
                location="path",
                required=True,
                type=OpenApiTypes.UUID
            )
        ],
        responses={
            204: OpenApiResponse(
                description="Submission successfully cancelled"
            )
        }
    )
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = Submission.CANCELLED
        instance.save()
        jira_cancel_issue(submission_id=instance.pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

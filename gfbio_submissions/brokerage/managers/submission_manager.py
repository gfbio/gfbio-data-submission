# -*- coding: utf-8 -*-
from django.db import models
from django.db.models import Q


class SubmissionManager(models.Manager):
    def get_submission(self, broker_submission_id):
        submissions = self.filter(broker_submission_id=broker_submission_id)
        if len(submissions) == 1:
            return submissions.first()
        else:
            return None

    def get_submission_instance(self, broker_submission_id):
        try:
            return self.get(broker_submission_id=broker_submission_id)
        except self.model.DoesNotExist:
            return self.model()

    def get_submitted_submissions_containing_reference(self, reference_type):
        return self.filter(status=self.model.SUBMITTED).filter(
            Q(additionalreference__type=reference_type) & Q(additionalreference__primary=True)
        )

    def get_open_submission(self, obj_id=None):
        # includes OPEN, SUBMITTED
        return self.get(
            Q(pk=obj_id),
            (~Q(status=self.model.CLOSED) & ~Q(status=self.model.ERROR) & ~Q(status=self.model.CANCELLED)),
        )

    def get_submitted_and_error_submissions(self, obj_id=None):
        # includes ERROR, SUBMITTED
        return self.get(
            Q(pk=obj_id),
            (~Q(status=self.model.CLOSED) & ~Q(status=self.model.OPEN) & ~Q(status=self.model.CANCELLED)),
        )

    def get_non_error_submission(self, obj_id=None):
        # includes OPEN, SUBMITTED, CLOSED
        return self.get(Q(pk=obj_id), ~Q(status=self.model.ERROR), ~Q(status=self.model.CANCELLED))

    def get_open_submission_id_for_bsi(self, broker_submission_id=None):
        try:
            submission = self.get(
                Q(broker_submission_id=broker_submission_id),
                (~Q(status=self.model.CLOSED) & ~Q(status=self.model.ERROR) & ~Q(status=self.model.CANCELLED)),
            )
            return submission.id
        except self.model.DoesNotExist:
            return -1

    # def get_submissions_of_submitting_user(self,
    #                                        submitting_user_identifier=None):
    #     return self.filter(
    #         Q(submitting_user=submitting_user_identifier),
    #         ~Q(submitting_user='')
    #     )

    def get_submission_values(self, broker_submission_id=None):
        return self.values(
            "pk",
            # string identifier, here only id of django user possible
            "user",
        ).get(broker_submission_id=broker_submission_id)

    def get_submissions_without_primary_helpdesk_issue(self):
        return self.exclude(Q(status=self.model.CANCELLED) | Q(status=self.model.CLOSED)).exclude(
            Q(additionalreference__primary=True) & Q(additionalreference__type="0")
        )

    def get_or_none(self, submission_id):
        try:
            return self.get(pk=submission_id)
        except self.model.DoesNotExist:
            return None

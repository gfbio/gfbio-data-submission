# -*- coding: utf-8 -*-
import logging
import os
from uuid import UUID

import arrow
from django.core.mail import mail_admins
from rest_framework import serializers

from gfbio_submissions.brokerage.configuration.settings import GENERIC, ENA, \
    ENA_PANGAEA
from gfbio_submissions.brokerage.models import Submission, AdditionalReference
from gfbio_submissions.brokerage.utils.schema_validation import validate_data

logger = logging.getLogger(__name__)


class JiraHookRequestSerializer(serializers.Serializer):
    issue = serializers.JSONField()
    broker_submission_id = serializers.CharField(read_only=True, required=False)
    issue_key = serializers.CharField(read_only=True, required=False)

    class Meta:
        fields = ['issue', ]

    def send_mail_to_admins(self, reason, message):
        mail_admins(
            subject='JiraHookRequestSerializer | warning regarding {0}'.format(
                reason),
            message='Notification for warning regarding {0}:\n'
                    '{1}\n'
                    'Jira Hook requested update for:\n'
                    'broker_submission_id: {2}\n'
                    'issue key: {3}'.format(
                reason, message, self.broker_submission_id, self.issue_key)
        )

    def save(self):
        try:
            embargo_date = arrow.get(
                self.validated_data.get('issue', {}).get('fields', {}).get(
                    'customfield_10200')
            )
        except arrow.parser.ParserError as e:
            logger.error(
                msg='serializer.py | JiraHookRequestSerializer | '
                    'unable to parse embargo date | {0}'.format(e)
            )

        submission_id = self.validated_data.get(
            'issue', {}).get('fields', {}).get('customfield_10303', '')
        try:
            submission = Submission.objects.get(
                broker_submission_id=UUID(submission_id))
        except Submission.DoesNotExist as e:
            logger.error(
                msg='serializer.py | JiraHookRequestSerializer | '
                    'unable to get submission | {0}'.format(e)
            )

        submission.embargo = embargo_date.date()
        submission.save()

    # TODO: !IMPORTANT! Please add a check procedure in the generic parsing of the JSON,
    #  that if the user that caused the action was the brokeragent,
    #  any further processing is skipped.

    def get_broker_submission_id_field_value(self):
        return self.initial_data.get('issue', {}).get('fields', {}).get(
            'customfield_10303', '')

    def get_embargo_date_field_value(self):
        return self.initial_data.get('issue', {}).get('fields', {}).get(
            'customfield_10200', '')

    def schema_validation(self, data):
        path = os.path.join(
            os.getcwd(),
            'gfbio_submissions/brokerage/schemas/jira_update_hook_schema.json')
        valid, errors = validate_data(
            data=data,
            schema_file=path, use_draft04_validator=True
        )
        if not valid:
            raise serializers.ValidationError(
                {'issue': [e.message for
                           e in errors]})

        self.broker_submission_id = self.get_broker_submission_id_field_value()
        self.issue_key = self.initial_data.get('issue', {}).get('key', '')

    @staticmethod
    def embargo_date_format_validation(jira_embargo_date):
        try:
            embargo_date = arrow.get(jira_embargo_date)
        except arrow.parser.ParserError as e:
            raise serializers.ValidationError(
                {'issue': ["'customfield_10200': {0}".format(e)]})
        return embargo_date

    def embargo_data_future_check(self, embargo_date, delta):
        # future, 1 year = 365 days, *2 = 730
        if delta.days > 730:
            self.send_mail_to_admins(reason='Submission embargo date',
                                     message='Embargo date in distant future')
            raise serializers.ValidationError(
                {'issue': [
                    "'customfield_10200': embargo date too far in the future: {0}".format(
                        embargo_date.for_json())]})

    def embargo_date_past_check(self, embargo_date, delta):
        # past, 1 day granularity
        if delta.days <= 0:
            self.send_mail_to_admins(reason='Submission embargo date',
                                     message='Embargo date in the past')
            raise serializers.ValidationError(
                {'issue': [
                    "'customfield_10200': embargo date in the past: {0}".format(
                        embargo_date.for_json())]})

    def embargo_date_validation(self):
        # TODO: constant for customfield key !
        jira_embargo_date = self.get_embargo_date_field_value()
        embargo_date = self.embargo_date_format_validation(jira_embargo_date)

        today = arrow.now()
        delta = embargo_date - today
        self.embargo_date_past_check(embargo_date, delta)
        self.embargo_data_future_check(embargo_date, delta)

    def submission_existing_check(self):
        # TODO: constant for customfield key !
        submission_id = self.get_broker_submission_id_field_value()
        submission = None
        try:
            # TODO: this here is hint to evtl. move this serializer to brokerag app
            submission = Submission.objects.get(
                broker_submission_id=UUID(submission_id))
        except Submission.DoesNotExist as e:
            raise serializers.ValidationError(
                {'issue': [
                    "'customfield_10303': {0} {1}".format(e, submission_id)]})
        return submission

    def submission_relation_check(self, submission):
        if submission:
            # TODO: this here is hint to evtl. move this serializer to brokerag app
            references = submission.additionalreference_set.filter(
                type=AdditionalReference.GFBIO_HELPDESK_TICKET,
                primary=True,
                reference_key=self.issue_key
            )
            if len(references) == 0:
                self.send_mail_to_admins(reason='Submission embargo date',
                                         message='No issue related to submission found')
                raise serializers.ValidationError(
                    {'issue': [
                        "'key': no related issue with key: {0} found for submission {1}".format(
                            self.issue_key, self.broker_submission_id)]})

    def submission_type_constraints_check(self, submission, key):
        if submission and submission.target == GENERIC:
            return True
        elif submission.target == ENA or submission.target == ENA_PANGAEA:
            # TODO: this here is hint to evtl. move this serializer to brokerag app
            studies = submission.brokerobject_set.filter(type='study')

            # go through all studie, although there should be only one ...
            # if any of the relate study broker_objects has a primary ena pid
            # with status private, the overall update of the submission will
            # be allowed if status is undefined or other than private,
            # update is rejected
            private_found = False
            for s in studies:
                private = s.persistentidentifier_set.filter(archive='ENA',
                                                            pid_type='PRJ',
                                                            status='PRIVATE')
                if private:
                    private_found = True
                    break
            if not private_found:
                self.send_mail_to_admins(reason='Submission embargo date',
                                         message='Attempt to update molecular submission which is not PRIVATE')
                raise serializers.ValidationError(
                    {'issue': [
                        "'key': issue {0}. status prevents update of submission {1} with target {2}".format(
                            key, submission.broker_submission_id,
                            submission.target)]})
            return private_found

    def validate(self, data):
        self.schema_validation(data)
        submission = self.submission_existing_check()
        key = self.submission_relation_check(submission)
        self.embargo_date_validation()
        self.submission_type_constraints_check(submission, key)
        return data

# -*- coding: utf-8 -*-
import logging
import os
from pprint import pprint
from uuid import UUID

import arrow
from rest_framework import serializers

from gfbio_submissions.brokerage.configuration.settings import GENERIC, ENA, \
    ENA_PANGAEA
from gfbio_submissions.brokerage.models import Submission, AdditionalReference
from gfbio_submissions.brokerage.utils.schema_validation import validate_data

logger = logging.getLogger(__name__)


class JiraHookRequestSerializer(serializers.Serializer):
    issue = serializers.JSONField()

    # TODO: call update stuff here
    # TODO: if saving submission set flag that no jira-issue update should be triggered to prevent loops
    def save(self):
        # here all should be fine ..
        print('SAVE SER. ', self.validated_data.keys())
        pprint(self.validated_data)
        try:
            embargo_date = arrow.get(self.validated_data.get('issue', {}).get('fields', {}).get('customfield_10200'))
        except arrow.parser.ParserError as e:
            logger.error(msg='serializer.py | JiraHookRequestSerializer | unable to parse embargo date | {0}'.format(e))

        submission_id = self.validated_data.get('issue', {}).get('fields', {}).get('customfield_10303', '')
        try:
            submission = Submission.objects.get(
                broker_submission_id=UUID(submission_id))
        except Submission.DoesNotExist as e:
            logger.error(
                msg='serializer.py | JiraHookRequestSerializer | unable to get submission | {0}'.format(e))

        print('embargo type ', type(embargo_date))
        submission.embargo = embargo_date.date()
        submission.save()

    #     RequestLog.objects.create(
    #         type=RequestLog.INCOMING,
    #         data=json.dumps(self.validated_data['issue']) if isinstance(
    #             self.validated_data['issue'], dict) else self.validated_data[
    #             'issue'],
    #     )

    # TODO: not needed due to save method
    # def create(self, validated_data):
    #     return RequestLog()
    #     # return Comment(**validated_data)
    #     print('serializer create')
    #     print(validated_data.keys())
    #     return RequestLog(
    #         type=RequestLog.INCOMING,
    #         data=validated_data.pop('issue', {})
    #     )

    # TODO: comes before general validate
    # TODO: add schema_validation for issue fields, extend later if needed
    # TODO: fields for embargo update in issue json:
    #   - issue.id / issue.key
    #   - 'customfield_10200'  ...... : '{0}'.format(submission.embargo.isoformat())
    #   - 'customfield_10303'  .........: '{0}'.format(submission.broker_submission_id),
    # def validate_issue(self, value):
    #     print('VALIDATE_ISSUE ', value.keys())
    #
    #     path = os.path.join(
    #         os.getcwd(),
    #         'gfbio_submissions/brokerage/schemas/jira_update_hook_schema.json')
    #     valid, errors = validate_data(
    #         data=value,
    #         schema_file=path, use_draft04_validator=True
    #     )
    #     # print(valid)
    #     # # print(errors)
    #     # error_messages = [e.message for e in errors]
    #     # pprint(error_messages)
    #     if not valid:
    #         raise serializers.ValidationError(
    #             {'issue': [e.message for e in errors]})
    #     return value
    #     # raise serializers.ValidationError(
    #     #     {'issue': 'error'})

    # TODO: comes after validate_issue
    # TODO: general stuff. maybe skip issue validation and due all here with json schema
    # TODO: validation requirements from ticket:
    #   - if update refers ticket that is not related to any submission -> email admins
    #   - ( I guess also when ticket is not existing at all -> email admins)
    #   - jira embargo has no checks, so:
    #       - if date in past or beyond 2 years in future -> email admins
    #   - generic submissons get update if above is ok
    #   - mol submission get update when above with the addition of:
    #       - check status of study, if not PRIVATE -> email admins
    #       - if update of edate is successful -> trigger update on ENA (not implemented yet (#259))

    @staticmethod
    def schema_validation(data):
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

    @staticmethod
    def embargo_date_format_validation(jira_embargo_date):
        # format
        try:
            embargo_date = arrow.get(jira_embargo_date)
        except arrow.parser.ParserError as e:
            raise serializers.ValidationError(
                {'issue': ["'customfield_10200': {0}".format(e)]})
        return embargo_date

    @staticmethod
    def embargo_data_future_check(embargo_date, delta):
        # future, 1 year = 365 days, *2 = 730
        if delta.days > 730:
            raise serializers.ValidationError(
                {'issue': [
                    "'customfield_10200': embargo date too far in the future: {0}".format(
                        embargo_date.for_json())]})

    @staticmethod
    def embargo_date_past_check(embargo_date, delta):
        # past, 1 day granularity
        if delta.days <= 0:
            raise serializers.ValidationError(
                {'issue': [
                    "'customfield_10200': embargo date in the past: {0}".format(
                        embargo_date.for_json())]})

    def embargo_date_validation(self):
        # TODO: constant for customfield key !
        jira_embargo_date = self.initial_data.get('issue', {}).get('fields',
                                                                   {}).get(
            'customfield_10200', '')
        embargo_date = self.embargo_date_format_validation(jira_embargo_date)

        today = arrow.now()
        delta = embargo_date - today
        self.embargo_date_past_check(embargo_date, delta)
        self.embargo_data_future_check(embargo_date, delta)

    def submission_existing_check(self):
        # TODO: constant for customfield key !
        submission_id = self.initial_data.get('issue', {}).get('fields',
                                                               {}).get(
            'customfield_10303', '')
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
        key = None
        if submission:
            key = self.initial_data.get('issue', {}).get('key', '')
            # print(submission.additionalreference_set.all())
            # TODO: this here is hint to evtl. move this serializer to brokerag app
            references = submission.additionalreference_set.filter(
                type=AdditionalReference.GFBIO_HELPDESK_TICKET,
                primary=True,
                reference_key=key
            )
            # print(references)
            if len(references) == 0:
                raise serializers.ValidationError(
                    {'issue': [
                        "'key': no related issue with key: {0} found for submission {1}".format(
                            key, submission.broker_submission_id)]})
        return key

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
                raise serializers.ValidationError(
                    {'issue': [
                        "'key': issue {0}. status prevents update of submission {1} with target {2}".format(
                            key, submission.broker_submission_id,
                            submission.target)]})
            return private_found

    def validate(self, data):
        print('VALIDATE')
        self.schema_validation(data)
        self.embargo_date_validation()
        submission = self.submission_existing_check()
        key = self.submission_relation_check(submission)
        self.submission_type_constraints_check(submission, key)

        return data

    # class Meta:
    #     # TODO: Maybe serializin requestlog is not a logical approach for modifying submission based on jira post
    #     model = RequestLog
    #     fields = ['type', 'url', 'response_status', 'issue',  ]

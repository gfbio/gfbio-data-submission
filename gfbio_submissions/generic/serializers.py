# -*- coding: utf-8 -*-
import datetime
import os

import arrow
from rest_framework import serializers

# class JiraRequestLogSerializer(serializers.ModelSerializer):
from gfbio_submissions.brokerage.utils.schema_validation import validate_data


class JiraRequestLogSerializer(serializers.Serializer):
    issue = serializers.JSONField()

    # TODO: call update stuff here
    # TODO: if saving submission set flag that no jira-issue update should be triggered to prevent loops
    def save(self):
        print('SAVE SER. ', self.validated_data.keys())

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
    def validate(self, data):
        print('VALIDATE ', data.keys())
        #     print(data)
        #     data['data'] = data.pop('issue', {})
        path = os.path.join(
            os.getcwd(),
            'gfbio_submissions/brokerage/schemas/jira_update_hook_schema.json')
        valid, errors = validate_data(
            data=data,
            schema_file=path, use_draft04_validator=True
        )

        # for e in errors:
        #     pprint(e.__dict__)

        if not valid:
            raise serializers.ValidationError(
                # .replace(" : \'", "").replace("\'", "")
                {'issue': [e.message for
                           e in errors]})
        # embargo --------------
        print('INITIAL DATA ', self.initial_data)
        # TODO: constant for customfield key !
        jira_embargo_date = self.initial_data.get('issue', {}).get('fields',
                                                                   {}).get(
            'customfield_10200', '')
        print(jira_embargo_date)

        # date_format = "%Y-%m-%d"
        # embargo_date = datetime.strptime(jira_embargo_date, date_format).date()

        # format
        try:
            embargo_date = arrow.get(jira_embargo_date)
        except arrow.parser.ParserError as e:
            raise serializers.ValidationError(
                {'issue': ["'customfield_10200': {0}".format(e)]})

        print('DATE/field 10200 ', embargo_date)

        today = arrow.now()
        # print('todday ', today)
        # print(type(embargo_date))
        # print(type(today))
        # print(embargo_date - today)

        # past, 1 day granularity
        delta = embargo_date - today
        if delta.days <= 0:
            raise serializers.ValidationError(
                {'issue': [
                    "'customfield_10200': embargo date ends in then past: {0}".format(
                        embargo_date.for_json())]})
        # future, 1 year = 365 days, *2 = 730
        if delta.days > 730:
            raise serializers.ValidationError(
                {'issue': [
                    "'customfield_10200': embargo date too far in the future: {0}".format(
                        embargo_date.for_json())]})
        return data

    # class Meta:
    #     # TODO: Maybe serializin requestlog is not a logical approach for modifying submission based on jira post
    #     model = RequestLog
    #     fields = ['type', 'url', 'response_status', 'issue',  ]

# -*- coding: utf-8 -*-

from rest_framework import serializers


# class JiraRequestLogSerializer(serializers.ModelSerializer):


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
    def validate_issue(self, value):
        print('VALIDATE_ISSUE ', value.keys())
        return value
        # raise serializers.ValidationError(
        #     {'issue': 'error'})

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
        return data

    # class Meta:
    #     # TODO: Maybe serializin requestlog is not a logical approach for modifying submission based on jira post
    #     model = RequestLog
    #     fields = ['type', 'url', 'response_status', 'issue',  ]

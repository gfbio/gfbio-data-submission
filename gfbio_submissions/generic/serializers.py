# -*- coding: utf-8 -*-

from rest_framework import serializers

from .models import RequestLog


class JiraRequestLogSerializer(serializers.ModelSerializer):
    # TODO: rename, depends on actual content of jira request
    # data = serializers.CharField()

    # TODO: maybe add this for explicit validation:
    #   def validated_data(self): (...)

    # def validate(self, data):
    #     return data

    class Meta:
        # TODO: Maybe serializin requestlog is not a logical approach for modifying submission based on jira post
        model = RequestLog
        fields = ['type', 'data', 'response_status', ]

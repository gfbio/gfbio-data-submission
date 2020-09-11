# -*- coding: utf-8 -*-


from rest_framework import serializers

from gfbio_submissions.brokerage.models import PersistentIdentifier


class PersistentIdentifierResolveSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersistentIdentifier
        fields = (
            'pid',
            'status'
        )

# -*- coding: utf-8 -*-
from rest_framework import serializers

from ..models.field_option import FieldOption


class FieldOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOption
        fields = (
            "option",
            "description",
            "help_link",
        )

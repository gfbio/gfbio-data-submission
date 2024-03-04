# -*- coding: utf-8 -*-

from django.db import models
from model_utils.models import TimeStampedModel

from ..models.field_type import FieldType


class Field(TimeStampedModel):
    title = models.CharField(max_length=64, blank=False, null=False)
    description = models.TextField(default="", blank=True, )

    field_type = models.ForeignKey(FieldType, on_delete=models.CASCADE)

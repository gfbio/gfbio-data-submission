# -*- coding: utf-8 -*-

from django.db import models
from model_utils.models import TimeStampedModel


class FieldType(TimeStampedModel):
    type = models.CharField(max_length=32, blank=False, null=False)

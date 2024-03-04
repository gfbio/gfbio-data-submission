# -*- coding: utf-8 -*-

from django.db import models
from model_utils.models import TimeStampedModel


class FieldType(TimeStampedModel):
    # TODO: unique constaint ?
    type = models.SlugField(max_length=32, blank=False, null=False)

    def __str__(self):
        return "{}_field_type".format(self.type)

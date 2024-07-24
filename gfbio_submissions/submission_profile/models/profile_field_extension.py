# -*- coding: utf-8 -*-
from django.db import models
from model_utils.models import TimeStampedModel

from ..models.field import Field
from ..models.profile import Profile


class ProfileFieldExtension(TimeStampedModel):
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    default = models.TextField(max_length=64, blank=True, default="")
    extra_field_test = models.TextField(max_length=64, blank=True, default="")

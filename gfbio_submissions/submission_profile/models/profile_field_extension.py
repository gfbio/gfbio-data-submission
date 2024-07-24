# -*- coding: utf-8 -*-
from django.db import models
from model_utils.models import TimeStampedModel

from ..models.field import Field
from ..models.profile import Profile


class ProfileFieldExtension(TimeStampedModel):
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    placeholder = models.TextField(default="", blank=True,
                                   help_text="Descriptive text displayed within the input field unless it is filled out")
    system_wide_mandatory = models.BooleanField(default=False)
    mandatory = models.BooleanField(default=False)
    visible = models.BooleanField(default=True)
    default = models.TextField(max_length=64, blank=True, default="")

    def clone(self, profile):
        self.pk = None
        self.profile = profile
        self.save()

    def __str__(self):
        return "{}_{}".format(self.profile.name, self.field.field_name)

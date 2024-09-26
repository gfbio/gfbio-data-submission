# -*- coding: utf-8 -*-
from django.db import models

from .field import Field
from .profile import Profile


class ProfileField(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)


    placeholder = models.TextField(default="", blank=True,
                                   help_text="Descriptive text displayed within the input field unless it is filled out")
    system_wide_mandatory = models.BooleanField(default=False)
    mandatory = models.BooleanField(default=False)
    visible = models.BooleanField(default=True)
    default = models.TextField(max_length=64, blank=True, default="")

    # TODO: redundant to Field.order, clarify where used and get rid of one or the two
    order = models.IntegerField(default=100, help_text='Rank within in the elements in the layout-position')

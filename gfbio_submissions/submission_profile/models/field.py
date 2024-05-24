# -*- coding: utf-8 -*-

from django.db import models
from model_utils.models import TimeStampedModel

from ..models.field_type import FieldType


class Field(TimeStampedModel):
    title = models.CharField(max_length=64, blank=False, null=False,
                             help_text="Title of the field, as displayed in the rendered Form")
    description = models.TextField(default="", blank=True,
                                   help_text="Descriptive text, below the title in the rendered Form")
    field_type = models.ForeignKey(FieldType, on_delete=models.CASCADE)
    comment = models.TextField(default="", blank=True,
                               help_text="Comment text describing the field. This is optional. "
                                         "The information provided here WILL NOT BE SHOWN IN THE FORM")

    def __str__(self):
        return "{}-{}".format(self.pk, self.field_type.type)

    # TODO: unique enough ?
    def field_id(self):
        return self.__str__()

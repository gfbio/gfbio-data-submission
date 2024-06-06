# -*- coding: utf-8 -*-

from django.db import models
from model_utils.models import TimeStampedModel


class FieldType(TimeStampedModel):
    type = models.SlugField(max_length=32, blank=False, null=False, unique=True,
                            help_text="A unique identifier naming the type of the field. It is used to map this "
                                      "field_type to a frontend codeblock that will be rendered as part of the Form.")
    comment = models.TextField(default="", blank=True, help_text="A human-readable description of the field type."
                                                                  "WILL NOT BE SHOWN OR USED IN THE FORM.")

    def __str__(self):
        return self.type

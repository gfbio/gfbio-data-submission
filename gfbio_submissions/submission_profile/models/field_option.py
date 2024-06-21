# -*- coding: utf-8 -*-
from django.db import models

from .field import Field


class FieldOption(models.Model):
    field = models.ForeignKey(Field, related_name="options", on_delete=models.CASCADE)
    order = models.IntegerField()
    option = models.CharField(max_length=128)
    description = models.TextField(default="", blank=True, help_text="May be displayed depending on field_type.")
    help_link = models.URLField(default="", blank=True, help_text="May be displayed depending on field_type.")


    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.option

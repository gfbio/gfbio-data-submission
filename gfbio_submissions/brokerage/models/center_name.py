# -*- coding: utf-8 -*-
from django.core.exceptions import ValidationError
from django.db import models


class CenterName(models.Model):
    center_name = models.CharField(max_length=128, default="")

    def clean(self):
        if self.center_name.strip() == "":
            raise ValidationError(
                {"center_name": "center_name must not be empty."}
            )

    def __str__(self):
        return self.center_name

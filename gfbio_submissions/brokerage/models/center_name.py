# -*- coding: utf-8 -*-
from django.db import models

from ..configuration.settings import DEFAULT_ENA_CENTER_NAME


class CenterName(models.Model):
    center_name = models.CharField(max_length=128, default='')

    def __str__(self):
        if self.center_name != '':
            return '{0}'.format(self.center_name)
        else:
            return DEFAULT_ENA_CENTER_NAME

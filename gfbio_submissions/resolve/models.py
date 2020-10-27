# -*- coding: utf-8 -*-
from django.db import models

from .managers import AccessionManager


class Accession(models.Model):
    identifier = models.CharField(max_length=256)

    objects = AccessionManager()

    def __str__(self):
        return self.identifier

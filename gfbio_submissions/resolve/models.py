# -*- coding: utf-8 -*-
from django.db import models


class Accession(models.Model):
    identifier = models.CharField(max_length=256)

    def __str__(self):
        return self.identifier

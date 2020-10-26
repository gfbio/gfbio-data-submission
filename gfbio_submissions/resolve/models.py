# -*- coding: utf-8 -*-
from django.db import models


class Accession(models.Model):
    identifier = models.CharField(max_length=256)

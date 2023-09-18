# -*- coding: utf-8 -*-
from django.db import models
from model_utils.models import TimeStampedModel


class JiraMessage(TimeStampedModel):
    name = models.CharField(
        max_length=128,
        blank=False,
        null=False,
        default='')
    message = models.TextField(
        blank=False,
        null=False,
        help_text="{submitter} - will be replaced with 'Submitter' or user's name if found<br />"
                  "{title} - will be replaced with submission's title<br />"
                  "{id} - will be replaced with submission's id<br />"
                  "{primary_accession} - replaced with primary accession number<br />"
                  "{reference} - will be replaced with jira's ticket reference<br />"
                  "{embargo} -  will be replaced with the embargo date"
    )

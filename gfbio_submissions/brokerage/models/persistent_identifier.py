# -*- coding: utf-8 -*-
from django.db import models
from model_utils.models import TimeStampedModel

from .broker_object import BrokerObject


class PersistentIdentifier(TimeStampedModel):
    ARCHIVES = (
        ('ENA', 'ENA'),
        ('PAN', 'Pangea'),
    )
    PID_TYPES = (
        ('ACC', 'ENA Accession Number'),
        ('PRJ', 'ENA BioProject ID (primary Accession Number)'),
        ('TSQ', 'ENA Accession for targeted sequence submission'),
        # TODO: rename to Pangea specific identifier for doi
        ('DOI', 'Pangea Doi'),
        ('BSA', 'Biosample'),
        ('LBL', 'Generic Label')
    )
    archive = models.CharField(choices=ARCHIVES, max_length=3, default='ENA')
    pid_type = models.CharField(choices=PID_TYPES, max_length=3, default='ACC')
    pid = models.CharField(max_length=256, default='')
    status = models.CharField(
        max_length=24,
        default='',
        blank=True,
        help_text='This field is usually set when ENA Reports are parsed '
                  'automatically. Thus contains the value of the ENA-Report '
                  'field "releaseStatus"'
    )
    hold_date = models.DateField(
        null=True,
        blank=True)
    resolver_url = models.URLField(max_length=256, default='', blank=True)
    broker_object = models.ForeignKey(BrokerObject, on_delete=models.CASCADE)
    outgoing_request_id = models.UUIDField(primary_key=False, null=True,
                                           blank=True)
    # notify user 2 weeks before the embargo ends
    user_notified = models.DateField(
        null=True,
        blank=True)

    # notify user when ena status changed to PUBLIC
    user_notified_released = models.DateField(
        null=True,
        blank=True)

    def __str__(self):
        return '{}'.format(self.pid)

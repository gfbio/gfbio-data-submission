import uuid

from django.db import models

from config.settings.base import AUTH_USER_MODEL
from gfbio_submissions.generic.fields import JsonDictField
from ..managers.broker_object_manager import BrokerObjectManager
from ..models.submission import Submission


# -*- coding: utf-8 -*-
class BrokerObject(models.Model):
    ENTITY_TYPES = (
        ('study', 'study'),
        ('sample', 'sample'),
        ('experiment', 'experiment'),
        ('run', 'run'),
        ('submission', 'submission'),
    )
    type = models.CharField(choices=ENTITY_TYPES, max_length=12)
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.PROTECT)
    # site_project_id = models.CharField(max_length=128, blank=True, default='')
    # site_object_id = models.CharField(max_length=128, blank=True, default='')
    object_id = models.CharField(max_length=36, default='')

    def save(self, *args, **kwargs):
        if self.object_id == '':
            self.object_id = '{0}'.format(uuid.uuid4())
        super(BrokerObject, self).save(*args, **kwargs)

    data = JsonDictField(default=dict)
    submissions = models.ManyToManyField(Submission)

    objects = BrokerObjectManager()

    def append_pid_for_pangea_doi(self, doi):
        return self.persistentidentifier_set.create(
            archive='PAN',
            pid_type='DOI',
            pid=doi
        )

    def get_or_create_ena_pid(self, entity_pid, request_id):
        return self.persistentidentifier_set.get_or_create(
            archive='ENA',
            pid=entity_pid,
            defaults={
                'archive': 'ENA',
                'pid_type': 'ACC',
                'pid': entity_pid,
                'outgoing_request_id': request_id,
            },
        )

    # TODO: discuss future usage
    # def natural_key(self):
    #     return self.type, self.site, self.site_project_id, self.site_object_id

    def __str__(self):
        return '{}_{}'.format(self.type, self.object_id)

    # TODO: discuss future usage
    # class Meta:
    #     unique_together = (('type', 'site', 'site_project_id', 'site_object_id'),)

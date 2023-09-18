# -*- coding: utf-8 -*-
from django.db import models

from .submission import Submission
from ..configuration.settings import REFERENCE_TYPES, GFBIO_HELPDESK_TICKET


class AdditionalReference(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    type = models.CharField(max_length=1, choices=REFERENCE_TYPES,
                            default=GFBIO_HELPDESK_TICKET)
    primary = models.BooleanField(
        default=False,
        help_text='Only primary tickets are updated. Once set all primary '
                  'fields of other AdditionalReferences of this type and with '
                  'this relation are set to False')
    reference_key = models.CharField(max_length=128, blank=True, default='')

    def save(self, *args, **kwargs):
        if self.primary:
            other_references = AdditionalReference.objects.filter(
                primary=True).filter(type=self.type).filter(
                submission=self.submission)
            for reference in other_references:
                reference.primary = False
                reference.save()
        super(AdditionalReference, self).save(*args, **kwargs)

    def __str__(self):
        return '{}'.format(self.reference_key)

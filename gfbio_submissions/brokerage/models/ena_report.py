# -*- coding: utf-8 -*-
from django.db import models
from django.db.models import JSONField
from model_utils.models import TimeStampedModel


class EnaReport(TimeStampedModel):
    STUDY = 'STU'
    SAMPLE = 'SAM'
    EXPERIMENT = 'EXP'
    RUN = 'RUN'

    REPORT_TYPES = [
        (STUDY, 'studies'),
        (SAMPLE, 'samples'),
        (EXPERIMENT, 'experiments'),
        (RUN, 'runs'),
    ]

    report_type = models.CharField(max_length=3, choices=REPORT_TYPES,
                                   default=STUDY)
    report_data = JSONField()

    def __str__(self):
        return '{}'.format(self.get_report_type_display())

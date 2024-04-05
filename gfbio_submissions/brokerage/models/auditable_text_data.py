# -*- coding: utf-8 -*-
import uuid

from django.db import models
from model_utils.models import TimeStampedModel

from .submission import Submission
from ..managers.auditable_text_data_manager import AuditableTextDataManager


class AuditableTextData(TimeStampedModel):
    data_id = models.UUIDField(primary_key=False, default=uuid.uuid4)
    name = models.CharField(max_length=128)
    submission = models.ForeignKey(
        Submission,
        null=False,
        blank=False,
        help_text="Associated Submission for this object",
        on_delete=models.CASCADE,
    )
    text_data = models.TextField(
        default="",
        blank=True,
        help_text="Main content of this object. E.g. xml, json or any other text-based data.",
    )
    comment = models.TextField(
        default="",
        blank=True,
        help_text="Free text. Any comments or useful information regarding this object",
    )

    objects = AuditableTextDataManager()

    def __str__(self):
        return "AuditableTextData_{0}".format(self.data_id)

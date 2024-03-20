# -*- coding: utf-8 -*-
import uuid

from django.db import models
from model_utils.models import TimeStampedModel

# from gfbio_submissions.brokerage.managers import AuditableTextDataManager
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

    # atax_file_name = models.CharField(
    #     blank=True,
    #     max_length=255,
    #     default="",
    #     help_text="Name of submission upload file",
    # )

    # atax_xml_valid = models.BooleanField(
    #     default=False,
    #     help_text="Result of the validation of the xml structure against abcd xml schema",
    #     verbose_name="validation status",
    # )

    # atax_exp_index = models.SmallIntegerField(
    #     default=-1,
    #     blank=True,
    #     help_text="single uploads: exponents for powers of two, combination: sum of single upload powers of two",
    # )

    objects = AuditableTextDataManager()

    def __str__(self):
        return "AuditableTextData_{0}".format(self.data_id)

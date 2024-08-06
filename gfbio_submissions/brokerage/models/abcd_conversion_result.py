import uuid

from django.db import models
from model_utils.models import TimeStampedModel

from .submission import Submission

class AbcdConversionResult(TimeStampedModel):
    data_id = models.UUIDField(primary_key=False, default=uuid.uuid4)
    submission = models.ForeignKey(
        Submission,
        null=False,
        blank=False,
        help_text="Associated Submission for this object",
        on_delete=models.CASCADE,
    )
    xml = models.TextField(
        default="",
        blank=True,
        help_text="Result of the ABCD-Conversion.",
    )
    errors = models.TextField(
        default="",
        blank=True,
        help_text="if errors occured during conversion they show here.",
    )
    warnings = models.TextField(
        default="",
        blank=True,
        help_text="if warnings occured during conversion they show here.",
    )
    logs = models.TextField(
        default="",
        blank=True,
        help_text="All logs written during conversion.",
    )
    atax_xml_valid = models.BooleanField(
        default=False,
        help_text="Result of the validation of the xml structure against abcd xml schema",
        verbose_name="validation status",
    )

    def __str__(self):
        return "{0}_{1}: {2}".format(self.submission, self.created, self.data_id)
    
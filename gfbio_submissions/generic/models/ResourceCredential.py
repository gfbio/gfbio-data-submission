import logging

from django.db import models
from model_utils.models import TimeStampedModel

logger = logging.getLogger(__name__)


class ResourceCredential(TimeStampedModel):
    title = models.SlugField(
        max_length=128, help_text="Enter a descriptive title for this instance"
    )
    url = models.CharField(
        max_length=256, help_text="Url to which requests will be sent to"
    )
    authentication_string = models.CharField(
        max_length=128,
        default="",
        blank=True,
        help_text="In cases where an archive "
        "demands some sort of pre-build "
        "authentication string or "
        "sentence, it is entered here. "
        "E.g. ENAs authentication",
    )
    username = models.CharField(
        max_length=72,
        default="",
        help_text="In case of username/password authentication fill this field",
    )
    password = models.CharField(
        max_length=72,
        default="",
        help_text="In case of username/password authentication fill this field",
    )
    comment = models.TextField(
        default="", blank=True, help_text="Enter a description or helpful text here"
    )

    def __str__(self):
        return "{}".format(self.title)

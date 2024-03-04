from model_utils.models import TimeStampedModel
from django.db import models

from ..models.field import Field


class Profile(TimeStampedModel):
    name = models.SlugField(max_length=32)

    fields = models.ManyToManyField(Field)

    def __str__(self):
        return "{}_{}".format(self.pk, self.name)

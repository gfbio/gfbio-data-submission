from model_utils.models import TimeStampedModel
from django.db import models


class Profile(TimeStampedModel):
    name = models.SlugField(max_length=32)

    def __str__(self):
        return "{}_{}".format(self.pk, self.name)

from django.db import models
from model_utils.models import TimeStampedModel

from ..models.field import Field
from ...brokerage.configuration.settings import GENERIC
from ...brokerage.models.submission import Submission


class Profile(TimeStampedModel):
    name = models.SlugField(max_length=16, unique=True)
    target = models.CharField(max_length=16, choices=Submission.TARGETS, default=GENERIC)

    fields = models.ManyToManyField(Field, blank=True)
    inherit_fields_from = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)

    # TODO: workflow field, sub models like preferences, chain of tasks etc.
    # TODO: owner ?
    # TODO: language ? or in preferences
    # TODO: general structure like, grid, menues, footer, general texts or descriptions
    # TODO: global actions, buttons or similar
    # TODO: global design ?

    def __str__(self):
        return "{}_{}".format(self.pk, self.name)

    def all_fields(self):
        if self.inherit_fields_from is None:
            return self.fields.all()
        return self.fields.all() | self.inherit_fields_from.fields.all()

    def form_fields(self):
        if self.inherit_fields_from is None:
            return self.all_fields()
        return self.all_fields() | self.inherit_fields_from.all_fields()

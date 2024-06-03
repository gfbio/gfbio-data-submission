# -*- coding: utf-8 -*-

from django.db import models
from model_utils.models import TimeStampedModel

from ..models.field_type import FieldType


class Field(TimeStampedModel):
    field_name = models.SlugField(max_length=32, blank=False, null=False,
                                  help_text="A descriptive name for the field. this will help in differentiating and "
                                            "selecting between fields. e.g. 'generic_title' or 'molecular_embargo_date'")
    field_type = models.ForeignKey(FieldType, on_delete=models.CASCADE)
    title = models.CharField(max_length=64, blank=False, null=False,
                             help_text="Title of the field, as displayed in the rendered Form")
    description = models.TextField(default="", blank=True,
                                   help_text="Descriptive text, below the title in the rendered Form")
    mandatory = models.BooleanField(default=False)
    visible = models.BooleanField(default=True)
    default = models.TextField(max_length=64, default="")
    comment = models.TextField(default="", blank=True,
                               help_text="Comment text describing the field. This is optional. "
                                         "The information provided here WILL NOT BE SHOWN IN THE FORM")
    # DONE-TODO: tests/serializer auf neue Felder anpassen
    # TODO: test for inherited profiles
    # TODO: test for all field (inherited of inherited)
    # DONE-TODO: mandatory, visible, defaults
    # TODO: profile als Get parameter (ivo)
    # DONE-TODO: inherit profile fields from other profiles
    # TODO: json import
    # FIXME: initiale Idee war json file als profil config, und nutzer profile in datenbank
    #   TODO: Begründung für Entscheidung gegen File (bzw. json field).
    # TODO: wie profil mit nutzer verbinen ?
    #   --> UserProfile model, über url anfragen bzw. in view nach user schauen ?
    #   - wie basis auswählen ?
    #   - wie felder auswählen ?
    #

    def __str__(self):
        return "{}_{}".format(self.field_name, self.pk)

    # TODO: unique enough ?
    def field_id(self):
        return self.__str__()

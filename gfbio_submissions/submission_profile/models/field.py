# -*- coding: utf-8 -*-

from django.db import models
from model_utils.models import TimeStampedModel

from ..models.field_type import FieldType


class Field(TimeStampedModel):
    # TODO: Discussion:
    #   to map a dynamic field to the related field in the submission data, a string is needed
    #   that matches the backend json validaton. example:
    #   a field that is representing the title in a GENERIC submission has to be sent {"title": <VALUE>}
    #   option are:
    #       1. the field_name is matching the actual field in the json data. e.g. field_name "title" for GENERIC title
    #       2. an extra field is added here to the model, that describes "mapping_to" jsondata . like "title" but field_name can be different
    #   in any case such an id has to be unique per profile to ensure proper form handling in the frontend.
    #   if a profile with a field "title" inherits fields from another profile, that has also a field "title", an form error may occur.
    #   but this will happen independent of option 1 or 2

    # TODO: in profile model. validator for unique-in-profile field_name (or mapping_to)
    #   https://docs.djangoproject.com/en/4.2/ref/validators/
    field_name = models.SlugField(max_length=32, blank=False, null=False,
                                  help_text="A descriptive name for the field. this will help in differentiating and "
                                            "selecting between fields. e.g. 'generic_title' or 'molecular_embargo_date'")
    field_type = models.ForeignKey(FieldType, on_delete=models.CASCADE)

    title = models.CharField(max_length=64, blank=False, null=False,
                             help_text="Title of the field, as displayed in the rendered Form")
    description = models.TextField(default="", blank=True,
                                   help_text="Descriptive text, below the title in the rendered Form")
    comment = models.TextField(default="", blank=True,
                               help_text="Comment text describing the field. This is optional. "
                                         "The information provided here WILL NOT BE SHOWN IN THE FORM")
    position = models.CharField(max_length=7, default='main',
                                choices=(('main', 'main'), ('sidebar', 'sidebar')),
                                help_text="Position of the element in the Layout of the form")
    order = models.IntegerField(default=100, help_text='Rank within in the elements in the layout-position')

    # ------------------------------------------------------------------------------
    # TODO: this here is per user/system specific, all above will remain unchanged
    system_wide_mandatory = models.BooleanField(default=False)
    placeholder = models.TextField(default="", blank=True,
                                   help_text="Descriptive text displayed within the input field unless it is filled out")

    mandatory = models.BooleanField(default=False)
    visible = models.BooleanField(default=True)
    default = models.TextField(max_length=64, blank=True, default="")

    # ------------------------------------------------------------------------------

    # TODO: test for inherited profiles
    # TODO: test for all field (inherited of inherited)
    # TODO: json import
    # FIXME: initiale Idee war json file als profil config, und nutzer profile in datenbank
    #   TODO: Begründung für Entscheidung gegen File (bzw. json field).
    # TODO: wie profil mit nutzer verbinen ?
    #   --> UserProfile model, über url anfragen bzw. in view nach user schauen ?
    #   - wie basis auswählen ?
    #   - wie felder auswählen ?
    # TODO: how to add field-level validation (e.g. min length decsription) to frontend ?
    #   - in frontend per field-widget (current ui has this) ?
    #   - add this to backend to be changable dynamically ?

    def save(self, *args, **kwargs):
        super(Field, self).save(*args, **kwargs)
        if self.system_wide_mandatory:
            self.mandatory = True
            system_wide_mandatories = Field.objects.filter(system_wide_mandatory=True)
            # prevent cyclic import error
            from .profile import Profile
            from .profile_field_extension import ProfileFieldExtension
            for profile in Profile.objects.all():
                for s in system_wide_mandatories:
                    # profile.fields.add(s)
                    ProfileFieldExtension.objects.get_or_create(
                        field=s, profile=profile,
                        defaults={"mandatory": True, "system_wide_mandatory": True}
                    )

    def __str__(self):
        return self.field_name

    # TODO: unique enough ?
    def field_id(self):
        # TODO: currently redundant to field_name
        return self.field_name

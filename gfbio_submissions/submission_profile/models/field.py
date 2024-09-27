# -*- coding: utf-8 -*-

from django.db import models
from django.db.models import Q
from model_utils.models import TimeStampedModel

from ..models.field_type import FieldType


class Field(TimeStampedModel):
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

    # TODO: redundant to ProfileFieldExtension.order, clarify where used and get rid of one or the two
    order = models.IntegerField(default=100, help_text='Rank within in the elements in the layout-position')

    system_wide_mandatory = models.BooleanField(default=False)
    placeholder = models.TextField(default="", blank=True,
                                   help_text="Descriptive text displayed within the input field unless it is filled out")

    mandatory = models.BooleanField(default=False)
    visible = models.BooleanField(default=True)
    default = models.TextField(max_length=64, blank=True, default="")

    def save(self, *args, **kwargs):
        #     print("save ", self)

        if self.system_wide_mandatory:
            # if system_wide_mandatory is true, so has to be mandatory
            self.mandatory = True
            # if system_wide_mandatory is true, the field has to be visible
            self.visible = True

        super(Field, self).save(*args, **kwargs)

        # just add this field to ALL profiles, if system_wide_mandatory is True and the profile
        #   does not already contain this field
        # prevent cyclic import error
        from .profile import Profile
        for profile in Profile.objects.filter(~Q(fields__id=self.id)):
            print(profile)
            profile.fields.add(self)

    # update ALL profiles to contain recent number of ALL system_wide_mandatory fields
    # system_wide_mandatories = Field.objects.filter(system_wide_mandatory=True)
    # prevent cyclic import error
    # from .profile import Profile
    # #         from .profile_field_extension import ProfileFieldExtension
    #     for profile in Profile.objects.all():

    #             print(" would add ", self, " to profile ", profile)
    # #             for s in system_wide_mandatories:
    # #                 ProfileFieldExtension.objects.add_from_field(field=self, profile=profile)

    def __str__(self):
        return self.field_name

    # TODO: unique enough ?
    def field_id(self):
        # TODO: currently redundant to field_name
        return self.field_name

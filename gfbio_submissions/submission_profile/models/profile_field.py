# -*- coding: utf-8 -*-
from django.db import models

from .field import Field
from .profile import Profile


class ProfileField(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    # TODO: via field.placeholder ?
    # placeholder = models.TextField(default="", blank=True,
    #                                help_text="Descriptive text displayed within the input field unless it is filled out")
    # TODO: via field.swm ?
    # system_wide_mandatory = models.BooleanField(default=False)

    # TODO: add helper text (admin) explaining swm implication
    mandatory = models.BooleanField(default=False)
    # TODO: add helper text (admin) explaining swm implication
    visible = models.BooleanField(default=True)
    # TODO: add helper text (admin) explaining swm implication
    default = models.TextField(max_length=64, blank=True, default="")

    # TODO: redundant to Field.order, clarify where used and get rid of one or the two
    order = models.IntegerField(default=100, help_text='Rank within in the elements in the layout-position')

    # TODO: go through tests/views
    #         compare list for reqs https://kb.gfbio.org/display/DASS/Submission+Profiles
    def save(self, *args, **kwargs):
        # initial creation, not an update
        if self.pk is None:
            self.mandatory = self.field.system_wide_mandatory
            # self.system_wide_mandatory = self.field.system_wide_mandatory
            # self.placeholder = self.field.placeholder
            self.visible = self.field.visible
            self.default = self.field.default
            self.order = self.field.order
        else:
            if self.field.system_wide_mandatory:
                self.mandatory = True
                self.visible = True
                self.default = self.field.default
        super(ProfileField, self).save(*args, **kwargs)
    def __str__(self):
        return self.field.field_name

# -*- coding: utf-8 -*-
from django.db import models

from .field import Field
from .profile import Profile

# def get_default_mandatory(field):
#     print('get_default_mandatory ', )
#     return Field.objects.get(field)

class ProfileField(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    # TODO: via field.placeholder ?
    # placeholder = models.TextField(default="", blank=True,
    #                                help_text="Descriptive text displayed within the input field unless it is filled out")
    # TODO: via field.swm ?
    # system_wide_mandatory = models.BooleanField(default=False)

    # TODO: add helper text (admin) explaining swm implication
    mandatory = models.BooleanField(default=True)
    # TODO: add helper text (admin) explaining swm implication
    visible = models.BooleanField(default=True)
    # TODO: add helper text (admin) explaining swm implication
    default = models.TextField(max_length=64, blank=True, default="")

    # TODO: redundant to Field.order, clarify where used and get rid of one or the two
    # order = models.IntegerField(default=100, help_text='Rank within in the elements in the layout-position')

    # TODO: go through tests/views
    #         compare list for reqs https://kb.gfbio.org/display/DASS/Submission+Profiles
    def save(self, *args, **kwargs):
        # TODO: maybe remove when output is better achieved via serializer
        if self.field.system_wide_mandatory:
            self.mandatory = True
            self.visible = True
            self.default = ""
        super(ProfileField, self).save(*args, **kwargs)
        # print('pf save, after supe.save ')
        # print(self.field.system_wide_mandatory)
        # print(self.mandatory)
        # initial creation, not an update
        # if self.pk is None:
        #     print(self.field.field_name, ' save ', kwargs, '  --  ', args)
        #     self.mandatory = self.field.mandatory
        #     # print(self.field.field_name, ' field save ', self.field.system_wide_mandatory, '   ', self.field.mandatory)
        #     # self.mandatory = True if self.field.system_wide_mandatory else self.field.mandatory
        #     # self.system_wide_mandatory = self.field.system_wide_mandatory
        #     # self.placeholder = self.field.placeholder
        #     # self.visible = self.field.visible
        #     # self.default = self.field.default
        #     self.order = self.field.order
        # else:
        #     if self.field.system_wide_mandatory:
        #         self.mandatory = True
        #         self.visible = True
        #         self.default = self.field.default

    def clone(self, profile, field):
        self.pk = None
        self.profile = profile
        self.field = field
        self.save()


    def __str__(self):
        return f"{self.pk}_{self.field.field_name}"

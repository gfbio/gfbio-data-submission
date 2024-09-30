# -*- coding: utf-8 -*-
from django.db import models

from .field import Field
from .profile import Profile


class ProfileField(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    # TODO: add helper text (admin) explaining swm implication
    mandatory = models.BooleanField(default=True)
    # TODO: add helper text (admin) explaining swm implication
    visible = models.BooleanField(default=True)
    # TODO: add helper text (admin) explaining swm implication
    default = models.TextField(max_length=64, blank=True, default="")

    # TODO: go through tests/views
    #         compare list for reqs https://kb.gfbio.org/display/DASS/Submission+Profiles
    def save(self, *args, **kwargs):
        # TODO: maybe remove when output is better achieved via serializer
        if self.field.system_wide_mandatory:
            self.mandatory = True
            self.visible = True
            self.default = ""
        super(ProfileField, self).save(*args, **kwargs)

    def clone(self, profile, field):
        self.pk = None
        self.profile = profile
        self.field = field
        self.save()

    def __str__(self):
        return f"{self.pk}_{self.field.field_name}"

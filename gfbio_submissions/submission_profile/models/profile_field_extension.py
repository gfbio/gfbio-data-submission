# -*- coding: utf-8 -*-

from django.db import models
from model_utils.models import TimeStampedModel

# from ..managers.profile_field_extension_manager import ProfileFieldExtensionManager
from ..models.field import Field
from ..models.profile import Profile


# class ProfileFieldExtension(TimeStampedModel):
#     field = models.ForeignKey(Field, on_delete=models.CASCADE)
#     profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
#
#     placeholder = models.TextField(default="", blank=True,
#                                    help_text="Descriptive text displayed within the input field unless it is filled out")
#     system_wide_mandatory = models.BooleanField(default=False)
#     mandatory = models.BooleanField(default=False)
#     visible = models.BooleanField(default=True)
#     default = models.TextField(max_length=64, blank=True, default="")
#
#     # TODO: redundant to Field.order, clarify where used and get rid of one or the two
#     order = models.IntegerField(default=100, help_text='Rank within in the elements in the layout-position')
#
#     objects = ProfileFieldExtensionManager()
#
#     def save(self, *args, **kwargs):
#         # initial, not an update
#         if self.pk is None:
#             self.mandatory = self.field.system_wide_mandatory
#             self.system_wide_mandatory = self.field.system_wide_mandatory
#             self.placeholder = self.field.placeholder
#             self.visible = self.field.visible
#             self.default = self.field.default
#             self.order = self.field.order
#         super(ProfileFieldExtension, self).save(*args, **kwargs)
#
#     def clone(self, profile):
#         self.pk = None
#         self.profile = profile
#         self.save()
#
#     def __str__(self):
#         return "{}_{}".format(self.profile.name, self.field.field_name)

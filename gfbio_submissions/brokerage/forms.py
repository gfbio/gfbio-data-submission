# -*- coding: utf-8 -*-
import logging

from django import forms
from django.utils.encoding import force_text

from .fields import OrderedJsonFormField
from .models import Submission

logger = logging.getLogger(__name__)


class Gcdj2CsvForm(forms.Form):
    gcdjson = OrderedJsonFormField(required=True)


# class SubmissionAdminForm(forms.ModelForm):
#     class Meta:
#         model = Submission
#         fields = '__all__'
#
#     def is_valid(self):
#         logger.info(force_text(self.errors))
#         return super(SubmissionAdminForm, self).is_valid()

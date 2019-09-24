# -*- coding: utf-8 -*-
import logging

from django import forms

from .fields import OrderedJsonFormField

logger = logging.getLogger(__name__)


class Gcdj2CsvForm(forms.Form):
    gcdjson = OrderedJsonFormField(required=True)


class SubmissionCommentForm(forms.Form):
    comment = forms.CharField()

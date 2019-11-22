# -*- coding: utf-8 -*-

from django import forms

from .fields import OrderedJsonFormField


class Gcdj2CsvForm(forms.Form):
    gcdjson = OrderedJsonFormField(required=True)


class SubmissionCommentForm(forms.Form):
    comment = forms.CharField()

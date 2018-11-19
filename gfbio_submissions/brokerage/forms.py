# -*- coding: utf-8 -*-
from django import forms

from gfbio_submissions.brokerage.fields import OrderedJsonFormField


class Gcdj2CsvForm(forms.Form):
    gcdjson = OrderedJsonFormField(required=True)


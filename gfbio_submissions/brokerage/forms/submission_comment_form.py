# -*- coding: utf-8 -*-
from django import forms


class SubmissionCommentForm(forms.Form):
    comment = forms.CharField()

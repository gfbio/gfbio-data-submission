# -*- coding: utf-8 -*-
from django import forms
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

from gfbio_submissions.generic.fields import OrderedJsonFormField


class Gcdj2CsvForm(forms.Form):
    gcdjson = OrderedJsonFormField(required=True)


class SubmissionCommentForm(forms.Form):
    comment = forms.CharField()


class JiraIssueUpdateQueryForm(forms.Form):
    user_id = forms.CharField()
    user_key = forms.CharField()

    def clean_user_id(self):
        id = self.cleaned_data['user_id']
        if id.count('brokeragent'):
            raise ValidationError(
                _('%(value)s is blacklisted'),
                params={'value': id},
            )
        return id

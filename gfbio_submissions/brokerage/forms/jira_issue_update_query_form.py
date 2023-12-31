# -*- coding: utf-8 -*-
from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class JiraIssueUpdateQueryForm(forms.Form):
    user_id = forms.CharField()
    user_key = forms.CharField(required=False)

    def clean_user_id(self):
        user_id = self.cleaned_data["user_id"]
        if user_id.count("brokeragent"):
            raise ValidationError(
                _("%(value)s is blacklisted"),
                params={"value": user_id},
            )
        return user_id

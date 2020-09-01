# -*- coding: utf-8 -*-

from django import forms


class ValidationSchemaSelectionForm(forms.Form):
    schema = forms.ChoiceField(
        required=True,
        choices=[
            ('common_requirements_definitions.json',
             'common_requirements_definitions'),
            ('ena_study_definitions.json', 'ena_study_definitions'),
        ])

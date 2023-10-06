# -*- coding: utf-8 -*-

from django import forms


class ValidationSchemaSelectionForm(forms.Form):
    schema = forms.ChoiceField(
        required=True,
        choices=[
            ("common_requirements_definitions.json", "common_requirements_definitions"),
            ("ena_study_definitions.json", "ena_study_definitions"),
            ("ena_sample_definitions.json", "ena_sample_definitions"),
            ("ena_experiment_definitions.json", "ena_experiment_definitions"),
            ("ena_run_definitions.json", "ena_run_definitions"),
            ("technical_content_definitions.json", "technical_content_definitions"),
        ],
    )

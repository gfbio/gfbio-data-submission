# -*- coding: utf-8 -*-

from django.db import models


class ProfileFieldExtensionManager(models.Manager):

    def add_from_field(self, field, profile):
        mandatory = field.mandatory
        visible = field.visible
        if field.system_wide_mandatory:
            mandatory = True
            visible = True
        self.get_or_create(
            field=field,
            profile=profile,
            defaults={
                "mandatory": mandatory,
                "system_wide_mandatory": field.system_wide_mandatory,
                "placeholder": field.placeholder,
                "visible": visible,
                "default": field.default,
                # TODO: redundant to Field.order, clarify where used and get rid of one or the two
                "order": field.order,
            }
        )

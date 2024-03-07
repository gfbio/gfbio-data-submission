# -*- coding: utf-8 -*-

from django.contrib import admin

from .models.field import Field
from .models.field_type import FieldType
from .models.profile import Profile

admin.site.register(Profile)
admin.site.register(Field)
admin.site.register(FieldType)

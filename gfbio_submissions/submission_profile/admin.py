# -*- coding: utf-8 -*-

from django.contrib import admin

from .models import FieldOption
# from .models.user_profile import UserProfile
from .models.field import Field
from .models.field_type import FieldType
from .models.profile import Profile


class FieldOptionInline(admin.TabularInline):
    model = FieldOption
    extra = 1

class FieldAdmin(admin.ModelAdmin):
    inlines = [FieldOptionInline, ]

admin.site.register(Profile)
# admin.site.register(UserProfile)
admin.site.register(Field, FieldAdmin)
admin.site.register(FieldType)

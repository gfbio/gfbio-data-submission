# -*- coding: utf-8 -*-

from django.contrib import admin

from .models import FieldOption
from .models.field import Field
from .models.field_type import FieldType
from .models.profile import Profile
from .models.profile_field_extension import ProfileFieldExtension


class ProfileFieldExtensionInline(admin.StackedInline):
    model = ProfileFieldExtension
    extra = 1


class ProfileAdmin(admin.ModelAdmin):
    inlines = [ProfileFieldExtensionInline]
    search_fields = ["user__username", "name"]
    list_filter = ["system_wide_profile", "target"]
    list_display = ["__str__", "system_wide_profile", "user", "target", ]


class FieldOptionInline(admin.TabularInline):
    model = FieldOption
    extra = 1


class FieldAdmin(admin.ModelAdmin):
    inlines = [FieldOptionInline, ]
    ordering = ["position", "order"]
    list_display = ["__str__", "position", "order"]


admin.site.register(Profile, ProfileAdmin)
admin.site.register(Field, FieldAdmin)
admin.site.register(FieldType)
admin.site.register(ProfileFieldExtension)

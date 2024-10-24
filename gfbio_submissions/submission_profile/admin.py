# -*- coding: utf-8 -*-

from django.contrib import admin

from .models.field import Field
from .models.field_option import FieldOption
from .models.field_type import FieldType
from .models.profile import Profile
from .models.profile_field import ProfileField


class ProfileFieldAdmin(admin.ModelAdmin):
    list_display = ["__str__", "profile", "field",]


class ProfileFieldInline(admin.TabularInline):
    model = ProfileField
    extra = 1


class ProfileAdmin(admin.ModelAdmin):
    inlines = [ProfileFieldInline]
    search_fields = ["user__username", "name"]
    list_filter = ["system_wide_profile", "active_user_profile"]
    list_display = ["__str__", "system_wide_profile", "user", "active_user_profile", ]
    fields = [
        "name",
        "target",
        "system_wide_profile",
        "user",
        "active_user_profile",
        # "fields",
    ]


class FieldOptionInline(admin.TabularInline):
    model = FieldOption
    extra = 1


class FieldAdmin(admin.ModelAdmin):
    inlines = [FieldOptionInline, ]
    ordering = ["position", "order"]
    list_display = ["__str__", "position", "order", "system_wide_mandatory", ]
    list_filter = ["system_wide_mandatory", ]


admin.site.register(Profile, ProfileAdmin)
admin.site.register(Field, FieldAdmin)
admin.site.register(FieldType)

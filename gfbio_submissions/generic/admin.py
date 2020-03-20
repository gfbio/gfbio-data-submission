# -*- coding: utf-8 -*-


from django.contrib import admin

from .models import TicketLabel, ResourceCredential, SiteConfiguration


class TicketLableInline(admin.TabularInline):
    model = TicketLabel


class SiteConfigurationAdmin(admin.ModelAdmin):
    inlines = (TicketLableInline,)


admin.site.register(ResourceCredential)
admin.site.register(SiteConfiguration, SiteConfigurationAdmin)

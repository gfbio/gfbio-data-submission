# -*- coding: utf-8 -*-


from django.contrib import admin

from .models import TicketLabel, ResourceCredential, SiteConfiguration, \
    RequestLog


class RequestLogAdmin(admin.ModelAdmin):
    readonly_fields = ('request_id', 'created', 'modified',)
    date_hierarchy = 'created'
    list_filter = ('type', 'site_user', 'response_status',)
    search_fields = ['submission_id', 'request_id', 'url', ]


class TicketLableInline(admin.TabularInline):
    model = TicketLabel


class SiteConfigurationAdmin(admin.ModelAdmin):
    inlines = (TicketLableInline,)


admin.site.register(ResourceCredential)
admin.site.register(RequestLog, RequestLogAdmin)
admin.site.register(SiteConfiguration, SiteConfigurationAdmin)

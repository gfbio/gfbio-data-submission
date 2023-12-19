# -*- coding: utf-8 -*-


from django.contrib import admin

from .models.request_log import RequestLog
from .models.resource_credential import ResourceCredential
from .models.site_configuration import SiteConfiguration
from .models.ticket_label import TicketLabel


class RequestLogAdmin(admin.ModelAdmin):
    list_display = ("__str__", "created", "modified", "url", "response_status")
    readonly_fields = (
        "request_id",
        "created",
        "modified",
    )
    date_hierarchy = "created"
    ordering = ("-created",)
    list_filter = (
        "type",
        "method",
        "response_status",
    )
    search_fields = [
        "submission_id",
        "request_id",
        "url",
    ]


class TicketLableInline(admin.TabularInline):
    model = TicketLabel


class SiteConfigurationAdmin(admin.ModelAdmin):
    inlines = (TicketLableInline,)


admin.site.register(ResourceCredential)
admin.site.register(RequestLog, RequestLogAdmin)
admin.site.register(SiteConfiguration, SiteConfigurationAdmin)

# -*- coding: utf-8 -*-
import tempfile
import zipfile
from wsgiref.util import FileWrapper

from django.contrib import admin
from django.http import HttpResponse

from .configuration.settings import SUBMISSION_DELAY
from .models import PersistentIdentifier, \
    Submission, ResourceCredential, BrokerObject, RequestLog, \
    AdditionalReference, SiteConfiguration, PrimaryDataFile, \
    TaskProgressReport, TicketLabel, SubmissionFileUpload, AuditableTextData, \
    CenterName
from .utils.submission_transfer import \
    SubmissionTransferHandler


class PersistentIdentifierInline(admin.TabularInline):
    model = PersistentIdentifier

    def get_extra(self, request, obj=None, **kwargs):
        return 1


class BrokerObjectInline(admin.TabularInline):
    model = BrokerObject.submissions.through

    def get_extra(self, request, obj=None, **kwargs):
        return 1


class BrokerObjectAdmin(admin.ModelAdmin):
    inlines = (PersistentIdentifierInline,)
    list_filter = ('type', 'site',)
    search_fields = ['submissions__broker_submission_id',
                     'persistentidentifier__pid'
                     ]
    exclude = [
        'submission',
    ]


class PersistentIdentifierAdmin(admin.ModelAdmin):
    pass


class AdditionalReferenceInline(admin.TabularInline):
    model = AdditionalReference

    def get_extra(self, request, obj=None, **kwargs):
        return 1


class TicketLableInline(admin.TabularInline):
    model = TicketLabel


class SiteConfigurationAdmin(admin.ModelAdmin):
    inlines = (TicketLableInline,)


def continue_release_submissions(modeladmin, request, queryset):
    for obj in queryset:
        # TODO: retrieving submission via manager is unneccessary, remove but test
        submission = Submission.objects.get(pk=obj.pk)
        transfer_handler = SubmissionTransferHandler(
            submission_id=submission.pk,
            target_archive=submission.target
        )
        transfer_handler.execute()


continue_release_submissions.short_description = 'Continue submission of selected Items'


def create_broker_objects_and_ena_xml(modeladmin, request, queryset):
    from gfbio_submissions.brokerage.tasks import \
        create_broker_objects_from_submission_data_task, \
        prepare_ena_submission_data_task
    for obj in queryset:
        chain = create_broker_objects_from_submission_data_task.s(
            submission_id=obj.pk).set(countdown=SUBMISSION_DELAY) \
                | prepare_ena_submission_data_task.s(submission_id=obj.pk).set(
            countdown=SUBMISSION_DELAY)
        chain()


create_broker_objects_and_ena_xml.short_description = 'Create BrokerObjects + XML'


def download_auditable_text_data(modeladmin, request, queryset):
    for obj in queryset:
        submission = Submission.objects.get(pk=obj.pk)
        temp = tempfile.TemporaryFile()
        archive = zipfile.ZipFile(temp, 'w', zipfile.ZIP_DEFLATED)

        for a in submission.auditabletextdata_set.all():
            f = tempfile.NamedTemporaryFile(mode='wb')
            f.write('{}'.format(a.text_data))
            f.seek(0)
            archive.write(f.name, '{}'.format(a.name))

        archive.close()
        temp.seek(0)
        wrapper = FileWrapper(temp)
        response = HttpResponse(wrapper, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename=test.zip'
        response['Content-Length'] = temp.tell()
        temp.close()
        return response


download_auditable_text_data.short_description = 'Download zipped data'


class SubmissionFileUploadInlineAdmin(admin.TabularInline):
    model = SubmissionFileUpload


class PrimaryDataFileInlineAdmin(admin.StackedInline):
    model = PrimaryDataFile

    def get_extra(self, request, obj=None, **kwargs):
        return 1


class AuditableTextDataInlineAdmin(admin.StackedInline):
    model = AuditableTextData

    def get_extra(self, request, obj=None, **kwargs):
        return 1


class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('broker_submission_id',
                    'submitting_user', 'site', 'status',)
    date_hierarchy = 'created'
    list_filter = ('site', 'status', 'target',)
    search_fields = ['broker_submission_id', 'submitting_user',
                     'submitting_user_common_information',
                     'additionalreference__reference_key'
                     ]
    inlines = (PrimaryDataFileInlineAdmin, AuditableTextDataInlineAdmin,
               AdditionalReferenceInline,)
    actions = [download_auditable_text_data,
               continue_release_submissions,
               create_broker_objects_and_ena_xml, ]


class RequestLogAdmin(admin.ModelAdmin):
    readonly_fields = ('request_id',)
    date_hierarchy = 'created'
    list_filter = ('type', 'site_user', 'response_status',)
    search_fields = ['submission_id', 'request_id', 'url', ]


class RunFileRestUploadAdmin(admin.ModelAdmin):
    readonly_fields = ('created',)


class SubmissionFileUploadAdmin(admin.ModelAdmin):
    pass


class TaskProgressReportAdmin(admin.ModelAdmin):
    date_hierarchy = 'created'
    list_filter = ('status', 'task_name',)
    search_fields = ['submission__broker_submission_id', 'task_name']


admin.site.register(Submission, SubmissionAdmin)
admin.site.register(BrokerObject, BrokerObjectAdmin)
admin.site.register(PersistentIdentifier, PersistentIdentifierAdmin)
admin.site.register(SiteConfiguration, SiteConfigurationAdmin)
admin.site.register(ResourceCredential)
admin.site.register(RequestLog, RequestLogAdmin)
admin.site.register(AdditionalReference)
admin.site.register(TaskProgressReport, TaskProgressReportAdmin)

admin.site.register(SubmissionFileUpload, SubmissionFileUploadAdmin)
admin.site.register(PrimaryDataFile)
admin.site.register(AuditableTextData)
admin.site.register(CenterName)

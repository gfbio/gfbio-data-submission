# -*- coding: utf-8 -*-
import tempfile
import zipfile
from wsgiref.util import FileWrapper

from django.contrib import admin
from django.db.models import Count
from django.http import HttpResponse
from django.utils.encoding import smart_bytes

from .configuration.settings import SUBMISSION_DELAY
from .models import PersistentIdentifier, \
    Submission, ResourceCredential, BrokerObject, RequestLog, \
    AdditionalReference, SiteConfiguration, TaskProgressReport, TicketLabel, \
    SubmissionUpload, \
    AuditableTextData, \
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


create_broker_objects_and_ena_xml.short_description = 'Create BrokerObjects & XML'


def re_create_ena_xml(model_admin, request, queryset):
    from gfbio_submissions.brokerage.tasks import \
        prepare_ena_submission_data_task
    for obj in queryset:
        obj.auditabletextdata_set.all().delete()
        prepare_ena_submission_data_task.apply_async(
            kwargs={
                'submission_id': obj.pk,
            },
            countdown=SUBMISSION_DELAY,
        )


re_create_ena_xml.short_description = 'Re-Create XML (ENA)'


def delete_broker_objects_and_ena_xml(modeladmin, request, queryset):
    for obj in queryset.exclude(status=Submission.CLOSED):
        broker_objects_with_pids = obj.brokerobject_set.annotate(
            pid_count=Count('persistentidentifier')).filter(pid_count__gte=1)
        if len(broker_objects_with_pids) == 0:
            obj.auditabletextdata_set.all().delete()
            obj.brokerobject_set.all().delete()


delete_broker_objects_and_ena_xml.short_description = '(!) Delete BrokerObjects & XML'


def download_auditable_text_data(modeladmin, request, queryset):
    for obj in queryset:
        submission = Submission.objects.get(pk=obj.pk)
        temp = tempfile.TemporaryFile()
        archive = zipfile.ZipFile(temp, 'w', zipfile.ZIP_STORED)

        for a in submission.auditabletextdata_set.all():
            f = tempfile.NamedTemporaryFile(mode='wb')
            f.write(smart_bytes('{}'.format(a.text_data)))
            f.seek(0)
            archive.write(f.name, '{}'.format(a.name))
        archive.close()
        temp.seek(0)
        wrapper = FileWrapper(temp)
        response = HttpResponse(wrapper, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename=test.zip'
        temp.close()
        return response


download_auditable_text_data.short_description = 'Download zipped data'


class AuditableTextDataInlineAdmin(admin.StackedInline):
    model = AuditableTextData

    def get_extra(self, request, obj=None, **kwargs):
        return 1


class SubmissionAdmin(admin.ModelAdmin):
    # form = SubmissionAdminForm
    list_display = ('broker_submission_id',
                    'submitting_user', 'site', 'status',)
    date_hierarchy = 'created'
    list_filter = ('site', 'status', 'target',)
    search_fields = ['broker_submission_id', 'submitting_user',
                     'submitting_user_common_information',
                     'additionalreference__reference_key'
                     ]
    inlines = (AuditableTextDataInlineAdmin,
               AdditionalReferenceInline,)
    actions = [download_auditable_text_data,
               continue_release_submissions,
               re_create_ena_xml,
               create_broker_objects_and_ena_xml,
               delete_broker_objects_and_ena_xml,
               ]


class RequestLogAdmin(admin.ModelAdmin):
    readonly_fields = ('request_id',)
    date_hierarchy = 'created'
    list_filter = ('type', 'site_user', 'response_status',)
    search_fields = ['submission_id', 'request_id', 'url', ]


class RunFileRestUploadAdmin(admin.ModelAdmin):
    readonly_fields = ('created',)


class SubmissionFileUploadAdmin(admin.ModelAdmin):
    pass


class PrimaryDataFileAdmin(admin.ModelAdmin):
    pass


def reparse_csv_metadata(modeladmin, request, queryset):
    # from gfbio_submissions.brokerage.tasks import \
    #     parse_meta_data_for_update_task
    # for obj in queryset:
    #     parse_meta_data_for_update_task.apply_async(
    #         kwargs={
    #             'submission_upload_id': obj.pk,
    #         },
    #         countdown=SUBMISSION_DELAY,
    #     )
    from gfbio_submissions.brokerage.tasks import \
        clean_submission_for_update_task, \
        parse_csv_to_update_clean_submission_task, \
        create_broker_objects_from_submission_data_task, \
        update_ena_submission_data_task
    for obj in queryset:
        submission_upload_id = obj.id
        rebuild_from_csv_metadata_chain = \
            clean_submission_for_update_task.s(
                submission_upload_id=submission_upload_id,
            ).set(countdown=SUBMISSION_DELAY) | \
            parse_csv_to_update_clean_submission_task.s(
                submission_upload_id=submission_upload_id,
            ).set(countdown=SUBMISSION_DELAY) | \
            create_broker_objects_from_submission_data_task.s(
                submission_id=SubmissionUpload.objects.get_related_submission_id(
                    submission_upload_id)
            ).set(countdown=SUBMISSION_DELAY) | \
            update_ena_submission_data_task.s(
                submission_upload_id=submission_upload_id,
            ).set(countdown=SUBMISSION_DELAY)
        rebuild_from_csv_metadata_chain()


reparse_csv_metadata.short_description = 'Re-parse csv metadata to get updated XMLs'


class SubmissionUploadAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'meta_data', 'site', 'user', 'attachment_id',
                    'attach_to_ticket')
    date_hierarchy = 'created'
    list_filter = ('site', 'meta_data', 'attach_to_ticket')
    search_fields = ['submission__broker_submission_id']
    actions = [
        reparse_csv_metadata,
    ]

    def save_model(self, request, obj, form, change):
        # obj.added_by = request.user
        print('ADMIN save model ', obj.pk)
        # or obj.save with params like ignore-attach
        super().save_model(request, obj, form, change)


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

admin.site.register(SubmissionUpload, SubmissionUploadAdmin)

admin.site.register(AuditableTextData)
admin.site.register(CenterName)

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
    Submission, BrokerObject, AdditionalReference, TaskProgressReport, \
    SubmissionUpload, \
    AuditableTextData, \
    CenterName, EnaReport
from .utils.ena import release_study_on_ena
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
    list_filter = ('type', 'user',)
    search_fields = ['submissions__broker_submission_id',
                     'persistentidentifier__pid'
                     ]
    exclude = [
        'submission',
    ]


class PersistentIdentifierAdmin(admin.ModelAdmin):
    list_filter = ('pid_type', 'archive',)
    search_fields = ['pid',
                     'broker_object__submissions__broker_submission_id'
                     ]
    date_hierarchy = 'created'

    list_display = (
        'archive', 'pid', 'pid_type', 'broker_object', 'status', 'hold_date',)


class AdditionalReferenceInline(admin.TabularInline):
    model = AdditionalReference

    def get_extra(self, request, obj=None, **kwargs):
        return 1


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


def release_submission_study_on_ena(modeladmin, request, queryset):
    for obj in queryset:
        submission = Submission.objects.get(pk=obj.pk)
        release_study_on_ena(submission=submission)


release_submission_study_on_ena.short_description = 'Release Study on ENA'


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


download_auditable_text_data.short_description = 'Download XMLs'


def validate_against_ena(modeladmin, request, queryset):
    from gfbio_submissions.brokerage.tasks import \
        validate_against_ena_task
    for obj in queryset:
        validate_against_ena_task.apply_async(
            kwargs={
                'submission_id': obj.pk
            },
            countdown=SUBMISSION_DELAY)


validate_against_ena.short_description = 'Validate against ENA production server'


def submit_to_ena_test(modeladmin, request, queryset):
    from gfbio_submissions.brokerage.tasks import \
        submit_to_ena_test_server_task
    for obj in queryset:
        submit_to_ena_test_server_task.apply_async(
            kwargs={
                'submission_id': obj.pk,
                'action': 'ADD'
            },
            countdown=SUBMISSION_DELAY)


submit_to_ena_test.short_description = 'Submit to ENA test server'


# TODO: maybe extra action for simple validate for testing
def perform_assembly_submission(modeladmin, request, queryset):
    for submission in queryset:
        pass
        # TODO do via chain
        # TODO: colllect and preapre data task (ivo script)
        # TODO: Register Study and samples (XML/Rest)
        # TODO: Prepate CLI command, assemble files, prepare manifest file
        # TODO: performe validate/submit
        # TODO: track errors and/or output to respective folders and store
        #  returned Accession to persistent identifier



perform_assembly_submission.short_description = 'Perform Assembly Submission'

def modify_ena_objects_with_current_xml(modeladmin, request, queryset):
    from gfbio_submissions.brokerage.tasks import \
        transfer_data_to_ena_task
    for obj in queryset:
        transfer_data_to_ena_task.apply_async(
            kwargs={
                'submission_id': obj.pk,
                'action': 'MODIFY'
            },
            countdown=SUBMISSION_DELAY
        )


modify_ena_objects_with_current_xml.short_description = 'Modify ENA objects with curent XML'


class AuditableTextDataInlineAdmin(admin.StackedInline):
    model = AuditableTextData

    def get_extra(self, request, obj=None, **kwargs):
        return 1


class SubmissionAdmin(admin.ModelAdmin):
    date_hierarchy = 'created'  # date drill down
    ordering = ('-modified',)  # ordering in list display
    list_display = ('broker_submission_id',
                    'user', 'created', 'target', 'status',)
    list_filter = ('status', 'target',)
    search_fields = ['broker_submission_id', 'submitting_user',
                     'submitting_user_common_information',
                     'additionalreference__reference_key'
                     ]
    inlines = (AuditableTextDataInlineAdmin,
               AdditionalReferenceInline,)
    actions = [
        release_submission_study_on_ena,
        validate_against_ena,
        submit_to_ena_test,
        modify_ena_objects_with_current_xml,
        download_auditable_text_data,
        continue_release_submissions,
        re_create_ena_xml,
        create_broker_objects_and_ena_xml,
        delete_broker_objects_and_ena_xml,
    ]
    readonly_fields = ('created', 'modified',)


class RunFileRestUploadAdmin(admin.ModelAdmin):
    readonly_fields = ('created',)


class SubmissionFileUploadAdmin(admin.ModelAdmin):
    pass


class PrimaryDataFileAdmin(admin.ModelAdmin):
    pass


def reparse_csv_metadata(modeladmin, request, queryset):
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
                    submission_upload_id), use_submitted_submissions=True
            ).set(countdown=SUBMISSION_DELAY) | \
            update_ena_submission_data_task.s(
                submission_upload_id=submission_upload_id,
            ).set(countdown=SUBMISSION_DELAY)
        rebuild_from_csv_metadata_chain()


reparse_csv_metadata.short_description = 'Re-parse csv metadata to get updated XMLs'


class SubmissionUploadAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'meta_data',
                    'user',
                    'attachment_id',
                    'attach_to_ticket')
    date_hierarchy = 'created'
    list_filter = ('user',
                   'meta_data', 'attach_to_ticket')
    search_fields = ['submission__broker_submission_id']
    actions = [
        reparse_csv_metadata,
    ]


class TaskProgressReportAdmin(admin.ModelAdmin):
    date_hierarchy = 'created'  # date drill down
    ordering = ('-modified',)  # ordering in list display
    readonly_fields = ('created', 'modified',)
    list_filter = ('status', 'task_name',)
    search_fields = ['submission__broker_submission_id', 'task_name']
    list_display = ('task_name', 'created', 'modified')


class EnaReportAdmin(admin.ModelAdmin):
    date_hierarchy = 'created'


admin.site.register(Submission, SubmissionAdmin)
admin.site.register(BrokerObject, BrokerObjectAdmin)
admin.site.register(PersistentIdentifier, PersistentIdentifierAdmin)
admin.site.register(AdditionalReference)
admin.site.register(TaskProgressReport, TaskProgressReportAdmin)

admin.site.register(SubmissionUpload, SubmissionUploadAdmin)

admin.site.register(AuditableTextData)
admin.site.register(CenterName)

admin.site.register(EnaReport, EnaReportAdmin)

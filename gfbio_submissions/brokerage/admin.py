# -*- coding: utf-8 -*-
import tempfile
import zipfile
from wsgiref.util import FileWrapper

from django.contrib import admin
from django.db.models import Count
from django.http import HttpResponse
from django.utils.encoding import smart_bytes

from gfbio_submissions.brokerage.tasks.submission_tasks.check_for_submittable_data import (
    check_for_submittable_data_task,
)

from .configuration.settings import SUBMISSION_DELAY, SUBMISSION_UPLOAD_RETRY_DELAY
from .models.additional_reference import AdditionalReference
from .models.auditable_text_data import AuditableTextData
from .models.abcd_conversion_result import AbcdConversionResult
from .models.broker_object import BrokerObject
from .models.center_name import CenterName
from .models.ena_report import EnaReport
from .models.jira_message import JiraMessage
from .models.persistent_identifier import PersistentIdentifier
from .models.submission import Submission
from .models.submission_upload import SubmissionUpload
from .models.task_progress_report import TaskProgressReport
from .utils.ena import release_study_on_ena
from .utils.submission_process import SubmissionProcessHandler
from .utils.task_utils import jira_cancel_issue


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
    list_filter = (
        "type",
        "user",
    )
    search_fields = ["submissions__broker_submission_id", "persistentidentifier__pid"]
    exclude = [
        "submission",
    ]


class PersistentIdentifierAdmin(admin.ModelAdmin):
    list_filter = (
        "pid_type",
        "archive",
    )
    search_fields = ["pid", "broker_object__submissions__broker_submission_id"]
    date_hierarchy = "created"

    list_display = (
        "archive",
        "pid",
        "pid_type",
        "broker_object",
        "status",
        "hold_date",
    )


class AdditionalReferenceInline(admin.TabularInline):
    model = AdditionalReference

    def get_extra(self, request, obj=None, **kwargs):
        return 1


def continue_release_submissions(modeladmin, request, queryset):
    for obj in queryset:
        # TODO: retrieving submission via manager is unneccessary, remove but test
        submission = Submission.objects.get(pk=obj.pk)
        process_handler = SubmissionProcessHandler(submission_id=submission.pk, target_archive=submission.target)
        process_handler.execute()


continue_release_submissions.short_description = "Continue submission of selected Items"


def release_submission_study_on_ena(modeladmin, request, queryset):
    for obj in queryset:
        submission = Submission.objects.get(pk=obj.pk)
        release_study_on_ena(submission=submission)


release_submission_study_on_ena.short_description = "Release Study on ENA"


def cancel_selected_submissions(modeladmin, request, queryset):
    for obj in queryset:
        obj.status = Submission.CANCELLED
        obj.save()
        jira_cancel_issue(submission_id=obj.pk, admin=True)


cancel_selected_submissions.short_description = "Cancel selected submissions"


def create_broker_objects_and_ena_xml(modeladmin, request, queryset):
    from .tasks.auditable_text_data_tasks.prepare_ena_submission_data import prepare_ena_submission_data_task
    from .tasks.broker_object_tasks.create_broker_objects_from_submission_data import (
        create_broker_objects_from_submission_data_task,
    )

    for obj in queryset:
        chain = create_broker_objects_from_submission_data_task.s(submission_id=obj.pk).set(
            countdown=SUBMISSION_DELAY
        ) | prepare_ena_submission_data_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
        chain()


create_broker_objects_and_ena_xml.short_description = "Create BrokerObjects & XML"


def re_create_ena_xml(model_admin, request, queryset):
    from .tasks.auditable_text_data_tasks.prepare_ena_submission_data import prepare_ena_submission_data_task

    for obj in queryset:
        obj.auditabletextdata_set.all().delete()
        prepare_ena_submission_data_task.apply_async(
            kwargs={
                "submission_id": obj.pk,
            },
            countdown=SUBMISSION_DELAY,
        )


re_create_ena_xml.short_description = "Re-Create XML (ENA)"


def delete_broker_objects_and_ena_xml(modeladmin, request, queryset):
    for obj in queryset.exclude(status=Submission.CLOSED):
        broker_objects_with_pids = obj.brokerobject_set.annotate(pid_count=Count("persistentidentifier")).filter(
            pid_count__gte=1
        )
        if len(broker_objects_with_pids) == 0:
            obj.auditabletextdata_set.all().delete()
            obj.brokerobject_set.all().delete()


delete_broker_objects_and_ena_xml.short_description = "(!) Delete BrokerObjects & XML"


def download_auditable_text_data(modeladmin, request, queryset):
    for obj in queryset:
        submission = Submission.objects.get(pk=obj.pk)
        temp = tempfile.TemporaryFile()
        archive = zipfile.ZipFile(temp, "w", zipfile.ZIP_STORED)

        for a in submission.auditabletextdata_set.all():
            f = tempfile.NamedTemporaryFile(mode="wb")
            f.write(smart_bytes("{}".format(a.text_data)))
            f.seek(0)
            archive.write(f.name, "{}".format(a.name))
        archive.close()
        temp.seek(0)
        wrapper = FileWrapper(temp)
        response = HttpResponse(wrapper, content_type="application/zip")
        response["Content-Disposition"] = "attachment; filename=test.zip"
        temp.close()
        return response


download_auditable_text_data.short_description = "Download XMLs"


def validate_against_ena(modeladmin, request, queryset):
    from .tasks.process_tasks.validate_against_ena import validate_against_ena_task

    for obj in queryset:
        validate_against_ena_task.apply_async(kwargs={"submission_id": obj.pk}, countdown=SUBMISSION_DELAY)


validate_against_ena.short_description = "Validate against ENA production server"


def submit_to_ena_test(modeladmin, request, queryset):
    from .tasks.process_tasks.submit_to_ena_test_server import submit_to_ena_test_server_task

    for obj in queryset:
        submit_to_ena_test_server_task.apply_async(
            kwargs={"submission_id": obj.pk, "action": "ADD"},
            countdown=SUBMISSION_DELAY,
        )


submit_to_ena_test.short_description = "Submit to ENA test server"


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


perform_assembly_submission.short_description = "Perform Assembly Submission"


def modify_ena_objects_with_current_xml(modeladmin, request, queryset):
    from .tasks.process_tasks.transfer_data_to_ena import transfer_data_to_ena_task

    for obj in queryset:
        transfer_data_to_ena_task.apply_async(
            kwargs={"submission_id": obj.pk, "action": "MODIFY"},
            countdown=SUBMISSION_DELAY,
        )


modify_ena_objects_with_current_xml.short_description = "Modify ENA objects with curent XML"


def perform_targeted_sequence_submission(modeladmin, request, queryset):
    from .tasks.auditable_text_data_tasks.create_targeted_sequence_ena_manifest import (
        create_targeted_sequence_ena_manifest_task,
    )
    from .tasks.auditable_text_data_tasks.prepare_ena_study_xml import prepare_ena_study_xml_task
    from .tasks.broker_object_tasks.create_study_broker_objects_only import create_study_broker_objects_only_task
    from .tasks.process_tasks.process_ena_response import process_ena_response_task
    from .tasks.process_tasks.process_targeted_sequence_results import process_targeted_sequence_results_task
    from .tasks.process_tasks.register_study_at_ena import register_study_at_ena_task
    from .tasks.process_tasks.submit_targeted_sequence_to_ena import submit_targeted_sequences_to_ena_task

    for obj in queryset:
        chain = (
            create_study_broker_objects_only_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
            | prepare_ena_study_xml_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
            | register_study_at_ena_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
            | process_ena_response_task.s(submission_id=obj.pk, close_submission_on_success=False).set(
                countdown=SUBMISSION_DELAY
            )
            | create_targeted_sequence_ena_manifest_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
            | submit_targeted_sequences_to_ena_task.s(submission_id=obj.pk, do_test=False, do_validate=False).set(
                countdown=SUBMISSION_DELAY
            )
            | process_targeted_sequence_results_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
        )
        chain()


perform_targeted_sequence_submission.short_description = "Perform Targeted Sequence Submission"


def register_study_at_ena(modeladmin, request, queryset):
    from .tasks.auditable_text_data_tasks.prepare_ena_study_xml import prepare_ena_study_xml_task
    from .tasks.broker_object_tasks.create_study_broker_objects_only import create_study_broker_objects_only_task
    from .tasks.process_tasks.process_ena_response import process_ena_response_task
    from .tasks.process_tasks.register_study_at_ena import register_study_at_ena_task

    for obj in queryset:
        chain = (
            create_study_broker_objects_only_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
            | prepare_ena_study_xml_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
            | register_study_at_ena_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
            | process_ena_response_task.s(submission_id=obj.pk, close_submission_on_success=False).set(
                countdown=SUBMISSION_DELAY
            )
        )
        chain()


register_study_at_ena.short_description = "Register Study at ENA"


def prepare_manifest(modeladmin, request, queryset):
    from .tasks.auditable_text_data_tasks.create_targeted_sequence_ena_manifest import (
        create_targeted_sequence_ena_manifest_task,
    )

    for obj in queryset:
        create_targeted_sequence_ena_manifest_task.apply_async(
            kwargs={
                "submission_id": obj.pk,
            }
        )


prepare_manifest.short_description = "Prepare MANIFEST file"


def submit_manifest_to_ena(modeladmin, request, queryset):
    from .tasks.process_tasks.process_targeted_sequence_results import process_targeted_sequence_results_task
    from .tasks.process_tasks.submit_targeted_sequence_to_ena import submit_targeted_sequences_to_ena_task

    for obj in queryset:
        chain = submit_targeted_sequences_to_ena_task.s(submission_id=obj.pk, do_test=False, do_validate=False).set(
            countdown=SUBMISSION_DELAY
        ) | process_targeted_sequence_results_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
        chain()


submit_manifest_to_ena.short_description = "Submit MANIFEST file to ENA"


def validate_manifest_at_ena(modeladmin, request, queryset):
    from .tasks.process_tasks.process_targeted_sequence_results import process_targeted_sequence_results_task
    from .tasks.process_tasks.submit_targeted_sequence_to_ena import submit_targeted_sequences_to_ena_task

    for obj in queryset:
        chain = submit_targeted_sequences_to_ena_task.s(submission_id=obj.pk, do_test=False, do_validate=True).set(
            countdown=SUBMISSION_DELAY
        ) | process_targeted_sequence_results_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
        chain()


validate_manifest_at_ena.short_description = "Validate MANIFEST file at ENA"


def create_helpdesk_issue_manually(modeladmin, request, queryset):
    from .tasks.jira_tasks.attach_to_submission_issue import attach_to_submission_issue_task
    from .tasks.jira_tasks.create_submission_issue import create_submission_issue_task
    from .tasks.jira_tasks.get_gfbio_helpdesk_username import get_gfbio_helpdesk_username_task
    from .tasks.jira_tasks.jira_initial_comment import jira_initial_comment_task

    for obj in queryset:
        chain = (
            get_gfbio_helpdesk_username_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
            | create_submission_issue_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
            | jira_initial_comment_task.s(submission_id=obj.pk).set(countdown=SUBMISSION_DELAY)
        )
        chain()
        related_uploads = SubmissionUpload.objects.filter(submission=obj, attach_to_ticket=True)
        for upload in related_uploads:
            attach_to_submission_issue_task.apply_async(
                kwargs={
                    "submission_id": "{0}".format(obj.pk),
                    "submission_upload_id": "{0}".format(upload.pk),
                },
                countdown=SUBMISSION_UPLOAD_RETRY_DELAY,
            )


create_helpdesk_issue_manually.short_description = "Create helpdesk issue manually"


def combine_csvs_to_abcd(modeladmin, request, queryset):
    from .tasks.atax_tasks.atax_run_combination_task import atax_run_combination_task

    obj = queryset[0]
    chain = (
        atax_run_combination_task.s(submission_id=obj.pk).set(
            countdown=SUBMISSION_DELAY
        )
    )

    chain()

combine_csvs_to_abcd.short_description = "Combine CSV-Files to ABCD-File"

def atax_validate(modeladmin, request, queryset):
    from .tasks.atax_tasks.atax_submission_validate_xml_upload import atax_submission_validate_auditable_atax_xml_task

    for obj in queryset:
        chain = (
            atax_submission_validate_auditable_atax_xml_task.s(
                auditable_id = obj.pk
            ).set(countdown=SUBMISSION_DELAY)
        )

        chain()




atax_validate.short_description = "ATAX validate"


class AuditableTextDataAdmin(admin.ModelAdmin):
    actions = [
        atax_validate
    ]


class AuditableTextDataInlineAdmin(admin.StackedInline):
    model = AuditableTextData

    def get_extra(self, request, obj=None, **kwargs):
        return 1


class SubmissionAdmin(admin.ModelAdmin):
    date_hierarchy = "created"  # date drill down
    ordering = ("-modified",)  # ordering in list display
    list_display = (
        "broker_submission_id",
        "user",
        "created",
        "target",
        "status",
    )
    list_filter = (
        "status",
        "target",
    )
    # TODO: user username emaial
    search_fields = ["broker_submission_id", "additionalreference__reference_key", "user__username", "user__email", "user__name"]
    inlines = (
        AuditableTextDataInlineAdmin,
        AdditionalReferenceInline,
    )
    actions = [
        create_helpdesk_issue_manually,
        cancel_selected_submissions,
        release_submission_study_on_ena,
        validate_against_ena,
        submit_to_ena_test,
        modify_ena_objects_with_current_xml,
        download_auditable_text_data,
        continue_release_submissions,
        re_create_ena_xml,
        create_broker_objects_and_ena_xml,
        delete_broker_objects_and_ena_xml,
        perform_targeted_sequence_submission,
        register_study_at_ena,
        prepare_manifest,
        validate_manifest_at_ena,
        submit_manifest_to_ena,
        combine_csvs_to_abcd,
    ]
    readonly_fields = (
        "created",
        "modified",
    )

    def save_model(self, request, obj, form, change):
        # FIXME: this is not good and needs refactoring asap !
        old_sub = Submission.objects.filter(id=obj.pk).first()
        if old_sub and change and old_sub.status != obj.status and obj.status == Submission.CANCELLED:
            jira_cancel_issue(submission_id=obj.pk, admin=True)
        super(SubmissionAdmin, self).save_model(request, obj, form, change)


class RunFileRestUploadAdmin(admin.ModelAdmin):
    readonly_fields = ("created",)


class SubmissionFileUploadAdmin(admin.ModelAdmin):
    pass


class PrimaryDataFileAdmin(admin.ModelAdmin):
    pass


def reparse_csv_metadata(modeladmin, request, queryset):
    from .tasks.auditable_text_data_tasks.update_ena_submission_data import update_ena_submission_data_task
    from .tasks.broker_object_tasks.create_broker_objects_from_submission_data import (
        create_broker_objects_from_submission_data_task,
    )
    from .tasks.submission_upload_tasks.clean_submission_for_update import clean_submission_for_update_task
    from .tasks.submission_upload_tasks.parse_csv_to_update_clean_submission import (
        parse_csv_to_update_clean_submission_task,
    )

    for obj in queryset:
        submission_upload_id = obj.id
        rebuild_from_csv_metadata_chain = (
            clean_submission_for_update_task.s(
                submission_upload_id=submission_upload_id,
            ).set(countdown=SUBMISSION_DELAY)
            | parse_csv_to_update_clean_submission_task.s(
                submission_upload_id=submission_upload_id,
            ).set(countdown=SUBMISSION_DELAY)
            | create_broker_objects_from_submission_data_task.s(
                submission_id=SubmissionUpload.objects.get_related_submission_id(submission_upload_id),
                use_submitted_submissions=True,
            ).set(countdown=SUBMISSION_DELAY)
            | update_ena_submission_data_task.s(
                submission_upload_id=submission_upload_id,
            ).set(countdown=SUBMISSION_DELAY)
            | check_for_submittable_data_task.s(
                submission_id=SubmissionUpload.objects.get_related_submission_id(submission_upload_id),
            ).set(countdown=SUBMISSION_DELAY)
        )
        rebuild_from_csv_metadata_chain()


reparse_csv_metadata.short_description = "Re-parse csv metadata to get updated XMLs"


def download_submission_upload_file(modeladmin, request, queryset):
    for obj in queryset:
        f = obj.file
        response = HttpResponse(f.read(), content_type="application/force-download")
        response["Content-Disposition"] = "attachment; filename=%s" % f.name.split("/")[-1:][0]
        return response


download_submission_upload_file.short_description = "Download the file of the selected SubmissionUpload."


class SubmissionUploadAdmin(admin.ModelAdmin):
    list_display = ("__str__", "meta_data", "user", "attachment_id", "attach_to_ticket")
    date_hierarchy = "created"
    list_filter = ("user", "meta_data", "attach_to_ticket")
    search_fields = ["submission__broker_submission_id"]
    actions = [
        reparse_csv_metadata,
        download_submission_upload_file,
    ]


class TaskProgressReportAdmin(admin.ModelAdmin):
    date_hierarchy = "created"  # date drill down
    ordering = ("-modified",)  # ordering in list display
    readonly_fields = (
        "created",
        "modified",
    )
    list_filter = (
        "status",
        "task_name",
    )
    search_fields = ["submission__broker_submission_id", "task_name"]
    list_display = ("task_name", "created", "modified")


class EnaReportAdmin(admin.ModelAdmin):
    date_hierarchy = "created"


class JiraMessageAdmin(admin.ModelAdmin):
    fields = ("name", "message")
    # readonly_fields = ('name',)
    ordering = ("name",)
    list_filter = ("name",)
    search_fields = [
        "name",
    ]
    list_display = ("name", "modified")


class AbcdConversionResultAdmin(admin.ModelAdmin):
    date_hierarchy = "created"  # date drill down
    ordering = ("-modified",)  # ordering in list display
    list_display = (
        "data_id",
        "submission",
        "created",
        "atax_xml_valid"
    )
    list_filter = (
        "submission",
        "created",
        "atax_xml_valid",
    )
    search_fields = ["submission__id", "submission__broker_submission_id"]
    readonly_fields = (
        "created",
    )


admin.site.register(Submission, SubmissionAdmin)
admin.site.register(BrokerObject, BrokerObjectAdmin)
admin.site.register(PersistentIdentifier, PersistentIdentifierAdmin)
admin.site.register(AdditionalReference)
admin.site.register(TaskProgressReport, TaskProgressReportAdmin)

admin.site.register(SubmissionUpload, SubmissionUploadAdmin)

admin.site.register(AuditableTextData, AuditableTextDataAdmin)
admin.site.register(CenterName)

admin.site.register(EnaReport, EnaReportAdmin)

admin.site.register(JiraMessage, JiraMessageAdmin)

admin.site.register(AbcdConversionResult, AbcdConversionResultAdmin)

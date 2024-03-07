import os

from celery import Celery

# set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

app = Celery("gfbio_submissions")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()
# FIXME: major problem, celery does no recursive auto discover, just per app config -> tasks.py
#   or you have to manually specify the module to discover, compare example below.
#   this would mean to have a entry for every file containing a task, current refactoring has put
#   every task in one file !

# TODO: please check scripts/list_task_packages . here a list of all required paths is printed out, to
#   insert it here. This is a quick fix to register all tasks until a more sophisticated solution is implemented.
app.autodiscover_tasks(
    [
        'gfbio_submissions.brokerage.tasks.auditable_text_data_tasks.prepare_ena_study_xml',
        'gfbio_submissions.brokerage.tasks.auditable_text_data_tasks.update_ena_submission_data',
        'gfbio_submissions.brokerage.tasks.auditable_text_data_tasks.prepare_ena_submission_data',
        'gfbio_submissions.brokerage.tasks.auditable_text_data_tasks.create_targeted_sequence_ena_manifest',
        'gfbio_submissions.brokerage.tasks.ena_report_tasks.update_resolver_accessions',
        'gfbio_submissions.brokerage.tasks.ena_report_tasks.fetch_ena_reports',
        'gfbio_submissions.brokerage.tasks.ena_report_tasks.update_accession_objects_from_ena_report',
        'gfbio_submissions.brokerage.tasks.ena_report_tasks.update_persistent_identifier_report_status',
        'gfbio_submissions.brokerage.tasks.jira_tasks.check_for_pangaea_doi',
        'gfbio_submissions.brokerage.tasks.jira_tasks.add_pangaea_doi',
        'gfbio_submissions.brokerage.tasks.jira_tasks.update_submission_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.jira_transition_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.notify_on_embargo_ended',
        'gfbio_submissions.brokerage.tasks.jira_tasks.add_accession_link_to_submission_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.create_submission_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.add_pangaealink_to_submission_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.jira_cancel_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.add_posted_comment_to_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.notify_user_embargo_changed',
        'gfbio_submissions.brokerage.tasks.jira_tasks.attach_to_pangaea_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.get_gfbio_helpdesk_username',
        'gfbio_submissions.brokerage.tasks.jira_tasks.add_accession_to_pangaea_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.add_accession_to_submission_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.attach_to_submission_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.delete_submission_issue_attachment',
        'gfbio_submissions.brokerage.tasks.jira_tasks.jira_initial_comment',
        'gfbio_submissions.brokerage.tasks.jira_tasks.create_pangaea_issue',
        'gfbio_submissions.brokerage.tasks.jira_tasks.notify_user_embargo_expiry',
        'gfbio_submissions.brokerage.tasks.submission_upload_tasks.clean_submission_for_update',
        'gfbio_submissions.brokerage.tasks.submission_upload_tasks.parse_csv_to_update_clean_submission',
        'gfbio_submissions.brokerage.tasks.transfer_tasks.validate_against_ena',
        'gfbio_submissions.brokerage.tasks.transfer_tasks.process_targeted_sequence_results',
        'gfbio_submissions.brokerage.tasks.transfer_tasks.trigger_submission_transfer',
        'gfbio_submissions.brokerage.tasks.transfer_tasks.transfer_data_to_ena',
        'gfbio_submissions.brokerage.tasks.transfer_tasks.register_study_at_ena',
        'gfbio_submissions.brokerage.tasks.transfer_tasks.process_ena_response',
        'gfbio_submissions.brokerage.tasks.transfer_tasks.submit_to_ena_test_server',
        'gfbio_submissions.brokerage.tasks.transfer_tasks.update_ena_embargo',
        'gfbio_submissions.brokerage.tasks.transfer_tasks.trigger_submission_transfer_for_updates',
        'gfbio_submissions.brokerage.tasks.transfer_tasks.submit_targeted_sequence_to_ena',
        'gfbio_submissions.brokerage.tasks.broker_object_tasks.create_broker_objects_from_submission_data',
        'gfbio_submissions.brokerage.tasks.broker_object_tasks.create_study_broker_objects_onl',
        'gfbio_submissions.brokerage.tasks.user_tasks.check_for_user_without_site_configuration',
        'gfbio_submissions.brokerage.tasks.submission_tasks.delete_related_auditable_textdata',
        'gfbio_submissions.brokerage.tasks.submission_tasks.check_for_molecular_content_in_submission',
        'gfbio_submissions.brokerage.tasks.submission_tasks.notify_curators_on_embargo_ends',
        'gfbio_submissions.brokerage.tasks.submission_tasks.check_for_submission_without_helpdesk_issue',
        'gfbio_submissions.brokerage.tasks.submission_tasks.check_issue_existing_for_submission',
        'gfbio_submissions.brokerage.tasks.submission_tasks.check_on_hold_status',
        # 'gfbio_submissions.brokerage.tasks.atax_tasks.atax_submission_validate_xml_upload',
        # 'gfbio_submissions.brokerage.tasks.atax_tasks.atax_submission_parse_csv_upload_to_xml',
        # 'gfbio_submissions.brokerage.tasks.atax_tasks.atax_submission_combine_xmls_to_one_structure',
    ]
)

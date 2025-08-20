# -*- coding: utf-8 -*-
import logging
import os

from django.conf import settings

from config.celery_app import app
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.utils.jira import JiraClient
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...utils.task_utils import get_submission_and_site_configuration, jira_error_auto_retry


logger = logging.getLogger(__name__)

from ..submission_task import SubmissionTask

@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.notify_admin_on_ena_transfer_completed_task",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
    queue="ena_transfer",
)
def notify_admin_on_ena_transfer_completed_task(self, previous_result=None, submission_id=None, submission_cloud_upload_ids=[], user_id=None):
    print("Meep-naoetct")

    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    reference = submission.get_primary_helpdesk_reference()

    if reference and site_configuration.helpdesk_server:
        jira_message = (
            f"Transfer to ENA for Submission {submission.broker_submission_id} executed.\n"
            f"Check {settings.HOST_URL_ROOT}/admin/brokerage/submission/{submission.pk}/submission-cloud-upload-view/ for detailed information.\n"
        )
        submission_cloud_uploads = submission.submissioncloudupload_set.filter(pk__in=submission_cloud_upload_ids).all()

        files_with_errors = [
            file for file in submission_cloud_uploads
            if file.status != SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_CHECKED_CHECKSUM
        ]
        if files_with_errors:
            jira_message += f"\nProcess ran into problems for {len(files_with_errors)} file(s):"
            jira_message += "\n".join([
                f"- {fwe.file_upload.original_filename}: {SubmissionCloudUpload.get_status_name(fwe.status)}"
                for fwe in files_with_errors
            ])
            jira_message += "\n\n"
        
        successes = [
            file.file_upload.original_filename
            for file in submission_cloud_uploads
            if file.status == SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_CHECKED_CHECKSUM
        ]
        if successes:
            jira_message += "\nSuccessfully transmitted:\n"
            jira_message += ", ".join(successes)
            jira_message += "\n"

        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.add_comment(key_or_issue=reference.reference_key, text=jira_message, is_internal=True)
        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )

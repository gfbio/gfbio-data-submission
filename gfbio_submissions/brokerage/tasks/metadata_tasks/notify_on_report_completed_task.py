import logging

from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.metadata_validation_comment import (
    build_metadata_validation_report_comment,
    is_internal_metadata_validation_jira_comment,
    should_post_metadata_validation_jira_comment,
)
from gfbio_submissions.brokerage.utils.task_utils import get_any_submission_and_site_configuration, jira_error_auto_retry

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.notify_on_report_completed_task",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def notify_on_report_completed_task(self, previous_task_result=None, submission_id=None, report_id=None):
    report = MetadataValidationReport.objects.select_related(
        "submission",
        "upload_file__file_upload",
    ).get(pk=report_id)

    if not should_post_metadata_validation_jira_comment(report):
        logger.info(
            "Skipping metadata validation Jira comment for report %s (no triggered_by user).",
            report_id,
        )
        return True

    comment = build_metadata_validation_report_comment(report)
    is_internal = is_internal_metadata_validation_jira_comment(report)

    submission, site_configuration = get_any_submission_and_site_configuration(
        submission_id=report.submission_id,
        task=self,
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()
    if reference and site_configuration and site_configuration.helpdesk_server:
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.add_comment(key_or_issue=reference.reference_key, text=comment, is_internal=is_internal)
        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )

    logger.info(
        "No helpdesk ticket available for metadata validation report %s.",
        report_id,
    )
    return True

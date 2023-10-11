# -*- coding: utf-8 -*-
from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY, \
    PANGAEA_ISSUE_VIEW_URL
from gfbio_submissions.brokerage.exceptions.transfer_exceptions import TransferServerError, TransferClientError
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration, jira_error_auto_retry


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.add_pangaealink_to_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def add_pangaealink_to_submission_issue_task(self, prev=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    helpdesk_reference = submission.get_primary_helpdesk_reference()
    pangaea_reference = submission.get_primary_pangaea_reference()

    if helpdesk_reference and pangaea_reference:
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)

        jira_client.add_comment(
            key_or_issue=helpdesk_reference.reference_key,
            text="[Pangaea Ticket {1}|{0}{1}]".format(
                PANGAEA_ISSUE_VIEW_URL, pangaea_reference.reference_key
            ),
            is_internal=False,
        )
        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )

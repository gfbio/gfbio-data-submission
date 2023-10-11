# -*- coding: utf-8 -*-
from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY, \
    GFBIO_HELPDESK_TICKET
from gfbio_submissions.brokerage.exceptions.transfer_exceptions import TransferServerError, TransferClientError
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration, jira_error_auto_retry


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.create_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def create_submission_issue_task(self, prev_task_result=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    # TODO: test task without check for null, what happens when errors occur here, not caused inside a
    #  method called here

    # TODO: only needed for comment on ticket, thus remove
    # TODO: althouht filter for primary should deliver only on ticket, a dedicated manager method
    #   would be cleaner (no .first() on query set)
    # existing_tickets = submission.additionalreference_set.filter(
    #     Q(type=GFBIO_HELPDESK_TICKET) & Q(primary=True))

    jira_client = JiraClient(resource=site_configuration.helpdesk_server)
    jira_client.create_submission_issue(
        reporter=prev_task_result, site_config=site_configuration, submission=submission
    )

    jira_error_auto_retry(
        jira_client=jira_client,
        task=self,
        broker_submission_id=submission.broker_submission_id,
    )
    if jira_client.issue:
        submission.additionalreference_set.create(
            type=GFBIO_HELPDESK_TICKET,
            reference_key=jira_client.issue.key,
            primary=True,
        )
    else:
        return TaskProgressReport.CANCELLED

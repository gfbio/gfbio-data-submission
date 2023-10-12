# -*- coding: utf-8 -*-
from config.celery_app import app
from ...configuration.settings import (
    SUBMISSION_MAX_RETRIES,
    SUBMISSION_RETRY_DELAY,
    PANGAEA_JIRA_TICKET,
)
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.jira import JiraClient
from ...utils.task_utils import (
    get_submission_and_site_configuration,
    jira_error_auto_retry,
)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.create_pangaea_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def create_pangaea_issue_task(self, prev=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    jira_client = JiraClient(
        resource=site_configuration.pangaea_jira_server,
        token_resource=site_configuration.pangaea_token_server,
    )
    jira_client.create_pangaea_issue(
        site_config=site_configuration, submission=submission
    )
    jira_error_auto_retry(
        jira_client=jira_client,
        task=self,
        broker_submission_id=submission.broker_submission_id,
    )
    if jira_client.issue:
        submission.additionalreference_set.create(
            type=PANGAEA_JIRA_TICKET, reference_key=jira_client.issue.key, primary=True
        )
        return {
            "issue_key": jira_client.issue.key,
        }
    else:
        return TaskProgressReport.CANCELLED

# -*- coding: utf-8 -*-
from config.celery_app import app
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
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
    name="tasks.attach_to_pangaea_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def attach_to_pangaea_issue_task(self, kwargs={}, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    if "issue_key" in kwargs.keys():
        issue_key = kwargs.get("issue_key", "None")
        jira_client = JiraClient(
            resource=site_configuration.pangaea_jira_server,
            token_resource=site_configuration.pangaea_token_server,
        )
        jira_client.attach_to_pangaea_issue(key=issue_key, submission=submission)
        jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )
        return {"issue_key": issue_key}

    else:
        return TaskProgressReport.CANCELLED

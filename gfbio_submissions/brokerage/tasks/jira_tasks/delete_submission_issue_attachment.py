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
    name="tasks.delete_submission_issue_attachment_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def delete_submission_issue_attachment_task(
    self, kwargs=None, submission_id=None, attachment_id=None
):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    # TODO: temporary solution until workflow is fix,
    #   also needs manager method to prevent exceptions here
    # TODO: maybe attachment id is better than submission upload id, which may be delete
    #   when task executes
    # submission_upload = SubmissionUpload.objects.filter(
    #     pk=submission_upload_id).first()

    jira_client = JiraClient(
        resource=site_configuration.helpdesk_server,
    )
    jira_client.delete_attachment(attachment_id)
    return jira_error_auto_retry(
        jira_client=jira_client,
        task=self,
        broker_submission_id=submission.broker_submission_id,
    )

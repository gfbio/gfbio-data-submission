# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.jira import JiraClient
from ...utils.task_utils import jira_error_auto_retry

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.jira_cancel_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def jira_cancel_issue_task(self, submission_id=None, admin=False):
    logger.info(
        "tasks.py | jira_cancel_issue_task | submission_id={} admin={}".format(
            submission_id, admin
        )
    )
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)

    submission = Submission.objects.get(id=submission_id)

    if submission and submission.user:
        site_config = submission.user.site_configuration
        if site_config:
            reference = submission.get_primary_helpdesk_reference()
            if reference:
                jira_client = JiraClient(resource=site_config.helpdesk_server)
                jira_client.cancel_issue(
                    issue=reference.reference_key,
                    submission=submission,
                    admin=admin,
                )
                return jira_error_auto_retry(
                    jira_client=jira_client,
                    task=self,
                    broker_submission_id=submission.broker_submission_id,
                )

    return {
        "status": "not canceled",
        "submission": "{}".format(submission.broker_submission_id),
        "user": "{}".format(submission.user),
        "admin": "{}".format(admin),
    }

# -*- coding: utf-8 -*-
from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY, \
    SUBMISSION_COMMENT_TEMPLATE
from gfbio_submissions.brokerage.exceptions.transfer_exceptions import TransferServerError, TransferClientError
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks import logger
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration, jira_error_auto_retry, \
    retry_no_ticket_available_exception


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.add_posted_comment_to_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def add_posted_comment_to_issue_task(
    self, prev_task_result=None, submission_id=None, comment="", user_values={}
):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    if reference:
        comment_text = comment
        if "username" in user_values.keys() and "email" in user_values.keys():
            comment_text = SUBMISSION_COMMENT_TEMPLATE.format(
                user_values.get("username", ""), user_values.get("email", ""), comment
            )
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.add_comment(
            key_or_issue=reference.reference_key, text=comment_text, is_internal=False
        )
        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )
    else:
        logger.info(
            msg="add_posted_comment_to_issue_task no tickets found. "
                "submission_id={0} ".format(submission_id)
        )

        return retry_no_ticket_available_exception(
            task=self,
            broker_submission_id=submission.broker_submission_id,
            number_of_tickets=1 if reference else 0,
        )

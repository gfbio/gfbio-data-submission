# -*- coding: utf-8 -*-
from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY, ENA, \
    ENA_PANGAEA, ATAX
from gfbio_submissions.brokerage.exceptions.transfer_exceptions import TransferServerError, TransferClientError
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks import logger
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration, \
    get_jira_comment_template, jira_comment_replace, jira_error_auto_retry


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.jira_initial_comment_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def jira_initial_comment_task(self, prev=None, submission_id=None):
    logger.info(
        "tasks.py | jira_initial_comment_task | submission_id={}".format(submission_id)
    )

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=False
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if submission and site_config:
        reference = submission.get_primary_helpdesk_reference()
        if reference:
            comment_template_name = "WELCOME_COMMENT"
            if submission.target == ENA or submission.target == ENA_PANGAEA:
                comment_template_name = "WELCOME_MOLECULAR_COMMENT"
            elif submission.target == ATAX:
                comment_template_name = "WELCOME_ATAX_COMMENT"

            comment = get_jira_comment_template(
                template_name=comment_template_name,
                task_name="jira_initial_comment_task",
            )
            if not comment:
                return TaskProgressReport.CANCELLED

            comment = jira_comment_replace(
                comment=comment,
                title=submission.data["requirements"]["title"],
                submission_id=submission.broker_submission_id,
                reference=reference.reference_key,
            )

            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key, text=comment, is_internal=False
            )
            jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )
            if jira_client.comment:
                return {
                    "status": "initial comment sent",
                    "submission": "{}".format(submission.broker_submission_id),
                    "reference": "{}".format(reference.reference_key),
                }

    return {
        "status": "initial comment not sent",
        "submission": "{}".format(submission.broker_submission_id),
        "user": "{}".format(submission.user),
    }

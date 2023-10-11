# -*- coding: utf-8 -*-
import datetime

from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
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
    name="tasks.notify_on_embargo_ended_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def notify_on_embargo_ended_task(self, submission_id=None):
    if not submission_id:
        return "submission_id not provided"

    logger.info(
        "tasks.py | notify_on_embargo_ended_task | submission_id={}".format(
            submission_id
        )
    )

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if site_config and site_config.helpdesk_server:
        reference = submission.get_primary_helpdesk_reference()
        primary_accession = submission.get_primary_accession()
        if reference and primary_accession:
            comment = get_jira_comment_template(
                template_name="NOTIFY_EMBARGO_RELEASE",
                task_name="notify_on_embargo_ended_task",
            )
            if not comment:
                return TaskProgressReport.CANCELLED

            comment = jira_comment_replace(
                comment=comment, primary_accession=primary_accession.pid
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
                primary_accession.user_notified_released = datetime.date.today()
                primary_accession.save()
                return {
                    "submission": submission.broker_submission_id,
                    "issue_key": reference.reference_key,
                    "primary_accession": primary_accession.pid,
                    "user_notified_on": datetime.date.today().isoformat(),
                }

    return "No notifications to send"

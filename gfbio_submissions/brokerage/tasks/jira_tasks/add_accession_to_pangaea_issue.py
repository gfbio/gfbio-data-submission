# -*- coding: utf-8 -*-
from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from gfbio_submissions.brokerage.exceptions.transfer_exceptions import TransferServerError, TransferClientError
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration, jira_error_auto_retry


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.add_accession_to_pangaea_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def add_accession_to_pangaea_issue_task(self, kwargs=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    if "issue_key" in kwargs.keys():
        # TODO: manager method to get panagea issue without needing pre-chain result
        ticket_key = kwargs.get("issue_key", "None")
        study_pid = submission.get_primary_accession()
        if study_pid:
            jira_client = JiraClient(
                resource=site_configuration.pangaea_jira_server,
                token_resource=site_configuration.pangaea_token_server,
            )
            jira_client.add_comment(
                key_or_issue=ticket_key,
                text="ENA Accession No. of study {}. broker_submission_id: "
                     "{0}. {1}".format(study_pid.pid, submission.broker_submission_id),
                is_internal=False,
            )

            return jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )
    else:
        return TaskProgressReport.CANCELLED

# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...configuration.settings import (
    SUBMISSION_MAX_RETRIES,
    SUBMISSION_RETRY_DELAY,
    ENA,
    ENA_PANGAEA,
)
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.jira import JiraClient
from ...utils.task_utils import (
    get_submission_and_site_configuration,
    jira_error_auto_retry,
)

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.add_accession_link_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def add_accession_link_to_submission_issue_task(
    self, prev_task_result=None, submission_id=None, target_archive=None
):
    if prev_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | add_accession_link_to_submission_issue_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED
    # No submission will be returned if submission.status is error
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )

    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    if reference and prev_task_result is True:
        if target_archive == ENA or target_archive == ENA_PANGAEA:
            study_pid = (
                submission.brokerobject_set.filter(type="study")
                .first()
                .persistentidentifier_set.filter(pid_type="PRJ")
                .first()
            )

            jira_client = JiraClient(resource=site_configuration.helpdesk_server)
            jira_client.add_ena_study_link_to_issue(
                reference.reference_key, study_pid.pid
            )
            return jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )

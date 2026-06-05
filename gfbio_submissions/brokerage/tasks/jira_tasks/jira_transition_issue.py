# -*- coding: utf-8 -*-
import logging

from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import submission_task
from ...utils.jira import JiraClient
from ...utils.task_utils import get_submission_and_site_configuration, jira_error_auto_retry

logger = logging.getLogger(__name__)


@submission_task("tasks.jira_transition_issue_task")
def jira_transition_issue_task(self, prev=None, submission_id=None, transition_id=871, resolution="Done"):
    logger.info(
        "tasks.py | jira_transition_issue_task | "
        "submission_id={} transition_id={} resolution={}".format(submission_id, transition_id, resolution)
    )

    if not submission_id:
        return "submission_id not provided"

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if submission and submission.user and site_config:
        reference = submission.get_primary_helpdesk_reference()
        if reference:
            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.transition_issue(
                issue=reference.reference_key,
                submission=submission,
                transition_id=transition_id,
                resolution=resolution,
            )
            return jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )

    return {
        "status": "transition failed",
        "submission": "{}".format(submission.broker_submission_id),
        "user": "{}".format(submission.user),
        "transition_id": "{}".format(transition_id),
        "resolution": "{}".format(resolution),
    }

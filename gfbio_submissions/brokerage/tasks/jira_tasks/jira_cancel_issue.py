# -*- coding: utf-8 -*-
import logging

from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import submission_task
from ...utils.jira import JiraClient
from ...utils.task_utils import jira_error_auto_retry

logger = logging.getLogger(__name__)


@submission_task("tasks.jira_cancel_issue_task")
def jira_cancel_issue_task(self, submission_id=None, admin=False):
    logger.info("tasks.py | jira_cancel_issue_task | submission_id={} admin={}".format(submission_id, admin))
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

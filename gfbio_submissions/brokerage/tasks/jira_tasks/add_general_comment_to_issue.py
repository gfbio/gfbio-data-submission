# -*- coding: utf-8 -*-
import logging

from ...configuration.settings import SUBMISSION_COMMENT_TEMPLATE
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import submission_task

logger = logging.getLogger(__name__)

from ...utils.jira import JiraClient
from ...utils.task_utils import (
    get_submission_and_site_configuration,
    jira_error_auto_retry,
    retry_no_ticket_available_exception,
)


@submission_task("tasks.add_general_comment_to_issue_task")
def add_general_comment_to_issue_task(self, prev_task_result=None, submission_id=None, comment="", is_internal=False):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    if reference and site_configuration.helpdesk_server:
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.add_comment(key_or_issue=reference.reference_key, text=comment, is_internal=is_internal)
        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )
    else:
        logger.info(
            msg="add_general_comment_to_issue_task no tickets found. submission_id={0}  helpdesk_server={1}".format(
                submission_id, site_configuration.helpdesk_server
            )
        )
        return TaskProgressReport.CANCELLED

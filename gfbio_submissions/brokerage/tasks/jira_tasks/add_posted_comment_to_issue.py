# -*- coding: utf-8 -*-
import logging

from ...configuration.settings import SUBMISSION_COMMENT_TEMPLATE
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import submission_task
from ...utils.jira import JiraClient
from ...utils.task_utils import (
    get_any_submission_and_site_configuration,
    jira_error_auto_retry,
    retry_no_ticket_available_exception,
)

logger = logging.getLogger(__name__)


@submission_task("tasks.add_posted_comment_to_issue_task")
def add_posted_comment_to_issue_task(self, prev_task_result=None, submission_id=None, comment="", user_values={}):
    submission, site_configuration = get_any_submission_and_site_configuration(submission_id=submission_id, task=self)
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
            key_or_issue=reference.reference_key,
            text=comment_text,
            is_internal=False,
            submission=submission,
        )
        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )
    else:
        logger.info(
            msg="add_posted_comment_to_issue_task no tickets found. " "submission_id={0} ".format(submission_id)
        )

        return retry_no_ticket_available_exception(
            task=self,
            broker_submission_id=submission.broker_submission_id,
            number_of_tickets=1 if reference else 0,
        )

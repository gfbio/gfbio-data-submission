# -*- coding: utf-8 -*-
import logging

from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import submission_task
from ...utils.jira import JiraClient
from ...utils.task_utils import (
    get_jira_comment_template,
    get_submission_and_site_configuration,
    jira_comment_replace,
    jira_error_auto_retry,
)

logger = logging.getLogger(__name__)


@submission_task("tasks.notify_user_embargo_changed_task")
def notify_user_embargo_changed_task(self, prev=None, submission_id=None):
    logger.info("tasks.py | notify_user_embargo_changed_task | submission_id={0}".format(submission_id))

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if site_config and site_config.helpdesk_server:
        reference = submission.get_primary_helpdesk_reference()
        if reference:
            comment = get_jira_comment_template(
                template_name="NOTIFY_EMBARGO_CHANGED",
                task_name="notify_user_embargo_changed_task",
            )
            if not comment:
                return TaskProgressReport.CANCELLED

            comment = jira_comment_replace(comment=comment, embargo=submission.embargo.isoformat())

            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.add_comment(key_or_issue=reference.reference_key, text=comment, is_internal=False)
            return jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )
    else:
        logger.info("tasks.py | notify_user_embargo_changed_task | no site_config for helpdesk_serever")

    return {
        "status": "error",
        "submission": "{}".format(submission.broker_submission_id),
        "msg": "missing site_config or jira ticket",
    }

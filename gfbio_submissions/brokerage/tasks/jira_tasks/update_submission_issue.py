# -*- coding: utf-8 -*-
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import submission_task
from ...utils.jira import JiraClient
from ...utils.task_utils import get_submission_and_site_configuration, jira_error_auto_retry


@submission_task("tasks.update_submission_issue_task")
def update_submission_issue_task(self, prev_task_result=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    reference = submission.get_primary_helpdesk_reference()
    if reference:
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.update_submission_issue(
            reporter=prev_task_result,
            key=reference.reference_key,
            site_config=site_configuration,
            submission=submission,
        )

        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )
    else:
        return TaskProgressReport.CANCELLED

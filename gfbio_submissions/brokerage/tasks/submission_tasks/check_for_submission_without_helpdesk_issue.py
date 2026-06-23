# -*- coding: utf-8 -*-
import logging

from config.celery_app import app

from ...configuration.settings import (
    NO_HELPDESK_ISSUES_EMAIL_MESSAGE_TEMPLATE,
    NO_HELPDESK_ISSUES_EMAIL_SUBJECT_TEMPLATE,
)
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.email_curators import mail_curators

logger = logging.getLogger(__name__)


def _format_submissions_without_helpdesk_issue(submissions):
    lines = []
    for sub in submissions:
        username = sub.user.username if sub.user else "no user"
        lines.append(
            "- submission: {0} | database id: {1} | status: {2} | user: {3}".format(
                sub.broker_submission_id,
                sub.pk,
                sub.status,
                username,
            )
        )
    return "\n".join(lines)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_for_submissions_without_helpdesk_issue_task",
)
def check_for_submissions_without_helpdesk_issue_task(self):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(msg="tasks.py |  check_for_submissions_without_helpdesk_issue_task |" " start search")
    submissions_without_issue = list(Submission.objects.get_submissions_without_primary_helpdesk_issue())
    if not submissions_without_issue:
        logger.info(msg="tasks.py | check_for_submissions_without_helpdesk_issue_task | no submissions found")
        return True

    logger.info(
        msg="tasks.py | check_for_submissions_without_helpdesk_issue_task "
        "| no helpdesk issue for {} submission(s) | "
        "sending mail to admins".format(len(submissions_without_issue))
    )
    mail_curators(
        subject=NO_HELPDESK_ISSUES_EMAIL_SUBJECT_TEMPLATE.format(len(submissions_without_issue)),
        message=NO_HELPDESK_ISSUES_EMAIL_MESSAGE_TEMPLATE.format(
            _format_submissions_without_helpdesk_issue(submissions_without_issue)
        ),
    )
    return True

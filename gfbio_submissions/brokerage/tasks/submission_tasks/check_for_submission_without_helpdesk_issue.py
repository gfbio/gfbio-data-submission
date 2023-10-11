# -*- coding: utf-8 -*-
from django.core.mail import mail_admins

from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import NO_HELPDESK_ISSUE_EMAIL_SUBJECT_TEMPLATE, \
    NO_HELPDESK_ISSUEE_EMAIL_MESSAGE_TEMPLATE
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks import logger
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_for_submissions_without_helpdesk_issue_task",
)
def check_for_submissions_without_helpdesk_issue_task(self):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(
        msg="tasks.py |  check_for_submissions_without_helpdesk_issue_task |"
            " start search"
    )
    submissions_without_issue = (
        Submission.objects.get_submissions_without_primary_helpdesk_issue()
    )
    for sub in submissions_without_issue:
        logger.info(
            msg="tasks.py | check_for_submissions_without_helpdesk_issue_task "
                "| no helpdesk issue for submission {} | "
                "sending mail to admins".format(sub.broker_submission_id)
        )
        mail_admins(
            subject=NO_HELPDESK_ISSUE_EMAIL_SUBJECT_TEMPLATE.format(
                sub.broker_submission_id
            ),
            message=NO_HELPDESK_ISSUEE_EMAIL_MESSAGE_TEMPLATE.format(
                sub.broker_submission_id, sub.user.username
            ),
        )
    return True

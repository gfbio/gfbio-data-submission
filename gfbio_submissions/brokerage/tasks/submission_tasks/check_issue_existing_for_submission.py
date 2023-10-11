# -*- coding: utf-8 -*-
from django.core.mail import mail_admins

from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import GFBIO_HELPDESK_TICKET, \
    NO_HELPDESK_ISSUE_EMAIL_SUBJECT_TEMPLATE, NO_HELPDESK_ISSUEE_EMAIL_MESSAGE_TEMPLATE
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks import logger
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_issue_existing_for_submission_task",
)
def check_issue_existing_for_submission_task(self, prev=None, submission_id=None):
    logger.info(
        "tasks.py | check_issue_existing_for_submission_task | "
        "submission_id={0}".format(submission_id)
    )

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if (
        len(
            submission.additionalreference_set.filter(
                primary=True, type=GFBIO_HELPDESK_TICKET
            )
        )
        < 1
    ):
        logger.error(
            "tasks.py | check_issue_existing_for_submission_task | "
            "no helpdesk issue found for submission={0}  | "
            "submission_id={1}".format(submission.broker_submission_id, submission_id)
        )
        mail_admins(
            subject=NO_HELPDESK_ISSUE_EMAIL_SUBJECT_TEMPLATE.format(
                submission.broker_submission_id
            ),
            message=NO_HELPDESK_ISSUEE_EMAIL_MESSAGE_TEMPLATE.format(
                submission.broker_submission_id, submission.user.username
            ),
        )
        return TaskProgressReport.CANCELLED

    return True

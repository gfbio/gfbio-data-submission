# -*- coding: utf-8 -*-
from django.core.mail import mail_admins

from config.celery_app import app
from config.settings.base import HOST_URL_ROOT, ADMIN_URL
from gfbio_submissions.brokerage.configuration.settings import APPROVAL_EMAIL_SUBJECT_TEMPLATE, \
    APPROVAL_EMAIL_MESSAGE_TEMPLATE
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks import logger
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.submission_transfer import SubmissionTransferHandler
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_on_hold_status_task",
)
def check_on_hold_status_task(self, previous_task_result=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if site_configuration.release_submissions:
        logger.info(
            msg="check_on_hold_status_task. submission pk={0}. "
                "site_config pk={1}. site_configuration.release_submissions"
                "={2}. execute submission."
                "".format(
                submission_id,
                site_configuration.pk,
                site_configuration.release_submissions,
            )
        )
        transfer_handler = SubmissionTransferHandler(
            submission_id=submission.pk, target_archive=submission.target
        )
        transfer_handler.execute()
    else:
        if not submission.approval_notification_sent:
            # email admins, then do smth. to trigger chain once ok
            logger.info(
                msg="check_on_hold_status_task. submission pk={0}. "
                    "site_config pk={1}. site_configuration.release_submissions"
                    "={2}. send mail to admins."
                    "".format(
                    submission_id,
                    site_configuration.pk,
                    site_configuration.release_submissions,
                )
            )
            # TODO: refactor to method in task_utils, and use templates/constants
            mail_admins(
                subject=APPROVAL_EMAIL_SUBJECT_TEMPLATE.format(
                    HOST_URL_ROOT,
                    # site_configuration.site.username if site_configuration.site else site_configuration.title,
                    submission.user.username
                    if submission.user
                    else site_configuration.title,
                    submission.broker_submission_id,
                ),
                message=APPROVAL_EMAIL_MESSAGE_TEMPLATE.format(
                    submission.broker_submission_id,
                    "{0}{1}brokerage/submission/{2}/change/".format(
                        HOST_URL_ROOT, ADMIN_URL, submission.pk
                    ),
                ),
            )
            submission.approval_notification_sent = True
            submission.save()

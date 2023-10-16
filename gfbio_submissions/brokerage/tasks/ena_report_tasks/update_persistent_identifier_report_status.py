# -*- coding: utf-8 -*-

import logging

from django.core.mail import mail_admins

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.ena import update_persistent_identifier_report_status

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_persistent_identifier_report_status_task",
)
def update_persistent_identifier_report_status_task(self, previous_task_result=None):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(
        msg="tasks.py | update_persistent_identifier_report_status_task "
        "| previous_task_result={0}".format(previous_task_result)
    )
    fetch_report_status = False
    try:
        previous_task_status, fetch_report_status = previous_task_result
    except TypeError:
        pass
    if fetch_report_status == TaskProgressReport.CANCELLED or fetch_report_status is None:
        logger.info(
            msg="tasks.py | update_resolver_accessions_task "
            "| error(s) in previous tasks | return={0}".format(previous_task_result)
        )
        mail_admins(
            subject='Failing update caused by error in "tasks.fetch_ena_reports_task"',
            message='Due to an error in "tasks.fetch_ena_reports_task" the execution'
            "of {} was stopped.\nWARNING: Persistent Identifier tables are not "
            "updated properly !".format(self.name),
        )
        return TaskProgressReport.CANCELLED
    success = update_persistent_identifier_report_status()
    logger.info(msg="tasks.py | update_persistent_identifier_report_status_task " "| success={0}".format(success))

    return success

# -*- coding: utf-8 -*-
import logging

from django.core.mail import mail_admins

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.ena import update_resolver_accessions


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_resolver_accessions_task",
)
def update_resolver_accessions_task(self, previous_task_result=False):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(
        msg="tasks.py | update_resolver_accessions_task " "| previous_task_result={0}".format(previous_task_result)
    )
    if previous_task_result == TaskProgressReport.CANCELLED or previous_task_result is None:
        logger.info(
            msg="tasks.py | update_resolver_accessions_task "
            "| error(s) in previous tasks | return={0}".format(previous_task_result)
        )
        mail_admins(
            subject='Failing update caused by error in "tasks.fetch_ena_reports_task"',
            message='Due to an error in "tasks.fetch_ena_reports_task" the execution'
            "of {} was stopped.\nWARNING: Resolver tables are not "
            "updated properly !".format(self.name),
        )
        return TaskProgressReport.CANCELLED, TaskProgressReport.CANCELLED
    success = update_resolver_accessions()
    logger.info(msg="tasks.py | update_resolver_accessions_task " "| success={0}".format(success))

    return success, previous_task_result

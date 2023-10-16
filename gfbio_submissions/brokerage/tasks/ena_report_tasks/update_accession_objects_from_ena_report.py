# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.ena import execute_update_accession_objects_chain

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_accession_objects_from_ena_report_task",
)
def update_accession_objects_from_ena_report_task(self):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(msg="tasks.py | update_accession_objects_from_ena_report_task " "| start update")
    execute_update_accession_objects_chain(name_on_error=self.name)
    logger.info(msg="tasks.py | update_accession_objects_from_ena_report_task " "| finished")
    return True

# -*- coding: utf-8 -*-
from config.celery_app import app
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks import logger
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.ena import execute_update_accession_objects_chain


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_accession_objects_from_ena_report_task",
)
def update_accession_objects_from_ena_report_task(self):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(
        msg="tasks.py | update_accession_objects_from_ena_report_task " "| start update"
    )
    execute_update_accession_objects_chain(name_on_error=self.name)
    logger.info(
        msg="tasks.py | update_accession_objects_from_ena_report_task " "| finished"
    )
    return True

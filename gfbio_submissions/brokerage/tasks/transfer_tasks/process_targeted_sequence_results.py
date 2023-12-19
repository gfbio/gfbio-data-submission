# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.ena_cli import extract_accession_from_webin_report
from ...utils.task_utils import get_submission_and_site_configuration


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.process_targeted_sequence_results_task",
)
def process_targeted_sequence_results_task(
    self,
    previous_result=None,
    submission_id=None,
):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | process_targeted_sequence_results_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED
    if submission is None:
        logger.warning(
            "tasks.py | process_targeted_sequence_results_task | "
            "no valid Submission available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED
    logger.info(
        "tasks.py | process_targeted_sequence_results_task | "
        "extract_accession_from_webin_report | broker_submission_id={}".format(submission.broker_submission_id)
    )
    accession = extract_accession_from_webin_report(submission.broker_submission_id)
    logger.info(
        "tasks.py | process_targeted_sequence_results_task | "
        "extract_accession_from_webin_report | accession={}".format(accession)
    )
    if accession == "-1":
        return TaskProgressReport.CANCELLED
    else:
        study_bo = submission.brokerobject_set.filter(type="study").first()
        if study_bo is None:
            logger.warning(
                "tasks.py | process_targeted_sequence_results_task | "
                "no valid study broker object available | "
                "submission_id={0}".format(submission_id)
            )
            return TaskProgressReport.CANCELLED
        study_pid = study_bo.persistentidentifier_set.create(
            archive="ENA",
            pid_type="TSQ",
            pid=accession,
        )
        return True

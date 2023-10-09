# -*- coding: utf-8 -*-
from config.celery_app import app
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks import logger
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.csv import check_for_molecular_content
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_for_molecular_content_in_submission_task",
)
def check_for_molecular_content_in_submission_task(
    self, previous_task_result=None, submission_id=None
):
    logger.info(
        msg="check_for_molecular_content_in_submission_task. get submission"
            " with pk={}.".format(submission_id)
    )

    # TODO: needs only submission, not both.
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    logger.info(
        msg="check_for_molecular_content_in_submission_task. "
            "process submission={}.".format(submission.broker_submission_id)
    )

    molecular_data_available, messages, check_performed = check_for_molecular_content(
        submission
    )

    logger.info(
        msg="check_for_molecular_content_in_submission_task. "
            "valid molecular data available={0}"
            "".format(molecular_data_available)
    )

    return {
        "molecular_data_available": molecular_data_available,
        "messages": messages,
        "molecular_data_check_performed": check_performed,
    }

import logging

from config.celery_app import app
from gfbio_submissions.brokerage.models.submission_report import SubmissionReport
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.csv import check_for_submittable_data
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration

logger = logging.getLogger(__name__)


@app.task(base=SubmissionTask, bind=True, name="tasks.check_for_submittable_data_task")
def check_for_submittable_data_task(self, previous_task_result=None, submission_id=None):
    logger.info(msg="check_for_submittable_data_task. get submission with pk={}.".format(submission_id))

    submission, _ = get_submission_and_site_configuration(submission_id=submission_id, task=self, include_closed=True)
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    logger.info(msg="check_for_submittable_data_task. process submission={}.".format(submission.broker_submission_id))

    data_is_submittable, messages, check_performed = check_for_submittable_data(submission)

    logger.info(msg="check_for_submittable_data_task. data is submittable={0}".format(data_is_submittable))

    if messages:
        error_str = ""
        for message in messages:
            error_str += message + ", "
        SubmissionReport.objects.create(
            submission=submission,
            report=error_str,
            report_category=SubmissionReport.ERROR,
        )
        submission.status = submission.ERROR
        submission.save()

    return {
        "data_is_submittable": data_is_submittable,
        "messages": messages,
        "submittable_data_check_performed": check_performed,
    }

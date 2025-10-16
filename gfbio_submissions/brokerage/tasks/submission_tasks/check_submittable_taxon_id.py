import logging

from config.celery_app import app
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_report import SubmissionReport
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.csv import check_submittable_taxon_id
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration

logger = logging.getLogger(__name__)


@app.task(base=SubmissionTask, bind=True, name="tasks.check_submittable_taxon_id_task")
def check_submittable_taxon_id_task(self, previous_task_result=None, submission_id=None):
    logger.info(msg="check_submittable_taxon_id_task. get submission with pk={}.".format(submission_id))

    submission, site_config = get_submission_and_site_configuration(submission_id=submission_id, task=self, include_closed=True)
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    logger.info(msg="check_submittable_taxon_id_task. process submission={}.".format(submission.broker_submission_id))

    data_is_submittable, messages, submittable_data_check_performed = check_submittable_taxon_id(submission)

    logger.info(msg="check_submittable_taxon_id_task. data is submittable={0}".format(data_is_submittable))

    if messages:
        error_str = ",".join(messages)
        SubmissionReport.objects.create(
            submission=submission,
            report=error_str,
            report_category=SubmissionReport.ERROR,
        )
        submission.status = Submission.ERROR
        submission.save()
        reference = submission.get_primary_helpdesk_reference()
        
        if site_config.helpdesk_server and reference:
            comment = f"Error occured on checking if the data is submittable to ena: {error_str}"
            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.add_comment(key_or_issue=reference, text=comment, is_internal=True)

    return {
        "data_is_submittable": data_is_submittable,
        "messages": messages,
        "submittable_data_check_performed": submittable_data_check_performed,
    }

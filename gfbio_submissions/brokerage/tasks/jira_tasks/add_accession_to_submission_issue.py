# -*- coding: utf-8 -*-
from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY, ENA, \
    ENA_PANGAEA
from gfbio_submissions.brokerage.exceptions.transfer_exceptions import TransferServerError, TransferClientError
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks import logger
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration, \
    get_jira_comment_template, jira_comment_replace, jira_error_auto_retry
from gfbio_submissions.users.models import User


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.add_accession_to_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def add_accession_to_submission_issue_task(
    self, prev_task_result=None, submission_id=None, target_archive=None
):
    if prev_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | add_accession_to_submission_issue_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED
    # No submission will be returned if submission.status is error
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )

    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    comment = get_jira_comment_template(
        template_name="ACCESSION_COMMENT",
        task_name="add_accession_to_submission_issue_task",
    )
    if not comment:
        return TaskProgressReport.CANCELLED

    # TODO: althouht filter for primary should deliver only on ticket, a dedicated manager method
    #   would be cleaner (no .first() on query set)
    # TODO: result is a list of GFbio helpdesk tickets wich are primary,
    #   tecnically len can only be 1, due to model.save ...
    # existing_tickets = submission.additionalreference_set.filter(
    #     Q(type=GFBIO_HELPDESK_TICKET) & Q(primary=True))
    reference = submission.get_primary_helpdesk_reference()

    submitter_name = "Submitter"
    try:
        user = submission.user
        if len(user.name):
            submitter_name = user.name
    except User.DoesNotExist as e:
        logger.warning(
            "tasks.py | add_accession_to_submission_issue_task | "
            "submission_id={0} | No user with "
            "submission.submiting_user={1} | "
            "{2}".format(submission_id, submission.user, e)
        )
    except ValueError as ve:
        logger.warning(
            "tasks.py | add_accession_to_submission_issue_task | "
            "submission_id={0} | ValueError with "
            "submission.submiting_user={1} | "
            "{2}".format(submission_id, submission.user, ve)
        )

    # TODO: previous task is process_ena_response_task, if ena responded successfully
    #  and delievered accesstions, theses are appended as persistentidentifiers
    #  if all worked Pids shoul be in DB and process returns true
    # TODO: makes sense only for ENA or ENA_PANGAEA targets
    if reference and prev_task_result is True:
        if target_archive == ENA or target_archive == ENA_PANGAEA:
            study_pid = (
                submission.brokerobject_set.filter(type="study")
                .first()
                .persistentidentifier_set.filter(pid_type="PRJ")
                .first()
            )

            comment = jira_comment_replace(
                comment=comment,
                submitter=submitter_name,
                primary_accession=study_pid.pid,
            )
            jira_client = JiraClient(resource=site_configuration.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key, text=comment, is_internal=False
            )
            return jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )

# -*- coding: utf-8 -*-
from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from gfbio_submissions.brokerage.exceptions.transfer_exceptions import TransferServerError, TransferClientError
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks import logger
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration, jira_error_auto_retry, \
    retry_no_ticket_available_exception


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.attach_to_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def attach_to_submission_issue_task(
    self,
    kwargs=None,
    submission_id=None,
    submission_upload_id=None,
):
    logger.info(
        msg="attach_to_submission_issue_task. submission_id={0} | submission_upload_id={1}"
            "".format(submission_id, submission_upload_id)
    )

    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.info(
            msg="attach_to_submission_issue_task no Submission"
                " found. return {2}. | submission_id={0} | submission_upload_id={1}"
                "".format(submission_id, submission_upload_id, TaskProgressReport.CANCELLED)
        )
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    logger.info(msg="attach_to_submission_issue_task | reference={0}".format(reference))

    # TODO: if no ticket available, the reason may that this task is started independened of
    #  submission transfer chain that creates the ticket, so a proper retry has to be
    #  implemented
    if reference:
        submission_upload = (
            submission.submissionupload_set.filter(attach_to_ticket=True)
            .filter(pk=submission_upload_id)
            .first()
        )
        logger.info(
            msg="attach_to_submission_issue_task | submission_upload={0}".format(
                submission_upload
            )
        )
        if submission_upload:
            do_attach = False
            if submission_upload.attachment_id is None:
                do_attach = True
            if submission_upload.modified_recently:
                do_attach = True

            if not do_attach:
                logger.info(
                    msg="attach_to_submission_issue_task | do_attach={0} | return {1}".format(
                        do_attach, TaskProgressReport.CANCELLED
                    )
                )
                return TaskProgressReport.CANCELLED

            # TODO: access media nginx https://stackoverflow.com/questions/8370658/how-to-serve-django-media-files-via-nginx
            jira_client = JiraClient(
                resource=site_configuration.helpdesk_server,
            )
            file_name = None
            if submission_upload.file.name:
                file_name = submission_upload.file.name
            attachment = jira_client.add_attachment(
                key=reference.reference_key,
                file=submission_upload.file,
                file_name=file_name.replace("/", "_"),
            )

            jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )

            submission_upload.attachment_id = attachment.id
            submission_upload.modified_recently = False
            submission_upload.save(ignore_attach_to_ticket=True)

            logger.info(
                msg="attach_to_submission_issue_task | do_attach={0} | return {1}".format(
                    do_attach, True
                )
            )

            return True
        else:
            logger.info(
                msg="attach_to_submission_issue_task no SubmissionUpload"
                    " found. submission_id={0} | submission_upload_id={1}"
                    "".format(submission_id, submission_upload_id)
            )
            return False
    else:
        logger.info(
            msg="attach_to_submission_issue_task no tickets found. "
                "submission_id={0} | submission_upload_id={1}"
                "".format(submission_id, submission_upload_id)
        )

        return retry_no_ticket_available_exception(
            task=self,
            broker_submission_id=submission.broker_submission_id,
            number_of_tickets=1 if reference else 0,
        )

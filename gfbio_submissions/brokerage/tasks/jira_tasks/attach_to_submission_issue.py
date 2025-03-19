# -*- coding: utf-8 -*-
import logging
import os

from django.conf import settings
from dt_upload.views.backend_based_upload_mixins import get_s3_client

from config.celery_app import app
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.jira import JiraClient
from ...utils.task_utils import (
    get_submission_and_site_configuration,
    jira_error_auto_retry,
    retry_no_ticket_available_exception,
)


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
            submission.submissionupload_set.filter(attach_to_ticket=True).filter(pk=submission_upload_id).first()
        )
        logger.info(msg="attach_to_submission_issue_task | submission_upload={0}".format(submission_upload))
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

            logger.info(msg="attach_to_submission_issue_task | do_attach={0} | return {1}".format(do_attach, True))

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


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.attach_cloud_upload_to_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def attach_cloud_upload_to_submission_issue_task(
    self,
    kwargs=None,
    submission_id=None,
    submission_upload_id=None,
):
    logger.info(
        msg=f"{self.name}. submission_id={submission_id} | submission_upload_id={submission_upload_id}"
    )

    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.info(
            msg=f"attach_cloud_upload_to_submission_issue_task no Submission found. return "
                f"{TaskProgressReport.CANCELLED}. | submission_id={submission_id} | "
                f"submission_upload_id={submission_upload_id}"
        )
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    logger.info(msg="attach_to_submission_issue_task | reference={0}".format(reference))

    if reference:

        submission_cloud_upload = submission.submissioncloudupload_set.filter(attach_to_ticket=True).filter(
            meta_data=True).filter(pk=submission_upload_id).first()

        logger.info(msg=f"{self.name} | submission_cloud_upload={submission_cloud_upload}")
        if submission_cloud_upload:
            do_attach = False
            if submission_cloud_upload.attachment_id is None:
                do_attach = True
            if submission_cloud_upload.modified_recently:
                do_attach = True

            if not do_attach:
                logger.info(
                    msg=f"{self.name} | do_attach={do_attach} | return {TaskProgressReport.CANCELLED}"
                )
                return TaskProgressReport.CANCELLED

            jira_client = JiraClient(
                resource=site_configuration.helpdesk_server,
            )
            file_name = None
            if submission_cloud_upload.file_upload is None:
                logger.info(
                    msg=f"{self.name} | no file_upload for submission_cloud_upload | return {TaskProgressReport.CANCELLED}"
                )
                return TaskProgressReport.CANCELLED

            if submission_cloud_upload.file_upload.original_filename:
                file_name = submission_cloud_upload.file_upload.original_filename

            bucket_name, s3_client = get_s3_client()
            local_file = f"local-{submission_cloud_upload.file_upload.file_key}"
            with open(local_file, "wb") as f:
                s3_client.download_fileobj(Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                                           Key=submission_cloud_upload.file_upload.file_key, Fileobj=f)
            with open(local_file, "rb") as f:
                logger.info(
                    msg=f"{self.name} | attach local file {local_file} | downloaded from "
                        f"{settings.AWS_STORAGE_BUCKET_NAME} with key {submission_cloud_upload.file_upload.file_key}"
                )
                attachment = jira_client.add_attachment(
                    key=reference.reference_key,
                    file=f,
                    file_name=file_name.replace("/", "_"),
                )

                jira_error_auto_retry(
                    jira_client=jira_client,
                    task=self,
                    broker_submission_id=submission.broker_submission_id,
                )

            submission_cloud_upload.attachment_id = attachment.id
            submission_cloud_upload.modified_recently = False
            submission_cloud_upload.save()

            logger.info(msg=f"attach_to_submission_issue_task | do_attach={do_attach} | return {True}")
            os.remove(local_file)

            return True
        else:
            logger.info(
                msg=f"attach_to_submission_issue_task no SubmissionUpload found. "
                    f"submission_id={submission_id} | submission_upload_id={submission_upload_id}"
            )
            return False
    else:
        logger.info(
            msg=f"attach_to_submission_issue_task no tickets found. submission_id={submission_id} | "
                f"submission_upload_id={submission_upload_id}"
        )

        return retry_no_ticket_available_exception(
            task=self,
            broker_submission_id=submission.broker_submission_id,
            number_of_tickets=1 if reference else 0,
        )

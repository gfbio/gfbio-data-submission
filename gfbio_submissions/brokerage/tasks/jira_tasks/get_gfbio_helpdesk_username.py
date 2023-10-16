# -*- coding: utf-8 -*-
import logging

from django.utils.encoding import smart_str

from config.celery_app import app
from ...configuration.settings import (
    SUBMISSION_MAX_RETRIES,
    SUBMISSION_RETRY_DELAY,
    JIRA_FALLBACK_USERNAME,
    JIRA_FALLBACK_EMAIL,
)
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.gfbio import get_gfbio_helpdesk_username
from ...utils.task_utils import (
    get_submission_and_site_configuration,
    raise_transfer_server_exceptions,
)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.get_gfbio_helpdesk_username_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def get_gfbio_helpdesk_username_task(self, prev_task_result=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.info("tasks.py | get_gfbio_helpdesk_username_task | return TaskProgressReport.CANCELLED")
        return TaskProgressReport.CANCELLED

    user_name = JIRA_FALLBACK_USERNAME
    user_email = JIRA_FALLBACK_EMAIL
    user_full_name = ""
    result = {
        "jira_user_name": user_name,
        "email": user_email,
        "full_name": user_full_name,
    }
    goe_id = submission.user.externaluserid_set.filter(provider="goe_id").first()
    user_name = goe_id.external_id if goe_id else submission.user.username
    user_email = submission.user.email
    user_full_name = submission.user.name
    result["email"] = user_email if len(user_email) else JIRA_FALLBACK_EMAIL
    result["full_name"] = user_full_name

    response = get_gfbio_helpdesk_username(user_name=user_name, email=user_email, fullname=user_full_name)
    logger.info(
        "tasks.py | get_gfbio_helpdesk_username_task | response status={0} | content={1}".format(
            response.status_code, response.content
        )
    )

    raise_transfer_server_exceptions(
        response=response,
        task=self,
        broker_submission_id=submission.broker_submission_id,
        max_retries=SUBMISSION_MAX_RETRIES,
    )

    if response.status_code == 200:
        result["jira_user_name"] = smart_str(response.content)

    logger.info("tasks.py | get_gfbio_helpdesk_username_task |return={0}".format(result))
    return result

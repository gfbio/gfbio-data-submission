# -*- coding: utf-8 -*-
import logging

from billiard.exceptions import SoftTimeLimitExceeded
from django.utils.encoding import smart_str
from requests import Response, ConnectionError

from config.celery_app import app
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.auditable_text_data import AuditableTextData
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.ena import send_submission_to_ena
from ...utils.task_utils import (
    get_submission_and_site_configuration,
    raise_transfer_server_exceptions,
)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.transfer_data_to_ena_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def transfer_data_to_ena_task(self, prepare_result=None, submission_id=None, action="ADD"):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    ena_submission_data = AuditableTextData.objects.assemble_ena_submission_data(submission=submission)
    if ena_submission_data == {}:
        return TaskProgressReport.CANCELLED
    try:
        response, request_id = send_submission_to_ena(
            submission, site_configuration.ena_server, ena_submission_data, action
        )
        res = raise_transfer_server_exceptions(
            response=response,
            task=self,
            broker_submission_id=submission.broker_submission_id,
            max_retries=SUBMISSION_MAX_RETRIES,
        )
    except SoftTimeLimitExceeded as se:
        logger.error(
            "tasks.py | transfer_data_to_ena_task | "
            "SoftTimeLimitExceeded | "
            "submission_id={0} | error={1}".format(submission_id, se)
        )
        response = Response()
    except ConnectionError as e:
        logger.error(
            msg="tasks.py | transfer_data_to_ena_task | connection_error "
            "{}.url={} title={}".format(
                e,
                site_configuration.ena_server.url,
                site_configuration.ena_server.title,
            )
        )
        response = Response()
    return str(request_id), response.status_code, smart_str(response.content)

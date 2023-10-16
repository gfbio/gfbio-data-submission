# -*- coding: utf-8 -*-
import logging

from django.utils.encoding import smart_str
from requests import ConnectionError, Response

from config.celery_app import app
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.broker_object import BrokerObject
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.ena import register_study_at_ena
from ...utils.task_utils import (
    get_submission_and_site_configuration,
    raise_transfer_server_exceptions,
)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.register_study_at_ena_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def register_study_at_ena_task(
    self,
    previous_result=None,
    submission_id=None,
):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )

    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | register_study_at_ena_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED
    if submission is None:
        logger.warning(
            "tasks.py | register_study_at_ena_task | "
            "no valid Submission available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    primary_accession = BrokerObject.objects.get_study_primary_accession_number(submission)
    if primary_accession is not None:
        logger.info(
            "tasks.py | register_study_at_ena_task | "
            " persistent_identifier={0} found | return pk={1}".format(primary_accession, primary_accession.pk)
        )
        return TaskProgressReport.CANCELLED

    study_text_data = submission.auditabletextdata_set.filter(name="study.xml").first()
    study_broker_object = submission.brokerobject_set.filter(type="study").first()

    if study_text_data is None:
        logger.info(
            "tasks.py | register_study_at_ena_task | no study textdata found | submission_id={0}".format(
                submission.broker_submission_id
            )
        )
        return TaskProgressReport.CANCELLED
    elif study_broker_object is None:
        logger.info(
            "tasks.py | register_study_at_ena_task | no study brokerobject found | submission_id={0}".format(
                submission.broker_submission_id
            )
        )
        return TaskProgressReport.CANCELLED
    else:
        try:
            response, request_id = register_study_at_ena(submission=submission, study_text_data=study_text_data)
            logger.info(
                "tasks.py | register_study_at_ena_task | "
                "register_study_at_ena executed | submission_id={0} "
                "| response status_code={1}".format(submission.broker_submission_id, response.status_code)
            )
            res = raise_transfer_server_exceptions(
                response=response,
                task=self,
                broker_submission_id=submission.broker_submission_id,
                max_retries=SUBMISSION_MAX_RETRIES,
            )
        except ConnectionError as e:
            logger.error(
                msg="connection_error {}.url={} title={}".format(
                    e,
                    site_configuration.ena_server.url,
                    site_configuration.ena_server.title,
                )
            )
            response = Response()
        # TODO: followed by process_ena_response_task like in general submission process for ENA
        return str(request_id), response.status_code, smart_str(response.content)

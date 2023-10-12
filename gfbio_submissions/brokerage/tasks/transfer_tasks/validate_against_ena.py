# -*- coding: utf-8 -*-
from config.celery_app import app
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...tasks.submission_task import SubmissionTask
from ...utils.task_utils import send_data_to_ena_for_validation_or_test


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.validate_against_ena_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def validate_against_ena_task(self, submission_id=None, action="VALIDATE"):
    results = send_data_to_ena_for_validation_or_test(self, submission_id, action)
    return results

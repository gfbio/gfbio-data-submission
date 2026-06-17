# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...exceptions.transfer_exceptions import InvalidCenterName
from ...tasks.submission_task import SubmissionTask
from ...utils.center_name import resolve_and_validate_center_name
from ...utils.ena import _fail_submission_safely
from ...utils.ena_cli import store_manifest_to_filesystem, submit_targeted_sequences
from ...utils.task_utils import get_submission_and_site_configuration


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.submit_targeted_sequences_to_ena_task",
)
def submit_targeted_sequences_to_ena_task(
    self, previous_result=None, submission_id=None, do_test=True, do_validate=True
):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | submit_targeted_sequences_to_ena_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED
    if submission is None or site_configuration is None:
        logger.warning(
            "tasks.py | submit_targeted_sequences_to_ena_task | "
            "no valid Submission available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    logger.info(
        "tasks.py | submit_targeted_sequences_to_ena_task | "
        "store_manifest_to_filesystem | submission={}".format(submission.broker_submission_id)
    )
    store_manifest_to_filesystem(submission)
    # DASS-3574: resolve the curated centre before invoking webin-cli so an
    # empty/None centre fails the submission (terminal-safe) and aborts the
    # task — the value can never reach ENA via the -centername arg.
    try:
        center_name = resolve_and_validate_center_name(submission)
    except InvalidCenterName as ex:
        logger.warning(
            "tasks.py | submit_targeted_sequences_to_ena_task | "
            "invalid center_name, aborting before webin-cli | "
            "submission_id={0} | error={1}".format(submission_id, ex)
        )
        _fail_submission_safely(submission, str(ex))
        return TaskProgressReport.CANCELLED
    logger.info(
        "tasks.py | submit_targeted_sequences_to_ena_task | "
        "submit_targeted_sequences| submission={}".format(submission.broker_submission_id)
    )
    success = submit_targeted_sequences(
        username=site_configuration.ena_server.username,
        password=site_configuration.ena_server.password,
        submission=submission,
        center_name=center_name,
        test=do_test,
        validate=do_validate,
    )
    logger.info(
        "tasks.py | submit_targeted_sequences_to_ena_task | "
        "done | return success={0} | submission={1}".format(success, submission.broker_submission_id)
    )
    return success

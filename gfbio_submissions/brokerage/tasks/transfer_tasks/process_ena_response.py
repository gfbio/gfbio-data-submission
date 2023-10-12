# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...models.broker_object import BrokerObject
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.ena import parse_ena_submission_response
from ...utils.task_utils import get_submission_and_site_configuration
from gfbio_submissions.generic.models import RequestLog


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.process_ena_response_task",
)
def process_ena_response_task(
    self, transfer_result=None, submission_id=None, close_submission_on_success=True
):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if (
        transfer_result == TaskProgressReport.CANCELLED
        or submission == TaskProgressReport.CANCELLED
    ):
        logger.warning(
            "tasks.py | process_ena_response_task | "
            "transfer_result or submission unavailable | "
            "submission_id={0} | submission={1} | transfer_result={2} | "
            "return={3}".format(
                submission_id,
                submission,
                transfer_result,
                TaskProgressReport.CANCELLED,
            )
        )
        return TaskProgressReport.CANCELLED

    try:
        request_id, response_status_code, response_content = transfer_result
    except TypeError as te:
        logger.warning(
            "tasks.py | process_ena_response_task | "
            "type error parsing transfer_result of previous task | "
            "submission_id={0} | Error={1} | transfer_result={2}".format(
                submission_id, te, transfer_result
            )
        )
        return TaskProgressReport.CANCELLED

    parsed = parse_ena_submission_response(response_content)
    success = True if parsed.get("success", False) == "true" else False
    if success:
        BrokerObject.objects.append_pids_from_ena_response(parsed)
        if close_submission_on_success:
            submission.status = Submission.CLOSED
        submission.save()
        return True
    else:
        submission.status = Submission.ERROR
        outgoing_request = RequestLog.objects.get(request_id=request_id)
        outgoing_request.request_details["parsed_ena_response"] = parsed
        outgoing_request.save()
        submission.save()
        logger.info(
            msg="process_ena_response_task. ena reported error(s) "
            "for submisison={}. refer to RequestLog={}".format(
                submission.broker_submission_id, outgoing_request.request_id
            )
        )
        return TaskProgressReport.CANCELLED

# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...configuration.settings import ATAX
from ...models import SubmissionReport
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.schema_validation import validate_atax_data
from ...utils.task_utils import get_submission

logger = logging.getLogger(__name__)


# TODO: remove and replace with proper merge if needed, this here is just to establish the overall workflow
def get_merged_text_data(submission):
    merged_xml = "<?xml version=\"1.0\" ?>\n<Merged>"
    for data in submission.auditabletextdata_set.all():
        merged_xml += "{0}".format(data.text_data.replace('<?xml version="1.0" ?>', '').replace('\n', ''))
    merged_xml += "</Merged>"
    return merged_xml


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.validate_merged_atax_data_task",
)
def validate_merged_atax_data_task(self,
                                   previous_result=None,
                                   submission_id=None):
    logger.info(
        "validate_merged_atax_data.py | validate_merged_atax_data_task | submission_id={}".format(submission_id))

    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "validate_merged_atax_data.py | validate_merged_atax_data_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED

    submission = get_submission(submission_id=submission_id, task=self, include_closed=True)

    if not submission.release or submission.target != ATAX:
        logger.warning(
            "validate_merged_atax_data.py | validate_merged_atax_data_task | "
            "trying to parse files of unreleased submission OR wrong target | release={0} | target={1}"
            "submission_id={2}".format(submission.release, submission.target, submission.id)
        )
        return TaskProgressReport.CANCELLED

    merged_xml = get_merged_text_data(submission)

    valid, errors = validate_atax_data(
        schema_file_name="ABCD_2.06.XSD",
        xml_string=merged_xml,
    )
    if len(errors):
        for error in errors:
            SubmissionReport.objects.create(
                submission=submission,
                report_category=SubmissionReport.ERROR,
                report='{} {}'.format(error.message, error.reason),
            )
    return valid, errors

# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.ena import (
    prepare_study_data_only,
    store_single_data_item_as_auditable_text_data,
)
from ...utils.task_utils import get_submission_and_site_configuration

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.prepare_ena_study_xml_task",
)
def prepare_ena_study_xml_task(self, previous_task_result=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    # TODO: refactor to general method for all tasks where applicable
    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | prepare_ena_study_xml_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED
    if submission == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | prepare_ena_study_xml_task | "
            " do nothing because submission={0}".format(TaskProgressReport.CANCELLED)
        )
        return TaskProgressReport.CANCELLED

    if len(submission.auditabletextdata_set.filter(name="study.xml")):
        study_pk = submission.auditabletextdata_set.filter(name="study.xml").first().pk
        logger.info(
            "tasks.py | prepare_ena_study_xml_task | "
            " auditable textdata with name study.xml found | return pk={0}".format(study_pk)
        )
        # TODO: for now return XMLs primary key
        return study_pk
    elif not len(submission.brokerobject_set.filter(type="study")):
        logger.warning(
            "tasks.py | prepare_ena_study_xml_task | "
            " do nothing because submission={0} has no broker object "
            "of type study".format(TaskProgressReport.CANCELLED)
        )
        return TaskProgressReport.CANCELLED
    else:
        study_data = prepare_study_data_only(submission=submission)
        study_text_data = store_single_data_item_as_auditable_text_data(submission=submission, data=study_data)
        logger.info(
            "tasks.py | prepare_ena_study_xml_task | "
            " created auditable textdata with name study.xml | return pk={0}".format(
                study_text_data.pk if study_text_data is not None else "invalid"
            )
        )
        return TaskProgressReport.CANCELLED if study_text_data is None else study_text_data.pk

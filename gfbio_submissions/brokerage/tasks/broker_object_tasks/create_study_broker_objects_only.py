# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...models.broker_object import BrokerObject
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.task_utils import get_submission_and_site_configuration

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.create_study_broker_objects_only_task",
)
def create_study_broker_objects_only_task(
    self, previous_task_result=None, submission_id=None
):
    # TODO: refactor to general method for all tasks where applicable
    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | create_study_broker_objects_only_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | create_study_broker_objects_only_task | "
            " do nothing because submission={0}".format(TaskProgressReport.CANCELLED)
        )
        return TaskProgressReport.CANCELLED
    if len(submission.brokerobject_set.filter(type="study")):
        study_pk = submission.brokerobject_set.filter(type="study").first().pk
        logger.info(
            "tasks.py | create_study_broker_objects_only_task | "
            " broker object of type study found | return pk={0}".format(study_pk)
        )
        # TODO: for now return study BOs primary key
        return study_pk
    else:
        study = BrokerObject.objects.add_study_only(submission=submission)
        logger.info(
            "tasks.py | create_study_broker_objects_only_task | "
            " created broker object of type study | return pk={0}".format(study.pk)
        )
        return study.pk

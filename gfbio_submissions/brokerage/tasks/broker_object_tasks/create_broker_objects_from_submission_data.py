# -*- coding: utf-8 -*-
import logging

from django.db import transaction, IntegrityError

from config.celery_app import app
from ...models.broker_object import BrokerObject
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.task_utils import (
    get_submitted_submission_and_site_configuration,
    get_submission_and_site_configuration,
)

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.create_broker_objects_from_submission_data_task",
)
def create_broker_objects_from_submission_data_task(
    self, previous_task_result=None, submission_id=None, use_submitted_submissions=False
):
    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | create_broker_objects_from_submission_data_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED

    submission, site_configuration = (
        get_submitted_submission_and_site_configuration(submission_id=submission_id, task=self)
        if use_submitted_submissions
        else get_submission_and_site_configuration(submission_id=submission_id, task=self, include_closed=True)
    )
    logger.info(
        "tasks.py | create_broker_objects_from_submission_data_task | "
        "submission={0} | site_configuration={1}".format(submission, site_configuration)
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | create_broker_objects_from_submission_data_task | "
            " do nothing because submission={0}".format(TaskProgressReport.CANCELLED)
        )
        return TaskProgressReport.CANCELLED

    try:
        logger.info(
            "tasks.py | create_broker_objects_from_submission_data_task "
            "| try delete broker objects and create new ones "
            "from submission data"
        )
        with transaction.atomic():
            submission.brokerobject_set.all().delete()
            BrokerObject.objects.add_submission_data(submission)
            return True
    except IntegrityError as e:
        logger.error(
            'create_broker_objects_from_submission_data_task IntegrityError in "create_broker_objects_from'
            '_submission_data_task": {}'.format(e)
        )

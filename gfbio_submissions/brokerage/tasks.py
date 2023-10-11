# -*- coding: utf-8 -*-
import logging

from django.db import transaction

from config.celery_app import app
from .models.task_progress_report import TaskProgressReport
from .tasks.submission_task import SubmissionTask
from .utils.ena import (
    prepare_ena_data,
    store_ena_data_as_auditable_text_data,
)
from .utils.task_utils import (
    get_submission_and_site_configuration,
)

logger = logging.getLogger(__name__)


# common tasks -----------------------------------------------------------------


# TODO: re-consider if needed when workflow is clear




# TODO: on_hold check is in this form obsolete, if target is ENA etc
#   submission to ena is triggered without prior creation of BOs and XML


# NEW PREP WORKFLOW BO CREATION AND SOID CREATION ------------------------------


# ENA submission transfer tasks ------------------------------------------------


# Pangea submission transfer tasks ---------------------------------------------


# HELPDESK TASKS --------------------------------------------------------------


# FIXME: here problems while using new jirclient to attach, especiall while put submissionupload


# TODO: add tests ...


# FIXME: It is possible to set a submission for the taskprogressreport here.


# @app.task(
#     base=SubmissionTask,
#     bind=True,
#     name="tasks.prepare_ena_submission_data_task",
# )
# def prepare_ena_submission_data_task(self, prev_task_result=None, submission_id=None):
#     submission, site_configuration = get_submission_and_site_configuration(
#         submission_id=submission_id, task=self, include_closed=True
#     )
#     if submission == TaskProgressReport.CANCELLED:
#         return TaskProgressReport.CANCELLED
#
#     if len(submission.brokerobject_set.all()) > 0:
#         with transaction.atomic():
#             submission.auditabletextdata_set.all().delete()
#         ena_submission_data = prepare_ena_data(submission=submission)
#         store_ena_data_as_auditable_text_data(
#             submission=submission, data=ena_submission_data
#         )
#         # TODO: this will become obsolete once, data is taken from AuditableTextData ....
#         return ena_submission_data
#     else:
#         logger.info(
#             msg="prepare_ena_submission_data_task. no brokerobjects. "
#                 "return={0} "
#                 "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
#         )
#         return TaskProgressReport.CANCELLED

# -*- coding: utf-8 -*-
import logging

from django.db import transaction

from config.celery_app import app
from ...models.auditable_text_data import AuditableTextData
from ...models.submission_upload import SubmissionUpload
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.ena import prepare_ena_data

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_ena_submission_data_task",
)
def update_ena_submission_data_task(
    self, previous_task_result=None, submission_upload_id=None
):
    # TODO: here it would be possible to get the related submission for the TaskReport
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    submission_upload = SubmissionUpload.objects.get_linked_molecular_submission_upload(
        submission_upload_id
    )

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | update_ena_submission_data_task | "
            "previous task reported={0} | "
            "submission_upload_id={1}".format(
                TaskProgressReport.CANCELLED, submission_upload_id
            )
        )
        return TaskProgressReport.CANCELLED

    if submission_upload is None:
        logger.error(
            "tasks.py | update_ena_submission_data_task | "
            "no valid SubmissionUpload available | "
            "submission_upload_id={0}".format(submission_upload_id)
        )
        return TaskProgressReport.CANCELLED

    ena_submission_data = prepare_ena_data(submission=submission_upload.submission)

    logger.info(
        "tasks.py | update_ena_submission_data_task | "
        "update AuditableTextData related to submission={0} "
        "".format(submission_upload.submission.broker_submission_id)
    )
    with transaction.atomic():
        for d in ena_submission_data:
            filename, filecontent = ena_submission_data[d]
            logger.info(
                "tasks.py | update_ena_submission_data_task | "
                "iterate ena_submission_data to update_or_create AuditableTextData | filename={0} len filecontent={1}".format(
                    filename, len(filecontent)
                )
            )
            # TODO: while fixing DASS-1107: I decided to opt for try and catch plus log message. But a general change of
            #   the workflow is suggested, e.g. delete the respective (or all) textdata and create a new one
            try:
                (
                    obj,
                    created,
                ) = submission_upload.submission.auditabletextdata_set.update_or_create(
                    name=filename, defaults={"text_data": filecontent}
                )
            except AuditableTextData.MultipleObjectsReturned as ex:
                logger.warning(
                    "tasks.py | update_ena_submission_data_task | "
                    "AuditableTextData returned more than one object while update_or_create | filename={0} | {1}".format(
                        filename, ex
                    )
                )
                return TaskProgressReport.CANCELLED
        return True

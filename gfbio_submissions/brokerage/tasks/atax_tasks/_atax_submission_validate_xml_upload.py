# -*- coding: utf-8 -*-
import logging

from kombu.utils import json

from config.celery_app import app
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.atax_submission_validate_xml_upload_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def atax_submission_validate_xml_upload_task(
    self,
    previous_task_result=None,
    submission_id=None,
    submission_upload_id=None,
    is_combination=False,
):
    report, created = TaskProgressReport.objects.create_initial_report(submission=None, task=self)

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | atax_submission_validate_xml_upload_task | "
            "previous task reported={0} | "
            "submission_upload_id={1}".format(TaskProgressReport.CANCELLED, submission_upload_id)
        )
        return TaskProgressReport.CANCELLED

    if submission_upload_id:
        submission_upload = SubmissionUpload.objects.get_linked_atax_submission_upload(submission_upload_id)

    # FIXME: logic ?
    if submission_upload is None and is_combination == False:
        logger.error(
            "tasks.py | atax_submission_validate_xml_upload_task | "
            "no valid SubmissionUpload available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission
    report.save()

    if not is_combination:
        # simple upload file name:
        upload_name = submission_upload.file.name.split("/")[-1:][0]

        # get the stored xml string back from auditabletextdata:
        text_to_validate = ""
        if len(submission_upload.submission.auditabletextdata_set.filter(atax_file_name=upload_name)):
            upload_by_file__name = submission_upload.submission.auditabletextdata_set.filter(
                atax_file_name=upload_name
            ).first()
    elif is_combination:
        upload_by_file__name = submission_upload.submission.auditabletextdata_set.filter(name="combination").first()

    if upload_by_file__name is not None:
        text_to_validate = upload_by_file__name.text_data

        is_val, errors = validate_atax_data_is_valid(
            submission=submission_upload.submission,
            schema_file="ABCD_2.06.XSD",
            xml_string=text_to_validate,  # string_abcd_xml_converted
        )
        # if abcd xml not valid:
        if errors:
            messages = [e.message for e in errors]
            submission_upload.submission.data.update({"validation": messages})
            report.task_exception_info = json.dumps({"validation": messages})

            report.save()
            submission_upload.submission.status = Submission.ERROR
            submission_upload.submission.save()
            return TaskProgressReport.CANCELLED

        else:
            submission_upload.submission.save()

            # update field atax_xml_valid:
            if upload_by_file__name is not None:
                upload_by_file__name.atax_xml_valid = True
                upload_by_file__name.save()

            return {"is_valid": upload_by_file__name.atax_xml_valid}  # text_to_validate

    else:
        return True

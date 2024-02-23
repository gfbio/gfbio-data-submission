# -*- coding: utf-8 -*-
import logging
import math as m
import os

from config.celery_app import app
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.atax import (
    analyze_filename_and_type,
    parse_taxonomic_csv_specimen,
    parse_taxonomic_csv_measurement,
    parse_taxonomic_csv_multimedia,
)
from ...utils.csv_atax import store_atax_data_as_auditable_text_data

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.atax_submission_parse_csv_upload_to_xml_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def atax_submission_parse_csv_upload_to_xml_task(
    self, previous_task_result=None, submission_id=None, submission_upload_id=None
):
    request_file_keys = ["specimen", "measurement", "multimedia", "combination"]

    logger.info("tasks.py | atax_submission_parse_csv_upload_to_xml_task | submission_id={}".format(submission_id))

    report, created = TaskProgressReport.objects.create_initial_report(submission=None, task=self)

    # is this necessary here?
    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | atax_submission_parse_csv_upload_to_xml_task | "
            "previous task reported={0} | "
            "submission_id={1} |"
            "submission_upload_id={2}".format(TaskProgressReport.CANCELLED, submission_id, submission_upload_id)
        )
        return TaskProgressReport.CANCELLED

    # submission_upload = submission.submissionupload_set.filter(pk=submission_upload_id).filter(submission.target=ATAX)  # .first()
    if submission_upload_id:
        submission_upload = SubmissionUpload.objects.get_linked_atax_submission_upload(submission_upload_id)

    if submission_upload is None:
        logger.error(
            "tasks.py | atax_submission_parse_csv_upload_to_xml_task | "
            "no valid SubmissionUpload for submission.target ATAX available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    else:
        # determine the mimetype, later in an extra task?:
        import mimetypes

        errors = []
        file_mime = mimetypes.guess_type(submission_upload.file.path)
        the_mimes = ("text/csv",)  # expand this by excel later on

        if not file_mime[0] in the_mimes:
            logger.warning(
                "tasks.py | atax_submission_parse_csv_upload_to_xml | "
                'SubmissionUpload file"{0}" is not in csv format| '
                "submission_id={1}".format(submission_upload.file.path, submission_id)
            )
            return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission
    report.save()

    # xml_data_as_string = ''
    # ind = -1
    # differentiate between specimen and measurement and multimedia and combination csv file:
    file_key = analyze_filename_and_type(os.path.basename(submission_upload.file.path), submission_upload.meta_data)
    if file_key in request_file_keys:
        match str(file_key):
            case "specimen":
                # create xml data as string:
                with open(submission_upload.file.path, "r", encoding="utf-8-sig") as data_file:
                    xml_data_as_string = parse_taxonomic_csv_specimen(submission_upload.submission, data_file)
                atax_xml_file_type = file_key
                ind = 0
            case "measurement":
                with open(submission_upload.file.path, "r", encoding="utf-8-sig") as data_file:
                    xml_data_as_string = parse_taxonomic_csv_measurement(submission_upload.submission, data_file)
                atax_xml_file_type = file_key
                ind = 1
            case "multimedia":
                with open(submission_upload.file.path, "r", encoding="utf-8-sig") as data_file:
                    xml_data_as_string = parse_taxonomic_csv_multimedia(submission_upload.submission, data_file)
                atax_xml_file_type = file_key
                ind = 2
            case _:
                logger.warning(
                    "tasks.py | atax_submission_parse_csv_upload_to_xml | "
                    'SubmissionUpload file"{0}" has no expected basename | '
                    "submission_id={1}".format(submission_upload.file.path, submission_id)
                )
                return TaskProgressReport.CANCELLED

        # store xml data informations in auditabletextdata:
        if xml_data_as_string and len(xml_data_as_string) > 0:
            store_atax_data_as_auditable_text_data(
                submission=submission_upload.submission,
                data_type=atax_xml_file_type,
                data=xml_data_as_string,
                comment="ABCD xml structure",
                atax_file_name=os.path.basename(submission_upload.file.path),
                atax_exp_index=ind,
            )
            # store specimen additionally as combination
            if atax_xml_file_type == request_file_keys[0]:
                store_atax_data_as_auditable_text_data(
                    submission=submission_upload.submission,
                    data_type=request_file_keys[3],
                    data=xml_data_as_string,
                    comment="ABCD xml structure",
                    atax_file_name=os.path.basename(submission_upload.file.path),
                    atax_exp_index=m.pow(2, ind),
                )

            return {"file_key": file_key}  # xml_data_as_string

        else:
            # no success while csv to xml  transformation:
            # is ERROR status correct here?
            submission_upload.submission.status = Submission.ERROR
            submission_upload.submission.save()

            logger.info(
                msg="atax_submission_parse_csv_upload_to_xml_task. no transformed xml upload data.  | "
                " for {0},  return={1}  | "
                "submission_id={2}".format(str(file_key), TaskProgressReport.CANCELLED, submission_id)
            )
            return TaskProgressReport.CANCELLED

    return True

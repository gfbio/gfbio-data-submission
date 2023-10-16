# -*- coding: utf-8 -*-
import logging
import math as m

from config.celery_app import app
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.auditable_text_data import AuditableTextData
from ...models.submission_upload import SubmissionUpload
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.atax import (
    update_specimen_with_measurements_abcd_xml,
    update_specimen_with_multimedia_abcd_xml,
)
from ...utils.csv_atax import store_atax_data_as_auditable_text_data

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.atax_submission_combine_xmls_to_one_structure_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def atax_submission_combine_xmls_to_one_structure_task(
    self, previous_task_result=None, submission_id=None, submission_upload_id=None
):
    report, created = TaskProgressReport.objects.create_initial_report(submission=None, task=self)

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | atax_submission_combine_xmls_to_one_structure_task | "
            "previous task reported={0} | "
            "submission_upload_id={1}".format(TaskProgressReport.CANCELLED, submission_upload_id)
        )
        return TaskProgressReport.CANCELLED

    if submission_upload_id:
        submission_upload = SubmissionUpload.objects.get_linked_atax_submission_upload(submission_upload_id)

    if submission_upload is None:
        logger.error(
            "tasks.py | atax_submission_combine_xmls_to_one_structure_task | "
            "no valid SubmissionUpload available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission
    report.save()

    upload_name = submission_upload.file.name.split("/")[-1:][0]

    text_to_validate = ""
    # each upload belongs to exactly one category (file names different):
    # current upload:
    if len(submission_upload.submission.auditabletextdata_set.filter(atax_file_name=upload_name)):
        upload_by_file_name = submission_upload.submission.auditabletextdata_set.filter(
            atax_file_name=upload_name
        ).first()
        if upload_by_file_name is None:
            logger.info(
                "tasks.py | atax_auditable_task | no  textdata found | submission_id={0}".format(
                    submission_upload.submission.broker_submission_id
                )
            )
            return None

        specimen_abcd_updated = str()
        combi_name = str()
        combi_updated = False
        keys_found = []  # UnitIds of measurements or multimedias, found in specimen or combination for later tests!

        # all uploads for submission:
        atax_submission_upload = AuditableTextData.objects.assemble_atax_submission_uploads(
            submission=submission_upload.submission
        )
        if atax_submission_upload == {}:
            return TaskProgressReport.CANCELLED
        elif len(atax_submission_upload) <= 1:
            return {"upload length at all": str(len(atax_submission_upload))}
        else:
            #  integrate measurements /multimedia into specimen.xml:
            if len(atax_submission_upload) > 1 and "COMBINATION" in atax_submission_upload.keys():
                combi_name = "combination"
                tuple = atax_submission_upload["COMBINATION"]
                ind = tuple[5]
                add_int = 0
            # distinguish whether combination is already present or not:
            # put result into combination:
            if upload_by_file_name.name == "measurement" and bool(combi_name):
                (
                    specimen_abcd_updated,
                    keys_found,
                ) = update_specimen_with_measurements_abcd_xml(upload=atax_submission_upload, name=combi_name)
                add_ind = 1
            elif upload_by_file_name.name == "multimedia" and bool(combi_name):
                (
                    specimen_abcd_updated,
                    keys_found,
                ) = update_specimen_with_multimedia_abcd_xml(upload=atax_submission_upload, name=combi_name)
                add_ind = 2
            elif upload_by_file_name.name == "specimen":
                # are there measurement data from earlier?
                if len(submission_upload.submission.auditabletextdata_set.filter(name="measurement")):
                    auditable_xml = submission_upload.submission.auditabletextdata_set.filter(
                        name="measurement"
                    ).first()
                    if auditable_xml is not None:
                        (
                            specimen_abcd_updated,
                            keys_found_ms,
                        ) = update_specimen_with_measurements_abcd_xml(
                            upload=atax_submission_upload, name="combination"
                        )
                        # store specimen plus measurements as combination:
                        if specimen_abcd_updated is not None and len(specimen_abcd_updated) > 0:
                            store_atax_data_as_auditable_text_data(
                                submission=submission_upload.submission,
                                data_type="combination",
                                data=specimen_abcd_updated,
                                comment="ABCD xml structure",
                                atax_file_name="ABCD specimen with integrated metadata",
                                atax_exp_index=int(ind) + int(m.pow(2, 1)),
                            )
                            combi_updated = True

                # are there multimedia data?
                # refresh auditables
                atax_submission_upload = AuditableTextData.objects.assemble_atax_submission_uploads(
                    submission=submission_upload.submission
                )
                if len(atax_submission_upload) > 1 and "COMBINATION" in atax_submission_upload.keys():
                    combi_name = "combination"
                    tuple = atax_submission_upload["COMBINATION"]
                    ind = tuple[5]

                if len(submission_upload.submission.auditabletextdata_set.filter(name="multimedia")):
                    auditable_xml = submission_upload.submission.auditabletextdata_set.filter(
                        name="multimedia"
                    ).first()
                    if auditable_xml is not None:
                        (
                            specimen_abcd_updated,
                            keys_found_m,
                        ) = update_specimen_with_multimedia_abcd_xml(
                            upload=atax_submission_upload, name=combi_name
                        )  #
                        if specimen_abcd_updated is not None and len(specimen_abcd_updated) > 0:
                            store_atax_data_as_auditable_text_data(
                                submission=submission_upload.submission,
                                data_type="combination",
                                data=specimen_abcd_updated,
                                comment="ABCD xml structure",
                                atax_file_name="ABCD specimen with integrated meta data",
                                atax_exp_index=int(ind) + int(m.pow(2, 2)),
                            )
                            combi_updated = True

            if combi_updated == False:
                if specimen_abcd_updated is not None and len(specimen_abcd_updated) > 0:
                    store_atax_data_as_auditable_text_data(
                        submission=submission_upload.submission,
                        data_type="combination",
                        data=specimen_abcd_updated,
                        comment="ABCD xml structure",
                        atax_file_name="ABCD specimen with integrated meta data",
                        atax_exp_index=int(ind) + int(m.pow(2, int(add_ind))),
                    )
                    combi_updated = True

            submission_upload.submission.save()
            return {"combi_updated": combi_updated}

        return True

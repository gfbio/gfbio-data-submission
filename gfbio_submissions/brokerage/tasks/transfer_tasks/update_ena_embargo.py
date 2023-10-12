# -*- coding: utf-8 -*-
import datetime
import logging
import textwrap

from django.core.mail import mail_admins
from pytz import timezone

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.task_utils import get_submission_and_site_configuration
from gfbio_submissions.generic.utils import logged_requests


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_ena_embargo_task",
)
def update_ena_embargo_task(self, prev=None, submission_id=None):
    logger.info(
        "tasks.py | update_ena_embargo_task | submission_id={0}".format(submission_id)
    )

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        mail_admins(
            subject="update_ena_embargo_task failed",
            message="Failed to get submission and site_config for the task.\n"
            "Submission_id: {0}".format(submission_id),
        )
        return TaskProgressReport.CANCELLED

    study_primary_accession = submission.brokerobject_set.filter(type="study").first()
    if study_primary_accession:
        study_primary_accession = (
            study_primary_accession.persistentidentifier_set.filter(
                pid_type="PRJ"
            ).first()
        )

    if site_config is None or not site_config.ena_server:
        logger.warning(
            "ena.py | update_ena_embargo_task | no site_configuration found | submission_id={0}".format(
                submission.broker_submission_id
            )
        )
        return "no site_configuration"

    if study_primary_accession:
        logger.info(
            "ena.py | update_ena_embargo_task | primary accession "
            "found for study | accession_no={0} | submission_id={1}".format(
                study_primary_accession, submission.broker_submission_id
            )
        )

        current_datetime = datetime.datetime.now(timezone("UTC")).isoformat()
        submission_xml = textwrap.dedent(
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<SUBMISSION_SET xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
            ' xsi:noNamespaceSchemaLocation="ftp://ftp.sra.ebi.ac.uk/meta/xsd/sra_1_5/SRA.submission.xsd">'
            "<SUBMISSION"
            ' alias="gfbio:hold:{broker_submission_id}:{time_stamp}"'
            ' center_name="GFBIO" broker_name="GFBIO">'
            "<ACTIONS>"
            "<ACTION>"
            '<HOLD target="{accession_no}" HoldUntilDate="{hold_date}"/>'
            "</ACTION>"
            "</ACTIONS>"
            "</SUBMISSION>"
            "</SUBMISSION_SET>".format(
                hold_date=submission.embargo.isoformat(),
                broker_submission_id=submission.broker_submission_id,
                time_stamp=current_datetime,
                accession_no=study_primary_accession,
            )
        )

        auth_params = {
            "auth": site_config.ena_server.authentication_string,
        }
        data = {"SUBMISSION": ("submission.xml", submission_xml)}

        response = logged_requests.post(
            url=site_config.ena_server.url,
            submission=submission,
            return_log_id=False,
            params=auth_params,
            files=data,
            verify=False,
        )
        return ("success",)

    else:
        logger.warning(
            "ena.py | update_ena_embargo_task | no primary accession no "
            "found for study | submission_id={0}".format(
                submission.broker_submission_id
            )
        )
        return "no primary accession number found, submission={}".format(
            submission.broker_submission_id
        )

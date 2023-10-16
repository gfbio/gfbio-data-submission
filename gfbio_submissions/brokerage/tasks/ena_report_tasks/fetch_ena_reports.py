# -*- coding: utf-8 -*-
import logging

from kombu.utils import json
from requests import ConnectionError

from config.celery_app import app
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.ena_report import EnaReport
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.ena import fetch_ena_report
from ...utils.task_utils import raise_transfer_server_exceptions

logger = logging.getLogger(__name__)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.fetch_ena_reports_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def fetch_ena_reports_task(self):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
    if site_configuration is None or site_configuration.ena_report_server is None:
        return TaskProgressReport.CANCELLED
    result = True
    logger.info(msg="tasks.py | fetch_ena_reports_task | start update")
    for report_type in EnaReport.REPORT_TYPES:
        type_key, type_name = report_type
        logger.info(
            msg="tasks.py | fetch_ena_reports_task | get report of type={0}".format(
                type_name
            )
        )
        try:
            response, request_id = fetch_ena_report(site_configuration, type_name)
            if response.ok:
                obj, updated = EnaReport.objects.update_or_create(
                    report_type=type_key,
                    defaults={
                        "report_type": type_key,
                        "report_data": json.loads(response.content),
                    },
                )
            else:
                # FIXME: retry count applies to fetch_ena_reports_task not
                #  single report type, thus if a retry is counted for a single
                #  report, this accumulates for all following reports types.
                #  e.g.: study retry+1. sample retry+1. no retries left
                #  for experiment or run
                result = raise_transfer_server_exceptions(
                    response=response, task=self, max_retries=SUBMISSION_MAX_RETRIES
                )
                logger.info(
                    msg="tasks.py | fetch_ena_reports_task | "
                    "raise_transfer_server_exceptions result={0}".format(result)
                )
        except ConnectionError as e:
            logger.error(
                msg="tasks.py | fetch_ena_reports_task | url={1} title={2} "
                "| connection_error {0}".format(
                    e,
                    site_configuration.ena_report_server.url,
                    site_configuration.ena_report_server.title,
                )
            )
            return TaskProgressReport.CANCELLED
    return result

# -*- coding: utf-8 -*-
import json
import os
from unittest import skip

import responses
from django.test import override_settings

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
from gfbio_submissions.generic.models.request_log import RequestLog
from gfbio_submissions.generic.models.resource_credential import ResourceCredential

from ...models.ena_report import EnaReport
from ...models.task_progress_report import TaskProgressReport
from ...tasks.ena_report_tasks.fetch_ena_reports import fetch_ena_reports_task
from .test_tasks_base import TestTasks


class TestEnaReportTasks(TestTasks):
    # https://www.ebi.ac.uk/ena/submit/report/studies?format=json
    # https://www.ebi.ac.uk/ena/submit/report/studies?format=json&max-results=100
    # https://www.ebi.ac.uk/ena/submit/report/studies?format=json&max-results=25&status=private
    # https://ena-docs.readthedocs.io/en/latest/submit/general-guide/reports-service.html
    # https://www.ebi.ac.uk/ena/submit/report/swagger-ui.html

    @classmethod
    def _add_report_responses(cls):
        with open(os.path.join(_get_test_data_dir_path(), "ena_reports_testdata.json"), "r") as file:
            data = json.load(file)
        for report_type in EnaReport.REPORT_TYPES:
            key, val = report_type
            responses.add(
                responses.GET,
                "{0}{1}?format=json".format(cls.default_site_config.ena_report_server.url, val),
                status=200,
                json=data[val],
            )

    @classmethod
    def _add_client_error_responses(cls):
        for report_type in EnaReport.REPORT_TYPES:
            key, val = report_type
            responses.add(
                responses.GET,
                "{0}{1}?format=json".format(cls.default_site_config.ena_report_server.url, val),
                status=401,
            )

    @classmethod
    def _add_server_error_responses(cls):
        for report_type in EnaReport.REPORT_TYPES:
            key, val = report_type
            responses.add(
                responses.GET,
                "{0}{1}?format=json".format(cls.default_site_config.ena_report_server.url, val),
                status=500,
            )

    @skip("Request to real server")
    def test_real_life_get_ena_reports_task(self):
        rc = ResourceCredential.objects.create(
            title="ena report server",
            url="https://www.ebi.ac.uk/ena/submit/report/",
            username="",
            password="",
        )
        self.default_site_config.ena_report_server = rc
        self.default_site_config.save()

        self.assertEqual(0, len(EnaReport.objects.all()))

        fetch_ena_reports_task.apply_async(kwargs={})
        self.assertEqual(len(EnaReport.REPORT_TYPES), len(EnaReport.objects.all()))
        self.assertEqual(len(EnaReport.REPORT_TYPES), len(RequestLog.objects.all()))

    @responses.activate
    def test_get_ena_reports_task(self):
        self._add_report_responses()
        self.assertEqual(0, len(EnaReport.objects.all()))
        fetch_ena_reports_task.apply_async(kwargs={})
        self.assertEqual(len(EnaReport.REPORT_TYPES), len(EnaReport.objects.all()))
        self.assertEqual(len(EnaReport.REPORT_TYPES), len(RequestLog.objects.all()))
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual("SUCCESS", tprs.first().status)

    @responses.activate
    def test_get_ena_reports_task_client_error(self):
        self._add_client_error_responses()
        self.assertEqual(0, len(EnaReport.objects.all()))
        res = fetch_ena_reports_task.apply_async(kwargs={})
        self.assertEqual(TaskProgressReport.CANCELLED, res.get())
        self.assertEqual(0, len(EnaReport.objects.all()))
        self.assertEqual(len(EnaReport.REPORT_TYPES), len(RequestLog.objects.all()))

    @responses.activate
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False, CELERY_TASK_EAGER_PROPAGATES=False)
    def test_get_ena_reports_task_server_error(self):
        self._add_server_error_responses()
        self.assertEqual(0, len(EnaReport.objects.all()))
        res = fetch_ena_reports_task.apply(kwargs={})
        self.assertEqual(TaskProgressReport.CANCELLED, res.get())
        self.assertEqual(0, len(EnaReport.objects.all()))

        # 1 execute plus 2 retries for first reporttype,
        # then 1 execute for each of the remaining 3 reporttypes
        # since max retries is exceeded
        self.assertEqual(6, len(RequestLog.objects.all()))

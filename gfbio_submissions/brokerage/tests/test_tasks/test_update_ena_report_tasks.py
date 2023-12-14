# -*- coding: utf-8 -*-
import json
import os

import responses

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.resolve.models import Accession
from gfbio_submissions.users.models import User
from .test_tasks_base import TestTasks
from ...models.broker_object import BrokerObject
from ...models.ena_report import EnaReport
from ...models.persistent_identifier import PersistentIdentifier
from ...models.task_progress_report import TaskProgressReport
from ...tasks.ena_report_tasks.update_accession_objects_from_ena_report import (
    update_accession_objects_from_ena_report_task,
)
from ...tasks.ena_report_tasks.update_persistent_identifier_report_status import (
    update_persistent_identifier_report_status_task,
)
from ...tasks.ena_report_tasks.update_resolver_accessions import update_resolver_accessions_task


class TestUpdateResolverAccessionsTask(TestTasks):
    def setUp(self):
        with open(os.path.join(_get_test_data_dir_path(), "ena_reports_testdata.json"), "r") as file:
            data = json.load(file)
        for report_type in EnaReport.REPORT_TYPES:
            key, val = report_type
            EnaReport.objects.create(report_type=key, report_data=data[val])

    def test_update_success(self):
        self.assertEqual(0, len(Accession.objects.all()))
        res = update_resolver_accessions_task.apply_async(kwargs={})
        self.assertTrue(res.successful())
        self.assertLess(0, len(Accession.objects.all()))


class TestUpdatePersistentIdentifierReportStatusTask(TestTasks):
    def setUp(self):
        with open(os.path.join(_get_test_data_dir_path(), "ena_reports_testdata.json"), "r") as file:
            data = json.load(file)
        for report_type in EnaReport.REPORT_TYPES:
            key, val = report_type
            EnaReport.objects.create(report_type=key, report_data=data[val])

    @classmethod
    def _add_persistent_identifier_test_data(cls):
        user = User.objects.get(username="user1")
        broker_object = BrokerObject.objects.create(
            type="study",
            user=user,
            data={
                "center_name": "GFBIO",
                "study_abstract": "abstract",
                "study_title": "title",
                "study_alias": "alias",
            },
        )
        PersistentIdentifier.objects.create(
            archive="ENA",
            pid_type="ACC",
            broker_object=broker_object,
            pid="ERP0815",
            outgoing_request_id="da76ebec-7cde-4f11-a7bd-35ef8ebe5b85",
        )
        PersistentIdentifier.objects.create(
            archive="ENA",
            pid_type="PRJ",
            broker_object=broker_object,
            pid="PRJEB0815",
            outgoing_request_id="da76ebec-7cde-4f11-a7bd-35ef8ebe5b85",
        )
        PersistentIdentifier.objects.create(
            archive="PAN",
            pid_type="DOI",
            broker_object=broker_object,
            pid="PAN007",
            outgoing_request_id="7e76fdec-7cde-4f11-a7bd-35ef8fde5b85",
        )

    def test_update_success(self):
        self._add_persistent_identifier_test_data()
        res = update_persistent_identifier_report_status_task.apply_async(kwargs={})
        self.assertTrue(res.successful())


class TestUpdateAccessionsChain(TestTasks):
    def setUp(self):
        with open(os.path.join(_get_test_data_dir_path(), "ena_reports_testdata.json"), "r") as file:
            data = json.load(file)
        for report_type in EnaReport.REPORT_TYPES:
            key, val = report_type
            EnaReport.objects.create(report_type=key, report_data=data[val])

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

    @responses.activate
    def test_update_accession_objects_from_ena_report(self):
        self._add_report_responses()
        result = update_accession_objects_from_ena_report_task.apply_async()
        tpr = TaskProgressReport.objects.all()
        self.assertEqual(4, len(tpr))
        expected_task_names = [
            "tasks.fetch_ena_reports_task",
            "tasks.update_resolver_accessions_task",
            "tasks.update_persistent_identifier_report_status_task",
            "tasks.update_accession_objects_from_ena_report_task",
        ]
        for t in tpr:
            self.assertIn(t.task_name, expected_task_names)
            self.assertNotEqual(TaskProgressReport.CANCELLED, t.task_return_value)

    @responses.activate
    def test_update_accession_objects_failing_ena_report(self):
        self._add_server_error_responses()
        # provoke an error in  first task
        site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
        site_configuration.delete()
        update_accession_objects_from_ena_report_task.apply_async()
        tpr = TaskProgressReport.objects.all()
        self.assertEqual(4, len(tpr))
        expected_task_names = [
            "tasks.fetch_ena_reports_task",
            "tasks.update_resolver_accessions_task",
            "tasks.update_persistent_identifier_report_status_task",
            "tasks.update_accession_objects_from_ena_report_task",
        ]
        for t in tpr:
            if t.task_name not in [
                "tasks.update_accession_objects_from_ena_report_task",
            ]:
                self.assertIn(TaskProgressReport.CANCELLED, t.task_return_value)
            self.assertIn(t.task_name, expected_task_names)

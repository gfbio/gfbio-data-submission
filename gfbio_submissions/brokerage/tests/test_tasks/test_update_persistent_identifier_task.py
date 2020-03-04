# -*- coding: utf-8 -*-
import json
import os

from gfbio_submissions.brokerage.models import PersistentIdentifier, \
    BrokerObject, EnaReport
from gfbio_submissions.brokerage.tasks import \
    update_persistent_identifier_report_status_task
from gfbio_submissions.brokerage.tests.utils import \
    _get_test_data_dir_path
from gfbio_submissions.users.models import User
from .test_tasks_base import TestTasks


class TestUpdatePersistentIdentifierReportStatusTask(TestTasks):
    def setUp(self):
        with open(os.path.join(_get_test_data_dir_path(),
                               'ena_reports_testdata.json'),
                  'r') as file:
            data = json.load(file)
        for report_type in EnaReport.REPORT_TYPES:
            key, val = report_type
            EnaReport.objects.create(
                report_type=key,
                report_data=data[val]
            )

    @classmethod
    def _add_persistent_identifier_test_data(cls):
        user = User.objects.get(
            username='user1'
        )
        broker_object = BrokerObject.objects.create(
            type='study',
            user=user,
            # site_project_id='prj001xxx',
            # site_object_id='obj001',
            data={
                'center_name': 'GFBIO',
                'study_type': 'Metagenomics',
                'study_abstract': 'abstract',
                'study_title': 'title',
                'study_alias': 'alias',
                # 'site_object_id': 'from_data_01'
            }
        )
        PersistentIdentifier.objects.create(
            archive='ENA',
            pid_type='ACC',
            broker_object=broker_object,
            pid='ERP0815',
            outgoing_request_id='da76ebec-7cde-4f11-a7bd-35ef8ebe5b85'
        )
        PersistentIdentifier.objects.create(
            archive='ENA',
            pid_type='PRJ',
            broker_object=broker_object,
            pid='PRJEB0815',
            outgoing_request_id='da76ebec-7cde-4f11-a7bd-35ef8ebe5b85'
        )
        PersistentIdentifier.objects.create(
            archive='PAN',
            pid_type='DOI',
            broker_object=broker_object,
            pid='PAN007',
            outgoing_request_id='7e76fdec-7cde-4f11-a7bd-35ef8fde5b85'
        )

    def test_update_success(self):
        self._add_persistent_identifier_test_data()
        res = update_persistent_identifier_report_status_task.apply_async(
            kwargs={
            }
        )
        self.assertTrue(res.successful())

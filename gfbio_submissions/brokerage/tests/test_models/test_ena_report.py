# -*- coding: utf-8 -*-
import json
import os

from django.test import TestCase

from gfbio_submissions.brokerage.models import EnaReport, BrokerObject, \
    PersistentIdentifier
from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
from gfbio_submissions.users.models import User


class TestEnaReport(TestCase):

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

    def test_db_content(self):
        self.assertEqual(4, len(EnaReport.objects.all()))
        self.assertEqual(3, len(EnaReport.objects.filter(
            report_type=EnaReport.STUDY).first().report_data))

    def test_create_instance(self):
        data = [
            {
                "report": {
                    "id": "ERP119242",
                    "alias": "25104:e3339647-f889-4370-9287-4fb5cb688e4c",
                    "firstCreated": "2020-01-08T14:35:41",
                    "firstPublic": None,
                    "releaseStatus": "PRIVATE",
                    "submissionAccountId": "Webin-40945",
                    "secondaryId": "PRJEB36096",
                    "title": "Anaerobic oxidation of ethane by archaea in different marine environments",
                    "holdDate": "2021-01-07T00:00:00"
                },
                "links": []
            },
        ]
        er = EnaReport.objects.create(report_type=EnaReport.STUDY,
                                      report_data=data)
        self.assertIsInstance(er, EnaReport)

    def test_filter_json(self):
        data = [
            {
                "report": {
                    "id": "ERP119242",
                    "alias": "25104:e3339647-f889-4370-9287-4fb5cb688e4c",
                    "firstCreated": "2020-01-08T14:35:41",
                    "firstPublic": None,
                    "releaseStatus": "PRIVATE",
                    "submissionAccountId": "Webin-40945",
                    "secondaryId": "PRJEB36096",
                    "title": "Anaerobic oxidation of ethane by archaea in different marine environments",
                    "holdDate": "2021-01-07T00:00:00"
                },
                "links": []
            },
            {
                "report": {
                    "id": "ERP117556",
                    "alias": "gfbio:study:99b1ee42-becb-499d-ad81-930098524a6d:2019-03-29",
                    "firstCreated": "2019-09-27T13:52:01",
                    "firstPublic": "2019-10-22T23:20:19",
                    "releaseStatus": "PUBLIC",
                    "submissionAccountId": "Webin-40945",
                    "secondaryId": "PRJEB34624",
                    "title": "Fucoidan degrading marine Lentimonas",
                    "holdDate": None
                },
                "links": []
            },
        ]
        EnaReport.objects.create(report_type=EnaReport.STUDY,
                                 report_data=data)
        data = [{
            "report": {
                "id": "ERS4223059",
                "alias": "25111:e3339647-f889-4370-9287-4fb5cb688e4c",
                "firstCreated": "2020-01-08T14:35:41",
                "firstPublic": None,
                "releaseStatus": "PRIVATE",
                "submissionAccountId": "Webin-40945",
                "secondaryId": "SAMEA6457547",
                "title": "GeoB19351-14",
                "taxId": "2608793",
                "scientificName": "Candidatus Argoarchaeum ethanivorans",
                "commonName": None
            },
            "links": []
        }, ]

        EnaReport.objects.create(report_type=EnaReport.SAMPLE,
                                 report_data=data)

        self.assertEqual(1, len(EnaReport.objects.filter(
            report_type=EnaReport.STUDY).filter(
            report_data__1__report__holdDate=None)))

        # Works even when searching for part of desired json data
        self.assertEqual(1, len(
            EnaReport.objects.filter(
                report_type=EnaReport.STUDY).filter(
                report_data__contains=[{'report': {'id': 'ERP117556'}}])
        ))

    def test_parsing_for_ena_status(self):
        user = User.objects.create(
            username='user1'
        )
        broker_object = BrokerObject.objects.create(
            type='study',
            site=user,
            site_project_id='prj001xxx',
            site_object_id='obj001',
            data={
                'center_name': 'GFBIO',
                'study_type': 'Metagenomics',
                'study_abstract': 'abstract',
                'study_title': 'title',
                'study_alias': 'alias',
                'site_object_id': 'from_data_01'
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
        identifiers = PersistentIdentifier.objects.all()
        self.assertEqual(3, len(identifiers))
        for i in identifiers:
            self.assertEqual('', i.status)

        success = update_persistent_identifier_report_status()
        self.assertTrue(success)

        identifiers = PersistentIdentifier.objects.all().exclude(pid_type='DOI')
        self.assertEqual(2, len(identifiers))
        for i in identifiers:
            self.assertNotEqual('', i.status)

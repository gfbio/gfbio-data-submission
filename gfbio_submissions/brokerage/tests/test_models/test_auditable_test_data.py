# -*- coding: utf-8 -*-

import xml.etree.ElementTree as ET

from django.test import TestCase

from gfbio_submissions.users.models import User
from ..utils import _create_submission_via_serializer
from ...admin import download_auditable_text_data
from ...configuration.settings import GFBIO_HELPDESK_TICKET
from ...models.additional_reference import AdditionalReference
from ...models.auditable_text_data import AuditableTextData
from ...models.submission import Submission
from ...utils.ena import prepare_ena_data, store_ena_data_as_auditable_text_data


class TestAuditableTextData(TestCase):
    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(username="horst", email="horst@horst.de", password="password")
        _create_submission_via_serializer()

    @classmethod
    def _create_sample_textdata_with_checklist_mismatch(cls, submission):
        atd = AuditableTextData.objects.create(name="sample.xml", submission=submission)
        atd.text_data = ('<SAMPLE_SET><SAMPLE alias="2:xxx" center_name="" broker_name="GFBIO">'
                         '<TITLE>sample title</TITLE><SAMPLE_NAME><TAXON_ID>530564</TAXON_ID></SAMPLE_NAME><DESCRIPTION />'
                         '<SAMPLE_ATTRIBUTES><SAMPLE_ATTRIBUTE><TAG>investigation type</TAG><VALUE>mimarks-survey</VALUE>'
                         '</SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>environmental package</TAG><VALUE>water</VALUE>'
                         '</SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>collection date</TAG><VALUE>2014-11</VALUE>'
                         '</SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE>'
                         '</SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>water environmental package</TAG><VALUE>water</VALUE>'
                         '</SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>ENA-CHECKLIST</TAG><VALUE>ERC000024</VALUE>'
                         '</SAMPLE_ATTRIBUTE></SAMPLE_ATTRIBUTES></SAMPLE>'
                         '<SAMPLE alias="4:xxx" center_name="" broker_name="GFBIO">'
                         '<TITLE>sample title 3</TITLE><SAMPLE_NAME><TAXON_ID>530564</TAXON_ID></SAMPLE_NAME><DESCRIPTION />'
                         '<SAMPLE_ATTRIBUTES><SAMPLE_ATTRIBUTE><TAG>environmental package</TAG><VALUE>wastewater sludge</VALUE>'
                         '</SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE></SAMPLE_ATTRIBUTE>'
                         '<SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>AB 3730xL Genetic Analyzer</VALUE></SAMPLE_ATTRIBUTE>'
                         '</SAMPLE_ATTRIBUTES></SAMPLE>'
                         '<SAMPLE alias="3:xxx" center_name="" broker_name="GFBIO">'
                         '<TITLE>sample title 2</TITLE><SAMPLE_NAME><TAXON_ID>530564</TAXON_ID></SAMPLE_NAME><DESCRIPTION />'
                         '<SAMPLE_ATTRIBUTES>'
                         '<SAMPLE_ATTRIBUTE><TAG>environmental package</TAG><VALUE>wastewater sludge</VALUE></SAMPLE_ATTRIBUTE>'
                         '<SAMPLE_ATTRIBUTE><TAG>environmental package</TAG><VALUE>soil</VALUE></SAMPLE_ATTRIBUTE>'
                         '<SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE></SAMPLE_ATTRIBUTE>'
                         '<SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>AB 3730xL Genetic Analyzer</VALUE></SAMPLE_ATTRIBUTE>'
                         '<SAMPLE_ATTRIBUTE><TAG>ENA-CHECKLIST</TAG><VALUE>ERC000024</VALUE></SAMPLE_ATTRIBUTE>'
                         '</SAMPLE_ATTRIBUTES></SAMPLE>'
                         '</SAMPLE_SET>')
        atd.save()

    def test_instance(self):
        submission = Submission.objects.first()
        atd = AuditableTextData.objects.create(name="test-file", submission=submission)
        self.assertFalse(atd.pk is None)
        self.assertIsInstance(atd, AuditableTextData)

    def test_store_ena_data_as_auditable_text_data(self):
        submission = Submission.objects.first()
        all_text_data = AuditableTextData.objects.all()
        self.assertEqual(0, len(all_text_data))
        data = prepare_ena_data(submission)
        store_ena_data_as_auditable_text_data(submission, data)
        all_text_data = AuditableTextData.objects.all()
        self.assertEqual(4, len(all_text_data))
        text_data_for_submission = AuditableTextData.objects.filter(submission=submission)
        self.assertEqual(4, len(text_data_for_submission))

    def test_find_ena_checklist_mismatches(self):
        submission = Submission.objects.first()
        submission.additionalreference_set.add(AdditionalReference.objects.create(
            type=GFBIO_HELPDESK_TICKET, primary=True, reference_key='SAND-0815', submission=submission
        ))
        self._create_sample_textdata_with_checklist_mismatch(submission)
        all_text_data = AuditableTextData.objects.all()
        checklist_errors = []
        # as used in: gfbio_submissions/brokerage/management/commands/list_ena_checklist_mismatches.py
        #   -> mangage.py management command
        for a in all_text_data:
            if 'sample' in a.name:
                sample_root = ET.fromstring(a.text_data)
                for sample in sample_root:
                    env_package_children = sample.findall(".//TAG[.='environmental package']")
                    ena_checklist_children = sample.findall(".//TAG[.='ENA-CHECKLIST']")
                    if len(env_package_children) > 1 or (
                        len(env_package_children) == 1 and len(ena_checklist_children) == 0):
                        checklist_errors.append(sample)
        self.assertEqual(2, len(checklist_errors))

    def test_admin_download(self):
        submission = Submission.objects.first()
        data = prepare_ena_data(submission)
        store_ena_data_as_auditable_text_data(submission, data)
        data = AuditableTextData.objects.filter(submission=submission)
        response = download_auditable_text_data(
            None,
            None,
            Submission.objects.filter(broker_submission_id=submission.broker_submission_id),
        )
        self.assertEqual(200, response.status_code)

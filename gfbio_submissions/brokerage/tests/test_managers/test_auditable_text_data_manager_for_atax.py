# -*- coding: utf-8 -*-

from django.test import TestCase

import os
from gfbio_submissions.brokerage.models import Submission, AuditableTextData, \
    BrokerObject
from gfbio_submissions.brokerage.serializers import SubmissionSerializer

from gfbio_submissions.users.models import User
from gfbio_submissions.brokerage.tests.utils import  _get_taxonomic_min_data, _get_test_data_dir_path
from gfbio_submissions.brokerage.utils.csv_atax import store_atax_data_as_auditable_text_data
import xml.etree.ElementTree as ET

class TestAuditableTextDataManagerForAtax(TestCase):

    # TODO: move to utils or similar ...
    @classmethod
    def _create_submission_via_serializer(cls, runs=False, username=None,
                                          create_broker_objects=True):

        serializer = SubmissionSerializer(data={
            'target': 'ATAX',
            'release': True,
            'data': _get_taxonomic_min_data()
        })
        serializer.is_valid()

        user = User.objects.get(
            username=username) if username else User.objects.first()
        submission = serializer.save(user=user)
        if create_broker_objects:
            BrokerObject.objects.add_submission_data(submission)
        return submission

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(username='horst', email='horst@horst.de',
                                 password='password')
        cls._create_submission_via_serializer()


    @classmethod
    def _create_atax_text_test_data(cls, invalid=False):
        file_name = 'csv_files/specimen_table_Platypelis_with_gaps.csv' if invalid else 'csv_files/specimen_table_Platypelis.csv'

        #  do so, f.close() is called automatically:
        with open(os.path.join(_get_test_data_dir_path(), file_name)) as f:
            content = f.readlines()
        return content

    @classmethod
    def _create_atax_xml_test_data(cls, invalid=False):
        file_name = 'xml_files/specimen_reference_Platypelis.xml'

        tree = ET.parse(os.path.join(_get_test_data_dir_path(), file_name))
        root = tree.getroot()
        ET.register_namespace("abcd", "http://www.tdwg.org/schemas/abcd/2.06")
        return ET.tostring(root, encoding='utf8').decode('utf8')


    def test_manager_submission_store_audit_data_and_check_for_atax(self):
        submission = Submission.objects.first()

        data = self._create_atax_text_test_data()
        self.assertEqual(0, len(AuditableTextData.objects.all()))
        store_atax_data_as_auditable_text_data(submission, 'specimen_table_Platypelis.csv', data)
        self.assertEqual(1, len(AuditableTextData.objects.all()))

    def test_submission_store_xml_audit_file_and_filter_the_content(self):
        submission = Submission.objects.first()
        data = self._create_atax_xml_test_data()
        self.assertEqual(0, len(AuditableTextData.objects.all()))
        store_atax_data_as_auditable_text_data(submission, 'specimen_reference_Platypelis.xml', data)

        platypelis_xml = submission.auditabletextdata_set.filter(
          name='specimen_reference_Platypelis.xml')

        self.assertEqual(1, len(platypelis_xml))
        platypelis_xml = platypelis_xml.first()
        self.assertIn('<abcd:UnitID>ZSM 5652/2012</abcd:UnitID>', platypelis_xml.text_data)
        self.assertIn('<abcd:FullScientificNameString>Platypelis laetus</abcd:FullScientificNameString>', platypelis_xml.text_data)
        self.assertIn('<abcd:ISODateTimeBegin>2012-11-26</abcd:ISODateTimeBegin>', platypelis_xml.text_data)
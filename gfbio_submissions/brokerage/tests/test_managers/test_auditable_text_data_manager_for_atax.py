# -*- coding: utf-8 -*-

import os
import xml.etree.ElementTree as ET

from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import _create_submission_via_serializer, _get_test_data_dir_path
# from gfbio_submissions.brokerage.utils.csv_atax import store_atax_data_as_auditable_text_data
from gfbio_submissions.users.models import User

from ...models.auditable_text_data import AuditableTextData
from ...models.submission import Submission


# TODO: DASS-1498 this will be used later or moved or deleted
# class TestAuditableTextDataManagerForAtax(TestCase):
#     @classmethod
#     def setUpTestData(cls):
#         User.objects.create_user(username="horst", email="horst@horst.de", password="password")
#         _create_submission_via_serializer()
#
#     @classmethod
#     def _create_atax_text_test_data(cls, invalid=False):
#         file_name = (
#             "csv_files/specimen_table_Platypelis_with_gaps.csv"
#             if invalid
#             else "csv_files/specimen_table_Platypelis.csv"
#         )
#
#         #  do so, f.close() is called automatically:
#         with open(os.path.join(_get_test_data_dir_path(), file_name)) as f:
#             content = f.readlines()
#         return content
#
#     @classmethod
#     def _create_atax_xml_test_data(cls, invalid=False):
#         file_name = "xml_files/specimen_reference_Platypelis.xml"
#
#         tree = ET.parse(os.path.join(_get_test_data_dir_path(), file_name))
#         root = tree.getroot()
#         ET.register_namespace("abcd", "http://www.tdwg.org/schemas/abcd/2.06")
#         return ET.tostring(root, encoding="utf8").decode("utf8")
#
#     def test_manager_submission_store_audit_data_and_check_for_atax(self):
#         submission = Submission.objects.first()
#
#         data = self._create_atax_text_test_data()
#         self.assertEqual(0, len(AuditableTextData.objects.all()))
#         store_atax_data_as_auditable_text_data(
#             submission,
#             "specimen",
#             data,
#             "one test data set",
#             "specimen_table_Platypelis.csv",
#             1,
#         )
#         self.assertEqual(1, len(AuditableTextData.objects.all()))
#
#     def test_submission_store_xml_audit_file_and_filter_the_content(self):
#         submission = Submission.objects.first()
#         data = self._create_atax_xml_test_data()
#         self.assertEqual(0, len(AuditableTextData.objects.all()))
#         store_atax_data_as_auditable_text_data(
#             submission,
#             "specimen",
#             data,
#             "one test data set",
#             "specimen_reference_Platypelis.xml",
#             1,
#         )
#
#         platypelis_xml = submission.auditabletextdata_set.filter(atax_file_name="specimen_reference_Platypelis.xml")
#
#         platypelis1_xml = submission.auditabletextdata_set.filter(name="specimen")
#
#         self.assertEqual(1, len(platypelis1_xml))
#         self.assertEqual(1, len(platypelis_xml))
#         platypelis_xml = platypelis_xml.first()
#         self.assertIn("<abcd:UnitID>ZSM 5652/2012</abcd:UnitID>", platypelis_xml.text_data)
#         self.assertIn(
#             "<abcd:FullScientificNameString>Platypelis laetus</abcd:FullScientificNameString>",
#             platypelis_xml.text_data,
#         )
#         self.assertIn(
#             "<abcd:ISODateTimeBegin>2012-11-26</abcd:ISODateTimeBegin>",
#             platypelis_xml.text_data,
#         )

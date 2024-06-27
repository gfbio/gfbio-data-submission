# -*- coding: utf-8 -*-
import os
import re

from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload
from ...models.abcd_conversion_result import AbcdConversionResult
from gfbio_submissions.users.models import User

#from ...tasks.auditable_text_data_tasks.prepare_ena_submission_data import prepare_ena_submission_data_task
from ...tasks.atax_tasks.atax_run_combination_task import atax_run_combination_task
from ..test_utils.test_csv_parsing import TestCSVParsing
from .test_tasks_base import TestTasks
from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path


class TestSubmissionAbcdConversionTasks(TestTasks):
    def test_abcd_conversion_task(self):
        assert 0 == AbcdConversionResult.objects.count()
        submission = Submission.objects.first()
        user = User.objects.first()
        upload = TestCSVParsing.create_csv_submission_upload(
            submission, user, "csv_files/specimen_table_Platypelis.csv"
        )
        upload.save(ignore_attach_to_ticket=True)
        upload = TestCSVParsing.create_csv_submission_upload(
            submission, user, "csv_files/multimedia_table_Platypelis.csv"
        )
        upload.save(ignore_attach_to_ticket=True)
        upload = TestCSVParsing.create_csv_submission_upload(
            submission, user, "csv_files/measurement_table_Platypelis.csv"
        )
        upload.save(ignore_attach_to_ticket=True)

        atax_run_combination_task(submission_id=submission.pk)
        
        assert 1 == AbcdConversionResult.objects.count()
        abcdConversionResult = AbcdConversionResult.objects.first()
        assert True == abcdConversionResult.atax_xml_valid
        assert abcdConversionResult.xml.startswith(
            '<abcd:DataSets xmlns:abcd="http://www.tdwg.org/schemas/abcd/2.06" '
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation=" http://www.tdwg.org/schemas/abcd/2.06 '
            'http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"><abcd:DataSet><abcd:TechnicalContacts>'
        )

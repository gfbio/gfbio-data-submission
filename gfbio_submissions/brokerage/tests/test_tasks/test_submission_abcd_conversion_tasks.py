# -*- coding: utf-8 -*-
import os

from django.core.files.uploadedfile import SimpleUploadedFile

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
from gfbio_submissions.users.models import User
from .test_tasks_base import TestTasks
from ..test_utils.test_csv_parsing import TestCSVParsing
from ...models.abcd_conversion_result import AbcdConversionResult
from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload
# from ...tasks.auditable_text_data_tasks.prepare_ena_submission_data import prepare_ena_submission_data_task
from ...tasks.atax_tasks.atax_run_combination_task import atax_run_combination_task


def create_fake_submission_upload(submission, user, file_sub_path):
    with open(os.path.join(_get_test_data_dir_path(), "csv_files/molecular_metadata.csv"), "rb") as data_file:
        return SubmissionUpload.objects.create(
            submission=submission,
            user=user,
            meta_data=True,
            file=SimpleUploadedFile(file_sub_path, data_file.read()),
        )


def run_test(specimen, multimedia, measurement, mocked_media):
    submission = Submission.objects.first()
    user = User.objects.first()
    upload = TestCSVParsing.create_csv_submission_upload(
        submission, user, specimen
    )
    upload.save(ignore_attach_to_ticket=True)
    upload = TestCSVParsing.create_csv_submission_upload(
        submission, user, multimedia
    )
    upload.save(ignore_attach_to_ticket=True)
    upload = TestCSVParsing.create_csv_submission_upload(
        submission, user, measurement
    )
    upload.save(ignore_attach_to_ticket=True)

    for filename in mocked_media:
        upload = create_fake_submission_upload(
            submission, user, filename
        )
        upload.save(ignore_attach_to_ticket=True)

    atax_run_combination_task(submission_id=submission.pk)


class TestSubmissionAbcdConversionTasks(TestTasks):
    def test_abcd_conversion_task(self):
        mocked_media_files = ["Holotype_FGZC3761.jpg", "_MAD2789.tif", "_MAD2790.tif", "FGZC 3588.jpg",
                              "FGZC 3588_ventral.jpg", "FGZC 3762.jpg", "FGZC 3762_ventral.jpg",
                              "Platypelis_Sorata_plates_01July2019.jpg", "P_tsaratananaensis_FGZC 3648.jpg",
                              "P_tsaratananaensis_FGZC 3648_vent.jpg", "P_tsaratananaensis_FGZC 3647.jpg",
                              "P_tsaratananaensis_FGZC 3647_vent.jpg", "P_tsaratananaensis_FGZC 3649.jpg",
                              "P_tsaratananaensis_FGZC 3649_vent.jpg"]
        run_test("csv_files/specimen_table_Platypelis.csv", "csv_files/multimedia_table_Platypelis.csv",
                 "csv_files/measurement_table_Platypelis.csv", mocked_media_files)

        assert 1 == AbcdConversionResult.objects.count()
        abcdConversionResult = AbcdConversionResult.objects.first()
        assert True == abcdConversionResult.atax_xml_valid
        assert abcdConversionResult.xml.startswith(
            '<abcd:DataSets xmlns:abcd="http://www.tdwg.org/schemas/abcd/2.06" '
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation=" http://www.tdwg.org/schemas/abcd/2.06 '
            'http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"><abcd:DataSet><abcd:TechnicalContacts>'
        )

    def test_abcd_conversion_task_fail_on_missing_media(self):
        mocked_media_files = ["Holotype_FGZC3761.jpg", "_MAD2789.tif", "_MAD2790.tif", "FGZC 3588.jpg",
                              "FGZC 3588_ventral.jpg", "FGZC 3762.jpg", "FGZC 3762_ventral.jpg",
                              "Platypelis_Sorata_plates_01July2019.jpg", "P_tsaratananaensis_FGZC 3648.jpg",
                              "P_tsaratananaensis_FGZC 3648_vent.jpg", "P_tsaratananaensis_FGZC 3647.jpg",
                              "P_tsaratananaensis_FGZC 3647_vent.jpg", "P_tsaratananaensis_FGZC 3649.jpg"]
        run_test("csv_files/specimen_table_Platypelis.csv", "csv_files/multimedia_table_Platypelis.csv",
                 "csv_files/measurement_table_Platypelis.csv", mocked_media_files)

        assert 1 == AbcdConversionResult.objects.count()
        abcdConversionResult = AbcdConversionResult.objects.first()
        assert False == abcdConversionResult.atax_xml_valid
        print(abcdConversionResult.errors)
        assert abcdConversionResult.errors == """[{'description': "File P_tsaratananaensis_FGZC_3649_vent.jpg in row 15 is missing it's corresponding file in the upload.", 'content': {'file': 'multimedia', 'row': 15, 'message': 'File not found'}}, {'description': 'Process ran into (validation-)errors. Please check error-log for further information.', 'content': {}}]"""

    def test_abcd_conversion_task_warning_on_missing_media(self):
        mocked_media_files = ["Holotype_FGZC3761.jpg", "_MAD2789.tif", "_MAD2790.tif", "FGZC 3588.jpg",
                              "FGZC 3588_ventral.jpg", "FGZC 3762.odd", "FGZC 3762_ventral.jpg",
                              "Platypelis_Sorata_plates_01July2019.jpg", "P_tsaratananaensis_FGZC 3648.jpg",
                              "P_tsaratananaensis_FGZC 3648_vent.jpg", "P_tsaratananaensis_FGZC 3647.jpg",
                              "P_tsaratananaensis_FGZC 3647_vent.jpg", "P_tsaratananaensis_FGZC 3649.jpg",
                              "P_tsaratananaensis_FGZC 3649_vent.jpg"]
        run_test("csv_files/specimen_table_Platypelis.csv", "csv_files/multimedia_table_Platypelis_with_odd_media.csv",
                 "csv_files/measurement_table_Platypelis.csv", mocked_media_files)

        assert 1 == AbcdConversionResult.objects.count()
        abcdConversionResult = AbcdConversionResult.objects.first()
        assert True == abcdConversionResult.atax_xml_valid
        assert abcdConversionResult.warnings == "[{'description': \"File extension 'odd' of FGZC 3762.odd may not match the format description 'Image'.\", 'content': {'file': 'multimedia', 'row': 8, 'message': 'Unrecognized file extension'}}]"
        assert abcdConversionResult.xml

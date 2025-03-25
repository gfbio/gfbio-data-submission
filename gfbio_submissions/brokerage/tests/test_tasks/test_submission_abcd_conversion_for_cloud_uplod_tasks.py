# -*- coding: utf-8 -*-

import os
from pprint import pprint
from unittest.mock import MagicMock
from unittest.mock import patch

from django.conf import settings
from dt_upload.models import FileUploadRequest

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
from .test_tasks_base import TestTasks
from ...models import SubmissionCloudUpload
from ...models.abcd_conversion_result import AbcdConversionResult
from ...models.submission import Submission
from ...tasks.atax_tasks.atax_run_combination_task import atax_run_combination_for_cloud_upload_task


def create_fake_submission_upload(submission, user, file_sub_path):
    with open(os.path.join(_get_test_data_dir_path(), "csv_files/molecular_metadata.csv"), "rb") as data_file:
        file_content = data_file.read()
    local_file = f"{file_sub_path}"
    with open(local_file, 'w+b') as f:
        f.write(file_content)
    file_upload = FileUploadRequest.objects.create(
        original_filename=file_sub_path,
        file_key=file_sub_path,
        file_type="tif",
        status="COMPLETE",
        user=user
    )
    cloud_upload = SubmissionCloudUpload.objects.create(
        submission=submission,
        attach_to_ticket=False,
        meta_data=False,
        file_upload=file_upload
    )
    return cloud_upload, file_upload


class TestSubmissionAbcdConversionForCloudUploadTasks(TestTasks):

    def setUp(self):
        folder = "csv_files"
        self.specimen = "specimen_table_Platypelis.csv"
        self.multimedia = "multimedia_table_Platypelis.csv"
        self.odd_multimedia = "multimedia_table_Platypelis_with_odd_media.csv"
        self.measurement = "measurement_table_Platypelis.csv"

        with open(os.path.join(_get_test_data_dir_path(), f"{folder}{os.sep}{self.specimen}"), "rb") as data_file:
            self.specimen_content = data_file.read()
        with open(os.path.join(_get_test_data_dir_path(), f"{folder}{os.sep}{self.multimedia}"), "rb") as data_file:
            self.multimedia_content = data_file.read()
        with open(os.path.join(_get_test_data_dir_path(), f"{folder}{os.sep}{self.odd_multimedia}"), "rb") as data_file:
            self.odd_multimedia_content = data_file.read()
        with open(os.path.join(_get_test_data_dir_path(), f"{folder}{os.sep}{self.measurement}"), "rb") as data_file:
            self.measurement_content = data_file.read()

        self.specimen_file = f"/tmp/{self.specimen}"
        self.multimedia_file = f"/tmp/{self.multimedia}"
        self.odd_multimedia_file = f"/tmp/{self.odd_multimedia}"
        self.measurement_file = f"/tmp/{self.measurement}"

        with open(self.specimen_file, 'w+b') as f:
            f.write(self.specimen_content)
        with open(self.multimedia_file, 'w+b') as f:
            f.write(self.multimedia_content)
        with open(self.odd_multimedia_file, 'w+b') as f:
            f.write(self.odd_multimedia_content)
        with open(self.measurement_file, 'w+b') as f:
            f.write(self.measurement_content)

        settings.AWS_STORAGE_BUCKET_NAME = "fake-bucket"
        settings.AWS_ACCESS_KEY_ID = "fake_access_key"
        settings.AWS_SECRET_ACCESS_KEY = "fake_secret_key"
        settings.AWS_S3_REGION_NAME = "us-east-1"
        settings.AWS_S3_ENDPOINT_URL = None

        self.submission = Submission.objects.first()
        self.user = self.submission.user

        file_upload = FileUploadRequest.objects.create(
            original_filename=self.specimen,
            file_key=f"{self.specimen}",
            file_type="csv",
            status="COMPLETE",
            user=self.user
        )
        SubmissionCloudUpload.objects.create(
            submission=self.submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=file_upload
        )
        file_upload = FileUploadRequest.objects.create(
            original_filename=self.multimedia,
            file_key=f"{self.multimedia}",
            file_type="csv",
            status="COMPLETE",
            user=self.user
        )
        SubmissionCloudUpload.objects.create(
            submission=self.submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=file_upload
        )
        file_upload = FileUploadRequest.objects.create(
            original_filename=self.measurement,
            file_key=f"{self.measurement}",
            file_type="csv",
            status="COMPLETE",
            user=self.user
        )
        SubmissionCloudUpload.objects.create(
            submission=self.submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=file_upload
        )

    def tearDown(self):
        os.remove(self.specimen_file)
        os.remove(self.multimedia_file)
        os.remove(self.measurement_file)

    def run_test(self, submission, mocked_media):
        for filename in mocked_media:
            upload, file_upload = create_fake_submission_upload(
                submission, submission.user, filename
            )

        def mock_download_fileobj(Bucket, Key, Fileobj):
            if Key == self.specimen:
                with open(self.specimen_file, 'rb') as f:
                    Fileobj.write(f.read())
            elif Key == self.multimedia:
                with open(self.multimedia_file, 'rb') as f:
                    Fileobj.write(f.read())
            elif Key == self.odd_multimedia:
                with open(self.odd_multimedia_file, 'rb') as f:
                    Fileobj.write(f.read())
            elif Key == self.measurement:
                with open(self.measurement_file, 'rb') as f:
                    Fileobj.write(f.read())

        with patch('boto3.client') as mock_boto3_client:
            mock_s3 = MagicMock()
            mock_boto3_client.return_value = mock_s3
            mock_s3.download_fileobj.side_effect = mock_download_fileobj
            atax_run_combination_for_cloud_upload_task(submission_id=self.submission.pk)

    def test_abcd_conversion_task(self):
        mocked_media_files = ["Holotype_FGZC3761.jpg", "_MAD2789.tif", "_MAD2790.tif", "FGZC 3588.jpg",
                              "FGZC 3588_ventral.jpg", "FGZC 3762.jpg", "FGZC 3762_ventral.jpg",
                              "Platypelis_Sorata_plates_01July2019.jpg", "P_tsaratananaensis_FGZC 3648.jpg",
                              "P_tsaratananaensis_FGZC 3648_vent.jpg", "P_tsaratananaensis_FGZC 3647.jpg",
                              "P_tsaratananaensis_FGZC 3647_vent.jpg", "P_tsaratananaensis_FGZC 3649.jpg",
                              "P_tsaratananaensis_FGZC 3649_vent.jpg"]
        self.run_test(self.submission, mocked_media_files)

        assert 1 == AbcdConversionResult.objects.count()
        abcdConversionResult = AbcdConversionResult.objects.first()
        pprint(abcdConversionResult.errors)

        assert True == abcdConversionResult.atax_xml_valid
        assert abcdConversionResult.xml.startswith(
            '<abcd:DataSets xmlns:abcd="http://www.tdwg.org/schemas/abcd/2.06" '
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation=" http://www.tdwg.org/schemas/abcd/2.06 '
            'http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"><abcd:DataSet><abcd:TechnicalContacts>'
        )
        for m in mocked_media_files:
            os.remove(m)

    def test_abcd_conversion_task_fail_on_missing_media(self):
        mocked_media_files = ["Holotype_FGZC3761.jpg", "_MAD2789.tif", "_MAD2790.tif", "FGZC 3588.jpg",
                              "FGZC 3588_ventral.jpg", "FGZC 3762.jpg", "FGZC 3762_ventral.jpg",
                              "Platypelis_Sorata_plates_01July2019.jpg", "P_tsaratananaensis_FGZC 3648.jpg",
                              "P_tsaratananaensis_FGZC 3648_vent.jpg", "P_tsaratananaensis_FGZC 3647.jpg",
                              "P_tsaratananaensis_FGZC 3647_vent.jpg", "P_tsaratananaensis_FGZC 3649.jpg"]
        self.run_test(self.submission, mocked_media_files)

        assert 1 == AbcdConversionResult.objects.count()
        abcdConversionResult = AbcdConversionResult.objects.first()
        assert False == abcdConversionResult.atax_xml_valid
        assert abcdConversionResult.errors == "[{'description': \"File P_tsaratananaensis_FGZC 3649_vent.jpg in row 15 is missing it's corresponding file in the upload.\", 'content': {'file': 'multimedia', 'row': 15, 'message': 'File not found'}}, {'description': 'Process ran into (validation-)errors. Please check error-log for further information.', 'content': {}}]"

        for m in mocked_media_files:
            os.remove(m)

    def test_abcd_conversion_task_warning_on_missing_media(self):
        mocked_media_files = ["Holotype_FGZC3761.jpg", "_MAD2789.tif", "_MAD2790.tif", "FGZC 3588.jpg",
                              "FGZC 3588_ventral.jpg", "FGZC 3762.odd", "FGZC 3762_ventral.jpg",
                              "Platypelis_Sorata_plates_01July2019.jpg", "P_tsaratananaensis_FGZC 3648.jpg",
                              "P_tsaratananaensis_FGZC 3648_vent.jpg", "P_tsaratananaensis_FGZC 3647.jpg",
                              "P_tsaratananaensis_FGZC 3647_vent.jpg", "P_tsaratananaensis_FGZC 3649.jpg",
                              "P_tsaratananaensis_FGZC 3649_vent.jpg"]
        SubmissionCloudUpload.objects.get(file_upload__file_key=self.multimedia).delete()
        file_upload = FileUploadRequest.objects.create(
            original_filename=self.odd_multimedia,
            file_key=f"{self.odd_multimedia}",
            file_type="csv",
            status="COMPLETE",
            user=self.user
        )
        SubmissionCloudUpload.objects.create(
            submission=self.submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=file_upload
        )
        self.run_test(self.submission, mocked_media_files)
        assert 1 == AbcdConversionResult.objects.count()
        abcdConversionResult = AbcdConversionResult.objects.first()
        assert True == abcdConversionResult.atax_xml_valid
        assert abcdConversionResult.warnings == "[{'description': \"File extension 'odd' of FGZC 3762.odd may not match the format description 'Image'.\", 'content': {'file': 'multimedia', 'row': 8, 'message': 'Unrecognized file extension'}}]"
        assert abcdConversionResult.xml

        for m in mocked_media_files:
            os.remove(m)

# -*- coding: utf-8 -*-

import io
from unittest.mock import patch

from dt_upload.models import FileUploadRequest

from ...models.metadata_validation_report import MetadataValidationReport
from ...models.submission import Submission
from ...models.submission_cloud_upload import SubmissionCloudUpload
from ...tasks.metadata_tasks.validate_metadata_file_countries_task import (
    validate_metadata_file_countries_task,
)
from .test_tasks_base import TestTasks

HEADER = "sample_title;taxon_id;sample_description;geographic location (country and/or sea)\n"

_OPENER_PATH = (
    "gfbio_submissions.brokerage.tasks.metadata_tasks."
    "validate_metadata_file_countries_task.create_submission_file_opener"
)


class _FakeOpener:
    def __init__(self, content):
        self._content = content

    def csv_reader(self, cloud_upload):
        return io.StringIO(self._content)


class TestValidateMetadataFileCountriesTask(TestTasks):
    def _create_report(self):
        submission = Submission.objects.first()
        # status must not be "COMPLETED": FileUploadRequest.save() then accesses
        # a related MultiPartUpload that this unit test does not create. The
        # status is irrelevant here because the file read is mocked.
        file_upload = FileUploadRequest.objects.create(
            original_filename="meta.csv",
            file_key="meta.csv-key",
            file_type="csv",
            status="PENDING",
            user=submission.user,
        )
        cloud_upload = SubmissionCloudUpload.objects.create(
            submission=submission,
            meta_data=True,
            file_upload=file_upload,
        )
        return MetadataValidationReport.objects.create(
            submission=submission,
            upload_file=cloud_upload,
            file_md5_checksum="checksum",
        )

    @staticmethod
    def _run(report):
        return validate_metadata_file_countries_task.apply(
            kwargs={"report_id": report.id}
        ).get()

    @patch(_OPENER_PATH)
    def test_validation_successfull(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "The sample1;123;Belly Button;Baltic Sea\nThe sample2;123;Belly Button;Baltic Sea:Usedom\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("SUCCESS", task_report.status)
        self.assertEqual(0, task_report.validationfinding_set.count())

    @patch(_OPENER_PATH)
    def test_missing_col(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener("sample_title;taxon_id;sample_description;\nThe sample;123;München\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("ERROR", finding.status)
        self.assertEqual(1, finding.row)  # header is row 1
        self.assertFalse(finding.column)  # No Column means no index
        self.assertEqual("geographic location (country and/or sea)", finding.column_name)
        self.assertEqual("Column Geographic Location is missing.", finding.message)
        self.assertEqual("Please ensure the column 'geographic location (country and/or sea)' exists and there is a geographic location name set for every row in the column.", finding.help_text)

    @patch(_OPENER_PATH)
    def test_finding_nothing_close(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "The sample;123;Belly Button;Lummerland\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("ERROR", finding.status)
        self.assertEqual(2, finding.row)
        self.assertEqual(4, finding.column)
        self.assertEqual("geographic location (country and/or sea)", finding.column_name)
        self.assertEqual("The Geographic Location 'Lummerland' does not match the ENA-vocabulary (https://www.insdc.org/submitting-standards/geo_loc_name-qualifier-vocabulary/).", finding.message)
        self.assertEqual("Please double check the geografic location Lummerland.", finding.help_text)

    @patch(_OPENER_PATH)
    def test_finding_single_close(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "The sample;123;Belly Button;Baltix Sea\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("ERROR", finding.status)
        self.assertEqual(2, finding.row)
        self.assertEqual(4, finding.column)
        self.assertEqual("geographic location (country and/or sea)", finding.column_name)
        self.assertEqual("The Geographic Location 'Baltix Sea' does not match the ENA-vocabulary (https://www.insdc.org/submitting-standards/geo_loc_name-qualifier-vocabulary/).", finding.message)
        self.assertEqual("Please double check the geografic location Baltix Sea. Did you maybe mean Baltic Sea?", finding.help_text)

    @patch(_OPENER_PATH)
    def test_finding_multiple_close(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "The sample;123;Belly Button;Baltix Ocean\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("ERROR", finding.status)
        self.assertEqual(2, finding.row)
        self.assertEqual(4, finding.column)
        self.assertEqual("geographic location (country and/or sea)", finding.column_name)
        self.assertEqual("The Geographic Location 'Baltix Ocean' does not match the ENA-vocabulary (https://www.insdc.org/submitting-standards/geo_loc_name-qualifier-vocabulary/).", finding.message)
        self.assertEqual("Please double check the geografic location Baltix Ocean. Did you maybe mean one of these: Baltic Sea, Atlantic Ocean, Arctic Ocean?", finding.help_text)

    @patch(_OPENER_PATH)
    def test_finding_location_empty(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "The sample;123;Belly Button;\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("ERROR", finding.status)
        self.assertEqual(2, finding.row)
        self.assertEqual(4, finding.column)
        self.assertEqual("geographic location (country and/or sea)", finding.column_name)
        self.assertEqual("Geographic Location is missing.", finding.message)
        self.assertEqual("Please ensure there is a geographic location name set for every row in column 'geographic location (country and/or sea)'.", finding.help_text)

    @patch(_OPENER_PATH)
    def test_multiple_findings(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "The sample1;123;Belly Button;Baltix Sea\nThe sample2;123;Belly Button;Baltic Sea\nThe sample3;123;Belly Button;Baltix Sea\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        self.assertEqual(2, task_report.validationfinding_set.count())
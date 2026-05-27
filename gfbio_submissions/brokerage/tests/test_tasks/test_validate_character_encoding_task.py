# -*- coding: utf-8 -*-

import io
from unittest.mock import patch

from dt_upload.models import FileUploadRequest

from ...models.metadata_validation_report import MetadataValidationReport
from ...models.submission import Submission
from ...models.submission_cloud_upload import SubmissionCloudUpload
from ...tasks.metadata_tasks.validate_character_encoding_task import (
    validate_character_encoding_task,
)
from .test_tasks_base import TestTasks

HEADER = "sample_title;taxon_id;sample_description\n"

_OPENER_PATH = (
    "gfbio_submissions.brokerage.tasks.metadata_tasks."
    "validate_character_encoding_task.create_submission_file_opener"
)


class _FakeOpener:
    def __init__(self, content):
        self._content = content

    def csv_reader(self, cloud_upload):
        return io.StringIO(self._content)


class _FakeRaisingOpener:
    def csv_reader(self, cloud_upload):
        raise UnicodeDecodeError("utf-8", b"\xff", 0, 1, "invalid start byte")


class _FakeMissingFileOpener:
    def csv_reader(self, cloud_upload):
        raise FileNotFoundError(2, "No such file or directory", "meta.csv-key")


class TestValidateCharacterEncodingTask(TestTasks):
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
        return validate_character_encoding_task.apply(
            kwargs={"report_id": report.id}
        ).get()

    @patch(_OPENER_PATH)
    def test_non_ascii_cell_yields_warning_finding(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "The sample;123;München\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("WARNING", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("WARNING", finding.status)
        self.assertEqual(2, finding.row)  # header is row 1
        self.assertEqual(3, finding.column)  # sample_description, 1-based
        self.assertEqual("sample_description", finding.column_name)
        self.assertIn("München", finding.message)

    @patch(_OPENER_PATH)
    def test_ascii_only_yields_success_without_findings(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "The sample;123;Belly Button\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("SUCCESS", task_report.status)
        self.assertEqual(0, task_report.validationfinding_set.count())

    @patch(_OPENER_PATH)
    def test_undecodable_file_yields_error_finding(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeRaisingOpener()

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("ERROR", finding.status)

    @patch(_OPENER_PATH)
    def test_unreadable_file_yields_error_finding(self, mock_opener):
        # The file is not available on the mounted storage (e.g. cloud upload
        # whose object is not yet present). The task must record an error
        # finding instead of letting the OSError crash the validation chord.
        report = self._create_report()
        mock_opener.return_value = _FakeMissingFileOpener()

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("ERROR", finding.status)
        self.assertIn("could not be opened", finding.message)

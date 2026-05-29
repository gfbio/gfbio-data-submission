# -*- coding: utf-8 -*-
import io
from unittest.mock import patch

from dt_upload.models import FileUploadRequest

from ...models.metadata_validation_report import MetadataValidationReport
from ...models.submission import Submission
from ...models.submission_cloud_upload import SubmissionCloudUpload
from ...tasks.metadata_tasks.check_ena_submittable_taxon_ids_task import (
    check_ena_submittable_taxon_ids_task,
)
from .test_tasks_base import TestTasks

TASK_MODULE = (
    "gfbio_submissions.brokerage.tasks.metadata_tasks."
    "check_ena_submittable_taxon_ids_task"
)


class FakeFileOpener:
    def __init__(self, content):
        self.content = content

    def is_csv(self, cloud_upload):
        return True

    def csv_reader(self, cloud_upload):
        return io.StringIO(self.content)


class TestCheckEnaSubmittableTaxonIdsTask(TestTasks):
    def _create_report(self):
        submission = Submission.objects.first()
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
        return check_ena_submittable_taxon_ids_task.apply(
            kwargs={"report_id": report.id}
        ).get()

    @patch(f"{TASK_MODULE}.check_submittable_taxon_id")
    def test_success_without_findings(self, mock_check):
        report = self._create_report()
        mock_check.return_value = (True, [], True)

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("SUCCESS", task_report.status)
        self.assertEqual(0, task_report.validationfinding_set.count())

    @patch(f"{TASK_MODULE}.check_submittable_taxon_id")
    def test_invalid_taxon_ids_are_reported_as_errors(self, mock_check):
        report = self._create_report()
        mock_check.return_value = (
            False,
            ["Data with the following taxon ids is not submittable: 123,456"],
            True,
        )

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("ERROR", finding.status)
        self.assertEqual("taxon_id", finding.column_name)
        self.assertIn("not submittable", finding.message)

    @patch(f"{TASK_MODULE}.create_submission_file_opener")
    @patch(f"{TASK_MODULE}.check_submittable_taxon_id")
    def test_invalid_taxon_ids_include_row_and_column(self, mock_check, mock_opener):
        report = self._create_report()
        mock_check.return_value = (
            False,
            ["Data with the following taxon ids is not submittable: 123,456"],
            True,
        )
        mock_opener.return_value = FakeFileOpener(
            "sample_title;taxon_id\n"
            "Sample 1;123\n"
            "Sample 2;456\n"
        )

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        findings = list(task_report.validationfinding_set.order_by("row"))
        self.assertEqual(2, len(findings))
        self.assertEqual(2, findings[0].row)
        self.assertEqual(2, findings[0].column)
        self.assertEqual("taxon_id", findings[0].column_name)
        self.assertEqual(3, findings[1].row)
        self.assertIn("123", findings[0].message)
        self.assertIn("456", findings[1].message)

    @patch(f"{TASK_MODULE}.check_submittable_taxon_id")
    def test_not_performed_is_reported_as_warning(self, mock_check):
        report = self._create_report()
        mock_check.return_value = (False, [], False)

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("WARNING", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("WARNING", finding.status)
        self.assertIn("could not be performed", finding.message)

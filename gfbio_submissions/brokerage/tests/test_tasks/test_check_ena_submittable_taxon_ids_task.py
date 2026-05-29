# -*- coding: utf-8 -*-
from unittest.mock import patch

from dt_upload.models import FileUploadRequest

from ...models.metadata_validation_report import MetadataValidationReport
from ...models.submission import Submission
from ...models.submission_cloud_upload import SubmissionCloudUpload
from ...tasks.metadata_tasks.check_ena_submittable_taxon_ids_task import (
    check_ena_submittable_taxon_ids_task,
)
from .test_tasks_base import TestTasks

_CHECK_PATH = (
    "gfbio_submissions.brokerage.tasks.metadata_tasks."
    "check_ena_submittable_taxon_ids_task.check_submittable_taxon_id"
)


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

    @patch(_CHECK_PATH)
    def test_success_without_findings(self, mock_check):
        report = self._create_report()
        mock_check.return_value = (True, [], True)

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("SUCCESS", task_report.status)
        self.assertEqual(0, task_report.validationfinding_set.count())

    @patch(_CHECK_PATH)
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

    @patch(_CHECK_PATH)
    def test_not_performed_is_reported_as_warning(self, mock_check):
        report = self._create_report()
        mock_check.return_value = (False, [], False)

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("WARNING", task_report.status)
        finding = task_report.validationfinding_set.get()
        self.assertEqual("WARNING", finding.status)
        self.assertIn("could not be performed", finding.message)

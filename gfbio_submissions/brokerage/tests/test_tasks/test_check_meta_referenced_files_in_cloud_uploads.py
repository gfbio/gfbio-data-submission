# -*- coding: utf-8 -*-

from unittest.mock import PropertyMock, patch

from dt_upload.models import FileUploadRequest, MultiPartUpload

from ...models.submission import Submission
from ...models.submission_cloud_upload import SubmissionCloudUpload
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_upload_tasks.check_meta_referenced_files_in_cloud_uploads import (
    check_meta_referenced_files_in_cloud_uploads_task,
    generate_jira_message,
)
from .test_tasks_base import TestTasks


class DummyResponse:
    def __init__(self, content=b"dummy"):
        self.content = content

    def raise_for_status(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class TestCheckMetaReferencedFilesInCloudUploads(TestTasks):
    def _create_cloud_upload(self, submission, filename, meta=False, fur_status="COMPLETED", scu_status=SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM):
        fur = FileUploadRequest.objects.create(
            original_filename=filename,
            file_key=f"{filename}-key",
            file_type="fastq" if not meta else "csv",
            user=submission.user,
        )
        MultiPartUpload.objects.create(
            file_upload_request=fur
        )
        fur.status = fur_status
        fur.save()
        scu = SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=False,
            meta_data=meta,
            file_upload=fur,
            status=scu_status,
        )
        return scu

    @patch(
        "gfbio_submissions.brokerage.tasks.submission_upload_tasks.check_meta_referenced_files_in_cloud_uploads.requests.get",
        return_value=DummyResponse(),
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.submission_upload_tasks.check_meta_referenced_files_in_cloud_uploads.parse_molecular_csv_with_encoding_detection"
    )
    def test_success_and_extras(self, mock_parse, _mock_get):
        submission = Submission.objects.first()
        # data uploads
        self._create_cloud_upload(submission, "File3.forward.fastq.gz", meta=False)
        self._create_cloud_upload(submission, "File3.reverse.fastq.gz", meta=False)
        # extra upload not referenced
        self._create_cloud_upload(submission, "unreferenced.fastq.gz", meta=False)
        # meta upload
        meta_upload = self._create_cloud_upload(submission, "meta.csv", meta=True)
        # assign a name so FieldFile considers file present
        meta_upload.file_upload.uploaded_file.name = "meta.csv"

        mock_parse.return_value = {
            "samples": [],
            "experiments": [
                {"files": {"forward_read_file_name": "File3.forward.fastq.gz"}},
                {"files": {"reverse_read_file_name": "File3.reverse.fastq.gz"}},
            ],
        }

        with patch(
            "django.db.models.fields.files.FieldFile.url",
            new_callable=PropertyMock,
            return_value="http://example.test/meta.csv",
        ):
            async_result = check_meta_referenced_files_in_cloud_uploads_task.apply_async(
                kwargs={"submission_id": submission.pk}
            )
        result = async_result.get()

        self.assertIn("found", result)
        self.assertIn("missing", result)
        self.assertIn("extra_uploads", result)
        self.assertEqual(sorted([res['name'] for res in result["found"]]), ["File3.forward.fastq.gz", "File3.reverse.fastq.gz"])
        self.assertEqual(result["missing"], [])
        # meta.csv must not appear as extra upload
        self.assertEqual([res['name'] for res in result["extra_uploads"]], ["unreferenced.fastq.gz"])

    @patch(
        "gfbio_submissions.brokerage.tasks.submission_upload_tasks.check_meta_referenced_files_in_cloud_uploads.requests.get",
        return_value=DummyResponse(),
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.submission_upload_tasks.check_meta_referenced_files_in_cloud_uploads.parse_molecular_csv_with_encoding_detection"
    )
    def test_duplicates_and_missing(self, mock_parse, _mock_get):
        submission = Submission.objects.first()
        # only one of the files is uploaded
        self._create_cloud_upload(submission, "File3.forward.fastq.gz", meta=False)
        # meta upload
        meta_upload = self._create_cloud_upload(submission, "meta.csv", meta=True)
        meta_upload.file_upload.uploaded_file.name = "meta.csv"

        mock_parse.return_value = {
            "samples": [],
            "experiments": [
                {"files": {"forward_read_file_name": "File3.forward.fastq.gz"}},
                {"files": {"reverse_read_file_name": "File3.reverse.fastq.gz"}},
                {"files": {"forward_read_file_name": "File3.forward.fastq.gz"}},
            ],
        }

        with patch(
            "django.db.models.fields.files.FieldFile.url",
            new_callable=PropertyMock,
            return_value="http://example.test/meta.csv",
        ):
            async_result = check_meta_referenced_files_in_cloud_uploads_task.apply_async(
                kwargs={"submission_id": submission.pk}
            )
        result = async_result.get()

        self.assertEqual(result["missing"], ["File3.reverse.fastq.gz"])
        self.assertEqual(result["duplicates_in_csv"], ["File3.forward.fastq.gz"])

    @patch(
        "gfbio_submissions.brokerage.tasks.submission_upload_tasks.check_meta_referenced_files_in_cloud_uploads.requests.get",
        return_value=DummyResponse(),
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.submission_upload_tasks.check_meta_referenced_files_in_cloud_uploads.parse_molecular_csv_with_encoding_detection"
    )
    def test_broken_files(self, mock_parse, _mock_get):
        submission = Submission.objects.first()
        # only one of the files is uploaded
        self._create_cloud_upload(submission, "fu_pending.forward.fastq.gz", fur_status="PENDING")
        self._create_cloud_upload(submission, "fu_failed.reverse.fastq.gz", fur_status="FAILED")
        self._create_cloud_upload(submission, "scu_failed_chksm.reverse.fastq.gz", scu_status=SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM)
        self._create_cloud_upload(submission, "scu_new.reverse.fastq.gz", scu_status=SubmissionCloudUpload.STATUS_NEW)
        self._create_cloud_upload(submission, "scu_transfer_failed.reverse.fastq.gz", scu_status=SubmissionCloudUpload.STATUS_TRANSFER_FAILED)
        self._create_cloud_upload(submission, "scu_transfer_chksm_failed.reverse.fastq.gz", scu_status=SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_BAD_CHECKSUM)
        self._create_cloud_upload(submission, "scu_just_uploaded.reverse.fastq.gz", scu_status=SubmissionCloudUpload.STATUS_UPLOADED)
        # meta upload
        meta_upload = self._create_cloud_upload(submission, "meta.csv", meta=True)
        meta_upload.file_upload.uploaded_file.name = "meta.csv"

        mock_parse.return_value = {
            "samples": [],
            "experiments": [
                {"files": {"forward_read_file_name": "fu_pending.forward.fastq.gz"}},
                {"files": {"reverse_read_file_name": "fu_failed.reverse.fastq.gz"}},
                {"files": {"reverse_read_file_name": "scu_failed_chksm.reverse.fastq.gz"}},
                {"files": {"reverse_read_file_name": "scu_new.reverse.fastq.gz"}},
                {"files": {"reverse_read_file_name": "scu_transfer_failed.reverse.fastq.gz"}},
                {"files": {"reverse_read_file_name": "scu_transfer_chksm_failed.reverse.fastq.gz"}},
                {"files": {"reverse_read_file_name": "scu_just_uploaded.reverse.fastq.gz"}},
            ],
        }

        with patch(
            "django.db.models.fields.files.FieldFile.url",
            new_callable=PropertyMock,
            return_value="http://example.test/meta.csv",
        ):
            async_result = check_meta_referenced_files_in_cloud_uploads_task.apply_async(
                kwargs={"submission_id": submission.pk}
            )
        result = async_result.get()

        self.assertIn("uploads_in_bad_state", result)
        self.assertIn("found_with_problems", result)
        print(result["uploads_in_bad_state"])
        self.assertEqual(result["uploads_in_bad_state"][f"file_upload_state_{FileUploadRequest.FAILED}"], ["fu_failed.reverse.fastq.gz"])
        self.assertEqual(result["uploads_in_bad_state"][f"file_upload_state_{FileUploadRequest.PENDING}"], ["fu_pending.forward.fastq.gz"])
        self.assertEqual(result["found_with_problems"][f"cloud_upload_state_{SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_BAD_CHECKSUM}"], ["scu_transfer_chksm_failed.reverse.fastq.gz"])
        self.assertEqual(result["found_with_problems"][f"cloud_upload_state_{SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM}"], ["scu_failed_chksm.reverse.fastq.gz"])
        self.assertEqual(result["found_with_problems"][f"cloud_upload_state_{SubmissionCloudUpload.STATUS_TRANSFER_FAILED}"], ["scu_transfer_failed.reverse.fastq.gz"])
        self.assertEqual(result["found_with_problems"][f"cloud_upload_state_{SubmissionCloudUpload.STATUS_NEW}"], ["scu_new.reverse.fastq.gz"])
        self.assertEqual(result["found_with_problems"][f"cloud_upload_state_{SubmissionCloudUpload.STATUS_UPLOADED}"], ["scu_just_uploaded.reverse.fastq.gz"])

    def test_no_meta_marks_cancelled(self):
        submission = Submission.objects.first()
        # no meta upload created
        async_result = check_meta_referenced_files_in_cloud_uploads_task.apply_async(
            kwargs={"submission_id": submission.pk}
        )
        self.assertEqual(TaskProgressReport.CANCELLED, async_result.get())

    def test_multiple_meta_marks_cancelled(self):
        submission = Submission.objects.first()
        m1 = self._create_cloud_upload(submission, "meta1.csv", meta=True)
        m2 = self._create_cloud_upload(submission, "meta2.csv", meta=True)
        m1.file_upload.uploaded_file.name = "meta1.csv"
        m2.file_upload.uploaded_file.name = "meta2.csv"
        with patch(
            "django.db.models.fields.files.FieldFile.url",
            new_callable=PropertyMock,
            return_value="http://example.test/meta.csv",
        ):
            async_result = check_meta_referenced_files_in_cloud_uploads_task.apply_async(
                kwargs={"submission_id": submission.pk}
            )
        self.assertEqual(TaskProgressReport.CANCELLED, async_result.get())

    def test_prev_cancelled_short_circuit(self):
        submission = Submission.objects.first()
        async_result = check_meta_referenced_files_in_cloud_uploads_task.apply_async(
            kwargs={"submission_id": submission.pk, "previous_task_result": TaskProgressReport.CANCELLED}
        )
        self.assertEqual(TaskProgressReport.CANCELLED, async_result.get())

    def test_invalid_submission_id(self):
        async_result = check_meta_referenced_files_in_cloud_uploads_task.apply_async(kwargs={"submission_id": 999999})
        self.assertEqual(TaskProgressReport.CANCELLED, async_result.get())

    def test_generate_jira_message(self):
        result = {
            'meta_cloud_upload_name': 'meta.csv',
            'found': ['FileX.fastq.gz'],
            'total_referenced': 4,
            'total_uploaded': 7,
            'missing': ['File1.fastq.gz'],
            'duplicates_in_csv': ['File2.fastq.gz'],
            'found_with_problems': {f"file_upload_state_{FileUploadRequest.FAILED}": ['File3.fastq.gz']},
            'uploads_in_bad_state': {f"cloud_upload_state_{SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_BAD_CHECKSUM}": ['File4.fastq.gz']},
            'extra_uploads': []
        }
        jira_message = generate_jira_message(result)
        self.assertIn("Check for referenced files in csv-meta-file was executed for 'meta.csv' with errors!", jira_message)
        self.assertIn("h4. The following files are referenced multiple times in the csv", jira_message)
        self.assertIn("h4. Files missing (referenced in csv, but were not uploaded or have issues)", jira_message)
        self.assertIn("h4. Some files ran into problems while being processed", jira_message)
        self.assertIn("After transfer to ENA the checksum-check failed:", jira_message)
        self.assertNotIn("Files that were uploaded, but not referenced in the csv", jira_message)
        self.assertIn("Files in csv: 4 | files uploaded: 7", jira_message)
        self.assertIn("File1.fastq.gz", jira_message)
        self.assertIn("File2.fastq.gz", jira_message)
        self.assertIn("File3.fastq.gz", jira_message)
        self.assertIn("File4.fastq.gz", jira_message)
        self.assertNotIn("FileX.fastq.gz", jira_message)
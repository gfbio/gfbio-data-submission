# -*- coding: utf-8 -*-
from unittest.mock import patch

from botocore.exceptions import ClientError
from dt_upload.models import FileUploadRequest

from gfbio_submissions.brokerage.models.jira_queue_message import JiraQueueMessage
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks.process_tasks.verify_file_upload_request_checksum_in_bucket import (
    verify_file_upload_request_checksum_in_bucket_task,
)

from .test_tasks_base import TestTasks

CALCULATE_CHECKSUM_PATH = (
    "gfbio_submissions.brokerage.tasks.process_tasks.verify_file_upload_request_checksum_in_bucket."
    "calculate_checksum_locally"
)
PROVIDED_MD5 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
CALCULATED_MD5 = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"


class TestVerifyFileUploadRequestChecksumInBucket(TestTasks):
    def _create_cloud_upload(self, md5=PROVIDED_MD5, status=SubmissionCloudUpload.STATUS_UPLOADED):
        submission = Submission.objects.first()
        file_upload = FileUploadRequest.objects.create(
            original_filename="sample.fastq.gz",
            file_key="broker-id/sample.fastq.gz",
            file_type="application/gzip",
            md5=md5,
            user=submission.user,
        )
        return SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=file_upload,
            status=status,
        )

    def _run_task(self, submission_cloud_upload):
        return verify_file_upload_request_checksum_in_bucket_task.apply_async(
            kwargs={
                "submission_cloud_upload_id": submission_cloud_upload.pk,
                "submission_id": submission_cloud_upload.submission_id,
            }
        )

    @patch(CALCULATE_CHECKSUM_PATH, return_value=PROVIDED_MD5)
    def test_matching_checksum_updates_status_and_creates_jira_message(self, mock_calculate):
        submission_cloud_upload = self._create_cloud_upload()

        result = self._run_task(submission_cloud_upload)

        self.assertTrue(result.successful())
        mock_calculate.assert_called_once()
        self.assertEqual("md5", mock_calculate.call_args.args[0])
        self.assertEqual(submission_cloud_upload.pk, mock_calculate.call_args.args[1].pk)
        submission_cloud_upload.refresh_from_db()
        self.assertEqual(
            SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM,
            submission_cloud_upload.status,
        )
        message = JiraQueueMessage.objects.get(pk=result.get())
        self.assertEqual(JiraQueueMessage.TYPE_CHECKSUM_CALCULATED, message.type)
        self.assertEqual(submission_cloud_upload.submission_id, message.submission_id)
        self.assertEqual(
            {
                "file_name": "sample.fastq.gz",
                "checksum_missmatched": False,
            },
            message.data,
        )

    @patch(CALCULATE_CHECKSUM_PATH, return_value=CALCULATED_MD5)
    def test_mismatching_checksum_updates_status_and_includes_checksums(self, mock_calculate):
        submission_cloud_upload = self._create_cloud_upload()

        result = self._run_task(submission_cloud_upload)

        self.assertTrue(result.successful())
        mock_calculate.assert_called_once()
        self.assertEqual("md5", mock_calculate.call_args.args[0])
        self.assertEqual(submission_cloud_upload.pk, mock_calculate.call_args.args[1].pk)
        submission_cloud_upload.refresh_from_db()
        self.assertEqual(
            SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM,
            submission_cloud_upload.status,
        )
        message = JiraQueueMessage.objects.get(pk=result.get())
        self.assertEqual(JiraQueueMessage.TYPE_CHECKSUM_CALCULATED, message.type)
        self.assertEqual(
            {
                "file_name": "sample.fastq.gz",
                "checksum_missmatched": True,
                "provided_checksum": PROVIDED_MD5,
                "calculated_checksum": CALCULATED_MD5,
            },
            message.data,
        )

    @patch(CALCULATE_CHECKSUM_PATH, return_value="")
    def test_missing_object_cancels_without_status_change_or_jira_message(self, mock_calculate):
        submission_cloud_upload = self._create_cloud_upload()
        original_status = submission_cloud_upload.status

        result = self._run_task(submission_cloud_upload)

        self.assertTrue(result.successful())
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        mock_calculate.assert_called_once()
        self.assertEqual("md5", mock_calculate.call_args.args[0])
        self.assertEqual(submission_cloud_upload.pk, mock_calculate.call_args.args[1].pk)
        submission_cloud_upload.refresh_from_db()
        self.assertEqual(original_status, submission_cloud_upload.status)
        self.assertFalse(JiraQueueMessage.objects.filter(submission_id=submission_cloud_upload.submission_id).exists())

    @patch(CALCULATE_CHECKSUM_PATH)
    def test_non_404_client_error_propagates(self, mock_calculate):
        error = ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "denied"}, "ResponseMetadata": {"HTTPStatusCode": 403}},
            "GetObject",
        )
        mock_calculate.side_effect = error
        submission_cloud_upload = self._create_cloud_upload()
        original_status = submission_cloud_upload.status

        with self.assertRaises(ClientError) as caught:
            self._run_task(submission_cloud_upload)

        self.assertIs(error, caught.exception)
        submission_cloud_upload.refresh_from_db()
        self.assertEqual(original_status, submission_cloud_upload.status)
        self.assertFalse(JiraQueueMessage.objects.filter(submission_id=submission_cloud_upload.submission_id).exists())

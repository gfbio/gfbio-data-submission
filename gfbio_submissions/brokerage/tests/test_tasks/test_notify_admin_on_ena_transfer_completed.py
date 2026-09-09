# -*- coding: utf-8 -*-
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.conf import settings
from django.test import SimpleTestCase, TestCase
from dt_upload.models import FileUploadRequest, MultiPartUpload

from gfbio_submissions.brokerage.configuration.settings import GFBIO_HELPDESK_TICKET
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.tasks.process_tasks.notify_admin_on_ena_transfer_completed import (
    build_ena_transfer_completion_message,
    notify_admin_on_ena_transfer_completed_task,
)
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User


def _upload(name, status):
    return SimpleNamespace(file_upload=SimpleNamespace(original_filename=name), status=status)


class TestBuildEnaTransferCompletionMessage(SimpleTestCase):
    def setUp(self):
        self.submission = SimpleNamespace(pk=9, broker_submission_id="abc-123")

    def test_lists_successes_and_errors(self):
        uploads = [
            _upload("ok.fastq.gz", SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_CHECKED_CHECKSUM),
            _upload("bad.fastq.gz", SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_BAD_CHECKSUM),
        ]

        message = build_ena_transfer_completion_message(self.submission, uploads)

        self.assertIn("Transfer to ENA for Submission abc-123 executed.", message)
        self.assertIn(f"{settings.HOST_URL_ROOT}/{settings.ADMIN_URL}/brokerage/submission/9/", message)
        self.assertIn("Process ran into problems for 1 file(s):", message)
        self.assertIn("bad.fastq.gz", message)
        self.assertIn("Successfully transmitted:", message)
        self.assertIn("ok.fastq.gz", message)

    def test_lists_error_files_in_given_order(self):
        uploads = [
            _upload("z-last.fastq.gz", SubmissionCloudUpload.STATUS_TRANSFER_FAILED),
            _upload("a-first.fastq.gz", SubmissionCloudUpload.STATUS_TRANSFER_FAILED),
        ]

        message = build_ena_transfer_completion_message(self.submission, uploads)

        self.assertLess(message.index("z-last.fastq.gz"), message.index("a-first.fastq.gz"))

    def test_summarizes_large_success_and_error_lists(self):
        successes = [
            _upload(f"ok-{i}.fastq.gz", SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_CHECKED_CHECKSUM)
            for i in range(50)
        ]
        errors = [_upload(f"bad-{i}.fastq.gz", SubmissionCloudUpload.STATUS_TRANSFER_FAILED) for i in range(50)]

        message = build_ena_transfer_completion_message(self.submission, successes + errors)

        failed_status_name = SubmissionCloudUpload.get_status_name(SubmissionCloudUpload.STATUS_TRANSFER_FAILED)
        self.assertIn("Process ran into problems for 50 file(s):", message)
        self.assertIn(f"File(s) in state {failed_status_name}: 50", message)
        self.assertNotIn(f"File(s) in state {SubmissionCloudUpload.STATUS_TRANSFER_FAILED}: 50", message)
        self.assertIn("ok-0.fastq.gz, ok-1.fastq.gz", message)
        self.assertIn("[... 40 further files ...]", message)
        self.assertIn("ok-49.fastq.gz", message)
        self.assertNotIn("ok-10.fastq.gz", message)


class TestNotifyAdminOnEnaTransferCompletedTask(TestCase):
    def _create_cloud_upload(self, submission, filename, scu_status):
        fur = FileUploadRequest.objects.create(
            original_filename=filename,
            file_key=f"{filename}-key",
            file_type="fastq",
            user=submission.user,
        )
        MultiPartUpload.objects.create(file_upload_request=fur)
        fur.status = "COMPLETED"
        fur.save()
        return SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=fur,
            status=scu_status,
        )

    @patch("gfbio_submissions.brokerage.tasks.process_tasks.notify_admin_on_ena_transfer_completed.JiraClient")
    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.notify_admin_on_ena_transfer_completed."
        "get_submission_and_site_configuration"
    )
    def test_lists_uploads_in_pk_order(self, mock_get_submission, mock_jira_cls):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        site_configuration = SiteConfiguration.objects.create(
            title="Default",
            ena_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
        )
        user = User.objects.create(username="user1", site_configuration=site_configuration)
        submission = Submission.objects.create(
            user=user,
            status="OPEN",
            target="ENA",
            release=False,
            data={},
        )
        submission.additionalreference_set.create(primary=True, reference_key="SAND-1", type=GFBIO_HELPDESK_TICKET)
        older = self._create_cloud_upload(submission, "older.fastq.gz", SubmissionCloudUpload.STATUS_TRANSFER_FAILED)
        newer = self._create_cloud_upload(submission, "newer.fastq.gz", SubmissionCloudUpload.STATUS_TRANSFER_FAILED)
        mock_get_submission.return_value = (submission, site_configuration)
        mock_jira = MagicMock()
        mock_jira.error = None
        mock_jira_cls.return_value = mock_jira

        notify_admin_on_ena_transfer_completed_task.apply(
            kwargs={
                "submission_id": submission.pk,
                "submission_cloud_upload_ids": [newer.pk, older.pk],
            }
        )

        comment_text = mock_jira.add_comment.call_args.kwargs["text"]
        self.assertLess(older.pk, newer.pk)
        self.assertLess(comment_text.index("older.fastq.gz"), comment_text.index("newer.fastq.gz"))

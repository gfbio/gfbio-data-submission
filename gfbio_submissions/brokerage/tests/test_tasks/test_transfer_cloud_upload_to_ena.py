# -*- coding: utf-8 -*-
import signal
import subprocess
from unittest.mock import MagicMock, patch

from billiard.exceptions import SoftTimeLimitExceeded
from django.test import SimpleTestCase
from dt_upload.models import FileUploadRequest, MultiPartUpload

from gfbio_submissions.brokerage.configuration.settings import (
    ENA_ASCP_RATE_LIMIT,
    ENA_CLOUD_UPLOAD_TRANSFER_SOFT_TIME_LIMIT,
    ENA_CLOUD_UPLOAD_TRANSFER_TIME_LIMIT,
)
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena import (
    perform_ascp_file_transfer,
    transfer_cloud_upload_to_ena_task,
)
from gfbio_submissions.generic.models.resource_credential import ResourceCredential

from .test_tasks_base import TestTasks

TRANSFER_MODULE = "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena"


class TestTransferCloudUploadTaskLimits(SimpleTestCase):
    def test_time_limits_apply_only_to_the_transfer_task(self):
        self.assertEqual(4 * 60 * 60, ENA_CLOUD_UPLOAD_TRANSFER_TIME_LIMIT)
        self.assertEqual(4 * 60 * 60 - 5 * 60, ENA_CLOUD_UPLOAD_TRANSFER_SOFT_TIME_LIMIT)
        self.assertEqual(transfer_cloud_upload_to_ena_task.time_limit, ENA_CLOUD_UPLOAD_TRANSFER_TIME_LIMIT)
        self.assertEqual(
            transfer_cloud_upload_to_ena_task.soft_time_limit,
            ENA_CLOUD_UPLOAD_TRANSFER_SOFT_TIME_LIMIT,
        )
        self.assertLess(
            transfer_cloud_upload_to_ena_task.soft_time_limit,
            transfer_cloud_upload_to_ena_task.time_limit,
        )


class TestPerformAscpFileTransfer(TestTasks):
    def setUp(self):
        super().setUp()
        self.aspera = ResourceCredential.objects.create(
            title="ena-aspera",
            url="aspera.example.test",
            username="ena-user",
            password="ena-secret",
        )
        self.default_site_config.ena_aspera_server = self.aspera
        self.default_site_config.save()
        self.submission = Submission.objects.first()
        self.cloud_upload = self._create_cloud_upload("sample.fastq.gz")
        self.log_change = patch(
            "gfbio_submissions.brokerage.models.submission_cloud_upload.SubmissionCloudUpload.log_change"
        )
        self.log_change.start()
        self.addCleanup(self.log_change.stop)

    def _create_cloud_upload(self, filename):
        fur = FileUploadRequest.objects.create(
            original_filename=filename,
            file_key=f"{filename}-key",
            file_type="fastq",
            user=self.submission.user,
        )
        MultiPartUpload.objects.create(file_upload_request=fur)
        fur.status = "COMPLETED"
        fur.save()
        return SubmissionCloudUpload.objects.create(
            submission=self.submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=fur,
            status=SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM,
        )

    def _task(self):
        task = MagicMock()
        task.request.id = "ascp-task"
        task.request.retries = 0
        return task

    def _proc(self, returncode=0, poll_result=0, communicate_side_effect=None):
        proc = MagicMock()
        proc.pid = 4321
        proc.returncode = returncode
        proc.poll.return_value = poll_result
        if communicate_side_effect is not None:
            proc.communicate.side_effect = communicate_side_effect
        else:
            proc.communicate.return_value = (b"stdout", b"")
        return proc

    def _perform(self):
        return perform_ascp_file_transfer(
            self._task(),
            "/mnt/s3bucket/sample.fastq.gz",
            self.default_site_config,
            self.submission,
            self.cloud_upload,
            self.submission.user.pk,
            MagicMock(),
        )

    @patch(f"{TRANSFER_MODULE}.os.killpg")
    @patch(f"{TRANSFER_MODULE}.subprocess.Popen")
    def test_ascp_uses_size_compare_and_skips_kill_after_exit(self, mock_popen, mock_killpg):
        mock_popen.return_value = self._proc()

        result = self._perform()

        self.assertIs(result, True)
        cmd = mock_popen.call_args.args[0]
        self.assertIn("-k", cmd)
        self.assertEqual("1", cmd[cmd.index("-k") + 1])
        self.assertEqual(ENA_ASCP_RATE_LIMIT, cmd[cmd.index("-l") + 1])
        self.assertTrue(mock_popen.call_args.kwargs["start_new_session"])
        mock_killpg.assert_not_called()

    @patch(f"{TRANSFER_MODULE}.os.killpg")
    @patch(f"{TRANSFER_MODULE}.subprocess.Popen")
    def test_terminates_process_group_when_ascp_still_running(self, mock_popen, mock_killpg):
        proc = self._proc(poll_result=None)
        proc.wait.side_effect = subprocess.TimeoutExpired(cmd="ascp", timeout=5)
        mock_popen.return_value = proc

        result = self._perform()

        self.assertIs(result, True)
        self.assertEqual(
            [(4321, signal.SIGTERM), (4321, signal.SIGKILL)],
            [call.args for call in mock_killpg.call_args_list],
        )

    @patch(f"{TRANSFER_MODULE}.os.killpg")
    @patch(f"{TRANSFER_MODULE}.subprocess.Popen", side_effect=OSError("ascp missing"))
    def test_popen_failure_leaves_proc_unset_and_raises_original_error(self, _mock_popen, mock_killpg):
        with self.assertRaises(OSError):
            self._perform()

        mock_killpg.assert_not_called()
        self.cloud_upload.refresh_from_db()
        self.assertEqual(SubmissionCloudUpload.STATUS_TRANSFER_FAILED, self.cloud_upload.status)

    @patch(f"{TRANSFER_MODULE}.os.killpg")
    @patch(f"{TRANSFER_MODULE}.subprocess.Popen")
    def test_soft_time_limit_kills_ascp_marks_failed_and_propagates(self, mock_popen, mock_killpg):
        proc = self._proc(poll_result=None, communicate_side_effect=SoftTimeLimitExceeded())
        proc.wait.side_effect = subprocess.TimeoutExpired(cmd="ascp", timeout=5)
        mock_popen.return_value = proc

        with self.assertRaises(SoftTimeLimitExceeded):
            self._perform()

        self.cloud_upload.refresh_from_db()
        self.assertEqual(SubmissionCloudUpload.STATUS_TRANSFER_FAILED, self.cloud_upload.status)
        self.assertEqual(
            [(4321, signal.SIGTERM), (4321, signal.SIGKILL)],
            [call.args for call in mock_killpg.call_args_list],
        )


class TestTransferCloudUploadChecksumFlag(TestTasks):
    def setUp(self):
        super().setUp()
        aspera = ResourceCredential.objects.create(
            title="ena-aspera-task",
            url="aspera.example.test",
            username="ena-user",
            password="ena-secret",
        )
        self.default_site_config.ena_aspera_server = aspera
        self.default_site_config.save()
        self.submission = Submission.objects.first()
        fur = FileUploadRequest.objects.create(
            original_filename="sample.fastq.gz",
            file_key="sample.fastq.gz-key",
            file_type="fastq",
            user=self.submission.user,
        )
        MultiPartUpload.objects.create(file_upload_request=fur)
        fur.status = "COMPLETED"
        fur.save()
        self.cloud_upload = SubmissionCloudUpload.objects.create(
            submission=self.submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=fur,
            status=SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM,
        )
        self.log_change = patch(
            "gfbio_submissions.brokerage.models.submission_cloud_upload.SubmissionCloudUpload.log_change"
        )
        self.log_change.start()
        self.addCleanup(self.log_change.stop)

    def _run_task(self, checksum_enabled):
        proc = MagicMock()
        proc.pid = 99
        proc.returncode = 0
        proc.poll.return_value = 0
        proc.communicate.return_value = (b"", b"")
        with (
            patch(f"{TRANSFER_MODULE}.ENA_POST_TRANSFER_CHECKSUM_ENABLED", checksum_enabled),
            patch(f"{TRANSFER_MODULE}.os.path.exists", return_value=True),
            patch(f"{TRANSFER_MODULE}.ensure_folder_with_keep"),
            patch(f"{TRANSFER_MODULE}.subprocess.Popen", return_value=proc),
            patch(f"{TRANSFER_MODULE}.check_checksum_via_ftp") as mock_checksum,
        ):
            result = transfer_cloud_upload_to_ena_task.apply(
                kwargs={
                    "submission_cloud_upload_id": self.cloud_upload.pk,
                    "submission_id": self.submission.pk,
                    "user_id": self.submission.user.pk,
                }
            ).get()
        self.cloud_upload.refresh_from_db()
        return result, mock_checksum

    def test_skips_ftp_checksum_when_disabled(self):
        result, mock_checksum = self._run_task(False)

        self.assertIs(result, True)
        mock_checksum.assert_not_called()
        self.assertEqual(SubmissionCloudUpload.STATUS_IS_TRANSFERRED, self.cloud_upload.status)

    def test_runs_ftp_checksum_when_enabled(self):
        result, mock_checksum = self._run_task(True)

        self.assertIs(result, True)
        mock_checksum.assert_called_once()
        self.assertEqual(self.cloud_upload, mock_checksum.call_args.args[3])
        self.assertEqual(SubmissionCloudUpload.STATUS_IS_TRANSFERRED, self.cloud_upload.status)

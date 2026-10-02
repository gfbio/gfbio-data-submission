# -*- coding: utf-8 -*-
import os
import signal
import subprocess
import sys
import tempfile
import time
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
    _ASCP_PARENT_DEATH_LAUNCHER,
    _ascp_launch_command,
    perform_ascp_file_transfer,
    transfer_cloud_upload_to_ena_task,
)
from gfbio_submissions.generic.models.resource_credential import ResourceCredential

from .test_tasks_base import TestTasks

TRANSFER_MODULE = "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena"


def _process_is_alive(pid):
    """A zombie is not alive. PID 1 in the test container does not reap it."""
    try:
        with open(f"/proc/{pid}/stat") as stat:
            state = stat.read().split(")", 1)[1].split()[0]
    except FileNotFoundError:
        return False
    return state != "Z"


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


class TestAscpParentDeathLauncher(SimpleTestCase):
    def test_launcher_requests_sigterm_when_its_parent_dies(self):
        # PR_GET_PDEATHSIG is 2. The value is read in the exec'd process, so it
        # survived replacing the launcher with the target program.
        probe = (
            "import ctypes, signal, sys\n"
            "libc = ctypes.CDLL('libc.so.6')\n"
            "signum = ctypes.c_int()\n"
            "if libc.prctl(2, ctypes.byref(signum)) != 0:\n"
            "    sys.exit(2)\n"
            "sys.exit(0 if signum.value == signal.SIGTERM else 3)\n"
        )
        completed = subprocess.run(
            _ascp_launch_command([sys.executable, "-c", probe]),
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )

        self.assertEqual(0, completed.returncode, completed.stderr)

    def test_child_exits_when_parent_is_killed(self):
        parent_code = (
            "import os, signal, subprocess, sys, time\n"
            "child = subprocess.Popen(\n"
            "    [sys.executable, '-c', sys.argv[1], 'sleep', '60'],\n"
            "    start_new_session=True,\n"
            ")\n"
            "open(sys.argv[2], 'w').write(str(child.pid))\n"
            "time.sleep(0.5)\n"
            "os.kill(os.getpid(), signal.SIGKILL)\n"
        )
        with tempfile.NamedTemporaryFile() as pid_file:
            parent = subprocess.Popen(
                [sys.executable, "-c", parent_code, _ASCP_PARENT_DEATH_LAUNCHER, pid_file.name]
            )
            parent.wait(timeout=30)
            pid_file.seek(0)
            child_pid = int(pid_file.read())

        deadline = time.monotonic() + 5
        still_alive = True
        while time.monotonic() < deadline:
            if not _process_is_alive(child_pid):
                still_alive = False
                break
            time.sleep(0.1)
        if still_alive:
            os.kill(child_pid, signal.SIGKILL)
        self.assertFalse(still_alive)
        self.assertNotEqual(0, parent.returncode)


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
        launch_cmd = mock_popen.call_args.args[0]
        self.assertEqual(launch_cmd[:3], [sys.executable, "-c", _ASCP_PARENT_DEATH_LAUNCHER])
        cmd = launch_cmd[3:]
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

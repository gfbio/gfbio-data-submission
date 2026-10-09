# -*- coding: utf-8 -*-
import os
import signal
import subprocess
import sys
import tempfile
import time
from unittest.mock import MagicMock, patch

from billiard.exceptions import SoftTimeLimitExceeded
from celery.exceptions import Retry
from django.test import SimpleTestCase
from dt_upload.models import FileUploadRequest, MultiPartUpload

from gfbio_submissions.brokerage.configuration.settings import (
    ENA_ASCP_AUTH_RETRY_BACKOFF_SECONDS,
    ENA_ASCP_RATE_LIMIT,
    ENA_CLOUD_UPLOAD_TRANSFER_SOFT_TIME_LIMIT,
    ENA_CLOUD_UPLOAD_TRANSFER_TIME_LIMIT,
    SUBMISSION_RETRY_DELAY,
)
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena import (
    _ASCP_PARENT_DEATH_LAUNCHER,
    _ascp_launch_command,
    perform_ascp_file_transfer,
    transfer_cloud_upload_to_ena_task,
)
from gfbio_submissions.generic.models.request_log import RequestLog
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
            parent = subprocess.Popen([sys.executable, "-c", parent_code, _ASCP_PARENT_DEATH_LAUNCHER, pid_file.name])
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
        log_change_patcher = patch(
            "gfbio_submissions.brokerage.models.submission_cloud_upload.SubmissionCloudUpload.log_change"
        )
        self.log_change = log_change_patcher.start()
        self.addCleanup(log_change_patcher.stop)

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

    def _task(self, retries=0, kwargs=None):
        task = MagicMock()
        task.request.id = "ascp-task"
        task.request.retries = retries
        task.request.kwargs = {} if kwargs is None else kwargs
        task.retry.side_effect = Retry
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

    def _perform(self, auth_retry_count=0, retries=0, kwargs=None, report=None, task=None):
        if report is None:
            report = MagicMock()
        if task is None:
            task = self._task(retries=retries, kwargs=kwargs)
        return perform_ascp_file_transfer(
            task,
            "/mnt/s3bucket/sample.fastq.gz",
            self.default_site_config,
            self.submission,
            self.cloud_upload,
            self.submission.user.pk,
            report,
            auth_retry_count=auth_retry_count,
        )

    def _transfer_with_stderr(self, stderr, auth_retry_count=0, retries=0, request_kwargs=None):
        task = self._task(retries=retries, kwargs=request_kwargs)
        report = MagicMock()
        proc = self._proc(returncode=1)
        proc.communicate.return_value = (b"", stderr)
        with (
            patch(f"{TRANSFER_MODULE}.os.killpg"),
            patch(f"{TRANSFER_MODULE}.subprocess.Popen", return_value=proc),
        ):
            try:
                result = perform_ascp_file_transfer(
                    task,
                    "/mnt/s3bucket/sample.fastq.gz",
                    self.default_site_config,
                    self.submission,
                    self.cloud_upload,
                    self.submission.user.pk,
                    report,
                    auth_retry_count=auth_retry_count,
                )
            except Exception as exc:
                return exc, task, report, None
        return None, task, report, result

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

    def test_auth_failure_retries_without_changing_upload_status(self):
        request_kwargs = {"submission_id": self.submission.pk, "user_id": self.submission.user.pk}
        logs_before = RequestLog.objects.filter(submission_id=self.submission.broker_submission_id).count()

        exc, task, _report, result = self._transfer_with_stderr(
            b"Session Failed to Authenticate",
            auth_retry_count=0,
            retries=0,
            request_kwargs=request_kwargs,
        )

        self.assertIsInstance(exc, Retry)
        self.assertIsNone(result)
        retry_kwargs = task.retry.call_args.kwargs
        self.assertEqual(300, retry_kwargs["countdown"])
        self.assertEqual(ENA_ASCP_AUTH_RETRY_BACKOFF_SECONDS[0], retry_kwargs["countdown"])
        self.assertEqual(1, retry_kwargs["max_retries"])
        self.assertEqual(self.submission.pk, retry_kwargs["kwargs"]["submission_id"])
        self.assertEqual(self.submission.user.pk, retry_kwargs["kwargs"]["user_id"])
        self.assertEqual(1, retry_kwargs["kwargs"]["auth_retry_count"])
        self.assertNotIn("auth_retry_count", request_kwargs)
        self.cloud_upload.refresh_from_db()
        self.assertEqual(SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM, self.cloud_upload.status)
        self.log_change.assert_not_called()
        logs_after = RequestLog.objects.filter(submission_id=self.submission.broker_submission_id).count()
        self.assertEqual(logs_before + 1, logs_after)

    def test_auth_retry_backoff_uses_counter_before_increment(self):
        cases = (
            (1, 900, 2),
            (2, 1800, 3),
            (3, 3600, 4),
        )
        for auth_retry_count, countdown, next_count in cases:
            with self.subTest(auth_retry_count=auth_retry_count):
                self.log_change.reset_mock()
                request_kwargs = {
                    "submission_id": self.submission.pk,
                    "auth_retry_count": auth_retry_count,
                }
                exc, task, _report, result = self._transfer_with_stderr(
                    b"failed to authenticate",
                    auth_retry_count=auth_retry_count,
                    retries=auth_retry_count,
                    request_kwargs=request_kwargs,
                )

                self.assertIsInstance(exc, Retry)
                self.assertIsNone(result)
                retry_kwargs = task.retry.call_args.kwargs
                self.assertEqual(countdown, retry_kwargs["countdown"])
                self.assertEqual(ENA_ASCP_AUTH_RETRY_BACKOFF_SECONDS[auth_retry_count], retry_kwargs["countdown"])
                self.assertEqual(auth_retry_count + 1, retry_kwargs["max_retries"])
                self.assertEqual(self.submission.pk, retry_kwargs["kwargs"]["submission_id"])
                self.assertEqual(next_count, retry_kwargs["kwargs"]["auth_retry_count"])
                self.cloud_upload.refresh_from_db()
                self.assertEqual(
                    SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM,
                    self.cloud_upload.status,
                )
                self.log_change.assert_not_called()

    def test_exhausted_auth_retries_cancel_without_network_retry(self):
        report = MagicMock()
        task = self._task(
            retries=4,
            kwargs={"submission_id": self.submission.pk, "auth_retry_count": 4},
        )
        proc = self._proc(returncode=1)
        proc.communicate.return_value = (b"", b"failed to authenticate: timeout")
        with (
            patch(f"{TRANSFER_MODULE}.os.killpg"),
            patch(f"{TRANSFER_MODULE}.subprocess.Popen", return_value=proc),
        ):
            result = perform_ascp_file_transfer(
                task,
                "/mnt/s3bucket/sample.fastq.gz",
                self.default_site_config,
                self.submission,
                self.cloud_upload,
                self.submission.user.pk,
                report,
                auth_retry_count=4,
            )

        task.retry.assert_not_called()
        self.assertEqual(TaskProgressReport.CANCELLED, result)
        self.assertIn("Bad response from Aspera", report.task_exception)
        self.cloud_upload.refresh_from_db()
        self.assertEqual(SubmissionCloudUpload.STATUS_TRANSFER_FAILED, self.cloud_upload.status)
        self.log_change.assert_called()

    def test_auth_match_wins_over_timeout_pattern(self):
        exc, task, _report, result = self._transfer_with_stderr(
            b"failed to authenticate: timeout",
            auth_retry_count=0,
            retries=0,
            request_kwargs={"submission_id": self.submission.pk},
        )

        self.assertIsInstance(exc, Retry)
        self.assertIsNone(result)
        self.assertEqual(300, task.retry.call_args.kwargs["countdown"])
        self.assertEqual(1, task.retry.call_args.kwargs["kwargs"]["auth_retry_count"])
        self.cloud_upload.refresh_from_db()
        self.assertEqual(SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM, self.cloud_upload.status)
        self.log_change.assert_not_called()

    def test_network_failure_retries_on_remaining_budget(self):
        exc, task, _report, result = self._transfer_with_stderr(
            b"failed to connect",
            auth_retry_count=4,
            retries=4,
            request_kwargs={"submission_id": self.submission.pk, "auth_retry_count": 4},
        )

        self.assertIsInstance(exc, Retry)
        self.assertIsNone(result)
        self.assertEqual(1, task.retry.call_count)
        retry_kwargs = task.retry.call_args.kwargs
        self.assertEqual(SUBMISSION_RETRY_DELAY, retry_kwargs["countdown"])
        self.assertEqual(5, retry_kwargs["max_retries"])
        self.assertNotIn("kwargs", retry_kwargs)
        self.cloud_upload.refresh_from_db()
        self.assertEqual(SubmissionCloudUpload.STATUS_TRANSFER_FAILED, self.cloud_upload.status)

    def test_network_failure_still_retries_when_one_network_attempt_remains(self):
        exc, task, _report, result = self._transfer_with_stderr(
            b"failed to connect",
            auth_retry_count=4,
            retries=5,
            request_kwargs={"submission_id": self.submission.pk, "auth_retry_count": 4},
        )

        self.assertIsInstance(exc, Retry)
        self.assertIsNone(result)
        retry_kwargs = task.retry.call_args.kwargs
        self.assertEqual(SUBMISSION_RETRY_DELAY, retry_kwargs["countdown"])
        self.assertEqual(6, retry_kwargs["max_retries"])
        self.assertNotIn("kwargs", retry_kwargs)
        self.cloud_upload.refresh_from_db()
        self.assertEqual(SubmissionCloudUpload.STATUS_TRANSFER_FAILED, self.cloud_upload.status)

    def test_network_failure_raises_when_budget_is_empty(self):
        cases = (
            (6, 4),
            (2, 0),
        )
        for retries, auth_retry_count in cases:
            with self.subTest(retries=retries, auth_retry_count=auth_retry_count):
                self.cloud_upload.status = SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM
                self.cloud_upload.save()
                exc, task, _report, result = self._transfer_with_stderr(
                    b"failed to connect",
                    auth_retry_count=auth_retry_count,
                    retries=retries,
                    request_kwargs={"submission_id": self.submission.pk},
                )

                self.assertIsNone(result)
                self.assertIs(type(exc), Exception)
                self.assertIn("failed to connect", str(exc))
                task.retry.assert_not_called()
                self.cloud_upload.refresh_from_db()
                self.assertEqual(SubmissionCloudUpload.STATUS_TRANSFER_FAILED, self.cloud_upload.status)


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

    def _apply_with_patched_transfer(self, extra_kwargs=None, task_id=None, perform_side_effect=None):
        kwargs = {
            "submission_cloud_upload_id": self.cloud_upload.pk,
            "submission_id": self.submission.pk,
            "user_id": self.submission.user.pk,
        }
        if extra_kwargs:
            kwargs.update(extra_kwargs)
        perform_patch_kwargs = {"return_value": True}
        if perform_side_effect is not None:
            perform_patch_kwargs = {"side_effect": perform_side_effect}
        with (
            patch(f"{TRANSFER_MODULE}.os.path.exists", return_value=True),
            patch(f"{TRANSFER_MODULE}.ensure_folder_with_keep"),
            patch(f"{TRANSFER_MODULE}.perform_ascp_file_transfer", **perform_patch_kwargs) as mock_perform,
        ):
            result = transfer_cloud_upload_to_ena_task.apply(kwargs=kwargs, task_id=task_id).get()
        return result, mock_perform

    def test_forwards_auth_retry_count_to_ascp_transfer(self):
        _result, mock_perform = self._apply_with_patched_transfer(extra_kwargs={"auth_retry_count": 2})

        self.assertEqual(2, mock_perform.call_args.kwargs["auth_retry_count"])

    def test_defaults_auth_retry_count_when_omitted(self):
        _result, mock_perform = self._apply_with_patched_transfer()

        self.assertEqual(0, mock_perform.call_args.kwargs["auth_retry_count"])

    def test_marks_progress_report_running_when_transfer_starts(self):
        task_id = "38643864-3864-3864-3864-386438643864"
        TaskProgressReport.objects.create(
            task_id=task_id,
            task_name="tasks.transfer_cloud_upload_to_ena_task",
            status="RETRY",
        )
        captured = {}

        def _read_report(*args, **kwargs):
            report = TaskProgressReport.objects.get(task_id=task_id)
            captured["status"] = report.status
            captured["submission_id"] = report.submission_id
            captured["task_kwargs"] = report.task_kwargs
            return True

        result, _mock_perform = self._apply_with_patched_transfer(task_id=task_id, perform_side_effect=_read_report)

        self.assertIs(result, True)
        self.assertEqual(TaskProgressReport.RUNNING, captured["status"])
        self.assertEqual(self.submission.pk, captured["submission_id"])
        self.assertIn("submission_cloud_upload_id", captured["task_kwargs"])
        self.assertIn(str(self.cloud_upload.pk), captured["task_kwargs"])

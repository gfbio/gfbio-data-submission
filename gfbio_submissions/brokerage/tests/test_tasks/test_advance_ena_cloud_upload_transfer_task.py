# -*- coding: utf-8 -*-
from unittest.mock import MagicMock, patch

from celery.exceptions import Retry
from django.core.cache import cache
from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_DELAY
from gfbio_submissions.brokerage.exceptions.transfer_exceptions import TransferServerError
from gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena import (
    acquire_ena_transfer_lock,
    advance_ena_cloud_upload_transfer_task,
    ena_transfer_lock_key,
    release_ena_transfer_lock,
)


class TestAdvanceEnaCloudUploadTransferTask(TestCase):
    def setUp(self):
        super().setUp()
        cache.clear()

    def tearDown(self):
        cache.clear()
        super().tearDown()

    def _run_dispatcher(self, **kwargs):
        defaults = {
            "submission_id": 1,
            "submission_cloud_upload_ids": [10, 20],
            "user_id": 5,
            "index": 0,
            "lock_token": "test-lock-token",
        }
        defaults.update(kwargs)
        return advance_ena_cloud_upload_transfer_task.apply(kwargs=defaults)

    def _continuation_kwargs(self, signature):
        return {
            "index": signature.kwargs["index"],
            "lock_token": signature.kwargs["lock_token"],
            "submission_cloud_upload_ids": signature.kwargs["submission_cloud_upload_ids"],
            "submission_id": signature.kwargs["submission_id"],
            "user_id": signature.kwargs["user_id"],
        }

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "notify_admin_on_ena_transfer_completed_task.si"
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "transfer_cloud_upload_to_ena_task.si"
    )
    def test_schedules_one_transfer_with_continue_on_error_links(self, mock_transfer_si, mock_notify_si):
        transfer_sig = MagicMock()
        mock_transfer_si.return_value = transfer_sig

        self._run_dispatcher()

        mock_transfer_si.assert_called_once_with(
            submission_cloud_upload_id=10,
            submission_id=1,
            user_id=5,
        )
        mock_notify_si.assert_not_called()
        transfer_sig.apply_async.assert_called_once()
        call_kwargs = transfer_sig.apply_async.call_args.kwargs
        link = call_kwargs["link"]
        link_error = call_kwargs["link_error"]
        self.assertTrue(link.immutable)
        self.assertTrue(link_error.immutable)
        self.assertEqual(advance_ena_cloud_upload_transfer_task.name, link.task)
        self.assertEqual(self._continuation_kwargs(link), self._continuation_kwargs(link_error))
        self.assertEqual(1, link.kwargs["index"])
        self.assertEqual([10, 20], link.kwargs["submission_cloud_upload_ids"])
        self.assertEqual("test-lock-token", link.kwargs["lock_token"])
        self.assertNotIn("link", link.options)
        self.assertNotIn("link_error", link.options)
        self.assertNotIn("chain", link.options)

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "notify_admin_on_ena_transfer_completed_task.si"
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "transfer_cloud_upload_to_ena_task.si"
    )
    def test_success_and_error_links_advance_to_next_file(self, mock_transfer_si, mock_notify_si):
        transfer_sig = MagicMock()
        mock_transfer_si.return_value = transfer_sig
        self._run_dispatcher()
        link = transfer_sig.apply_async.call_args.kwargs["link"]
        link_error = transfer_sig.apply_async.call_args.kwargs["link_error"]

        mock_transfer_si.reset_mock()
        mock_transfer_si.return_value = MagicMock()
        link.apply()
        mock_transfer_si.assert_called_once_with(
            submission_cloud_upload_id=20,
            submission_id=1,
            user_id=5,
        )

        mock_transfer_si.reset_mock()
        mock_transfer_si.return_value = MagicMock()
        link_error.apply()
        mock_transfer_si.assert_called_once_with(
            submission_cloud_upload_id=20,
            submission_id=1,
            user_id=5,
        )
        mock_notify_si.assert_not_called()

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "notify_admin_on_ena_transfer_completed_task.si"
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "transfer_cloud_upload_to_ena_task.si"
    )
    def test_notifies_once_at_end_and_releases_lock(self, mock_transfer_si, mock_notify_si):
        notify_sig = MagicMock()
        mock_notify_si.return_value = notify_sig
        token = acquire_ena_transfer_lock(1)
        self.assertTrue(token)

        self._run_dispatcher(index=2, lock_token=token)

        mock_transfer_si.assert_not_called()
        mock_notify_si.assert_called_once_with(
            submission_id=1,
            submission_cloud_upload_ids=[10, 20],
        )
        notify_sig.apply_async.assert_called_once_with(countdown=SUBMISSION_DELAY)
        self.assertIsNone(cache.get(ena_transfer_lock_key(1)))

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "notify_admin_on_ena_transfer_completed_task.si"
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "transfer_cloud_upload_to_ena_task.si"
    )
    def test_empty_upload_list_does_not_schedule_transfer(self, mock_transfer_si, mock_notify_si):
        notify_sig = MagicMock()
        mock_notify_si.return_value = notify_sig

        self._run_dispatcher(submission_cloud_upload_ids=[], index=0)

        mock_transfer_si.assert_not_called()
        mock_notify_si.assert_called_once_with(
            submission_id=1,
            submission_cloud_upload_ids=[],
        )
        notify_sig.apply_async.assert_called_once_with(countdown=SUBMISSION_DELAY)

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "notify_admin_on_ena_transfer_completed_task.si"
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "transfer_cloud_upload_to_ena_task.si"
    )
    def test_failed_schedule_raises_transfer_server_error(self, mock_transfer_si, mock_notify_si):
        transfer_sig = MagicMock()
        transfer_sig.apply_async.side_effect = ConnectionError("broker down")
        mock_transfer_si.return_value = transfer_sig

        with self.assertRaises((TransferServerError, Retry)):
            self._run_dispatcher()
        mock_notify_si.assert_not_called()

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "notify_admin_on_ena_transfer_completed_task.si"
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "transfer_cloud_upload_to_ena_task.si"
    )
    def test_non_broker_exception_is_not_wrapped(self, mock_transfer_si, mock_notify_si):
        transfer_sig = MagicMock()
        transfer_sig.apply_async.side_effect = RuntimeError("not a broker error")
        mock_transfer_si.return_value = transfer_sig

        with self.assertRaises(RuntimeError):
            self._run_dispatcher()
        mock_notify_si.assert_not_called()

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "notify_admin_on_ena_transfer_completed_task.si"
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "transfer_cloud_upload_to_ena_task.si"
    )
    def test_failed_notify_keeps_lock(self, mock_transfer_si, mock_notify_si):
        notify_sig = MagicMock()
        notify_sig.apply_async.side_effect = ConnectionError("broker down")
        mock_notify_si.return_value = notify_sig
        token = acquire_ena_transfer_lock(1)
        self.assertTrue(token)

        with self.assertRaises((TransferServerError, Retry)):
            self._run_dispatcher(index=2, lock_token=token)

        self.assertEqual(token, cache.get(ena_transfer_lock_key(1)))

    def test_second_acquire_returns_none_while_lock_held(self):
        token = acquire_ena_transfer_lock(1)
        self.assertTrue(token)
        self.assertIsNone(acquire_ena_transfer_lock(1))
        self.assertEqual(token, cache.get(ena_transfer_lock_key(1)))

    def test_release_lock_only_when_token_matches(self):
        token_a = acquire_ena_transfer_lock(1)
        self.assertTrue(token_a)
        cache.set(ena_transfer_lock_key(1), "token-b")
        release_ena_transfer_lock(1, token_a)
        self.assertEqual("token-b", cache.get(ena_transfer_lock_key(1)))
        release_ena_transfer_lock(1, "token-b")
        self.assertIsNone(cache.get(ena_transfer_lock_key(1)))

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "notify_admin_on_ena_transfer_completed_task.si"
    )
    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.transfer_cloud_upload_to_ena."
        "transfer_cloud_upload_to_ena_task.si"
    )
    def test_terminal_dispatcher_error_releases_lock(self, mock_transfer_si, mock_notify_si):
        transfer_sig = MagicMock()
        transfer_sig.apply_async.side_effect = RuntimeError("programming error")
        mock_transfer_si.return_value = transfer_sig
        token = acquire_ena_transfer_lock(1)
        self.assertTrue(token)
        lock_key = ena_transfer_lock_key(1)

        with self.assertRaises(RuntimeError):
            self._run_dispatcher(lock_token=token)

        if cache.get(lock_key) == token:
            advance_ena_cloud_upload_transfer_task.on_failure(
                RuntimeError("programming error"),
                "task-id",
                (),
                {"submission_id": 1, "lock_token": token},
                None,
            )
        self.assertIsNone(cache.get(lock_key))

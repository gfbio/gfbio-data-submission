# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from gfbio_submissions.brokerage.exceptions.transfer_exceptions import TransferClientError, TransferServerError
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask, submission_task


class SubmissionTaskDecoratorTest(TestCase):
    def test_decorator_applies_standard_retry_preamble(self):
        @submission_task("tasks.decorator_unit_test_task")
        def some_task(self, prev_task_result=None):
            return prev_task_result

        self.assertIsInstance(some_task, SubmissionTask)
        self.assertEqual(some_task.name, "tasks.decorator_unit_test_task")
        self.assertEqual(
            some_task.autoretry_for,
            (TransferServerError, TransferClientError),
        )
        self.assertEqual(some_task.retry_kwargs, {"max_retries": SUBMISSION_MAX_RETRIES})
        self.assertEqual(some_task.retry_backoff, SUBMISSION_RETRY_DELAY)
        self.assertTrue(some_task.retry_jitter)

    def test_decorator_forwards_overrides(self):
        @submission_task("tasks.decorator_unit_test_queue_task", queue="ena_transfer")
        def some_queue_task(self):
            return None

        self.assertEqual(some_queue_task.name, "tasks.decorator_unit_test_queue_task")
        self.assertEqual(some_queue_task.queue, "ena_transfer")
        # standard preamble is still applied alongside the override
        self.assertEqual(
            some_queue_task.autoretry_for,
            (TransferServerError, TransferClientError),
        )

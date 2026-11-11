# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.users.models import User

from ...models.submission import IllegalStatusTransition, Submission


class SubmissionTransitionTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create(username="transition_user")

    def _submission(self, status=Submission.OPEN):
        submission = Submission.objects.create(user=self.user)
        if status != Submission.OPEN:
            # bypass the guarded interface to seed an arbitrary source state
            Submission.objects.filter(pk=submission.pk).update(status=status)
            submission.refresh_from_db()
        return submission

    def test_close_from_submitted_persists(self):
        submission = self._submission(status=Submission.SUBMITTED)
        submission.close()
        self.assertEqual(Submission.CLOSED, submission.status)
        submission.refresh_from_db()
        self.assertEqual(Submission.CLOSED, submission.status)

    def test_submit_from_closed_raises_and_does_not_persist(self):
        submission = self._submission(status=Submission.CLOSED)
        with self.assertRaises(IllegalStatusTransition):
            submission.submit()
        submission.refresh_from_db()
        self.assertEqual(Submission.CLOSED, submission.status)

    def test_submit_from_open_persists(self):
        submission = self._submission(status=Submission.OPEN)
        submission.submit()
        submission.refresh_from_db()
        self.assertEqual(Submission.SUBMITTED, submission.status)

    def test_fail_leaves_status_unchanged_in_memory_and_database(self):
        submission = self._submission(status=Submission.SUBMITTED)
        submission.fail(reason="boom", save=False)
        self.assertEqual(Submission.SUBMITTED, submission.status)
        submission.fail(reason="boom", save=True)
        self.assertEqual(Submission.SUBMITTED, submission.status)
        submission.refresh_from_db()
        self.assertEqual(Submission.SUBMITTED, submission.status)

    def test_fail_from_closed_does_not_raise(self):
        submission = self._submission(status=Submission.CLOSED)
        submission.fail(reason="boom")
        self.assertEqual(Submission.CLOSED, submission.status)
        submission.refresh_from_db()
        self.assertEqual(Submission.CLOSED, submission.status)

    def test_cancel_from_open_persists(self):
        submission = self._submission(status=Submission.OPEN)
        submission.cancel()
        submission.refresh_from_db()
        self.assertEqual(Submission.CANCELLED, submission.status)

    def test_cancel_from_cancelled_raises(self):
        submission = self._submission(status=Submission.CANCELLED)
        with self.assertRaises(IllegalStatusTransition):
            submission.cancel()

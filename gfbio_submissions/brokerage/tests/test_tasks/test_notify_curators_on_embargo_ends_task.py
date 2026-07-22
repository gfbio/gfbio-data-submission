# -*- coding: utf-8 -*-
import datetime

from django.contrib.auth.models import Group
from django.core import mail
from django.test import TestCase

from gfbio_submissions.users.models import User

from ...configuration.settings import ENA
from ...models.submission import Submission
from ...tasks.submission_tasks.notify_curators_on_embargo_ends import (
    notify_curators_on_embargo_ends_task,
)


class TestNotifyCuratorsOnEmbargoEndsTask(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="submitter", email="submitter@example.org", password="password")
        self.curator = User.objects.create_user(username="curator", email="curator@example.org", password="password")
        curators_group, _ = Group.objects.get_or_create(name="Curators")
        curators_group.user_set.add(self.curator)
        mail.outbox.clear()

    def _create_closed_submission_with_prj(self, embargo):
        submission = Submission.objects.create(
            user=self.user,
            status=Submission.CLOSED,
            target=ENA,
            embargo=embargo,
        )
        study = submission.brokerobject_set.create(type="study", user=self.user)
        study_pid = study.persistentidentifier_set.create(archive="ENA", pid_type="PRJ", pid="PRJE0815")
        return submission, study_pid

    def test_notify_curators_sets_marker_for_embargo_date(self):
        embargo = datetime.date.today() + datetime.timedelta(days=6)
        submission, study_pid = self._create_closed_submission_with_prj(embargo)

        result = notify_curators_on_embargo_ends_task.apply()

        self.assertTrue(result.successful())
        self.assertEqual(1, len(mail.outbox))
        self.assertIn("curator@example.org", mail.outbox[0].to)
        self.assertIn(str(submission.broker_submission_id), mail.outbox[0].body)
        self.assertIn("PRJE0815", mail.outbox[0].body)
        study_pid.refresh_from_db()
        self.assertEqual(embargo, study_pid.curators_notified_embargo_expiry_for)

    def test_notify_curators_does_not_repeat_same_embargo_date(self):
        embargo = datetime.date.today() + datetime.timedelta(days=6)
        self._create_closed_submission_with_prj(embargo)

        notify_curators_on_embargo_ends_task.apply()
        mail.outbox.clear()
        result = notify_curators_on_embargo_ends_task.apply()

        self.assertTrue(result.successful())
        self.assertEqual("No notifications to send", result.get())
        self.assertEqual(0, len(mail.outbox))

    def test_notify_curators_repeats_after_embargo_date_changes(self):
        first_embargo = datetime.date.today() + datetime.timedelta(days=5)
        second_embargo = datetime.date.today() + datetime.timedelta(days=6)
        submission, study_pid = self._create_closed_submission_with_prj(first_embargo)

        notify_curators_on_embargo_ends_task.apply()
        mail.outbox.clear()
        submission.embargo = second_embargo
        submission.save(update_fields=["embargo"])
        result = notify_curators_on_embargo_ends_task.apply()

        self.assertTrue(result.successful())
        self.assertEqual(1, len(mail.outbox))
        study_pid.refresh_from_db()
        self.assertEqual(second_embargo, study_pid.curators_notified_embargo_expiry_for)

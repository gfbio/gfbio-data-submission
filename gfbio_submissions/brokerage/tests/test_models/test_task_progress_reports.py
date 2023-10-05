# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.users.models import User
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport


class TestTaskProgressReport(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username="user1"
        )
        Submission.objects.create(user=user)

    def test_instance(self):
        self.assertEqual(0, len(TaskProgressReport.objects.all()))
        submission = Submission.objects.first()
        tpr = TaskProgressReport.objects.create(
            submission=submission,
            task_name='foo',
        )
        tpr.save()
        self.assertEqual(1, len(TaskProgressReport.objects.all()))

    def test_str(self):
        tpr = TaskProgressReport.objects.create(
            submission=Submission.objects.first(),
            task_name='foo',
        )
        tpr.save()
        self.assertEqual('foo', tpr.__str__())
        self.assertIsInstance(tpr.__str__(), str)

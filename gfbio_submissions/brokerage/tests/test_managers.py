# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.users.models import User


class SubmissionManagerTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username="user1"
        )
        Submission.objects.create(site=user)
        Submission.objects.create(site=user)
        cls.broker_submission_id = Submission.objects.first().broker_submission_id

    def test_get_submission_instance(self):
        broker_submission_ids = Submission.objects.all().values_list(
            'broker_submission_id')
        submission = Submission.objects.get_submission_instance(
            self.broker_submission_id)
        self.assertIn((submission.broker_submission_id,), broker_submission_ids)

        submission = Submission.objects.get_submission_instance(
            '4cffff16-cfff-4dff-baff-ffff9d5e4fff')
        self.assertIsInstance(submission, Submission)
        self.assertNotIn((submission.broker_submission_id,),
                         broker_submission_ids)

    def test_get_submission_for_task(self):
        submission = Submission()
        submission.site = User.objects.first()
        submission.save()
        database_id = submission.pk

        self.assertEqual(Submission.OPEN, submission.status)
        submission = Submission.objects.get_submission_for_task(id=database_id)
        self.assertEqual(Submission.OPEN, submission.status)
        submission.status = Submission.CLOSED
        submission.save()

        with self.assertRaises(Submission.DoesNotExist) as exc:
            Submission.objects.get_submission_for_task(id=database_id)

        submission = Submission.objects.get(pk=database_id)
        submission.status = Submission.ERROR
        submission.save()
        with self.assertRaises(Submission.DoesNotExist) as exc:
            Submission.objects.get_submission_for_task(id=database_id)

        submission = Submission.objects.get(pk=database_id)
        submission.status = Submission.OPEN
        submission.save()
        with self.assertRaises(Submission.DoesNotExist) as exc:
            Submission.objects.get_submission_for_task(id=database_id + 12)

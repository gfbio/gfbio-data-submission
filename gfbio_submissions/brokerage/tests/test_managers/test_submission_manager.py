# -*- coding: utf-8 -*-

from django.test import TestCase

from gfbio_submissions.users.models import User
from ...models.submission import Submission


class SubmissionManagerTest(TestCase):

    # TODO: redundant, move to utils or similar
    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username='user1'
        )
        Submission.objects.create(user=user)
        Submission.objects.create(user=user)
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
        submission.user = User.objects.first()
        submission.save()
        database_id = submission.pk

        self.assertEqual(Submission.OPEN, submission.status)
        submission = Submission.objects.get_open_submission(database_id)
        self.assertEqual(Submission.OPEN, submission.status)
        submission.status = Submission.CLOSED
        submission.save()

        with self.assertRaises(Submission.DoesNotExist) as exc:
            Submission.objects.get_open_submission(database_id)

        submission = Submission.objects.get(pk=database_id)
        submission.status = Submission.ERROR
        submission.save()
        with self.assertRaises(Submission.DoesNotExist) as exc:
            Submission.objects.get_open_submission(database_id)

        submission = Submission.objects.get(pk=database_id)
        submission.status = Submission.OPEN
        submission.save()
        with self.assertRaises(Submission.DoesNotExist) as exc:
            Submission.objects.get_open_submission(database_id + 12)

    def test_get_submitted_submissions(self):
        submission = Submission()
        submission.user = User.objects.first()
        submission.status = Submission.SUBMITTED
        submission.save()
        database_id = submission.pk

        self.assertEqual(Submission.SUBMITTED, submission.status)
        obj = Submission.objects.get_submitted_and_error_submissions(
            database_id)
        self.assertEqual(submission.pk, obj.pk)
        submission.status = Submission.CLOSED
        submission.save()

        with self.assertRaises(Submission.DoesNotExist) as exc:
            Submission.objects.get_submitted_and_error_submissions(database_id)

    def test_get_error_submissions(self):
        submission = Submission()
        submission.user = User.objects.first()
        submission.status = Submission.ERROR
        submission.save()
        database_id = submission.pk

        self.assertEqual(Submission.ERROR, submission.status)
        obj = Submission.objects.get_submitted_and_error_submissions(
            database_id)
        self.assertEqual(submission.pk, obj.pk)
        submission.status = Submission.CLOSED
        submission.save()

        with self.assertRaises(Submission.DoesNotExist) as exc:
            Submission.objects.get_submitted_and_error_submissions(database_id)

    def test_get_submissions_without_primary_helpdesk_issue(self):
        submissions = Submission.objects.all()
        no_issue_submissions = Submission.objects.get_submissions_without_primary_helpdesk_issue()
        self.assertEqual(len(submissions), len(no_issue_submissions))


class TestSubmissionManagerSubmittingUser(TestCase):
    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username='user1',
            is_site=True,
            is_user=False,
        )
        user_2 = User.objects.create(
            username='user2',
            is_site=False,
            is_user=True,
        )
        user_3 = User.objects.create(
            username='user3',
            is_site=False,
            is_user=True,
            email='user3@user3.com'
        )
        Submission.objects.create(user=user)
        Submission.objects.create(
            user=user_2, )
        Submission.objects.create(
            user=user_2, )
        Submission.objects.create(
            user=user_3, )

    def test_db_content(self):
        self.assertEqual(4, len(Submission.objects.all()))

    # def test_get_submissions_of_submitting_user(self):
    #     user = User.objects.get(username='user2')
    #     submissions = Submission.objects.get_submissions_of_submitting_user(
    #         submitting_user_identifier='{}'.format(user.id))
    #     self.assertEqual(2, len(submissions))
    #     user = User.objects.get(username='user3')
    #     submissions = Submission.objects.get_submissions_of_submitting_user(
    #         submitting_user_identifier='{}'.format(user.email))
    #     self.assertEqual(1, len(submissions))

    # def test_get_submissions_for_invalid_submitting_user(self):
    #     submissions = Submission.objects.get_submissions_of_submitting_user(
    #         submitting_user_identifier='invalid_id')
    #     self.assertEqual(0, len(submissions))

    # def test_get_submissions_of_empty_submitting_user(self):
    #     user = User.objects.get(username='user1')
    #     submissions = Submission.objects.filter(user=user)
    #     self.assertEqual(1, len(submissions))
    #     submissions = Submission.objects.get_submissions_of_submitting_user(
    #         submitting_user_identifier='{}'.format(user.id))
    #     self.assertEqual(0, len(submissions))

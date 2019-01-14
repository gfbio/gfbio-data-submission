# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.brokerage.models import Submission, AuditableTextData
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.utils.ena import prepare_ena_data, \
    store_ena_data_as_auditable_text_data
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


class TestAuditableTextDataManager(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        submission = SubmissionTest._create_submission_via_serializer()
        submission = SubmissionTest._create_submission_via_serializer()

    def test_manager_assemble_ena_submission_data(self):
        submission = Submission.objects.first()
        data = prepare_ena_data(submission)
        store_ena_data_as_auditable_text_data(submission, data)
        res = AuditableTextData.objects.assemble_ena_submission_data(
            submission=submission)
        request_file_keys = ['SAMPLE', 'STUDY', 'EXPERIMENT', 'RUN']
        self.assertEqual(sorted(request_file_keys), sorted(list(res.keys())))

    def test_manager_submission_data_no_experiments_no_runs(self):
        submission = Submission.objects.first()
        data = prepare_ena_data(submission)
        data.pop('EXPERIMENT')
        data.pop('RUN')
        self.assertEqual(0, len(AuditableTextData.objects.all()))
        store_ena_data_as_auditable_text_data(submission, data)
        self.assertEqual(2, len(AuditableTextData.objects.all()))
        res = AuditableTextData.objects.assemble_ena_submission_data(
            submission=submission)
        request_file_keys = ['SAMPLE', 'STUDY', ]
        self.assertEqual(sorted(request_file_keys), sorted(list(res.keys())))

    def test_manager_submission_filter(self):
        submission = Submission.objects.first()
        data = prepare_ena_data(submission)
        self.assertEqual(0, len(AuditableTextData.objects.all()))
        store_ena_data_as_auditable_text_data(submission, data)
        self.assertEqual(4, len(AuditableTextData.objects.all()))
        self.assertEqual(
            4,
            len(AuditableTextData.objects.filter(submission=submission))
        )

        submission_2 = Submission.objects.last()
        data = prepare_ena_data(submission_2)
        store_ena_data_as_auditable_text_data(submission_2, data)
        self.assertEqual(8, len(AuditableTextData.objects.all()))
        self.assertEqual(
            4,
            len(AuditableTextData.objects.filter(submission=submission_2))
        )

    def test_manager_invalid_submission(self):
        submission = Submission.objects.first()
        data = prepare_ena_data(submission)
        self.assertEqual(0, len(AuditableTextData.objects.all()))
        store_ena_data_as_auditable_text_data(submission, data)
        self.assertEqual(4, len(AuditableTextData.objects.all()))
        self.assertEqual(
            4,
            len(AuditableTextData.objects.filter(submission=submission))
        )
        submission_2 = Submission.objects.last()
        self.assertEqual(
            0,
            len(AuditableTextData.objects.filter(submission=submission_2))
        )
        res = AuditableTextData.objects.assemble_ena_submission_data(
            submission=submission_2)
        self.assertDictEqual({}, res)

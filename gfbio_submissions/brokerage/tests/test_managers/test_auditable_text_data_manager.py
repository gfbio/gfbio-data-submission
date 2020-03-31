# -*- coding: utf-8 -*-

from django.test import TestCase

from gfbio_submissions.brokerage.models import Submission, AuditableTextData, \
    BrokerObject
from gfbio_submissions.brokerage.serializers import SubmissionSerializer
from gfbio_submissions.brokerage.tests.utils import _get_ena_data, \
    _get_ena_data_without_runs
from gfbio_submissions.brokerage.utils.ena import prepare_ena_data, \
    store_ena_data_as_auditable_text_data
from gfbio_submissions.users.models import User


class TestAuditableTextDataManager(TestCase):

    # TODO: move to utils or similar ...
    @classmethod
    def _create_submission_via_serializer(cls, runs=False, username=None,
                                          create_broker_objects=True):
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': _get_ena_data() if runs else _get_ena_data_without_runs()
        })
        serializer.is_valid()
        user = User.objects.get(
            username=username) if username else User.objects.first()
        submission = serializer.save(user=user)
        if create_broker_objects:
            BrokerObject.objects.add_submission_data(submission)
        return submission

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(username='horst', email='horst@horst.de',
                                 password='password')
        cls._create_submission_via_serializer()
        cls._create_submission_via_serializer()

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

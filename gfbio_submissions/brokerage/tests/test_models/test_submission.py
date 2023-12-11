# -*- coding: utf-8 -*-
import uuid
from unittest.mock import patch

from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer,
    _get_ena_data,
    _get_ena_data_without_runs,
)
from gfbio_submissions.users.models import User

from ...models.broker_object import BrokerObject
from ...models.center_name import CenterName
from ...models.submission import Submission


class SubmissionTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.data = _get_ena_data_without_runs()
        user = User.objects.create(username="user1")
        Submission.objects.create(user=user)

    def test_str(self):
        submission = Submission.objects.first()
        self.assertEqual(
            "{0}_{1}".format(submission.pk, submission.broker_submission_id),
            submission.__str__(),
        )

    def test_create_empty_submission(self):
        submission = Submission()
        submission.user = User.objects.first()
        submission.save()
        submissions = Submission.objects.all()
        self.assertEqual(2, len(submissions))

    def test_center_name_is_none(self):
        submission = Submission.objects.first()
        self.assertIsNone(submission.center_name)

    def test_center_name(self):
        center_name, created = CenterName.objects.get_or_create(center_name="ABCD")
        sub = Submission.objects.first()
        sub.center_name = center_name
        sub.save()
        self.assertEqual(center_name, sub.center_name)
        self.assertEqual("ABCD", sub.center_name.center_name)

    def test_ids_on_empty_submission(self):
        submissions = Submission.objects.all()
        submission_count = len(submissions)
        submission = Submission()
        pre_save_bsi = submission.broker_submission_id
        submission.save()
        self.assertEqual(pre_save_bsi, submission.broker_submission_id)
        self.assertEqual(submission.pk, submission.id)
        submissions = Submission.objects.all()
        post_save_count = len(submissions)
        self.assertEqual(post_save_count, submission_count + 1)

    def test_get_study_json(self):
        submission = _create_submission_via_serializer()
        ena_study = {
            "study_title": self.data.get("requirements")["title"],
            "study_abstract": self.data.get("requirements")["description"],
            # 'study_type': self.data.get('requirements')[
            #     'study_type']
        }
        self.assertDictEqual(ena_study, submission.get_study_json())

    def test_get_sample_json(self):
        submission = _create_submission_via_serializer()
        content_samples = self.data.get("requirements").get("samples")
        for s in submission.get_sample_json().get("samples"):
            self.assertIn(s, content_samples)

    def test_get_experiment_json_with_files(self):
        submission = _create_submission_via_serializer()
        content_experiments = self.data.get("requirements").get("experiments")
        for s in submission.get_experiment_json().get("experiments"):
            self.assertIn(s, content_experiments)
            self.assertTrue("files" in s.keys())

    def test_get_experiment_json_with_files_and_run(self):
        json_data = _get_ena_data()
        submission = _create_submission_via_serializer(runs=True)
        content_experiments = json_data.get("requirements").get("experiments")
        for s in submission.get_experiment_json().get("experiments"):
            self.assertIn(s, content_experiments)
            if s["experiment_alias"] == "experiment_no_file_block":
                self.assertFalse("files" in s.keys())
            else:
                self.assertTrue("files" in s.keys())

    def test_get_run_json_with_files_in_experiment(self):
        submission = _create_submission_via_serializer()
        # 1x files in experiments. 0x run.
        self.assertEqual(1, len(submission.get_run_json().get("runs")))

    def test_get_run_json_with_additional_files_in_experiment(self):
        submission = _create_submission_via_serializer(runs=True)
        # 4x files in experiments. 2x run.
        self.assertEqual(6, len(submission.get_run_json().get("runs")))

    def test_get_json_with_aliases_with_file_in_experiment(self):
        submission = _create_submission_via_serializer()
        request_id_fake = uuid.UUID("71d59109-695d-4172-a8be-df6fb3283857")
        study, samples, experiments, runs = submission.get_json_with_aliases(alias_postfix=request_id_fake)
        study_alias = study.get("study_alias", None)
        sample_aliases = [s.get("sample_alias", "") for s in samples]
        experiment_aliases = [e.get("experiment_alias", "") for e in experiments]
        experiment_sample_descriptors = [e.get("design", {}).get("sample_descriptor", "") for e in experiments]
        experiment_study_refs = [e.get("study_ref", "") for e in experiments]
        run_experiment_refs = [r.get("experiment_ref") for r in runs]

        for e in experiment_sample_descriptors:
            self.assertIn(e, sample_aliases)
            self.assertTrue(2, len(e.split(":")))
        for e in experiment_study_refs:
            self.assertEqual(e, study_alias)
            self.assertTrue(2, len(e.split(":")))
        self.assertEqual(1, len(experiment_aliases))
        self.assertEqual(1, len(run_experiment_refs))

    def test_get_json_with_aliases_with_additional_files_in_experiment(self):
        submission = _create_submission_via_serializer(runs=True)
        request_id_fake = uuid.UUID("71d59109-695d-4172-a8be-df6fb3283857")
        study, samples, experiments, runs = submission.get_json_with_aliases(alias_postfix=request_id_fake)

        # TODO: expected db content regarding brokerobjects. for debugging.
        # 1 study
        self.assertEqual(
            1,
            len(BrokerObject.objects.filter(submissions=submission).filter(type="study")),
        )
        # 5 samples -> compare json.samples
        self.assertEqual(
            5,
            len(BrokerObject.objects.filter(submissions=submission).filter(type="sample")),
        )
        # 5 experiments -> compare json.experiments
        self.assertEqual(
            5,
            len(BrokerObject.objects.filter(submissions=submission).filter(type="experiment")),
        )
        # 6 runs ->  2 runs in json run block (1 file each) plus 4 (of 5)
        # experiments contain files block (2 files each)
        self.assertEqual(
            6,
            len(BrokerObject.objects.filter(submissions=submission).filter(type="run")),
        )

        study_alias = study.get("study_alias", None)
        sample_aliases = [s.get("sample_alias", "") for s in samples]
        experiment_aliases = [e.get("experiment_alias", "") for e in experiments]
        experiment_sample_descriptors = [e.get("design", {}).get("sample_descriptor", "") for e in experiments]
        experiment_study_refs = [e.get("study_ref", "") for e in experiments]
        run_experiment_refs = [r.get("experiment_ref") for r in runs]

        for e in experiment_sample_descriptors:
            self.assertIn(e, sample_aliases)
            self.assertTrue(2, len(e.split(":")))
        for e in experiment_study_refs:
            self.assertEqual(e, study_alias)
            self.assertTrue(2, len(e.split(":")))
        self.assertEqual(5, len(experiment_aliases))
        self.assertEqual(6, len(run_experiment_refs))
        for r in run_experiment_refs:
            self.assertIn(r, experiment_aliases)
            self.assertTrue(2, len(r.split(":")))

    def test_queuing_of_closed_submissions(self):
        with patch(
            "gfbio_submissions.brokerage.tasks.transfer_tasks.trigger_submission_transfer.trigger_submission_transfer_task.apply_async"
        ) as trigger_mock:
            sub = Submission()
            sub.user = User.objects.first()
            sub.status = Submission.CLOSED
            sub.save()
            self.assertEqual(Submission.CLOSED, sub.status)
            trigger_mock.assert_not_called()

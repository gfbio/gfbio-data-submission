# -*- coding: utf-8 -*-
import os
import shutil

from config.settings.base import MEDIA_ROOT
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_DELAY
from gfbio_submissions.brokerage.utils.ena import (
    prepare_ena_data,
    store_ena_data_as_auditable_text_data,
)
from gfbio_submissions.users.models import User
from .test_tasks_base import TestTasks
from ..test_utils.test_csv_parsing import TestCSVParsing
from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload
from ...models.task_progress_report import TaskProgressReport
from ...tasks.auditable_text_data_tasks.update_ena_submission_data import update_ena_submission_data_task
from ...tasks.broker_object_tasks.create_broker_objects_from_submission_data import (
    create_broker_objects_from_submission_data_task,
)
from ...tasks.submission_upload_tasks.clean_submission_for_update import clean_submission_for_update_task
from ...tasks.submission_upload_tasks.parse_csv_to_update_clean_submission import (
    parse_csv_to_update_clean_submission_task,
)


class TestParseMetaDataForUpdateTask(TestTasks):
    @classmethod
    def tearDownClass(cls):
        super(TestParseMetaDataForUpdateTask, cls).tearDownClass()
        [
            shutil.rmtree(path="{0}{1}{2}".format(MEDIA_ROOT, os.sep, o), ignore_errors=False)
            for o in os.listdir(MEDIA_ROOT)
        ]

    @classmethod
    def _add_submission_upload(cls):
        TestCSVParsing.create_csv_submission_upload(
            Submission.objects.first(), User.objects.first(), "csv_files/SO45_mod.csv"
        )

    @classmethod
    def _prepare_submission_upload_task_test_data(cls):
        cls._add_submission_upload()
        submission_upload = SubmissionUpload.objects.first()
        ena_submission_data = prepare_ena_data(submission=submission_upload.submission)
        store_ena_data_as_auditable_text_data(submission=submission_upload.submission, data=ena_submission_data)
        return submission_upload

    def test_complete_reparse_chain(self):
        submission_upload = self._prepare_submission_upload_task_test_data()

        sample = submission_upload.submission.auditabletextdata_set.filter(name="sample.xml")
        self.assertEqual(1, len(sample))
        sample = sample.first()
        self.assertIn("<TITLE>sample title</TITLE>", sample.text_data)

        experiment = submission_upload.submission.auditabletextdata_set.filter(name="experiment.xml")
        self.assertEqual(1, len(experiment))
        experiment = experiment.first()
        self.assertIn(
            "<PLATFORM>"
            "<CAPILLARY><INSTRUMENT_MODEL>AB 3730xL Genetic Analyzer</INSTRUMENT_MODEL></CAPILLARY>"
            "</PLATFORM>",
            experiment.text_data,
        )

        reparse_chain = (
            clean_submission_for_update_task.s(
                submission_upload_id=submission_upload.id,
            ).set(countdown=SUBMISSION_DELAY)
            | parse_csv_to_update_clean_submission_task.s(
                submission_upload_id=submission_upload.id,
            ).set(countdown=SUBMISSION_DELAY)
            | create_broker_objects_from_submission_data_task.s(
                submission_id=SubmissionUpload.objects.get_related_submission_id(submission_upload.id)
            ).set(countdown=SUBMISSION_DELAY)
            | update_ena_submission_data_task.s(
                submission_upload_id=submission_upload.id,
            ).set(countdown=SUBMISSION_DELAY)
        )

        reparse_chain()

        submission_upload = SubmissionUpload.objects.first()

        sample = submission_upload.submission.auditabletextdata_set.filter(name="sample.xml")
        self.assertEqual(1, len(sample))
        sample = sample.first()
        self.assertNotIn("<TITLE>sample title</TITLE>", sample.text_data)
        self.assertIn("<TITLE>SO245-01-01</TITLE>", sample.text_data)

        experiment = submission_upload.submission.auditabletextdata_set.filter(name="experiment.xml")
        self.assertEqual(1, len(experiment))
        experiment = experiment.first()
        self.assertNotIn(
            "<PLATFORM>"
            "<CAPILLARY><INSTRUMENT_MODEL>AB 3730xL Genetic Analyzer</INSTRUMENT_MODEL></CAPILLARY>"
            "</PLATFORM>",
            experiment.text_data,
        )
        self.assertIn(
            "<PLATFORM><ION_TORRENT><INSTRUMENT_MODEL>Ion Torrent PGM</INSTRUMENT_MODEL></ION_TORRENT></PLATFORM>",
            experiment.text_data,
        )

    # TODO: add tests for negative outcome: no submission, no reqs, prev_res = CANCELLED etc
    def test_clean_submission_for_update_task(self):
        submission_upload = self._prepare_submission_upload_task_test_data()
        requirements = submission_upload.submission.data.get("requirements", {})
        self.assertIn("experiments", requirements.keys())
        self.assertIn("samples", requirements.keys())
        result = clean_submission_for_update_task.apply_async(kwargs={"submission_upload_id": submission_upload.pk})
        self.assertTrue(result.get())
        expected_data = {
            "requirements": {
                "description": "Reduced Data for testing",
                # 'site_object_id': 'user1_1',
                "study_type": "Metagenomics",
                "title": "Simple ENA Data without run block",
            }
        }
        submission_upload = SubmissionUpload.objects.first()
        self.assertEqual(
            expected_data["requirements"].keys(),
            submission_upload.submission.data["requirements"].keys(),
        )

    def test_clean_submission_for_update_task_invalid_id(self):
        result = clean_submission_for_update_task.apply_async(kwargs={"submission_upload_id": 9999})
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())

    def test_clean_submission_for_update_task_prev_cancelled(self):
        self._add_submission_upload()
        submission_upload = SubmissionUpload.objects.first()
        result = clean_submission_for_update_task.apply_async(
            kwargs={
                "previous_task_result": TaskProgressReport.CANCELLED,
                "submission_upload_id": submission_upload.pk,
            }
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())

    def test_clean_submission_for_update_task_no_submission(self):
        self._add_submission_upload()
        submission_upload = SubmissionUpload.objects.first()
        submission_upload.submission = None
        submission_upload.save()
        result = clean_submission_for_update_task.apply_async(kwargs={"submission_upload_id": submission_upload.pk})
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())

    # TODO: add tests, compare TODO above. test for valid / invalid csv
    def test_parse_csv_to_update_clean_submission_task(self):
        submission_upload = self._prepare_submission_upload_task_test_data()
        clean_submission_for_update_task.apply_async(kwargs={"submission_upload_id": submission_upload.pk})
        result = parse_csv_to_update_clean_submission_task.apply_async(
            kwargs={"submission_upload_id": submission_upload.pk}
        )
        self.assertTrue(result.get())

        submission_upload = SubmissionUpload.objects.first()
        requirements = submission_upload.submission.data.get("requirements", {})

        self.assertIn("experiments", requirements.keys())
        self.assertGreater(len(requirements.get("experiments", [])), 0)
        self.assertIn("samples", requirements.keys())
        self.assertGreater(len(requirements.get("samples", [])), 0)

    def test_parse_csv_to_update_clean_submission_task_only(self):
        submission_upload = self._prepare_submission_upload_task_test_data()
        result = parse_csv_to_update_clean_submission_task.apply_async(
            kwargs={"submission_upload_id": submission_upload.pk}
        )
        self.assertTrue(result.get())

    def test_parse_csv_to_update_clean_submission_task_invalid_id(self):
        result = parse_csv_to_update_clean_submission_task.apply_async(kwargs={"submission_upload_id": 9999})
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())

    def test_parse_csv_to_update_clean_submission_task_invalid_data(self):
        TestCSVParsing.create_csv_submission_upload(
            Submission.objects.first(),
            User.objects.first(),
            "csv_files/invalid_molecular_metadata.csv",
        )
        submission_upload = SubmissionUpload.objects.first()
        result = parse_csv_to_update_clean_submission_task.apply_async(
            kwargs={"submission_upload_id": submission_upload.pk}
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        submission_upload = SubmissionUpload.objects.first()
        self.assertIn("validation", submission_upload.submission.data.keys())

    def test_update_ena_submission_data_task(self):
        submission_upload = self._prepare_submission_upload_task_test_data()
        clean_submission_for_update_task.apply_async(kwargs={"submission_upload_id": submission_upload.pk})
        parse_csv_to_update_clean_submission_task.apply_async(kwargs={"submission_upload_id": submission_upload.pk})
        create_broker_objects_from_submission_data_task.apply_async(
            kwargs={"submission_id": SubmissionUpload.objects.get_related_submission_id(submission_upload.id)}
        )

        sample = submission_upload.submission.auditabletextdata_set.filter(name="sample.xml")
        self.assertEqual(1, len(sample))
        sample = sample.first()
        self.assertIn("<TITLE>sample title</TITLE>", sample.text_data)

        experiment = submission_upload.submission.auditabletextdata_set.filter(name="experiment.xml")
        self.assertEqual(1, len(experiment))
        experiment = experiment.first()
        self.assertIn(
            "<PLATFORM>"
            "<CAPILLARY><INSTRUMENT_MODEL>AB 3730xL Genetic Analyzer</INSTRUMENT_MODEL></CAPILLARY>"
            "</PLATFORM>",
            experiment.text_data,
        )

        result = update_ena_submission_data_task.apply_async(kwargs={"submission_upload_id": submission_upload.pk})
        self.assertTrue(result.get())

        submission_upload = SubmissionUpload.objects.first()

        sample = submission_upload.submission.auditabletextdata_set.filter(name="sample.xml")
        self.assertEqual(1, len(sample))
        sample = sample.first()
        self.assertNotIn("<TITLE>sample title</TITLE>", sample.text_data)
        self.assertIn("<TITLE>SO245-01-01</TITLE>", sample.text_data)

        experiment = submission_upload.submission.auditabletextdata_set.filter(name="experiment.xml")
        self.assertEqual(1, len(experiment))
        experiment = experiment.first()
        self.assertNotIn(
            "<PLATFORM>"
            "<CAPILLARY><INSTRUMENT_MODEL>AB 3730xL Genetic Analyzer</INSTRUMENT_MODEL></CAPILLARY>"
            "</PLATFORM>",
            experiment.text_data,
        )
        self.assertIn(
            "<PLATFORM><ION_TORRENT><INSTRUMENT_MODEL>Ion Torrent PGM</INSTRUMENT_MODEL></ION_TORRENT></PLATFORM>",
            experiment.text_data,
        )

    def test_update_ena_submission_data_task_only(self):
        submission_upload = self._prepare_submission_upload_task_test_data()
        result = update_ena_submission_data_task.apply_async(kwargs={"submission_upload_id": submission_upload.pk})
        self.assertTrue(result.get())

    def test_update_ena_submission_data_task_invalid_id(self):
        result = update_ena_submission_data_task.apply_async(kwargs={"submission_upload_id": 9999})
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())

    def test_update_ena_submission_data_task_prev_cancelled(self):
        self._add_submission_upload()
        submission_upload = SubmissionUpload.objects.first()
        result = update_ena_submission_data_task.apply_async(
            kwargs={
                "previous_task_result": TaskProgressReport.CANCELLED,
                "submission_upload_id": submission_upload.pk,
            }
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())

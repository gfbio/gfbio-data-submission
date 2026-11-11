# -*- coding: utf-8 -*-
import json
import os
from types import SimpleNamespace
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer, _get_test_data_dir_path,
)
from gfbio_submissions.users.models import User
from ...configuration.settings import GENERIC
from ...models.auditable_text_data import AuditableTextData
from ...models.submission import Submission
from ...models.submission_report import SubmissionReport
from ...models.submission_upload import SubmissionUpload
from ...models.task_progress_report import TaskProgressReport
from ...tasks.atax_tasks._atax_submission_validate_xml_upload import atax_submission_validate_xml_upload_task
from ...tasks.atax_tasks.parse_atax_uploads import parse_atax_uploads_task
from ...tasks.atax_tasks.validate_merged_atax_data import validate_merged_atax_data_task
from ...utils.schema_validation import validate_atax_data


class TestAtaxSubmissionTasks(TestCase):

    def _create_unreleased_submission(self):
        submission = _create_submission_via_serializer(username=self.user.name, create_broker_objects=False, atax=True)
        submission.release = False
        submission.save()
        return submission

    @classmethod
    def create_csv_submission_upload(cls, submission, user, name="csv_files/upload_alphataxonomic_data.csv",
                                     file_sub_path="csv_files/specimen_table_Platypelis.csv"):
        with open(os.path.join(_get_test_data_dir_path(), file_sub_path), "rb") as data_file:
            return SubmissionUpload.objects.create(
                submission=submission,
                user=user,
                meta_data=True,
                file=SimpleUploadedFile(name, data_file.read()),
            )

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create(username="user1")
        submission = _create_submission_via_serializer(username=cls.user.name, create_broker_objects=False, atax=True)
        submission.release = True
        submission.save()
        simple_file = SimpleUploadedFile("test_upload_1.csv", b"these are the file contents!")
        SubmissionUpload.objects.create(
            submission=submission,
            user=cls.user,
            file=simple_file,
        )
        cls.create_csv_submission_upload(submission=submission, user=cls.user)
        cls.create_csv_submission_upload(submission=submission, name="csv_files/upload_alphataxonomic_data_error.csv",
                                         user=cls.user,
                                         file_sub_path="csv_files/specimen_table_Platypelis_with_error.csv")

    def test_db_content(self):
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        self.assertEqual("user1", submission.user.username)
        uploads = submission.submissionupload_set.all()
        self.assertEqual(3, len(uploads))

    # FIXME: DASS-2397 is this still needed ?
    def test_parse_atax_uploads_task(self):
        submission = Submission.objects.first()
        result = parse_atax_uploads_task.apply_async(
            kwargs={"submission_id": submission.pk}
        )
        self.assertTrue(result.successful())
        res = result.get()
        self.assertTrue(res)
        text_data = AuditableTextData.objects.all()
        self.assertEqual(len(text_data), len(submission.auditabletextdata_set.all()))
        for a in submission.auditabletextdata_set.all():
            print(a.text_data)

    # FIXME: DASS-2397 is this still needed ?
    def test_validate_merged_atax_data_task(self):
        submission = Submission.objects.first()
        parse_atax_uploads_task.apply_async(
            kwargs={"submission_id": submission.pk}
        )
        result = validate_merged_atax_data_task.apply_async(
            kwargs={"submission_id": submission.pk}
        )
        self.assertTrue(result.successful())
        valid, errors = result.get()
        self.assertFalse(valid)
        self.assertIsInstance(errors, list)
        reports = SubmissionReport.objects.all()
        self.assertEqual(len(errors), len(reports))

    # FIXME: DASS-2397 is this still needed ?
    def test_parse_uploads_task_for_unreleased_submission(self):
        submission = self._create_unreleased_submission()
        result = parse_atax_uploads_task.apply_async(
            kwargs={"submission_id": submission.pk}
        )
        self.assertTrue(result.successful())
        res = result.get()
        self.assertEqual(TaskProgressReport.CANCELLED, res)

    # FIXME: DASS-2397 is this still needed ?
    def test_parse_uploads_task_for_non_atx_submission(self):
        submission = self._create_unreleased_submission()
        submission.release = True
        submission.target = GENERIC
        submission.save()
        result = parse_atax_uploads_task.apply_async(
            kwargs={"submission_id": submission.pk}
        )
        self.assertTrue(result.successful())
        res = result.get()
        self.assertEqual(TaskProgressReport.CANCELLED, res)

    # FIXME: DASS-2397 is this still needed ?
    def test_validate_merged_data_task_for_unreleased_submission(self):
        submission = self._create_unreleased_submission()
        result = validate_merged_atax_data_task.apply_async(
            kwargs={"submission_id": submission.pk}
        )
        self.assertTrue(result.successful())
        res = result.get()
        self.assertEqual(TaskProgressReport.CANCELLED, res)

    # FIXME: DASS-2397 is this still needed ?
    def test_validate_merged_data_task_for_non_atx_submission(self):
        submission = self._create_unreleased_submission()
        submission.release = True
        submission.target = GENERIC
        submission.save()
        result = validate_merged_atax_data_task.apply_async(
            kwargs={"submission_id": submission.pk}
        )
        self.assertTrue(result.successful())
        res = result.get()
        self.assertEqual(TaskProgressReport.CANCELLED, res)

    def test_invalid_abcd_xml_persists_validation_without_error_status(self):
        submission = _create_submission_via_serializer(
            username=self.user.name, create_broker_objects=False, atax=True
        )
        status_before = submission.status
        upload = SubmissionUpload.objects.create(
            submission=submission,
            user=self.user,
            file=SimpleUploadedFile("combination.xml", b"<root>invalid</root>"),
        )
        AuditableTextData.objects.create(
            name="combination",
            submission=submission,
            text_data="<root>invalid</root>",
        )

        def _validate(submission=None, schema_file=None, xml_string=None, **kwargs):
            try:
                return validate_atax_data(schema_file_name=schema_file, xml_string=xml_string)
            except Exception:
                return False, [SimpleNamespace(message="invalid ABCD XML")]

        validator_path = (
            "gfbio_submissions.brokerage.tasks.atax_tasks."
            "_atax_submission_validate_xml_upload.validate_atax_data_is_valid"
        )
        with patch(validator_path, create=True, side_effect=_validate):
            result = atax_submission_validate_xml_upload_task.apply_async(
                kwargs={"submission_upload_id": upload.pk, "is_combination": True}
            )
            self.assertTrue(result.successful())
            self.assertEqual(TaskProgressReport.CANCELLED, result.get())

        submission.refresh_from_db()
        # Serializer sets SUBMITTED when release=True; the task must leave that status.
        self.assertEqual(Submission.SUBMITTED, status_before)
        self.assertEqual(status_before, submission.status)
        validation = submission.data["validation"]
        self.assertIsInstance(validation, list)
        self.assertTrue(validation)
        self.assertTrue(all(isinstance(message, str) and message for message in validation))

        report = TaskProgressReport.objects.filter(submission=submission).exclude(task_exception_info="").get()
        payload = json.loads(report.task_exception_info)
        self.assertEqual(validation, payload["validation"])

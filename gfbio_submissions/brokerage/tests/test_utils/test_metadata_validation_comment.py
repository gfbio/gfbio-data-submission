from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ENA
from gfbio_submissions.brokerage.models.metadata_validation_report import (
    MetadataValidationReport,
    ValidationFinding,
    ValidationTaskReport,
)
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.utils.metadata_validation_comment import (
    build_metadata_validation_report_comment,
    is_internal_metadata_validation_jira_comment,
    should_post_metadata_validation_jira_comment,
)
from gfbio_submissions.users.models import User


class TestMetadataValidationComment(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.submitter = User.objects.create_user(username="submitter", email="submitter@example.com")
        cls.admin = User.objects.create_user(username="admin", email="admin@example.com")

        cls.submission = Submission.objects.create(user=cls.submitter, status=Submission.OPEN, target=ENA, data={})
        cls.submitter_upload = SubmissionCloudUpload.objects.create(
            submission=cls.submission,
            user=cls.submitter,
            meta_data=True,
        )

    def test_should_post_jira_comment_when_triggered_by_submitter(self):
        report = MetadataValidationReport.objects.create(
            submission=self.submission,
            upload_file=self.submitter_upload,
            file_md5_checksum="abc",
            triggered_by=self.submitter,
        )
        self.assertTrue(should_post_metadata_validation_jira_comment(report))
        self.assertFalse(is_internal_metadata_validation_jira_comment(report))

    def test_should_post_internal_jira_comment_when_triggered_by_admin(self):
        report = MetadataValidationReport.objects.create(
            submission=self.submission,
            upload_file=self.submitter_upload,
            file_md5_checksum="abc",
            triggered_by=self.admin,
        )
        self.assertTrue(should_post_metadata_validation_jira_comment(report))
        self.assertTrue(is_internal_metadata_validation_jira_comment(report))

    def test_should_not_post_jira_comment_without_triggered_by(self):
        report = MetadataValidationReport.objects.create(
            submission=self.submission,
            upload_file=self.submitter_upload,
            file_md5_checksum="abc",
        )
        self.assertFalse(should_post_metadata_validation_jira_comment(report))

    def test_build_comment_includes_findings(self):
        report = MetadataValidationReport.objects.create(
            submission=self.submission,
            upload_file=self.submitter_upload,
            file_md5_checksum="abc",
            triggered_by=self.submitter,
        )
        task_report = ValidationTaskReport.objects.create(
            report=report,
            task_name="ENA mandatory fields",
            status="ERROR",
        )
        ValidationFinding.objects.create(
            task_report=task_report,
            status="ERROR",
            row=2,
            column_name="taxon_id",
            message="Required field 'taxon_id' is empty in row 2.",
            help_text="Taxon id help",
        )

        comment = build_metadata_validation_report_comment(report)
        self.assertIn("Metadata validation report", comment)
        self.assertIn("ENA mandatory fields (ERROR)", comment)
        self.assertIn("Required field 'taxon_id' is empty in row 2.", comment)
        self.assertIn("Please fix the issues above", comment)

    def test_build_comment_omits_task_details_when_no_errors(self):
        report = MetadataValidationReport.objects.create(
            submission=self.submission,
            upload_file=self.submitter_upload,
            file_md5_checksum="abc",
            triggered_by=self.submitter,
        )
        ValidationTaskReport.objects.create(
            report=report,
            task_name="ENA mandatory fields",
            status="SUCCESS",
        )

        comment = build_metadata_validation_report_comment(report)

        self.assertIn("Result: no errors found", comment)
        self.assertIn("The mandatory metadata checks completed without errors.", comment)
        self.assertNotIn("ENA mandatory fields (SUCCESS)", comment)
        self.assertNotIn("No issues reported.", comment)

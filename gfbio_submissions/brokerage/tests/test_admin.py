from unittest.mock import patch

from django.test import TestCase
from dt_upload.models import FileUploadRequest, MultiPartUpload

from gfbio_submissions.brokerage.admin import (
    SubmissionAdmin,
    re_create_ena_xml,
    retrigger_cloud_upload_checksums,
    submit_to_ena_test,
    validate_against_ena,
)
from gfbio_submissions.brokerage.configuration.settings import (
    GFBIO_HELPDESK_TICKET,
    PANGAEA_JIRA_TICKET,
)
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User

from ..models.auditable_text_data import AuditableTextData
from ..models.center_name import CenterName
from ..models.submission import Submission
from ..models.submission_cloud_upload import SubmissionCloudUpload
from ..models.task_progress_report import TaskProgressReport
from ..views.curator_submissions_view import ACTION_DEFINITIONS


class TestSubmissionAdmin(TestCase):
    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )

        site_configuration = SiteConfiguration.objects.create(
            title="Default",
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
        )
        user = User.objects.create(
            username="user1",
            site_configuration=site_configuration,
        )
        # DASS-3574: the VALIDATE/TEST path now resolves the curated centre, so
        # the fixture submission needs a valid CenterName (the FK guarantees
        # membership; the guard only rejects None/empty).
        center = CenterName.objects.create(center_name="test-center")
        Submission.objects.create(
            user=user,
            status="OPEN",
            # submitting_user='John Doe',
            center_name=center,
            target="ENA",
            release=False,
            data={},
        )

    def test_re_create_ena_xml(self):
        submission = Submission.objects.first()
        AuditableTextData.objects.create(name="test-file", submission=submission)
        re_create_ena_xml(None, None, Submission.objects.all())
        submission = Submission.objects.first()
        self.assertEqual(0, len(submission.auditabletextdata_set.all()))
        self.assertEqual(
            "tasks.prepare_ena_submission_data_task",
            TaskProgressReport.objects.first().task_name,
        )

    def test_validate_against_ena(self):
        validate_against_ena(None, None, Submission.objects.all())

        self.assertEqual(
            "No resource credentials found for ENA",
            TaskProgressReport.objects.first().task_return_value,
        )
        self.assertEqual("SUCCESS", TaskProgressReport.objects.first().status)
        self.assertEqual(
            "tasks.validate_against_ena_task",
            TaskProgressReport.objects.first().task_name,
        )

    def test_submit_to_ena_test(self):
        submit_to_ena_test(None, None, Submission.objects.all())

        self.assertEqual(
            "No resource credentials found for ENA-Testserver",
            TaskProgressReport.objects.first().task_return_value,
        )
        self.assertEqual("SUCCESS", TaskProgressReport.objects.first().status)
        self.assertEqual(
            "tasks.submit_to_ena_test_server_task",
            TaskProgressReport.objects.first().task_name,
        )

    def test_submission_get_ticket(self):
        admin = SubmissionAdmin(model=Submission, admin_site="")
        submission = Submission.objects.first()
        self.assertEqual("-", admin.get_ticket(submission))
        submission.additionalreference_set.create(primary=False, reference_key="SAND-123", type=GFBIO_HELPDESK_TICKET)
        self.assertEqual(
            "<a href='https://www.example.com/browse/SAND-123'>SAND-123</a>", admin.get_ticket(submission)
        )
        submission.additionalreference_set.create(primary=False, reference_key="2nd ref", type=GFBIO_HELPDESK_TICKET)
        self.assertEqual("multiple references", admin.get_ticket(submission))
        submission.additionalreference_set.create(primary=True, reference_key="ext-1", type=PANGAEA_JIRA_TICKET)
        self.assertEqual("ext-1", admin.get_ticket(submission))
        submission.additionalreference_set.create(primary=True, reference_key="DSUB-1", type=GFBIO_HELPDESK_TICKET)
        self.assertEqual("multiple primaries", admin.get_ticket(submission))

    def _create_cloud_upload(self, submission, filename, scu_status):
        fur = FileUploadRequest.objects.create(
            original_filename=filename,
            file_key=f"{filename}-key",
            file_type="fastq",
            user=submission.user,
        )
        MultiPartUpload.objects.create(file_upload_request=fur)
        fur.status = "COMPLETED"
        fur.save()
        return SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=fur,
            status=scu_status,
        )

    @patch("gfbio_submissions.brokerage.views.submission_cloud_upload_view.add_verify_checksum_task")
    def test_retrigger_cloud_upload_checksums_queues_uploaded_only(self, mock_verify):
        submission = Submission.objects.first()
        uploaded = self._create_cloud_upload(submission, "ready.fastq.gz", SubmissionCloudUpload.STATUS_UPLOADED)
        self._create_cloud_upload(
            submission, "checked.fastq.gz", SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM
        )
        self._create_cloud_upload(submission, "bad.fastq.gz", SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM)
        self._create_cloud_upload(submission, "transferred.fastq.gz", SubmissionCloudUpload.STATUS_IS_TRANSFERRED)
        self._create_cloud_upload(submission, "deleted.fastq.gz", SubmissionCloudUpload.STATUS_DELETED)
        self._create_cloud_upload(submission, "new.fastq.gz", SubmissionCloudUpload.STATUS_NEW)

        retrigger_cloud_upload_checksums(None, None, Submission.objects.filter(pk=submission.pk))

        mock_verify.assert_called_once()
        self.assertEqual(uploaded.pk, mock_verify.call_args.args[0].pk)

    @patch("gfbio_submissions.brokerage.views.submission_cloud_upload_view.add_verify_checksum_task")
    def test_retrigger_cloud_upload_checksums_no_uploads(self, mock_verify):
        submission = Submission.objects.first()
        retrigger_cloud_upload_checksums(None, None, Submission.objects.filter(pk=submission.pk))
        mock_verify.assert_not_called()

    def test_retrigger_cloud_upload_checksums_registered_on_submission_admin(self):
        self.assertIn(retrigger_cloud_upload_checksums, SubmissionAdmin.actions)

    def test_retrigger_cloud_upload_checksums_in_curator_action_definitions(self):
        matching = [action for action in ACTION_DEFINITIONS if action["key"] == "retrigger_cloud_upload_checksums"]
        self.assertEqual(1, len(matching))
        self.assertEqual(retrigger_cloud_upload_checksums, matching[0]["callable"])

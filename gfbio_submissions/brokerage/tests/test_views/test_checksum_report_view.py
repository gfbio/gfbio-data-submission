import json

from django.test import Client, TestCase
from django.urls import reverse

from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.users.models import User

from dt_upload.models import FileUploadRequest

class ChecksumValidationReportViewTestCase(TestCase):
    def setUp(self):
        self.test_user = User.objects.create_user(username="testuser")

        self.client = Client()

    def test_get_checksum_validation_report_working(self):
        submission = Submission.objects.create(user=self.test_user)
        submission.save()
        file_upload = FileUploadRequest.objects.create(
            original_filename="meta.csv",
            file_key="meta.csv-key",
            file_type="csv",
            status="UPLOADED",
            user=submission.user,
        )
        file_upload.save()
        cloud_upload = SubmissionCloudUpload.objects.create(
            submission=submission,
            meta_data=True,
            file_upload=file_upload,
            status=SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM,
        )
        cloud_upload.save()
        
        self.client.force_login(user=self.test_user)
        url = reverse(
            "brokerage:checksum_validation_report",
            kwargs={"broker_submission_id": str(submission.broker_submission_id)},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/json')
        content = json.loads(response.content)
        self.assertEqual("SUCCESS", content["status"])
        self.assertEqual(1, content["success_count"])
        self.assertEqual(0, content["error_count"])
        self.assertEqual(0, content["warning_count"])
        self.assertEqual(0, content["pending_count"])
        self.assertIn("All files (1) were validated successfully.", content["message"])
        self.assertEqual(1, len(content["findings"]))

    def test_get_checksum_validation_report_broken(self):
        submission = Submission.objects.create(user=self.test_user)
        submission.save()
        file_upload_pending = FileUploadRequest.objects.create(
            original_filename="meta.csv",file_key="meta.csv-key",file_type="csv",status="PENDING",user=submission.user,
        )
        file_upload_pending.save()
        cloud_upload_pending = SubmissionCloudUpload.objects.create(
            submission=submission, meta_data=True, file_upload=file_upload_pending, status=SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM,
        )
        cloud_upload_pending.save()
        
        file_upload_bad_chksm = FileUploadRequest.objects.create(
            original_filename="meta2.csv",file_key="meta2.csv-key",file_type="csv",status="UPLOADED",user=submission.user,
        )
        file_upload_bad_chksm.save()
        cloud_upload_bad_chksm = SubmissionCloudUpload.objects.create(
            submission=submission, meta_data=True, file_upload=file_upload_bad_chksm, status=SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM,
        )
        cloud_upload_bad_chksm.save()

        file_upload_not_checked_yet = FileUploadRequest.objects.create(
            original_filename="meta3.csv", file_key="meta3.csv-key", file_type="csv", status="UPLOADED", user=submission.user,
        )
        file_upload_not_checked_yet.save()
        cloud_upload_not_checked_yet = SubmissionCloudUpload.objects.create(
            submission=submission, meta_data=True, file_upload=file_upload_not_checked_yet, status=SubmissionCloudUpload.STATUS_UPLOADED,
        )
        cloud_upload_not_checked_yet.save()

        file_upload_failed = FileUploadRequest.objects.create(
            original_filename="meta4.csv", file_key="meta4.csv-key", file_type="csv", status="FAILED", user=submission.user,
        )
        file_upload_failed.save()
        cloud_upload_failed = SubmissionCloudUpload.objects.create(
            submission=submission, meta_data=True, file_upload=file_upload_failed, status=SubmissionCloudUpload.STATUS_UPLOADED,
        )
        cloud_upload_failed.save()

        self.client.force_login(user=self.test_user)
        url = reverse(
            "brokerage:checksum_validation_report",
            kwargs={"broker_submission_id": str(submission.broker_submission_id)},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/json')
        content = json.loads(response.content)
        print(content)
        self.assertEqual("ERROR", content["status"])
        self.assertEqual(0, content["success_count"])
        self.assertEqual(1, content["error_count"])
        self.assertEqual(1, content["warning_count"])
        self.assertEqual(2, content["pending_count"])
        self.assertIn("0 files were validated successfully.", content["message"])
        self.assertIn("There are 1 failed checksum validations.", content["message"])
        self.assertIn("Try upload the failed files again or contact the curator if the problem persists.", content["message"])
        self.assertIn("There are 2 pending checksum validations.", content["message"])
        self.assertIn("Give the pending files some time to be validated or contact the curator if the problem persists.", content["message"])
        self.assertIn("There are 1 warnings for files of the submission.", content["message"])
        self.assertIn("Reupload them or remove them if they are not needed.", content["message"])
        self.assertEqual(4, len(content["findings"]))

    def test_get_checksum_validation_report_no_permission(self):
        submission = Submission.objects.create(user=self.test_user)
        submission.save()
        self.client.force_login(user=User.objects.create_user(username="otheruser"))
        url = reverse(
            "brokerage:checksum_validation_report",
            kwargs={"broker_submission_id": str(submission.broker_submission_id)},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_get_checksum_validation_report_not_found(self):
        self.client.force_login(user=self.test_user)
        url = reverse(
            "brokerage:checksum_validation_report",
            kwargs={"broker_submission_id": "00000000-0000-0000-0000-000000000000"},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)
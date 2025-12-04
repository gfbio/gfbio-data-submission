import os
import hashlib
import boto3

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from moto import mock_s3

from dt_upload.models import FileUploadRequest, MultiPartUpload
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.users.models import User


@override_settings(
    AWS_STORAGE_BUCKET_NAME="test-bucket",
    AWS_ACCESS_KEY_ID="fake_access_key",
    AWS_SECRET_ACCESS_KEY="fake_secret_key",
    AWS_S3_REGION_NAME="us-east-1",
    AWS_S3_ENDPOINT_URL=None,
    DJANGO_UPLOAD_TOOLS_USE_CLOUD_UPLOAD=True,
    DJANGO_UPLOAD_TOOLS_USE_REUPLOAD=False,
    # Celery inline for tests
    CELERY_TASK_ALWAYS_EAGER=True,
    CELERY_TASK_EAGER_PROPAGATES=True,
)
class TestSignals(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        # Start moto and create the fake S3 bucket
        cls._moto = mock_s3()
        cls._moto.start()

        s3 = boto3.client(
            "s3",
            region_name=settings.AWS_S3_REGION_NAME,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
        s3.create_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
        cls._s3 = s3

    @classmethod
    def tearDownClass(cls):
        try:
            cls._moto.stop()
        finally:
            super().tearDownClass()

    def test_file_upload_postprocessing(self):
        submission_id = "00c0ffee-c0ff-c0ff-c0ff-c0ffeec0ffee"

        user = User.objects.create(username="user1")

        submission = Submission.objects.create(
            broker_submission_id=submission_id,
            user=user,
            target="ENA",
            release=False,
            data={},
        )

        # Step 1: create FileUploadRequest with a file_key, but no file yet.
        # This simulates the state after frontend / multipart setup.
        fur = FileUploadRequest.objects.create(
            original_filename="TestFile.txt",
            file_key=f"{submission_id}/TestFile.txt",
            file_size=17,
            s3_bucket=settings.AWS_STORAGE_BUCKET_NAME,
            s3_presigned_url="-",
            s3_location=f"https://s3.standin.test/{submission_id}/TestFile.txt",
            sha256="123",
            md5="123",
        )

        MultiPartUpload.objects.create(file_upload_request=fur)

        SubmissionCloudUpload.objects.create(
            submission=submission,
            file_upload=fur,
            file_upload_id=fur.id,
        )

        # Step 2: FIRST admin upload (empty -> file).
        initial_content = b"initial-content"
        initial_file = SimpleUploadedFile("TestFile.txt", initial_content)
        fur.uploaded_file = initial_file
        fur.save()

        fur.refresh_from_db()
        initial_name = fur.uploaded_file.name

        # Name behaviour for the first upload, since repeats of this test do not guarantee
        # deletion of files, so a re-run would fail if comparing directly with the filename
        # since then it would have a suffix:
        # 1) must live under the submission prefix
        self.assertTrue(initial_name.startswith(f"{submission_id}/"))
        # 2) basename should start with "TestFile"
        self.assertTrue(os.path.basename(initial_name).startswith("TestFile"))

        # checksums unchanged (still the placeholder values)
        self.assertEqual(fur.md5, "123")
        self.assertEqual(fur.sha256, "123")

        # Step 3: ADMIN REUPLOAD (file -> new file).
        # This should trigger:
        #   - pre_save flag
        #   - post_save -> status "PENDING-admin-upload"
        #   - Celery task -> move_file_and_update_file_upload -> recomputed checksums
        new_content = b"Content?"
        new_file = SimpleUploadedFile("NewFile.txt", new_content)
        fur.uploaded_file = new_file
        fur.save()

        updated_fur = FileUploadRequest.objects.get(pk=fur.id)

        new_name = updated_fur.uploaded_file.name

        # 1) It must still be in the submission folder
        self.assertTrue(new_name.startswith(f"{submission_id}/"))
        # 2) The basename must start with the new filename's base ("NewFile")
        self.assertTrue(os.path.basename(new_name).startswith("NewFile"))
        # 3) It must differ from the original uploaded path
        self.assertNotEqual(new_name, initial_name)

        # Check that checksums match the NEW content
        expected_md5 = hashlib.md5(new_content).hexdigest()
        expected_sha256 = hashlib.sha256(new_content).hexdigest()

        self.assertEqual(updated_fur.md5, expected_md5)
        self.assertEqual(updated_fur.sha256, expected_sha256)

        # And the object actually exists in (mocked) S3 via storage
        storage = updated_fur.uploaded_file.storage
        self.assertTrue(storage.exists(updated_fur.uploaded_file.name))

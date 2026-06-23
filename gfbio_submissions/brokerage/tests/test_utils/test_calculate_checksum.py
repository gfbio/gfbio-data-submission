from django.test import TestCase
from django.conf import settings

from dt_upload.models import FileUploadRequest
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.utils.s3fs import calculate_checksum_locally


class TestChecksumUtils(TestCase):
    def test_md5_calculation(self):
        settings.S3FS_MOUNT_POINT = "/app/gfbio_submissions/brokerage/tests/test_data/jpg_files/"
        fu = FileUploadRequest(file_key="Holotype_FGZC3761.jpg")
        scu = SubmissionCloudUpload(file_upload=fu)
        result = calculate_checksum_locally("md5", scu)
        self.assertEqual("debf8a985fc8d6b99a5b12ef76a0df59", result)

    def test_sha_calculation(self):
        settings.S3FS_MOUNT_POINT = "/app/gfbio_submissions/brokerage/tests/test_data/jpg_files/"
        fu = FileUploadRequest(file_key="Holotype_FGZC3761.jpg")
        scu = SubmissionCloudUpload(file_upload=fu)
        result = calculate_checksum_locally("sha256", scu)
        self.assertEqual("994f890869eaef311201aaba70cb8f8ad092ed848316ca6bc544015079436623", result)
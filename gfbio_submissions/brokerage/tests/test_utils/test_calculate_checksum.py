import hashlib
from unittest.mock import MagicMock, patch

from botocore.exceptions import ClientError
from django.test import TestCase, override_settings
from dt_upload.models import FileUploadRequest

from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.utils.cloud_upload_checksum import calculate_checksum_locally

GET_S3_CLIENT_PATH = "gfbio_submissions.brokerage.utils.cloud_upload_checksum.backend_based_upload_mixins.get_s3_client"
CLIENT_BUCKET = "client-returned-bucket"
SETTINGS_BUCKET = "settings-bucket"
FILE_KEY = "broker-id/sample.fastq.gz"
CHUNK_SIZE = 8 * 1024 * 1024
DETERMINISTIC_BYTES = b"deterministic-checksum-payload"


def _client_error(code, status=None, operation="HeadObject"):
    error_response = {"Error": {"Code": code, "Message": "boom"}}
    if status is not None:
        error_response["ResponseMetadata"] = {"HTTPStatusCode": status}
    return ClientError(error_response, operation)


@override_settings(AWS_STORAGE_BUCKET_NAME=SETTINGS_BUCKET)
class TestChecksumUtils(TestCase):
    def setUp(self):
        self.file_upload = FileUploadRequest(file_key=FILE_KEY)
        self.submission_cloud_upload = SubmissionCloudUpload(file_upload=self.file_upload)

    def _mock_s3(self, chunks=None, head_side_effect=None, get_side_effect=None):
        body = MagicMock()
        if chunks is not None:
            body.iter_chunks.return_value = iter(chunks)
        s3_client = MagicMock()
        if head_side_effect is not None:
            s3_client.head_object.side_effect = head_side_effect
        else:
            s3_client.head_object.return_value = {"ContentLength": 1}
        if get_side_effect is not None:
            s3_client.get_object.side_effect = get_side_effect
        else:
            s3_client.get_object.return_value = {"Body": body}
        return s3_client, body

    def _assert_head_and_get_once(self, s3_client, get_object_called=True):
        s3_client.head_object.assert_called_once_with(Bucket=CLIENT_BUCKET, Key=FILE_KEY)
        if get_object_called:
            s3_client.get_object.assert_called_once_with(Bucket=CLIENT_BUCKET, Key=FILE_KEY)
        else:
            s3_client.get_object.assert_not_called()

    @patch(GET_S3_CLIENT_PATH)
    def test_md5_calculation(self, get_s3_mock):
        s3_client, body = self._mock_s3(chunks=[DETERMINISTIC_BYTES])
        get_s3_mock.return_value = (CLIENT_BUCKET, s3_client)

        result = calculate_checksum_locally("md5", self.submission_cloud_upload)

        self.assertEqual(hashlib.md5(DETERMINISTIC_BYTES).hexdigest(), result)
        get_s3_mock.assert_called_once()
        self._assert_head_and_get_once(s3_client)
        body.iter_chunks.assert_called_once_with(chunk_size=CHUNK_SIZE)
        body.close.assert_called_once()

    @patch(GET_S3_CLIENT_PATH)
    def test_sha256_calculation(self, get_s3_mock):
        s3_client, body = self._mock_s3(chunks=[DETERMINISTIC_BYTES])
        get_s3_mock.return_value = (CLIENT_BUCKET, s3_client)

        result = calculate_checksum_locally("sha256", self.submission_cloud_upload)

        self.assertEqual(hashlib.sha256(DETERMINISTIC_BYTES).hexdigest(), result)
        get_s3_mock.assert_called_once()
        self._assert_head_and_get_once(s3_client)
        body.iter_chunks.assert_called_once_with(chunk_size=CHUNK_SIZE)
        body.close.assert_called_once()

    @patch(GET_S3_CLIENT_PATH)
    def test_streams_multiple_chunks_and_uses_client_bucket(self, get_s3_mock):
        chunks = [b"aaa", b"bbb", b"ccc"]
        s3_client, body = self._mock_s3(chunks=chunks)
        get_s3_mock.return_value = (CLIENT_BUCKET, s3_client)

        result = calculate_checksum_locally("md5", self.submission_cloud_upload)

        self.assertEqual(hashlib.md5(b"".join(chunks)).hexdigest(), result)
        self.assertNotEqual(CLIENT_BUCKET, SETTINGS_BUCKET)
        get_s3_mock.assert_called_once()
        self._assert_head_and_get_once(s3_client)
        body.iter_chunks.assert_called_once_with(chunk_size=CHUNK_SIZE)
        body.close.assert_called_once()

    @patch(GET_S3_CLIENT_PATH)
    def test_closes_body_after_iteration_error(self, get_s3_mock):
        s3_client, body = self._mock_s3()
        body.iter_chunks.side_effect = RuntimeError("stream failed")
        get_s3_mock.return_value = (CLIENT_BUCKET, s3_client)

        with self.assertRaises(RuntimeError):
            calculate_checksum_locally("md5", self.submission_cloud_upload)

        get_s3_mock.assert_called_once()
        self._assert_head_and_get_once(s3_client)
        body.close.assert_called_once()

    @patch(GET_S3_CLIENT_PATH)
    def test_missing_object_on_head_returns_empty_string(self, get_s3_mock):
        s3_client, body = self._mock_s3(head_side_effect=_client_error("404", status=404, operation="HeadObject"))
        get_s3_mock.return_value = (CLIENT_BUCKET, s3_client)

        result = calculate_checksum_locally("md5", self.submission_cloud_upload)

        self.assertEqual("", result)
        get_s3_mock.assert_called_once()
        self._assert_head_and_get_once(s3_client, get_object_called=False)
        body.close.assert_not_called()

    @patch(GET_S3_CLIENT_PATH)
    def test_missing_object_on_head_http_404_without_error_code_returns_empty_string(self, get_s3_mock):
        error = ClientError(
            {"Error": {"Message": "Not Found"}, "ResponseMetadata": {"HTTPStatusCode": 404}},
            "HeadObject",
        )
        s3_client, body = self._mock_s3(head_side_effect=error)
        get_s3_mock.return_value = (CLIENT_BUCKET, s3_client)

        result = calculate_checksum_locally("md5", self.submission_cloud_upload)

        self.assertEqual("", result)
        get_s3_mock.assert_called_once()
        self._assert_head_and_get_once(s3_client, get_object_called=False)
        body.close.assert_not_called()

    @patch(GET_S3_CLIENT_PATH)
    def test_missing_object_on_get_after_head_returns_empty_string(self, get_s3_mock):
        s3_client, body = self._mock_s3(get_side_effect=_client_error("NoSuchKey", status=404, operation="GetObject"))
        get_s3_mock.return_value = (CLIENT_BUCKET, s3_client)

        result = calculate_checksum_locally("md5", self.submission_cloud_upload)

        self.assertEqual("", result)
        get_s3_mock.assert_called_once()
        self._assert_head_and_get_once(s3_client)
        body.close.assert_not_called()

    @patch(GET_S3_CLIENT_PATH)
    def test_non_404_client_error_on_head_propagates(self, get_s3_mock):
        error = _client_error("AccessDenied", status=403, operation="HeadObject")
        s3_client, body = self._mock_s3(head_side_effect=error)
        get_s3_mock.return_value = (CLIENT_BUCKET, s3_client)

        with self.assertRaises(ClientError) as caught:
            calculate_checksum_locally("md5", self.submission_cloud_upload)

        self.assertIs(error, caught.exception)
        s3_client.get_object.assert_not_called()
        body.close.assert_not_called()

    @patch(GET_S3_CLIENT_PATH)
    def test_non_404_client_error_on_get_propagates(self, get_s3_mock):
        error = _client_error("InternalError", status=500, operation="GetObject")
        s3_client, body = self._mock_s3(get_side_effect=error)
        get_s3_mock.return_value = (CLIENT_BUCKET, s3_client)

        with self.assertRaises(ClientError) as caught:
            calculate_checksum_locally("md5", self.submission_cloud_upload)

        self.assertIs(error, caught.exception)
        body.close.assert_not_called()

    @patch(GET_S3_CLIENT_PATH)
    def test_invalid_checksum_method_raises_without_s3_call(self, get_s3_mock):
        with self.assertRaises(ValueError):
            calculate_checksum_locally("sha1", self.submission_cloud_upload)

        get_s3_mock.assert_not_called()

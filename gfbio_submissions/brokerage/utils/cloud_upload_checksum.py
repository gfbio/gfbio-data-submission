"""Stream MD5/SHA256 checksums for cloud uploads from S3 via boto3."""

import hashlib

from botocore.exceptions import ClientError
from dt_upload.views import backend_based_upload_mixins

CHUNK_SIZE = 8 * 1024 * 1024
_MISSING_OBJECT_CODES = {"404", "NoSuchKey", "NotFound"}
_TRANSIENT_S3_ERROR_CODES = {"SlowDown", "RequestTimeout", "InternalError", "ServiceUnavailable"}


def _is_missing_object_error(exc):
    response = getattr(exc, "response", None) or {}
    code = (response.get("Error") or {}).get("Code")
    status = (response.get("ResponseMetadata") or {}).get("HTTPStatusCode")
    return code in _MISSING_OBJECT_CODES or status == 404


def _is_transient_s3_error(exc):
    response = getattr(exc, "response", None) or {}
    code = (response.get("Error") or {}).get("Code")
    status = (response.get("ResponseMetadata") or {}).get("HTTPStatusCode")
    try:
        status = int(status)
    except (TypeError, ValueError):
        status = None
    return code in _TRANSIENT_S3_ERROR_CODES or status in (408, 429) or (status is not None and 500 <= status <= 599)


def calculate_checksum_locally(checksum_method, submission_cloud_upload):
    if checksum_method == "md5":
        file_hash = hashlib.md5()
    elif checksum_method == "sha256":
        file_hash = hashlib.sha256()
    else:
        raise ValueError(f"Unsupported checksum_method {checksum_method!r}; expected 'md5' or 'sha256'")

    bucket_name, s3_client = backend_based_upload_mixins.get_s3_client()
    key = submission_cloud_upload.file_upload.file_key

    try:
        s3_client.head_object(Bucket=bucket_name, Key=key)
    except ClientError as exc:
        if _is_missing_object_error(exc):
            return ""
        raise

    body = None
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=key)
        body = response["Body"]
        for chunk in body.iter_chunks(chunk_size=CHUNK_SIZE):
            file_hash.update(chunk)
        return file_hash.hexdigest()
    except ClientError as exc:
        if _is_missing_object_error(exc):
            return ""
        raise
    finally:
        if body is not None:
            body.close()

import hashlib
import os
from django.conf import settings

def calculate_checksum_locally(checksum_method, submission_cloud_upload):
    file_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{submission_cloud_upload.file_upload.file_key}"
    if os.path.exists(file_path):
        with open(file_path, 'rb') as f:
            if checksum_method == "md5":
                file_hash = hashlib.md5()
            elif checksum_method == "sha256":
                file_hash = hashlib.sha256()
            while chunk := f.read(8192):
                file_hash.update(chunk)
        return file_hash.hexdigest()
    return ""
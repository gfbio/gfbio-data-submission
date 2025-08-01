import hashlib
import os
from django.conf import settings

def calculate_checksum_locally(checksum_method, submission_cloud_upload):
    file_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{submission_cloud_upload.file_upload.file_key}"
    checksum = ""
    if os.path.exists(file_path):
        with open(file_path, 'rb') as f:
            f_read = f.read()
            if checksum_method == "md5":
                checksum = hashlib.md5(f_read).hexdigest()
            elif checksum_method == "sha256":
                checksum = hashlib.sha256(f_read).hexdigest()
    return checksum
from django.db import models

from .submission import Submission


class ChecksumValidationReport():
    error_count = 0
    warning_count = 0
    info_count = 0
    success_count = 0
    pending_count = 0
    
    message = "PENDING"
    status = "PENDING"
    checksumfileresults = []


class ChecksumFileResult():
    upload_pk = 0
    file_name = ""
    file_md5_checksum = ""
    status = "PENDING"
    message = ""
    
    def __init__(self, upload_pk, file_name, file_md5_checksum, status, message):
        self.upload_pk = upload_pk
        self.file_name = file_name
        self.file_md5_checksum = file_md5_checksum
        self.status = status
        self.message = message

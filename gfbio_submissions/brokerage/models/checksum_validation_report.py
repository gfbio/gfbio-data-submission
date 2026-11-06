class ChecksumValidationReport():
    def __init__(self):
        self.error_count = 0
        self.warning_count = 0
        self.success_count = 0
        self.pending_count = 0
        self.message = "PENDING"
        self.status = "PENDING"
        self.findings = []


class ChecksumFileResult():
    def __init__(self, upload_pk, file_name, file_md5_checksum, status, message):
        self.upload_pk = upload_pk
        self.file_name = file_name
        self.file_md5_checksum = file_md5_checksum
        self.status = status
        self.message = message

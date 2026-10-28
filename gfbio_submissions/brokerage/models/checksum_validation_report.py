from django.db import models
from model_utils.models import TimeStampedModel

from config.settings.base import AUTH_USER_MODEL

from .submission import Submission
from .submission_cloud_upload import SubmissionCloudUpload


class ChecksumValidationReport(TimeStampedModel):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    error_count = models.PositiveIntegerField(default=0)
    warning_count = models.PositiveIntegerField(default=0)
    info_count = models.PositiveIntegerField(default=0)
    verdict = models.CharField(max_length=255, default="PENDING")
    staus = models.CharField(max_length=10, default="PENDING")

    def __str__(self):
        return f"Checksum Report for submission '{self.submission.broker_submission_id.__str__()[0:8]}...'"

    class Meta:
        managed = False


class ChecksumFileResult(TimeStampedModel):
    report = models.ForeignKey(ChecksumValidationReport, on_delete=models.CASCADE)
    upload_pk = models.IntegerField()
    file_name = models.CharField(max_length=255)
    file_md5_checksum = models.CharField(max_length=255)
    status = models.CharField(max_length=10, default="PENDING")
    message = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Checksum Result for file '{self.file_name}' in report '{self.report.id}'"

    class Meta:
        managed = False
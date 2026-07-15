from django.db import models
from model_utils.models import TimeStampedModel

from config.settings.base import AUTH_USER_MODEL

from .submission import Submission
from .submission_cloud_upload import SubmissionCloudUpload


class MetadataValidationReport(TimeStampedModel):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    upload_file = models.ForeignKey(SubmissionCloudUpload, on_delete=models.CASCADE)
    file_md5_checksum = models.CharField(max_length=255)
    triggered_by = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="metadata_validation_reports_triggered",
        help_text="User who triggered validation. Jira comments are public when this matches submission.user, otherwise internal.",
    )

    def __str__(self):
        return f"Report for sub '{self.submission.broker_submission_id.__str__()[0:8]}...', file '{self.upload_file.file_upload.original_filename}' ({self.file_md5_checksum[0:8]}...)"


class ValidationTaskReport(TimeStampedModel):
    STATUSES = (
        ("PENDING", "PENDING"),
        ("SUCCESS", "SUCCESS"),
        ("WARNING", "WARNING"),
        ("ERROR", "ERROR")
    )
    report = models.ForeignKey(MetadataValidationReport, on_delete=models.CASCADE)
    status = models.CharField(choices=STATUSES, max_length=10, default="PENDING")
    task_name = models.CharField(max_length=255)

    def __str__(self):
        return f"Report {self.task_name}, status {self.status}"

class ValidationFinding(models.Model):
    STATUSES = (
        ("INFO", "INFO"),
        ("WARNING", "WARNING"),
        ("ERROR", "ERROR")
    )
    task_report = models.ForeignKey(ValidationTaskReport, on_delete=models.CASCADE)
    status = models.CharField(choices=STATUSES, max_length=10, default="ERROR")
    row = models.IntegerField(null=True) # row 1 == header-row
    column = models.IntegerField(null=True) #1-based
    column_name = models.CharField(max_length=255, null=True)
    message = models.TextField()
    help_text = models.TextField()

    def __str__(self):
        return f"Finding with status {self.status}; {self.message[0:25]}..."
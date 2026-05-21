from django.db import models
from model_utils.models import TimeStampedModel

from .submission import Submission
from .submission_cloud_upload import SubmissionCloudUpload

class MetadataValidationReport(TimeStampedModel):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    upload_file = models.ForeignKey(SubmissionCloudUpload, on_delete=models.CASCADE)


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


class ValidationFinding(models.Model):
    STATUSES = (
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
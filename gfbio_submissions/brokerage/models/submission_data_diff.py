from django.db import models


class SubmissionDataDiff(models.Model):
    """Field-level diff of Submission.data for one audit log row."""

    log_entry = models.OneToOneField(
        "auditlog.LogEntry",
        on_delete=models.CASCADE,
        related_name="submission_data_diff",
    )
    diff = models.JSONField()

    def __str__(self):
        return f"Submission data diff for log entry {self.log_entry_id}"

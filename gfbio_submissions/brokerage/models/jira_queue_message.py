
from django.db import models
from model_utils.models import TimeStampedModel

class JiraQueueMessage(TimeStampedModel):
    TYPE_CHECKSUM_CALCULATED = "CHECKSUM_CALCULATED"

    STATUS_NOT_SENT = "NOT_SENT"
    STATUS_PICKED_UP = "PICKED_UP"
    STATUS_SENT = "SENT"
    STATUS_ERROR = "ERROR"

    TYPES = (
        (TYPE_CHECKSUM_CALCULATED, TYPE_CHECKSUM_CALCULATED),
    )

    STATUSES = (
        (STATUS_NOT_SENT, "Not sent"),
        (STATUS_PICKED_UP, "Picked up"),
        (STATUS_SENT, "Sent"),
        (STATUS_ERROR, "Error"),
    )

    type = models.CharField(max_length=32, choices=TYPES)
    status = models.CharField(choices=STATUSES, max_length=10, default="NOT_SENT")
    data = models.JSONField()
    submission_id = models.IntegerField()
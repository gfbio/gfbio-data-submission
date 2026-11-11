import json
import logging
from contextvars import ContextVar

from auditlog.context import threadlocal
from auditlog.models import LogEntry
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import transaction

from gfbio_submissions.brokerage.models.submission_data_diff import SubmissionDataDiff
from gfbio_submissions.brokerage.submission_data_diff import diff_submission_data

# Identical old and new values. auditlog only stores a field when the values differ,
# so this pair never collides with a real diff. The audit page renders it as
# "data: changed" and the payload stays out of the log row.
DATA_CHANGED_LABEL = "changed"
DATA_CHANGED_MARKER = [DATA_CHANGED_LABEL, DATA_CHANGED_LABEL]

_data_audit_watermark = ContextVar("submission_data_audit_watermark", default=None)

logger = logging.getLogger(__name__)


def _auditlog_skips_save(kwargs):
    if getattr(threadlocal, "auditlog_disabled", False):
        return True
    return bool(kwargs.get("raw") and getattr(settings, "AUDITLOG_DISABLE_ON_RAW_SAVE", False))


def _diff_has_entries(diff):
    return bool(diff["added"] or diff["removed"] or diff["changed"])


def note_submission_data_change(sender, instance, **kwargs):
    """Remember a data change before auditlog writes the field diff.

    Connected to pre_save ahead of auditlog. The field-level diff is stashed
    with the log watermark so the follow-up receiver can store it without
    reading the submission again.
    """
    update_fields = kwargs.get("update_fields")
    if instance.pk is None or _auditlog_skips_save(kwargs):
        _data_audit_watermark.set(None)
        return
    if update_fields is not None and "data" not in update_fields:
        _data_audit_watermark.set(None)
        return

    previous_rows = list(sender.objects.filter(pk=instance.pk).values_list("data", flat=True)[:1])
    if not previous_rows or previous_rows[0] == instance.data:
        _data_audit_watermark.set(None)
        return

    watermark = LogEntry.objects.order_by("-pk").values_list("pk", flat=True).first() or 0
    diff = diff_submission_data(previous_rows[0], instance.data)
    _data_audit_watermark.set({"watermark": watermark, "diff": diff})


def record_submission_data_change(sender, instance, **kwargs):
    """Attach the data marker after auditlog's pre_save receiver.

    The marker lands on the row auditlog just created, or on a new row when
    data was the only change. A non-empty diff is stored beside that row.
    A failure to store the diff keeps the marker and does not block the save.
    """
    pending = _data_audit_watermark.get()
    _data_audit_watermark.set(None)
    if pending is None or instance.pk is None:
        return

    watermark = pending["watermark"]
    diff = pending["diff"]
    content_type = ContentType.objects.get_for_model(instance)
    entry = (
        LogEntry.objects.filter(content_type=content_type, object_pk=str(instance.pk), pk__gt=watermark)
        .order_by("-pk")
        .first()
    )
    if entry is None:
        entry = LogEntry.objects.log_create(
            instance,
            action=LogEntry.Action.UPDATE,
            changes=json.dumps({"data": DATA_CHANGED_MARKER}),
        )
    else:
        changes = entry.changes_dict
        if changes.get("data") == DATA_CHANGED_MARKER:
            return
        changes["data"] = DATA_CHANGED_MARKER
        entry.changes = json.dumps(changes)
        entry.save(update_fields=["changes"])

    if entry is None or not _diff_has_entries(diff):
        return

    # Savepoint so a database error while storing the diff does not abort the submission save.
    try:
        with transaction.atomic():
            SubmissionDataDiff.objects.get_or_create(log_entry=entry, defaults={"diff": diff})
    except Exception:
        logger.exception(
            "Failed to store submission data diff | submission_pk=%s log_entry_pk=%s",
            instance.pk,
            entry.pk,
        )

import json
from contextvars import ContextVar

from auditlog.context import threadlocal
from auditlog.models import LogEntry
from django.conf import settings
from django.contrib.contenttypes.models import ContentType

# Identical old and new values. auditlog only stores a field when the values differ,
# so this pair never collides with a real diff. The audit page renders it as
# "data: changed" and the payload stays out of the log row.
DATA_CHANGED_LABEL = "changed"
DATA_CHANGED_MARKER = [DATA_CHANGED_LABEL, DATA_CHANGED_LABEL]

_data_audit_watermark = ContextVar("submission_data_audit_watermark", default=None)


def _auditlog_skips_save(kwargs):
    if getattr(threadlocal, "auditlog_disabled", False):
        return True
    return bool(kwargs.get("raw") and getattr(settings, "AUDITLOG_DISABLE_ON_RAW_SAVE", False))


def note_submission_data_change(sender, instance, **kwargs):
    """Remember a data change before auditlog writes the field diff.

    Connected to pre_save ahead of auditlog. The follow-up receiver then attaches
    the marker to the row auditlog just created, or writes its own row.
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
    _data_audit_watermark.set(watermark)


def record_submission_data_change(sender, instance, **kwargs):
    """Attach the data marker after auditlog's pre_save receiver."""
    watermark = _data_audit_watermark.get()
    _data_audit_watermark.set(None)
    if watermark is None or instance.pk is None:
        return

    content_type = ContentType.objects.get_for_model(instance)
    entry = (
        LogEntry.objects.filter(content_type=content_type, object_pk=str(instance.pk), pk__gt=watermark)
        .order_by("-pk")
        .first()
    )
    if entry is None:
        LogEntry.objects.log_create(
            instance,
            action=LogEntry.Action.UPDATE,
            changes=json.dumps({"data": DATA_CHANGED_MARKER}),
        )
        return

    changes = entry.changes_dict
    if changes.get("data") == DATA_CHANGED_MARKER:
        return
    changes["data"] = DATA_CHANGED_MARKER
    entry.changes = json.dumps(changes)
    entry.save(update_fields=["changes"])

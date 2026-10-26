from contextlib import contextmanager
from contextvars import ContextVar

from django.contrib.admin.models import CHANGE, LogEntry
from django.contrib.admin.utils import model_format_dict
from django.contrib.contenttypes.models import ContentType
from django.utils.encoding import force_str

from .audit_context import submission_audit_context

ACTIONS_WITHOUT_AUDIT_LOG = frozenset(
    {
        "delete_selected",
        "download_auditable_text_data",
        "download_submission_upload_file",
        "download_submission_cloud_upload_file",
    }
)

_CHANNEL_PREFIX = {
    "admin": "Admin action: ",
    "curator": "Curator action: ",
}

# Objects an action skipped. None outside an action request.
_skipped_action_pks = ContextVar("skipped_admin_action_pks", default=None)


def posted_action_name(request):
    """Match Django's admin action resolution, including a negative index.

    An index outside the posted list does not raise. Django leaves the list
    unchanged, and the action form then reads the last posted name.
    """
    actions = request.POST.getlist("action")
    if not actions:
        return None
    try:
        index = int(request.POST.get("index", 0))
    except (TypeError, ValueError):
        index = 0
    try:
        return actions[index]
    except IndexError:
        return actions[-1]


def skip_admin_action_log(obj):
    """Drop one object from the history line of the action currently running."""
    skipped = _skipped_action_pks.get()
    if skipped is None or obj is None:
        return
    skipped.add(str(obj.pk))


@contextmanager
def skipped_admin_action_scope():
    skipped = set()
    token = _skipped_action_pks.set(skipped)
    try:
        yield skipped
    finally:
        _skipped_action_pks.reset(token)


def action_description(model_admin, request, action_name):
    actions = model_admin.get_actions(request)
    if action_name not in actions:
        return None
    description = str(actions[action_name][2])
    try:
        description = description % model_format_dict(model_admin.opts)
    except (TypeError, ValueError):
        pass
    return description


def selected_pks(request, queryset):
    if request.POST.get("select_across") == "1":
        return list(queryset.values_list("pk", flat=True))
    return request.POST.getlist("_selected_action")


def objects_for_action_log(model, pks):
    queryset = model.objects.filter(pk__in=pks)
    if model._meta.model_name == "submissioncloudupload":
        queryset = queryset.select_related("submission", "file_upload")
    return list(queryset)


def log_admin_action(user, objects, description, channel):
    if not objects or user is None or not getattr(user, "is_authenticated", False):
        return
    prefix = _CHANNEL_PREFIX[channel]
    change_message = f"{prefix}{description}"
    content_type = ContentType.objects.get_for_model(objects[0].__class__)
    LogEntry.objects.bulk_create(
        [
            LogEntry(
                user_id=user.pk,
                content_type=content_type,
                object_id=str(obj.pk),
                object_repr=force_str(obj)[:200],
                action_flag=CHANGE,
                change_message=change_message,
            )
            for obj in objects
        ]
    )


class AdminActionLogMixin:
    def response_action(self, request, queryset):
        action_name = posted_action_name(request)
        description = None
        if action_name and action_name not in ACTIONS_WITHOUT_AUDIT_LOG:
            description = action_description(self, request, action_name)
        pks = selected_pks(request, queryset)
        with skipped_admin_action_scope() as skipped:
            if description:
                with submission_audit_context(description, "admin"):
                    response = super().response_action(request, queryset)
            else:
                response = super().response_action(request, queryset)
            logged_pks = [pk for pk in pks if str(pk) not in skipped]
            if response is not None and description and logged_pks:
                log_admin_action(
                    request.user,
                    objects_for_action_log(self.model, logged_pks),
                    description,
                    "admin",
                )
        return response

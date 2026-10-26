from contextlib import contextmanager
from contextvars import ContextVar

_submission_audit_context = ContextVar("submission_audit_context", default=None)


def current_submission_audit_context():
    return _submission_audit_context.get()


@contextmanager
def submission_audit_context(action, channel, jira_user=None):
    payload = {"action": action, "channel": channel}
    if jira_user:
        payload["jira_user"] = jira_user
    token = _submission_audit_context.set(payload)
    try:
        yield
    finally:
        _submission_audit_context.reset(token)

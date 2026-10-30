from contextlib import contextmanager
from contextvars import ContextVar

_submission_audit_context = ContextVar("submission_audit_context", default=None)
# Tokens from _submission_audit_context.set(), only so postrun can reset in order.
_celery_audit_reset_tokens = ContextVar("celery_audit_reset_tokens", default=())


def current_submission_audit_context():
    return _submission_audit_context.get()


def push_celery_audit_context(task_name):
    token = _submission_audit_context.set({"action": task_name, "channel": "celery"})
    _celery_audit_reset_tokens.set(_celery_audit_reset_tokens.get() + (token,))


def pop_celery_audit_context():
    stack = _celery_audit_reset_tokens.get()
    if not stack:
        return
    token = stack[-1]
    _celery_audit_reset_tokens.set(stack[:-1])
    _submission_audit_context.reset(token)


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

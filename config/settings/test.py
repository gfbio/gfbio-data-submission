"""
With these settings, tests run faster.
"""

from .base import *  # noqa
from .base import env

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
SECRET_KEY = env(
    "DJANGO_SECRET_KEY",
    default="H199xxrHqXY5gjpcfQqid8gp5exRf3sZCSWT1mVYDfQatOj5La0p2YGZxwq5yilz",
)
# https://docs.djangoproject.com/en/dev/ref/settings/#test-runner
TEST_RUNNER = "django.test.runner.DiscoverRunner"

# CACHES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#caches
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "",
    }
}

# PASSWORDS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#password-hashers
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# TEMPLATES
# ------------------------------------------------------------------------------
# TEMPLATES[-1]["OPTIONS"]["loaders"] = [  # type: ignore[index] # noqa F405
#     (
#         "django.template.loaders.cached.Loader",
#         [
#             "django.template.loaders.filesystem.Loader",
#             "django.template.loaders.app_directories.Loader",
#         ],
#     )
# ]

# DEBUGING FOR TEMPLATES
# ------------------------------------------------------------------------------
TEMPLATES[0]["OPTIONS"]["debug"] = True  # type: ignore # noqa F405

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Celery
# ------------------------------------------------------------------------------
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#task-eager-propagates
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_TASK_ALWAYS_EAGER = True
# Keep eager test tasks fully in-process. base.py points the broker AND result
# backend at the real Redis, and in CI (cicd/local.yml) live celeryworker/beat
# services run under config.settings.local (non-eager) against the SAME Postgres
# and Redis as the test run. Without broker isolation, a task message from the
# test process could be executed by a live worker against the test database
# concurrently — a second DB backend that can deadlock with the test's own
# transaction on shared unique keys (e.g. users_user.username). Pin the broker
# and result backend to in-memory so nothing escapes the test process. DASS-3577.
CELERY_BROKER_URL = "memory://"
CELERY_RESULT_BACKEND = "cache+memory://"

# Your stuff...
# ------------------------------------------------------------------------------

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class SubmissionProfileConfig(AppConfig):
    name = "gfbio_submissions.submission_profile"
    verbose_name = _("Submission Profile")


def ready(self):
    try:
        import gfbio_submissions.submission_profile.signals  # noqa F401
    except ImportError:
        pass

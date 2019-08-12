from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class UsersConfig(AppConfig):
    name = "gfbio_submissions.users"
    verbose_name = _("Users")

    def ready(self):
        try:
            import gfbio_submissions.users.signals  # noqa F401
        except ImportError:
            pass

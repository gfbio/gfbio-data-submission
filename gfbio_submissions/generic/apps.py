from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class GenericConfig(AppConfig):
    name = "gfbio_submissions.generic"
    verbose_name = _("Generic")

    def ready(self):
        try:
            import gfbio_submissions.generic.signals  # noqa F401
        except ImportError:
            pass

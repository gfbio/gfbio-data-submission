from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ResolveConfig(AppConfig):
    name = "gfbio_submissions.resolve"
    verbose_name = _("Resolve")

    def ready(self):
        try:
            import gfbio_submissions.resolver.signals  # noqa F401
        except ImportError:
            pass
h
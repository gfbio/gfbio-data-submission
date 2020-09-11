from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ResolverConfig(AppConfig):
    name = "gfbio_submissions.resolver"
    verbose_name = _("Resolver")

    def ready(self):
        try:
            import gfbio_submissions.resolver.signals  # noqa F401
        except ImportError:
            pass

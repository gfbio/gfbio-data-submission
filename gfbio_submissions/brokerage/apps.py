from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class BrokerageConfig(AppConfig):
    name = "gfbio_submissions.brokerage"
    verbose_name = _("Brokerage")

    def ready(self):
        try:
            import gfbio_submissions.brokerage.signals  # noqa F401
        except ImportError:
            pass

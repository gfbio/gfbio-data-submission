import logging

from django.db import models

from .SiteConfiguration import SiteConfiguration

logger = logging.getLogger(__name__)


class TicketLabel(models.Model):
    PANGAEA_JIRA = "P"
    GFBIO_HELPDESK_JIRA = "G"
    LABEL_TYPES = (
        (PANGAEA_JIRA, "Pangaea JIRA"),
        (GFBIO_HELPDESK_JIRA, "GFBio-Helpdesk JIRA"),
    )
    site_configuration = models.ForeignKey(
        SiteConfiguration, null=False, on_delete=models.PROTECT
    )
    label_type = models.CharField(max_length=1, choices=LABEL_TYPES)
    label = models.CharField(max_length=256, default="")

    def __str__(self):
        return "{0}_{1}_{2}".format(
            self.site_configuration.title, self.label_type, self.pk
        )

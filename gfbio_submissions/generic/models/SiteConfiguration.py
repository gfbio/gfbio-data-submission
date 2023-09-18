import logging

from django.db import models
from model_utils.models import TimeStampedModel

from ..managers import SiteConfigurationManager
from .ResourceCredential import ResourceCredential

logger = logging.getLogger(__name__)


class SiteConfiguration(TimeStampedModel):
    SAND = "SAND"
    DSUB = "DSUB"
    JIRA_PROJECT_KEYS = (
        (SAND, SAND),
        (DSUB, DSUB),
    )

    title = models.SlugField(
        max_length=128,
        unique=True,
        help_text="Enter a descriptive title for this instance.",
    )

    contact = models.EmailField(
        blank=False,
        help_text=(
            "Main contact to address in case of something. This will, in any case, serve as a fallback when no other "
            "person can be determined."
        ),
    )

    release_submissions = models.BooleanField(
        default=False,
        help_text=(
            "If this field is unchecked (default), all submission requests by this site have to be manually approved "
            "by staff members. If checked all submissions will be automatically send to the respective archives."
        ),
    )
    # TODO: merge ena servers, since url-root is the same ...
    ena_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name="SiteConfiguration.ena_server+",
        help_text="Select which server and/or account this configuration should use to connect to ENA.",
        on_delete=models.PROTECT,
    )
    # TODO: merge ena servers, since url-root is the same ...
    ena_report_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name="SiteConfiguration.ena_report_server+",
        help_text=(
            "Select which server and/or account this configuration should use to obtain reports via ENA services."
        ),
        on_delete=models.PROTECT,
    )

    ena_ftp = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name="SiteConfiguration.ena_ftp+",
        help_text=(
            "Select which server and/or account this configuration should use to connect to access ENA FTP-server."
        ),
        on_delete=models.PROTECT,
    )
    pangaea_token_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name="SiteConfiguration.pangaea_token_server+",
        help_text=(
            "Select which server and/or account this configuration should use to connect to Pangaea token server. "
            "Via this server, the token necessary to access Pangaea-Jira is obtained"
        ),
        on_delete=models.PROTECT,
    )
    pangaea_jira_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name="SiteConfiguration.pangaea_jira_server+",
        help_text=(
            "Select which server and/or account this configuration should use to connect to Pangaea-Jira. This "
            "Server represents the actual jira-instance of Pangaea"
        ),
        on_delete=models.PROTECT,
    )

    helpdesk_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name="SiteConfiguration.helpdesk_server+",
        help_text=(
            "Select which server and/or account this configuration should use to connect to a JIRA based helpdesk "
            "system. In 99 % of all cases this means the GFBio JIRA helpdesk."
        ),
        on_delete=models.PROTECT,
    )

    jira_project_key = models.CharField(choices=JIRA_PROJECT_KEYS, max_length=4, default=SAND)

    comment = models.TextField(default="", help_text="Enter a description or helpful text here.")

    objects = SiteConfigurationManager()

    def get_ticket_labels(self, label_type=""):
        return [label.label for label in self.ticketlabel_set.filter(label_type=label_type)]

    def __str__(self):
        return "{}".format(self.title)

# -*- coding: utf-8 -*-

import logging
import uuid

from django.db import models
from model_utils.models import TimeStampedModel

from .fields import JsonDictField
from .managers import SiteConfigurationManager

logger = logging.getLogger(__name__)


class ResourceCredential(TimeStampedModel):
    title = models.SlugField(max_length=128,
                             help_text=
                             'Enter a descriptive title for this instance')
    url = models.CharField(max_length=256,
                           help_text=
                           'Url to which requests will be sent to')
    authentication_string = models.CharField(max_length=128, default='',
                                             blank=True,
                                             help_text=
                                             'In cases where an archive '
                                             'demands some sort of pre-build '
                                             'authentication string or '
                                             'sentence, it is entered here. '
                                             'E.g. ENAs authentication')
    username = models.CharField(max_length=72, default='',
                                help_text=
                                'In case of username/password authentication '
                                'fill this field')
    password = models.CharField(max_length=72, default='',
                                help_text=
                                'In case of username/password authentication '
                                'fill this field')
    comment = models.TextField(default='',
                               blank=True,
                               help_text=
                               'Enter a description or helpful text here')

    def __str__(self):
        return '{}'.format(self.title)


class SiteConfiguration(TimeStampedModel):
    SAND = 'SAND'
    DSUB = 'DSUB'
    JIRA_PROJECT_KEYS = (
        (SAND, SAND),
        (DSUB, DSUB),
    )

    title = models.SlugField(max_length=128,
                             unique=True,
                             help_text=
                             'Enter a descriptive title for this instance.')

    contact = models.EmailField(
        blank=False,
        help_text='Main contact to address in case of something. '
                  'This will, in any case, serve as a fallback '
                  'when no other person can be determined.')

    release_submissions = models.BooleanField(
        default=False,
        help_text='If this field is unchecked (default), all submission '
                  'requests by this site have to be manually approved by '
                  'staff members. If checked all submissions will be '
                  'automatically send to the respective archives.')
    # TODO: merge ena servers, since url-root is the same ...
    ena_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name='SiteConfiguration.ena_server+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to ENA.',
        on_delete=models.PROTECT
    )
    # TODO: merge ena servers, since url-root is the same ...
    ena_report_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name='SiteConfiguration.ena_report_server+',
        help_text='Select which server and/or account this configuration '
                  'should use to obtain reports via ENA services.',
        on_delete=models.PROTECT
    )

    ena_ftp = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name='SiteConfiguration.ena_ftp+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to access ENA FTP-server.',
        on_delete=models.PROTECT
    )
    pangaea_token_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name='SiteConfiguration.pangaea_token_server+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to Pangaea token server. Via this server, the'
                  'token necessary to access Pangaea-Jira is obtained',
        on_delete=models.PROTECT
    )
    pangaea_jira_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name='SiteConfiguration.pangaea_jira_server+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to Pangaea-Jira. This Server'
                  'represents the actual jira-instance of Pangaea',
        on_delete=models.PROTECT
    )

    helpdesk_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name='SiteConfiguration.helpdesk_server+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to a JIRA based helpdesk system. In '
                  '99 % of all cases this means the GFBio JIRA helpdesk.',
        on_delete=models.PROTECT
    )

    jira_project_key = models.CharField(choices=JIRA_PROJECT_KEYS, max_length=4,
                                        default=SAND)

    comment = models.TextField(
        default='',
        help_text='Enter a description or helpful text here.')

    objects = SiteConfigurationManager()

    def get_ticket_labels(self, label_type=''):
        return [label.label for label in
                self.ticketlabel_set.filter(label_type=label_type)]

    def __str__(self):
        return '{}'.format(self.title)


class TicketLabel(models.Model):
    PANGAEA_JIRA = 'P'
    GFBIO_HELPDESK_JIRA = 'G'
    LABEL_TYPES = (
        (PANGAEA_JIRA, 'Pangaea JIRA'),
        (GFBIO_HELPDESK_JIRA, 'GFBio-Helpdesk JIRA'),
    )
    site_configuration = models.ForeignKey(SiteConfiguration, null=False,
                                           on_delete=models.PROTECT)
    label_type = models.CharField(max_length=1, choices=LABEL_TYPES)
    label = models.CharField(max_length=256, default='')

    def __str__(self):
        return '{0}_{1}_{2}'.format(self.site_configuration.title,
                                    self.label_type, self.pk)


# TODO: candidate for generic app. no direct assocs to brokerage and is a generic concept
# TODO: review and refactor fields
class RequestLog(TimeStampedModel):
    INCOMING = '0'
    OUTGOING = '1'
    REQUEST_TYPES = (
        (INCOMING, 'incoming'),
        (OUTGOING, 'outgoing')
    )
    request_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        help_text='Primary-key for RequestLog entries')
    type = models.CharField(
        max_length=1,
        choices=REQUEST_TYPES,
        default=INCOMING,
        help_text='We separate incoming and outgoing requests')
    url = models.TextField(
        help_text='Target url of this Request',
        blank=True
    )
    data = models.TextField(
        blank=True,
        help_text='Any kind of payload that comes '
                  'with with this request (if available)')
    # TODO: refactor too when changing ownership
    site_user = models.CharField(
        max_length=72,
        help_text='A user of a site registered in our System. E.g. user=joe '
                  '(this value ...) at site=GFBio.org')
    submission_id = models.UUIDField(
        null=True,
        blank=True,
        help_text='The submission this request is associated with')
    response_status = models.IntegerField(
        null=True,
        blank=True,
        help_text='The response-code we send if this is an incoming request. '
                  'Otherwise the status sent by request-target')
    response_content = models.TextField(
        blank=True,
        help_text='The content we send if this is an incoming request. '
                  'Otherwise the content sent by request-target')
    triggered_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        help_text='This will be null for incoming requests Otherwise '
                  '(outgoing request) it will show the id of the incoming '
                  'request, that has triggered this request',
        on_delete=models.SET_NULL,
    )
    request_details = JsonDictField(
        default=dict,
        help_text='This may contain meta-information regarding this request'
    )

    def __str__(self):
        return '{}'.format(self.request_id)

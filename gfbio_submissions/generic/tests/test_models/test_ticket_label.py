# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.generic.models.ticket_label import TicketLabel
from gfbio_submissions.users.models import User


class TicketLabelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        User.objects.create(username="user1")
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        SiteConfiguration.objects.create(
            title="Title",
            # site=user,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Comment",
        )
        SiteConfiguration.objects.create(
            title="Default",
            # site=None,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
        )

    def test_instance(self):
        labels = TicketLabel.objects.all()
        self.assertEqual(0, len(labels))
        TicketLabel.objects.create(
            site_configuration=SiteConfiguration.objects.first(),
            label_type="P",
            label="label this!",
        )
        labels = TicketLabel.objects.all()
        self.assertEqual(1, len(labels))

    def test_site_configuration_labels(self):
        site_config = SiteConfiguration.objects.first()
        TicketLabel.objects.create(
            site_configuration=SiteConfiguration.objects.first(),
            label_type="P",
            label="label this!",
        )
        self.assertEqual(1, len(site_config.ticketlabel_set.all()))
        other_site_config = SiteConfiguration.objects.last()
        self.assertEqual(0, len(other_site_config.ticketlabel_set.all()))

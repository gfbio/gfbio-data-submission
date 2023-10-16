# -*- coding: utf-8 -*-

from django.test import TestCase

from config.settings.base import ADMINS
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.generic.models.ticket_label import TicketLabel
from gfbio_submissions.users.models import User


class SiteConfigurationTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        site_conf = SiteConfiguration.objects.create(
            title="Title",
            ena_server=resource_cred,
            ena_report_server=resource_cred,
            ena_ftp=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Comment",
        )
        SiteConfiguration.objects.create(
            title="Default",
            ena_server=resource_cred,
            ena_report_server=resource_cred,
            ena_ftp=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
        )
        User.objects.create(username="user1", site_configuration=site_conf)
        TicketLabel.objects.create(site_configuration=site_conf, label_type="P", label="label_1")
        TicketLabel.objects.create(site_configuration=site_conf, label_type="G", label="label_2")
        TicketLabel.objects.create(site_configuration=site_conf, label_type="P", label="label_3")

    def test_db(self):
        site_configurations = SiteConfiguration.objects.all()
        self.assertEqual(2, len(site_configurations))

    def test_instance(self):
        site_config = SiteConfiguration.objects.first()
        self.assertIsInstance(site_config, SiteConfiguration)
        self.assertEqual(1, len(site_config.configuration_users.all()))
        self.assertIsInstance(site_config.ena_server, ResourceCredential)
        self.assertIsInstance(site_config.pangaea_token_server, ResourceCredential)
        self.assertIsInstance(site_config.helpdesk_server, ResourceCredential)
        self.assertFalse(site_config.release_submissions)

    def test_str(self):
        site_config = SiteConfiguration.objects.all().first()
        self.assertEqual("Title", site_config.__str__())

    def test_get_hosting_site_configuration_fallback(self):
        admin, email = ADMINS[0] if len(ADMINS) else ("admin", "default@{0}.de".format(HOSTING_SITE))
        site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
        self.assertEqual(HOSTING_SITE, site_configuration.title)
        self.assertEqual(email, site_configuration.contact)

        self.assertFalse(site_configuration.release_submissions)
        self.assertIsNone(site_configuration.ena_server)
        self.assertIsNone(site_configuration.ena_report_server)
        self.assertIsNone(site_configuration.ena_ftp)
        self.assertIsNone(site_configuration.pangaea_token_server)
        self.assertIsNone(site_configuration.pangaea_jira_server)
        self.assertIsNone(site_configuration.helpdesk_server)

    def test_get_valid_hosting_site_configuration(self):
        config = SiteConfiguration.objects.first()
        SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            contact=config.contact,
            ena_server=config.ena_server,
            ena_report_server=config.ena_report_server,
            ena_ftp=config.ena_ftp,
            pangaea_token_server=config.pangaea_token_server,
            pangaea_jira_server=config.pangaea_jira_server,
            helpdesk_server=config.helpdesk_server,
        )
        site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
        self.assertEqual(HOSTING_SITE, site_configuration.title)
        self.assertEqual(config.contact, site_configuration.contact)
        self.assertFalse(site_configuration.release_submissions)

        self.assertIsNotNone(site_configuration.ena_server)
        self.assertIsNotNone(site_configuration.ena_report_server)
        self.assertIsNotNone(site_configuration.ena_ftp)
        self.assertIsNotNone(site_configuration.pangaea_token_server)
        self.assertIsNotNone(site_configuration.pangaea_jira_server)
        self.assertIsNotNone(site_configuration.helpdesk_server)

    def test_get_ticket_labels(self):
        site_config = SiteConfiguration.objects.all().first()
        labels = site_config.get_ticket_labels(label_type=TicketLabel.PANGAEA_JIRA)
        self.assertEqual(2, len(labels))
        self.assertTrue(isinstance(labels, list))
        for label in labels:
            self.assertTrue(isinstance(label, str))

# -*- coding: utf-8 -*-
from pprint import pprint

from django.test import TestCase

from gfbio_submissions.brokerage.models import ResourceCredential, \
    SiteConfiguration, TicketLabel, Submission
from gfbio_submissions.users.models import User


class SiteConfigurationTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        site_conf = SiteConfiguration.objects.create(
            title='Title',
            # site=user,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Comment',
        )
        SiteConfiguration.objects.create(
            title='Default',
            # site=None,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )
        user = User.objects.create(
            username='user1',
            site_configuration=site_conf
        )
        TicketLabel.objects.create(
            site_configuration=site_conf,
            label_type='P',
            label='label_1'
        )
        TicketLabel.objects.create(
            site_configuration=site_conf,
            label_type='G',
            label='label_2'
        )
        TicketLabel.objects.create(
            site_configuration=site_conf,
            label_type='P',
            label='label_3'
        )

    def test_db(self):
        site_configurations = SiteConfiguration.objects.all()
        self.assertEqual(2, len(site_configurations))

    def test_instance(self):
        site_config = SiteConfiguration.objects.first()
        user = User.objects.first()
        pprint(user.__dict__)
        print(user.site_configuration)
        pprint(site_config.__dict__)
        # print(site_config.user_site_configurations)
        # sub = Submission.objects.create()
        # print(sub)
        # print(sub.submissionupload_set)

        # self.assertIsInstance(site_config, SiteConfiguration)
        # # self.assertIsInstance(site_config.site, User)
        # print(SiteConfiguration.objects.first().user_set)
        # self.assertIsInstance(site_config.ena_server, ResourceCredential)
        # self.assertIsInstance(site_config.pangaea_token_server,
        #                       ResourceCredential)
        # self.assertIsInstance(site_config.helpdesk_server, ResourceCredential)
        # self.assertFalse(site_config.release_submissions)

    def test_str(self):
        site_config = SiteConfiguration.objects.all().first()
        self.assertEqual('Title', site_config.__str__())

    def test_get_site_configuration_for_task(self):
        site_config = SiteConfiguration.objects.get_site_configuration(
            site=User.objects.all().first()
        )
        self.assertEqual('Title', site_config.title)
        self.assertFalse(site_config.release_submissions)

    def test_get_site_configuration_without_site(self):
        site_config = SiteConfiguration.objects.get_site_configuration(
            site=None
        )
        self.assertEqual('Default', site_config.title)
        self.assertFalse(site_config.release_submissions)
        self.assertIsNone(site_config.site)

    def test_get_site_configuration_without_site_or_default(self):
        site_config = SiteConfiguration.objects.filter(title='Default').first()
        site_config.delete()
        with self.assertRaises(SiteConfiguration.DoesNotExist) as exc:
            site_config = SiteConfiguration.objects.get_site_configuration(
                site=None
            )

    def test_get_ticket_labels(self):
        site_config = SiteConfiguration.objects.all().first()
        labels = site_config.get_ticket_labels(
            label_type=TicketLabel.PANGAEA_JIRA)
        self.assertEqual(2, len(labels))
        self.assertTrue(isinstance(labels, list))
        for l in labels:
            self.assertTrue(isinstance(l, str))

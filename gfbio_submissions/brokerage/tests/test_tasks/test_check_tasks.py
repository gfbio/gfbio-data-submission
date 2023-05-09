# -*- coding: utf-8 -*-

from django.db.models import Q
from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ENA
from gfbio_submissions.brokerage.models import Submission, AdditionalReference, \
    TaskProgressReport
from gfbio_submissions.brokerage.tasks import \
    check_for_submissions_without_helpdesk_issue_task, \
    check_for_user_without_site_configuration_task
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models import ResourceCredential, \
    SiteConfiguration
from gfbio_submissions.users.models import User


class TestCheckTasks(TestCase):

    @classmethod
    def setUpTestData(cls):
        user1 = User.objects.create(
            username='user1'
        )
        user2 = User.objects.create(
            username='user2'
        )
        user3 = User.objects.create(
            username='user3'
        )

        # submission with primary helpdesk ticket
        submission = Submission.objects.create(
            user=user1,
            status=Submission.OPEN,
            target=ENA,
            data={'has': 'primary helpdeskticket and pangaea ticket'}
        )
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='HLP-01',
            primary=True
        )
        submission.additionalreference_set.create(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key='PNG-0x',
            primary=False
        )
        # submission with no primary helpdesk ticket, but CANCELLED
        submission = Submission.objects.create(
            user=user1,
            status=Submission.CANCELLED,
            target=ENA,
            data={'has': 'primary helpdeskticket and pangaea ticket'}
        )

        # submission with helpdesk ticket, which is not primary
        submission = Submission.objects.create(
            user=user2,
            status=Submission.OPEN,
            target=ENA,
            data={'has': 'non-primary helpdeskticket and no pangaea ticket'}
        )
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='HLP-02',
            primary=False
        )

        # submission with primary ticket that is no of type helpdesk
        submission = Submission.objects.create(
            user=user1,
            status=Submission.OPEN,
            target=ENA,
            data={'has': 'primary non-helpdesk ticket'}
        )
        submission.additionalreference_set.create(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key='PNG-0x2',
            primary=True
        )

        # submission with no tickets at all
        submission = Submission.objects.create(
            user=user2,
            status=Submission.OPEN,
            target=ENA,
            data={'has': 'no tickets at all'}
        )

        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )

        site_conf = SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            ena_server=resource_cred,
            ena_report_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
            contact='kevin@horstmeier.de'
        )
        user1.site_configuration = site_conf
        user1.is_user = True
        user1.is_site = False
        user1.save()
        user2.site_configuration = None
        user2.is_user = True
        user2.is_site = False
        user2.save()

    def test_db_content(self):
        submissions = Submission.objects.all()
        self.assertEqual(5, len(submissions))
        references = AdditionalReference.objects.all()
        self.assertEqual(4, len(references))

        no_ticket_subs_1 = Submission.objects.exclude(
            additionalreference__in=AdditionalReference.objects.filter(
                primary=True,
                type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            )
        )
        self.assertEqual(4, len(no_ticket_subs_1))

        no_ticket_subs_2 = Submission.objects.exclude(
            Q(additionalreference__primary=True) & Q(
                additionalreference__type='0')
        )
        self.assertEqual(4, len(no_ticket_subs_2))

        no_ticket_subs_3 = Submission.objects.get_submissions_without_primary_helpdesk_issue()
        self.assertEqual(3, len(no_ticket_subs_3))

    def test_check_for_submissions_without_helpdesk_issue_task(self):
        result = check_for_submissions_without_helpdesk_issue_task.apply()
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertTrue(result.successful())

    def test_check_for_user_without_site_configuration_task(self):
        users = User.objects.all()
        self.assertEqual(3, len(users))
        self.assertEqual(2, len(users.filter(site_configuration=None)))
        result = check_for_user_without_site_configuration_task.apply()
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertTrue(result.successful())
        self.assertEqual(0, len(User.objects.filter(site_configuration=None)))

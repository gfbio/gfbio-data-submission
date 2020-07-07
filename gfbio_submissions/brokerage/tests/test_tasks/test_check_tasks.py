# -*- coding: utf-8 -*-

from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ENA
from gfbio_submissions.brokerage.models import Submission, AdditionalReference
from gfbio_submissions.users.models import User


class TestCheckPrimaryIssueTask(TestCase):

    @classmethod
    def setUpTestData(cls):
        user1 = User.objects.create(
            username='user1'
        )
        user2 = User.objects.create(
            username='user2'
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
            data={'has': 'primary non-helpdesk tickt'}
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

    def test_db_content(self):
        submissions = Submission.objects.all()
        self.assertEqual(4, len(submissions))
        references = AdditionalReference.objects.all()
        self.assertEqual(4, len(references))

        no_ticket_subs = Submission.objects.exclude(
            additionalreference__in=AdditionalReference.objects.filter(
                primary=True,
                type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            )
        )

        self.assertEqual(3, len(no_ticket_subs))

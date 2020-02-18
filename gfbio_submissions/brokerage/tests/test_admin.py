# -*- coding: utf-8 -*-

from django.test import TestCase

from gfbio_submissions.brokerage.admin import re_create_ena_xml
from gfbio_submissions.brokerage.models import Submission, AuditableTextData, \
    TaskProgressReport, ResourceCredential, SiteConfiguration
from gfbio_submissions.users.models import User


class TestSubmissionAdmin(TestCase):
    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )

        site_configuration = SiteConfiguration.objects.create(
            title='Default',
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )
        user = User.objects.create(
            username='user1',
            site_configuration=site_configuration,
        )
        Submission.objects.create(
            user=user,
            status='OPEN',
            submitting_user='John Doe',
            target='ENA',
            release=False,
            data={}
        )

    def test_re_create_ena_xml(self):
        submission = Submission.objects.first()
        AuditableTextData.objects.create(
            name='test-file',
            submission=submission
        )
        re_create_ena_xml(None, None, Submission.objects.all())
        submission = Submission.objects.first()
        self.assertEqual(0, len(submission.auditabletextdata_set.all()))
        self.assertEqual('tasks.prepare_ena_submission_data_task',
                         TaskProgressReport.objects.first().task_name)

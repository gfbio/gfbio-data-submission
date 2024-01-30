# -*- coding: utf-8 -*-
from unittest import skip

import requests
import responses
from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import PANGAEA_JIRA_TICKET
from gfbio_submissions.brokerage.exceptions.transfer_exceptions import (
    TransferClientError,
    TransferServerError,
    raise_response_exceptions,
)
from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer,
    _get_ena_xml_response,
    _get_pangaea_attach_response,
    _get_pangaea_comment_response,
    _get_pangaea_soap_response,
    _get_pangaea_ticket_response,
)
from gfbio_submissions.brokerage.utils.submission_transfer import SubmissionTransferHandler
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User

from ...configuration.settings import JIRA_ATTACHMENT_SUB_URL, JIRA_COMMENT_SUB_URL, JIRA_ISSUE_URL
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport


class TestSubmissionTransferHandler(TestCase):
    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title="Pangaea Credential",
            url="https://ws.pangaea.de/ws/services/PanLogin",
            username="gfbio-broker",
            password="secret",
        )
        resource_cred_2 = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        site_configuration = SiteConfiguration.objects.create(
            title="Title",
            ena_server=resource_cred_2,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Comment",
        )
        User.objects.create(username="user1", site_configuration=site_configuration)

        cls.non_config_user = User.objects.create(username="no-conf", email="no@co.nf")

        submission = _create_submission_via_serializer()
        submission.additionalreference_set.create(type=PANGAEA_JIRA_TICKET, reference_key="FAKE_KEY", primary=True)

    def test_instance(self):
        submission = Submission.objects.first()
        transfer_handler = SubmissionTransferHandler(submission_id=submission.pk, target_archive="ENA")
        self.assertIsInstance(transfer_handler, SubmissionTransferHandler)
        self.assertEqual(submission.pk, transfer_handler.submission_id)
        self.assertEqual("ENA", transfer_handler.target_archive)

    def test_get_submission_and_siteconfig_for_task(self):
        submission = Submission.objects.first()
        from ...tasks.jira_tasks.create_submission_issue import create_submission_issue_task

        sub, conf = get_submission_and_site_configuration(
            submission_id=submission.pk,
            task=create_submission_issue_task,
            include_closed=False,
        )
        self.assertIsInstance(sub, Submission)
        self.assertIsInstance(conf, SiteConfiguration)

    @skip(
        "currently this method is not supposed to rise an exception, " "so task.chain can proceed in a controlled way"
    )
    def test_invalid_submission_id(self):
        with self.assertRaises(SubmissionTransferHandler.TransferInternalError):
            sub, conf = get_submission_and_site_configuration(submission_id=99)

    def test_no_site_config(self):
        from ...tasks.jira_tasks.create_submission_issue import create_submission_issue_task

        submission = Submission.objects.last()
        submission.user = self.non_config_user
        submission.save()
        submission = Submission.objects.last()
        self.assertIsNone(submission.user.site_configuration)

        sub, conf = get_submission_and_site_configuration(
            submission_id=Submission.objects.last().pk,
            task=create_submission_issue_task,
            include_closed=False,
        )
        self.assertNotIsInstance(conf, SiteConfiguration)
        self.assertIsNone(conf)

    def test_no_site_config_without_default(self):
        from ...tasks.jira_tasks.create_submission_issue import create_submission_issue_task

        site_config = SiteConfiguration.objects.last()
        site_config.delete()
        submission = Submission.objects.last()
        # - older version where exception was raised
        # with self.assertRaises(
        #         TransferInternalError) as exc:
        sub, conf = get_submission_and_site_configuration(
            submission_id=submission.pk,
            task=create_submission_issue_task,
            include_closed=False,
        )
        # - now exception is catched and TaskProgressReprort.CANCELLED is returned for sub
        self.assertEqual(TaskProgressReport.CANCELLED, sub)

    def test_raise_400_exception(self):
        response = requests.models.Response()
        response.status_code = 401
        response._content = "{}"
        with self.assertRaises(TransferClientError):
            raise_response_exceptions(response)

    def test_raise_500_exception(self):
        response = requests.models.Response()
        response.status_code = 500
        response._content = "{}"
        with self.assertRaises(TransferServerError):
            raise_response_exceptions(response)

    @responses.activate
    def test_execute_ena_only(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response(),
        )
        url = "{0}{1}/{2}/{3}".format(
            conf.helpdesk_server.url,
            JIRA_ISSUE_URL,
            "FAKE_KEY",
            JIRA_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json={"bla": "blubb"}, status=200)
        sth = SubmissionTransferHandler(submission_id=submission.pk, target_archive="ENA")
        tprs = TaskProgressReport.objects.exclude(task_name="tasks.update_helpdesk_ticket_task")
        self.assertEqual(0, len(tprs))
        sth.execute_submission_to_ena()
        tprs = TaskProgressReport.objects.exclude(task_name="tasks.update_helpdesk_ticket_task")
        self.assertLess(0, len(tprs))

    @responses.activate
    def test_execute_ena_pangaea(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()

        responses.add(
            responses.POST,
            site_config.ena_server.url,
            status=200,
            body=_get_ena_xml_response(),
        )
        url = "{0}{1}/{2}/{3}".format(
            site_config.helpdesk_server.url,
            JIRA_ISSUE_URL,
            "FAKE_KEY",
            JIRA_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json={"bla": "blubb"}, status=200)

        responses.add(
            responses.POST,
            site_config.pangaea_token_server.url,
            body=_get_pangaea_soap_response(),
            status=200,
        )
        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(site_config.pangaea_jira_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            "{0}{1}".format(site_config.pangaea_jira_server.url, JIRA_ISSUE_URL),
            json=_get_pangaea_ticket_response(),
            status=200,
        )
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/PDI-12428".format(site_config.helpdesk_server.url),
            json=_get_pangaea_ticket_response(),
        )

        responses.add(
            responses.POST,
            "{0}{1}/{2}/{3}".format(
                site_config.pangaea_jira_server.url,
                JIRA_ISSUE_URL,
                "PDI-12428",
                JIRA_ATTACHMENT_SUB_URL,
            ),
            json=_get_pangaea_attach_response(),
            status=200,
        )
        responses.add(
            responses.POST,
            "{0}/{1}/comment".format(site_config.pangaea_jira_server.url, "PANGAEA_FAKE_KEY"),
            json=_get_pangaea_comment_response(),
            status=200,
        )
        sth = SubmissionTransferHandler(submission_id=submission.pk, target_archive="ENA_PANGAEA")
        sth.execute_submission_to_ena_and_pangaea()
        # self.assertLess(0, len(TaskProgressReport.objects.all()))
        task_reports = TaskProgressReport.objects.all()

        expected_task_names = [
            "tasks.transfer_data_to_ena_task",
            "tasks.process_ena_response_task",
            "tasks.add_accession_to_submission_issue_task",
            "tasks.add_accession_link_submission_issue_task",
            "tasks.create_pangaea_issue_task",
            "tasks.attach_to_pangaea_issue_task",
            "tasks.add_accession_to_pangaea_issue_task",
            "tasks.add_pangaealink_to_submission_issue_task",
        ]
        self.assertEqual(8, len(task_reports))
        for t in task_reports:
            self.assertIn(t.task_name, expected_task_names)

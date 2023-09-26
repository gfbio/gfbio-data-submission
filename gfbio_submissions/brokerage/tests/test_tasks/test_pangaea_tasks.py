# -*- coding: utf-8 -*-
import uuid

import responses
from django.test import override_settings

from gfbio_submissions.brokerage.configuration.settings import (
    JIRA_ATTACHMENT_SUB_URL,
    JIRA_COMMENT_SUB_URL,
    JIRA_ISSUE_URL,
)
from gfbio_submissions.brokerage.models import PersistentIdentifier, Submission, TaskProgressReport
from gfbio_submissions.brokerage.tasks import (
    add_accession_to_pangaea_issue_task,
    attach_to_pangaea_issue_task,
    check_for_pangaea_doi_task,
    create_pangaea_issue_task,
)
from gfbio_submissions.brokerage.tests.utils import (
    _get_pangaea_attach_response,
    _get_pangaea_comment_response,
    _get_pangaea_soap_response,
    _get_pangaea_ticket_response,
)
from gfbio_submissions.generic.models.request_log import RequestLog
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration

from .test_tasks_base import TestTasks


class TestPangaeaTasks(TestTasks):
    @responses.activate
    def test_create_pangaea_issue_task_success(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.POST,
            "{0}{1}".format(site_config.pangaea_jira_server.url, JIRA_ISSUE_URL),
            json=self.pangaea_issue_json,
            status=200,
        )
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/PDI-12428".format(site_config.helpdesk_server.url),
            json=self.pangaea_issue_json,
        )

        result = create_pangaea_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
            }
        )
        res = result.get()
        self.assertTrue(result.successful())
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(3, len(additional_references))
        ref = additional_references.last()
        self.assertEqual("PDI-12428", ref.reference_key)

    @responses.activate
    def test_create_pangaea_issue_task_client_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        len_before = len(submission.additionalreference_set.all())
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.POST,
            "{0}{1}".format(site_config.pangaea_jira_server.url, JIRA_ISSUE_URL),
            json={},
            status=400,
        )
        result = create_pangaea_issue_task.apply_async(kwargs={"submission_id": submission.pk})
        self.assertTrue(result.successful())
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(len_before, len(additional_references))
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
        #                  request_logs.first().url)

    @override_settings(CELERY_TASK_ALWAYS_EAGER=False, CELERY_TASK_EAGER_PROPAGATES=False)
    @responses.activate
    def test_create_pangaea_issue_task_server_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        len_before = len(submission.additionalreference_set.all())
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.POST,
            "{0}{1}".format(site_config.pangaea_jira_server.url, JIRA_ISSUE_URL),
            json={},
            status=500,
        )

        result = create_pangaea_issue_task.apply(
            kwargs={
                "submission_id": submission.pk,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(len_before, len(additional_references))

        # TODO: add test/assertion for retries ...
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(3, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
        #                  request_logs.first().url)

    @responses.activate
    def test_attach_to_pangaea_issue_task_success(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/PDI-12428".format(site_config.helpdesk_server.url),
            json=self.pangaea_issue_json,
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
        #     status=200)
        result = attach_to_pangaea_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "kwargs": {"issue_key": "PDI-12428"},
            }
        )
        res = result.get()
        self.assertTrue(result.successful())
        self.assertDictEqual({"issue_key": "PDI-12428"}, res)
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
        #                                 'PANGAEA_FAKE_KEY'),
        #     request_logs.first().url)

    @responses.activate
    def test_attach_to_pangaea_issue_task_client_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/PDI-12428".format(site_config.helpdesk_server.url),
            json=self.pangaea_issue_json,
        )
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/PDI-12428/attachments".format(site_config.helpdesk_server.url),
            json={"mocked_400": True},
            status=400,
        )
        result = attach_to_pangaea_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "kwargs": {"issue_key": "PDI-12428"},
            }
        )
        self.assertTrue(result.successful())
        res = result.get()
        self.assertDictEqual({"issue_key": "PDI-12428"}, res)
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
        #                                 'PANGAEA_FAKE_KEY'),
        #     request_logs.first().url)

    @override_settings(CELERY_TASK_ALWAYS_EAGER=False, CELERY_TASK_EAGER_PROPAGATES=False)
    @responses.activate
    def test_attach_to_pangaea_issue_task_server_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/PDI-12428".format(site_config.helpdesk_server.url),
            json=self.pangaea_issue_json,
        )
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/PDI-12428/attachments".format(site_config.helpdesk_server.url),
            json={"mocked_500": True},
            status=500,
        )
        # responses.add(
        #     responses.POST,
        #     '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
        #                                 'PANGAEA_FAKE_KEY'),
        #     json={},
        #     status=500)
        result = attach_to_pangaea_issue_task.apply(
            kwargs={
                "submission_id": submission.pk,
                "kwargs": {"issue_key": "PDI-12428"},
            }
        )
        self.assertTrue(result.successful())
        res = result.get()
        self.assertDictEqual({"issue_key": "PDI-12428"}, res)

    @responses.activate
    def test_add_accession_to_pangaea_issue_task_success(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        submission.brokerobject_set.filter(type="study").first().persistentidentifier_set.create(
            archive="ENA",
            pid_type="PRJ",
            pid="PRJEB20411",
            outgoing_request_id=uuid.uuid4(),
        )
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            "{0}/{1}/comment".format(site_config.pangaea_jira_server, "PANGAEA_FAKE_KEY"),
            json=_get_pangaea_comment_response(),
            status=200,
        )
        result = add_accession_to_pangaea_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "kwargs": {
                    "login_token": "f3d7aca208aaec8954d45bebc2f59ba1522264db",
                    "ticket_key": "PANGAEA_FAKE_KEY",
                },
            }
        )
        self.assertTrue(result.successful())
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL, 'PANGAEA_FAKE_KEY'),
        #     request_logs.first().url)

    @responses.activate
    def test_add_accession_to_pangaea_issue_task_client_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        submission.brokerobject_set.filter(type="study").first().persistentidentifier_set.create(
            archive="ENA",
            pid_type="PRJ",
            pid="PRJEB20411",
            outgoing_request_id=uuid.uuid4(),
        )
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            "{0}/{1}/comment".format(site_config.pangaea_jira_server.url, "PANGAEA_FAKE_KEY"),
            status=400,
        )
        result = add_accession_to_pangaea_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "kwargs": {
                    "login_token": "f3d7aca208aaec8954d45bebc2f59ba1522264db",
                    "ticket_key": "PANGAEA_FAKE_KEY",
                },
            }
        )
        # expects results from previous chain element
        self.assertTrue(result.successful())
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
        #                             'PANGAEA_FAKE_KEY'),
        #     request_logs.first().url)

    @responses.activate
    def test_add_accession_to_pangaea_issue_task_server_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        submission.brokerobject_set.filter(type="study").first().persistentidentifier_set.create(
            archive="ENA",
            pid_type="PRJ",
            pid="PRJEB20411",
            outgoing_request_id=uuid.uuid4(),
        )
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            "{0}/{1}/comment".format(site_config.pangaea_jira_server.url, "PANGAEA_FAKE_KEY"),
            status=500,
        )
        result = add_accession_to_pangaea_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "kwargs": {
                    "login_token": "f3d7aca208aaec8954d45bebc2f59ba1522264db",
                    "ticket_key": "PANGAEA_FAKE_KEY",
                },
            }
        )
        self.assertTrue(result.successful())
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(3, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
        #                             'PANGAEA_FAKE_KEY'),
        #     request_logs.first().url)

    @responses.activate
    def test_check_for_pangaea_doi_task_success(self):
        site_config = SiteConfiguration.objects.first()
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
            responses.GET,
            "https://www.example.com/rest/api/2/issue/{0}".format("PANGAEA_FAKE_KEY"),
            json=_get_pangaea_ticket_response(),
            status=200,
        )
        responses.add(
            responses.POST,
            "{0}{1}/{2}/{3}".format(
                site_config.helpdesk_server.url,
                JIRA_ISSUE_URL,
                "FAKE_KEY",
                JIRA_COMMENT_SUB_URL,
            ),
            json={"bla": "blubb"},
            status=200,
        )

        result = check_for_pangaea_doi_task.apply_async(
            kwargs={"resource_credential_id": site_config.pangaea_token_server.pk}
        )
        self.assertTrue(result.successful())
        persistent_identifiers = PersistentIdentifier.objects.all()
        self.assertEqual(1, len(persistent_identifiers))
        pid = persistent_identifiers.first()
        self.assertEqual("PAN", pid.archive)
        self.assertEqual("DOI", pid.pid_type)
        self.assertEqual("doi:10.1594/PANGAEA.786576", pid.pid)

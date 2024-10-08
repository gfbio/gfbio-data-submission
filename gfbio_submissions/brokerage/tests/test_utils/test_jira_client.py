# -*- coding: utf-8 -*-

import datetime
from io import StringIO
from unittest import skip

import jira
import requests
import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.tests.utils import (
    _create_submission_via_serializer,
    _get_jira_attach_response,
    _get_jira_issue_response,
    _get_pangaea_attach_response,
    _get_pangaea_comment_response,
    _get_pangaea_soap_response,
    _get_pangaea_ticket_response,
    _get_request_comment_response,
)
from gfbio_submissions.brokerage.utils.gfbio import gfbio_prepare_create_helpdesk_payload
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User

from ...configuration.settings import (
    GENERIC,
    GFBIO_HELPDESK_TICKET,
    JIRA_ATTACHMENT_SUB_URL,
    JIRA_ATTACHMENT_URL,
    JIRA_ISSUE_URL,
)
from ...models.submission import Submission


class TestJiraClient(TestCase):
    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(username="horst", email="horst@horst.de", password="password")
        permissions = Permission.objects.filter(content_type__app_label="brokerage", codename__endswith="upload")
        user.user_permissions.add(*permissions)
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Token " + token.key)
        cls.api_client = client
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        token_resource_cred = ResourceCredential.objects.create(
            title="Token Resource",
            url="https://www.google.com",
            authentication_string="letMeInPlease",
        )
        cls.site_config = SiteConfiguration.objects.create(
            title="default",
            ena_server=resource_cred,
            pangaea_token_server=token_resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
            contact="kevin@horstmeier.de",
        )
        submission = _create_submission_via_serializer()
        submission.additionalreference_set.create(type=GFBIO_HELPDESK_TICKET, reference_key="SAND-1661", primary=True)
        cls.issue_json = _get_jira_issue_response()
        cls.pangaea_issue_json = _get_pangaea_ticket_response()
        cls.minimal_issue_fields = {
            "project": {"key": cls.site_config.jira_project_key},
            "summary": "sum41",
            "description": "desc",
            "issuetype": {"name": "Data Submission"},
        }

    def _add_jira_field_response(self, status_code=200, body=""):
        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(self.site_config.helpdesk_server.url),
            status=status_code,
            body=body,
        )

    def _add_jira_issue_response(self, status_code=200, json_content={}):
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/SAND-1661".format(self.site_config.helpdesk_server.url),
            status=status_code,
            json=json_content,
        )

    def _add_jira_id_response(self, status_code=200, json_content={}):
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/16814".format(self.site_config.helpdesk_server.url),
            status=status_code,
            json=json_content,
        )

    def _add_create_ticket_responses(self, status_code=200, json_content={}):
        self._add_jira_field_response()
        responses.add(
            responses.POST,
            "{0}{1}".format(self.site_config.helpdesk_server.url, JIRA_ISSUE_URL),
            status=status_code,
            json=json_content,
        )
        self._add_jira_issue_response(json_content=self.issue_json)

    def _add_get_ticket_responses(self, status_code=200, json_content={}):
        self._add_jira_field_response()
        responses.add(
            responses.POST,
            "{0}{1}".format(self.site_config.helpdesk_server.url, JIRA_ISSUE_URL),
            status=200,
            json=self.issue_json,
        )
        self._add_jira_issue_response(status_code=status_code, json_content=json_content)

    def _add_default_pangaea_responses(self):
        responses.add(
            responses.POST,
            self.site_config.pangaea_token_server.url,
            body=_get_pangaea_soap_response(),
            status=200,
        )
        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(self.site_config.pangaea_jira_server.url),
            status=200,
        )

    @responses.activate
    def test_instance(self):
        self._add_jira_field_response()
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        self.assertIsInstance(jira_client.jira, jira.client.JIRA)

    @responses.activate
    def test_pangaea_instance(self):
        self._add_default_pangaea_responses()
        jira_client = JiraClient(
            resource=self.site_config.helpdesk_server,
            token_resource=self.site_config.pangaea_token_server,
        )
        self.assertIsInstance(jira_client.jira, jira.client.JIRA)

    @responses.activate
    def test_client_connection_error(self):
        self._add_jira_field_response(status_code=400, body="client_error")
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        self.assertIsNotNone(jira_client.jira)

    @responses.activate
    def test_server_connection_error(self):
        self._add_jira_field_response(status_code=500, body="server_error")
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        self.assertIsNotNone(jira_client.jira)

    @responses.activate
    def test_create_issue(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.create_issue(fields=self.minimal_issue_fields)
        self.assertIsNone(jira_client.error)
        self.assertIsNotNone(jira_client.issue)

    @responses.activate
    def test_create_issue_client_error(self):
        self._add_create_ticket_responses(status_code=400, json_content={"error": "client"})
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.create_issue(fields=self.minimal_issue_fields)
        self.assertIsNotNone(jira_client.error)
        self.assertIsNone(jira_client.issue)

    @responses.activate
    def test_create_issue_server_error(self):
        self._add_create_ticket_responses(status_code=500, json_content={"error": "server"})
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.create_issue(fields=self.minimal_issue_fields)
        self.assertIsNotNone(jira_client.error)
        self.assertIsNone(jira_client.issue)

    @responses.activate
    def test_get_issue(self):
        self._add_get_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.create_issue(fields=self.minimal_issue_fields)
        jira_client.get_issue("SAND-1661")
        self.assertIsNone(jira_client.error)
        self.assertIsNotNone(jira_client.issue)

    @responses.activate
    def test_get_issue_not_found(self):
        self._add_jira_field_response()
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/SAND-xxx".format(self.site_config.helpdesk_server.url),
            status=404,
            json={"errorMessages": ["Issue Does Not Exist"], "errors": {}},
        )
        jira_client.get_issue("SAND-xxx")
        self.assertIsNotNone(jira_client.error)
        self.assertIsNone(jira_client.issue)

    @responses.activate
    def test_get_issue_server_error(self):
        self._add_jira_field_response()
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/SAND-xxx".format(self.site_config.helpdesk_server.url),
            status=500,
        )
        jira_client.get_issue("SAND-xxx")
        self.assertIsNotNone(jira_client.error)
        self.assertIsNone(jira_client.issue)

    @responses.activate
    def test_update_issue(self):
        self._add_jira_field_response()
        self._add_jira_issue_response(json_content=self.issue_json)
        url = "{0}/rest/api/2/issue/16814?notifyUsers=false".format(self.site_config.helpdesk_server.url)
        responses.add(responses.PUT, url, body="", status=204)
        self._add_jira_id_response(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.update_issue(key="SAND-1661", fields=None)
        self.assertIsNone(jira_client.error)
        self.assertEqual("SAND-1661", jira_client.issue.key)

    @responses.activate
    def test_add_comment(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/SAND-1661/comment".format(self.site_config.helpdesk_server.url),
            json=_get_pangaea_comment_response(),
            status=200,
        )
        jira_client.add_comment("SAND-1661", "Bla")
        self.assertIsNone(jira_client.error)
        self.assertIsNotNone(jira_client.comment)

    @responses.activate
    def test_add_comment_client_error(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/SAND-1661/comment".format(self.site_config.helpdesk_server.url),
            json={"errorMessages": ["Issue Does Not Exist"], "errors": {}},
            status=400,
        )
        jira_client.add_comment("SAND-1661", "Bla")
        self.assertIsNotNone(jira_client.error)
        self.assertIsNone(jira_client.comment)

    @responses.activate
    def test_add_comment_server_error(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/SAND-1661/comment".format(self.site_config.helpdesk_server.url),
            status=503,
        )
        jira_client.add_comment("SAND-1661", "Bla")
        self.assertIsNotNone(jira_client.error)
        self.assertIsNone(jira_client.comment)

    @responses.activate
    def test_get_comments_success(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/SAND-1661/comment".format(self.site_config.helpdesk_server.url),
            json=_get_pangaea_comment_response(),
            status=200,
        )
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/SAND-1661/comment".format(self.site_config.helpdesk_server.url),
            json=_get_request_comment_response(),
            status=200,
        )
        jira_client.add_comment("SAND-1661", "Bla")
        comments = jira_client.get_comments(key="SAND-1661")
        self.assertIsNone(jira_client.error)
        self.assertIsInstance(comments, list)
        self.assertEqual("programmatic update of ticket SAND-1535", comments[0].body)

    @responses.activate
    def test_get_comments_client_error(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/SAND-1661/comment".format(self.site_config.helpdesk_server.url),
            json=_get_pangaea_comment_response(),
            status=200,
        )
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/SAND-1661/comment".format(self.site_config.helpdesk_server.url),
            status=400,
        )
        jira_client.add_comment("SAND-1661", "Bla")
        jira_client.get_comments(key="SAND-1661")
        self.assertIsNotNone(jira_client.error)

    @responses.activate
    def test_get_comments_server_error(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/SAND-1661/comment".format(self.site_config.helpdesk_server.url),
            json=_get_pangaea_comment_response(),
            status=200,
        )
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/SAND-1661/comment".format(self.site_config.helpdesk_server.url),
            status=502,
        )
        jira_client.add_comment("SAND-1661", "Bla")
        jira_client.get_comments(key="SAND-1661")
        self.assertIsNotNone(jira_client.error)

    @responses.activate
    def test_add_attachment(self):
        # self._add_create_ticket_responses(json_content=self.issue_json)
        self._add_jira_field_response()
        self._add_jira_issue_response(json_content=self.issue_json)
        responses.add(
            responses.POST,
            "{0}{1}/{2}/{3}".format(
                self.site_config.helpdesk_server.url,
                JIRA_ISSUE_URL,
                "SAND-1661",
                JIRA_ATTACHMENT_SUB_URL,
            ),
            json=_get_jira_attach_response(),
            status=200,
        )
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)

        attachment = StringIO()
        attachment.write(":-)")
        res = jira_client.add_attachment("SAND-1661", attachment, "attachment")
        attachment.close()
        self.assertIsInstance(res, jira.resources.Attachment)
        self.assertIsNone(jira_client.error)

    @responses.activate
    def test_add_attachment_no_filename(self):
        # self._add_create_ticket_responses(json_content=self.issue_json)
        self._add_jira_field_response()
        self._add_jira_issue_response(json_content=self.issue_json)
        responses.add(
            responses.POST,
            "{0}{1}/{2}/{3}".format(
                self.site_config.helpdesk_server.url,
                JIRA_ISSUE_URL,
                "SAND-1661",
                JIRA_ATTACHMENT_SUB_URL,
            ),
            json=_get_jira_attach_response(),
            status=200,
        )
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)

        attachment = StringIO()
        attachment.write(":-)")
        res = jira_client.add_attachment("SAND-1661", attachment)
        attachment.close()
        self.assertIsInstance(res, jira.resources.Attachment)
        self.assertIsNone(jira_client.error)

    @responses.activate
    def test_add_attachment_no_issue(self):
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/SAND-1661".format(self.site_config.helpdesk_server.url),
            status=404,
            json={"errorMessages": ["Issue Does Not Exist"], "errors": {}},
        )
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)

        attachment = StringIO()
        attachment.write(":-)")
        res = jira_client.add_attachment("SAND-1661", attachment)
        attachment.close()
        self.assertIsNone(res, jira.resources.Attachment)
        self.assertIsNotNone(jira_client.error)

    @responses.activate
    def test_add_attachment_client_error(self):
        self._add_jira_field_response()
        self._add_jira_issue_response(json_content=self.issue_json)
        responses.add(
            responses.POST,
            "{0}{1}/{2}/{3}".format(
                self.site_config.helpdesk_server.url,
                JIRA_ISSUE_URL,
                "SAND-1661",
                JIRA_ATTACHMENT_SUB_URL,
            ),
            json={"client_error": True},
            status=401,
        )
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)

        attachment = StringIO()
        attachment.write(":-)")
        res = jira_client.add_attachment("SAND-1661", attachment, "attachment")
        attachment.close()
        self.assertIsNone(res)
        self.assertIsNotNone(jira_client.error)

    @responses.activate
    def test_add_attachment_server_error(self):
        self._add_jira_field_response()
        self._add_jira_issue_response(json_content=self.issue_json)
        responses.add(
            responses.POST,
            "{0}{1}/{2}/{3}".format(
                self.site_config.helpdesk_server.url,
                JIRA_ISSUE_URL,
                "SAND-1661",
                JIRA_ATTACHMENT_SUB_URL,
            ),
            status=502,
        )
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        attachment = StringIO()
        attachment.write(":-)")
        res = jira_client.add_attachment("SAND-1661", attachment, "attachment")
        attachment.close()
        self.assertIsNone(res)
        self.assertIsNotNone(jira_client.error)

    @responses.activate
    def test_delete_attachment(self):
        self._add_jira_field_response()
        self._add_jira_issue_response(json_content=self.issue_json)
        url = "{0}{1}/{2}".format(self.site_config.helpdesk_server.url, JIRA_ATTACHMENT_URL, "1")
        responses.add(responses.DELETE, url, body=b"", status=204)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.delete_attachment("1")
        self.assertIsNone(jira_client.error)

    @responses.activate
    def test_delete_attachment_client_error(self):
        self._add_jira_field_response()
        self._add_jira_issue_response(json_content=self.issue_json)
        url = "{0}{1}/{2}".format(self.site_config.helpdesk_server.url, JIRA_ATTACHMENT_URL, "1")
        responses.add(responses.DELETE, url, body=b"", status=403)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.delete_attachment("1")
        self.assertIsNotNone(jira_client.error)

    @responses.activate
    def test_delete_attachment_server_error(self):
        self._add_jira_field_response()
        self._add_jira_issue_response(json_content=self.issue_json)
        url = "{0}{1}/{2}".format(self.site_config.helpdesk_server.url, JIRA_ATTACHMENT_URL, "1")
        responses.add(responses.DELETE, url, body=b"", status=504)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.delete_attachment("1")
        self.assertIsNotNone(jira_client.error)

    @responses.activate
    def test_add_remote_link(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.GET,
            "{0}/rest/applinks/latest/listApplicationlinks".format(self.site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/SAND-1661/remotelink".format(self.site_config.helpdesk_server.url),
            json={
                "id": 10000,
                "self": "{0}/rest/api/2/issue/SAND-1661/remotelink/10000".format(self.site_config.helpdesk_server.url),
            },
            status=200,
        )
        jira_client.add_remote_link("SAND-1661", url="http://www.google.de", title="Google")
        self.assertIsNone(jira_client.error)

    @responses.activate
    def test_add_study_link(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.GET,
            "{0}/rest/applinks/latest/listApplicationlinks".format(self.site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/SAND-1661/remotelink".format(self.site_config.helpdesk_server.url),
            json={
                "id": 10000,
                "self": "{0}/rest/api/2/issue/SAND-1661/remotelink/10000".format(self.site_config.helpdesk_server.url),
            },
            status=200,
        )
        jira_client.add_ena_study_link_to_issue("SAND-1661", accession_number="PRJE0815")
        self.assertIsNone(jira_client.error)

    @responses.activate
    def test_add_comment_client_error_2(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.GET,
            "{0}/rest/applinks/latest/listApplicationlinks".format(self.site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/SAND-1661/remotelink".format(self.site_config.helpdesk_server.url),
            json={},
            status=403,
        )
        jira_client.add_remote_link("SAND-1661", url="http://www.google.de", title="Google")
        self.assertIsNotNone(jira_client.error)

    @responses.activate
    def test_add_comment_server_error_2(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        responses.add(
            responses.GET,
            "{0}/rest/applinks/latest/listApplicationlinks".format(self.site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            "{0}/rest/api/2/issue/SAND-1661/remotelink".format(self.site_config.helpdesk_server.url),
            json={},
            status=500,
        )
        jira_client.add_remote_link("SAND-1661", url="http://www.google.de", title="Google")
        self.assertIsNotNone(jira_client.error)

    @responses.activate
    def test_create_submission_issue(self):
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.create_submission_issue(
            reporter={"user_full_name": "Horst", "user_email": "horst@kevin.de"},
            submission=Submission.objects.first(),
            site_config=self.site_config,
        )

    @responses.activate
    def test_update_submission_issue(self):
        self._add_jira_field_response()
        self._add_jira_issue_response(json_content=self.issue_json)
        url = "{0}/rest/api/2/issue/16814".format(self.site_config.helpdesk_server.url)
        responses.add(responses.PUT, url, body="", status=204)
        self._add_jira_id_response(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.update_submission_issue(
            key="SAND-1661",
            site_config=self.site_config,
            submission=Submission.objects.first(),
        )
        self.assertIsNone(jira_client.error)
        self.assertEqual("SAND-1661", jira_client.issue.key)

    @responses.activate
    def test_force_submission_issue(self):
        self._add_create_ticket_responses(
            status_code=400,
            json_content={
                "errorMessages": ["Issue Does Not Exist"],
                "errors": {
                    "reporter": "The reporter specified is not a user",
                },
            },
        )
        self._add_create_ticket_responses(json_content=self.issue_json)
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.create_submission_issue(
            reporter={"user_full_name": "Horst", "user_email": "horst@kevin.de"},
            submission=Submission.objects.first(),
            site_config=self.site_config,
        )
        self.assertEqual(1, jira_client.retry_count)
        self.assertIsNone(jira_client.error)

    @responses.activate
    def test_force_submission_issue_retry_max(self):
        self._add_create_ticket_responses(
            status_code=400,
            json_content={
                "errorMessages": ["Issue Does Not Exist"],
                "errors": {
                    "reporter": "The reporter specified is not a user",
                },
            },
        )
        jira_client = JiraClient(resource=self.site_config.helpdesk_server)
        jira_client.create_submission_issue(
            reporter={"user_full_name": "Horst", "user_email": "horst@kevin.de"},
            submission=Submission.objects.first(),
            site_config=self.site_config,
        )
        self.assertEqual(3, jira_client.retry_count)
        self.assertIsNotNone(jira_client.error)

    @responses.activate
    def test_create_pangaea_issue(self):
        self._add_default_pangaea_responses()
        responses.add(
            responses.POST,
            "{0}{1}".format(self.site_config.helpdesk_server.url, JIRA_ISSUE_URL),
            status=200,
            json=self.pangaea_issue_json,
        )
        responses.add(
            responses.GET,
            "https://www.example.com/rest/api/2/issue/PDI-12428",
            status=200,
            json=self.pangaea_issue_json,
        )

        # self._add_create_ticket_responses(json_content=self.pangaea_issue_json)
        jira_client = JiraClient(
            resource=self.site_config.helpdesk_server,
            token_resource=self.site_config.pangaea_token_server,
        )

        jira_client.create_pangaea_issue(site_config=self.site_config, submission=Submission.objects.first())
        self.assertIsNone(jira_client.error)
        self.assertIsNotNone(jira_client.issue)

    @responses.activate
    def test_attach_to_pangaea_issue(self):
        self._add_default_pangaea_responses()
        # responses.add(
        #     responses.POST,
        #     '{0}{1}'.format(
        #         self.site_config.helpdesk_server.url,
        #         HELPDESK_API_SUB_URL
        #     ),
        #     status=200,
        #     json=self.pangaea_issue_json,
        # )
        responses.add(
            responses.GET,
            "https://www.example.com/rest/api/2/issue/PDI-12428",
            status=200,
            json=self.pangaea_issue_json,
        )
        responses.add(
            responses.POST,
            "{0}{1}/{2}/{3}".format(
                self.site_config.pangaea_jira_server.url,
                JIRA_ISSUE_URL,
                "PDI-12428",
                JIRA_ATTACHMENT_SUB_URL,
            ),
            json=_get_pangaea_attach_response(),
            status=200,
        )
        jira_client = JiraClient(
            resource=self.site_config.helpdesk_server,
            token_resource=self.site_config.pangaea_token_server,
        )
        attachment = StringIO()
        attachment.write(":-)")
        jira_client.attach_to_pangaea_issue("PDI-12428", submission=Submission.objects.first())
        attachment.close()

    @responses.activate
    def test_get_doi_from_pangaea_issue(self):
        self._add_default_pangaea_responses()
        jira_client = JiraClient(
            resource=self.site_config.helpdesk_server,
            token_resource=self.site_config.pangaea_token_server,
        )
        responses.add(
            responses.GET,
            "https://www.example.com/rest/api/2/issue/PDI-12428",
            status=200,
            json=self.pangaea_issue_json,
        )
        doi = jira_client.get_doi_from_pangaea_issue("PDI-12428")
        self.assertEqual("doi:10.1594/PANGAEA.786576", doi)

    @responses.activate
    def test_no_doi_in_pangaea_issue(self):
        self._add_default_pangaea_responses()
        jira_client = JiraClient(
            resource=self.site_config.helpdesk_server,
            token_resource=self.site_config.pangaea_token_server,
        )
        responses.add(
            responses.GET,
            "https://www.example.com/rest/api/2/issue/PDI-12428",
            status=200,
            json=self.issue_json,
        )
        doi = jira_client.get_doi_from_pangaea_issue("PDI-12428")
        self.assertIsNone(doi)

    # --------------------------------------------------------------------------

    @skip("Test against real server")
    def test_jira_client_with_pangaea(self):
        token_resource = ResourceCredential.objects.create(
            title="token",
            url="https://ws.pangaea.de/ws/services/PanLogin",
            authentication_string="-",
            username="gfbio-broker",
            password="",
            comment="-",
        )
        jira_resource = ResourceCredential.objects.create(
            title="jira instance",
            url="https://issues.pangaea.de",
            authentication_string="-",
            username="gfbio-broker",
            password="",
            comment="-",
        )
        client = JiraClient(resource=jira_resource, token_resource=token_resource)

    @skip("Test against real server")
    def test_jira_client_with_helpdesk(self):
        jira_resource = ResourceCredential.objects.create(
            title="jira instance",
            url="http://helpdesk.gfbio.org",
            authentication_string="-",
            username="brokeragent",
            password="",
            comment="-",
        )
        client = JiraClient(resource=jira_resource)

    @skip("Test against helpdesk server")
    def test_jira_client_create_issue(self):
        jira_resource = ResourceCredential.objects.create(
            title="jira instance",
            url="http://helpdesk.gfbio.org",
            authentication_string="-",
            username="brokeragent",
            password="",
            comment="-",
        )
        client = JiraClient(resource=jira_resource)

        # almost analog to gfbio_prepare_create_helpdesk_payload(...)
        issue_dict = {
            "project": {"key": "SAND"},
            "summary": "New issue from jira-python",
            "description": "Look into this one",
            "issuetype": {"name": "Data Submission"},
            "reporter": {"name": "maweber@mpi-bremen.de"},
            "assignee": {"name": "maweber@mpi-bremen.de"},  # or data center
            "customfield_10010": "sand/molecular-data",
            "customfield_10200": "{0}".format((datetime.date.today() + datetime.timedelta(days=365)).isoformat()),
            "customfield_10201": "requirements title",
            "customfield_10208": "requirements description",
            "customfield_10303": "7fafa310-6031-4e41-987b-271d89916eb2",
            # 'customfield_10311': requirements.get('data_collection_time', ''),
            "customfield_10308": [
                "LABEL1",
                "label2",
            ],
            "customfield_10313": ", ".join(["Algae & Protists", "Microbiology"]),
            "customfield_10205": "first_name,last_name;email",
            "customfield_10307": "; ".join(["publication 1234"]),
            "customfield_10216": [{"value": l} for l in ["Sensitive Personal Information", "Uncertain"]],
            "customfield_10314": "potential project id",
            "customfield_10202": {
                "self": "https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10500",
                "value": "other",
                "id": "10500",
            },
            "customfield_10600": "http://www.downloadurl.com",
            "customfield_10229": [{"value": "other"}],
        }
        client.create_issue(issue_dict)

    @skip("Test against helpdesk server")
    def test_jira_client_publication_list_fields(self):
        jira_resource = ResourceCredential.objects.create(
            title="jira instance",
            url="https://helpdesk.gfbio.org",
            authentication_string="-",
            username="",
            password="",
            comment="-",
        )
        site_config = SiteConfiguration.objects.create(
            title="jira",
            jira_project_key=SiteConfiguration.DSUB,
            helpdesk_server=jira_resource,
        )
        submission = Submission.objects.create(
            release=True,
            target=GENERIC,
            data={
                "requirements": {
                    "title": "The use of non-local Leucanthemum vulgare seeds in the course of restoration measures can no longer be detected several years after their application",
                    "license": "CC BY 4.0",
                    "categories": ["Botany", "Ecology & Environment"],
                    "description": "Ecological restoration along roadside verges and on compensatory sites requires large-scale reintroductions of plants in form of seeds or seedlings; however, the genetic basis of seed or seedling sourcing is a controversial issue. Formerly, non-local seed sourcing of naturally occurring herbaceous species was common practice. Lately local provenancing got wide attention, and additional strategies are being recommended. All of these, however, raise the costs for restoration efforts.\nHere we test whether the earlier introduction of non-local seeds of Leucanthemum vulgare agg. in the course of ecological restoration can still be detected several years after the measure. The results are used to provide conservation recommendations for this widespread herbaceous insect-pollinated species.\nWe analyzed the population genetic pattern (AFLP) of the ox-eye daisy in Central Germany on sites formerly restored with non-local seed sources (R) and compared these to the ones of indigenous populations (I). All populations of L. vulgare agg. were genetically diverse and did not clearly distinguish between R and I sites. Furthermore, no clear evidence of distinct local genetic patterns was observed. Based on our results, we argue for the use of non-native seeds in the course of restoration measures for ox-eye daisies due to cost savings, but support the demand for a broader population genetic monitoring in order to put the entire system of seed provenance on a solid empirical basis.\n",
                    "contributors": [
                        {
                            "lastName": "Gemeinholzer",
                            "position": 1,
                            "firstName": "Birgit",
                            "institution": "",
                            "contribution": "Author/Creator",
                            "emailAddress": "b.gemeinholzer@uni-kassel.de",
                        },
                        {
                            "lastName": "Reiker",
                            "position": 2,
                            "firstName": "Jutta",
                            "contribution": "Data Owner",
                            "emailAddress": "J.Reiker@gmx.de",
                        },
                        {
                            "lastName": "M\u00fcller",
                            "position": 3,
                            "firstName": "Christina",
                            "institution": "",
                            "contribution": "",
                            "emailAddress": "Christina.M.Mueller@bot1.bio.uni-giessen.de",
                        },
                        {
                            "lastName": "Wissemann",
                            "position": 4,
                            "firstName": "Volker ",
                            "emailAddress": "Volker.Wissemann@bot1.bio.uni-giessen.de",
                        },
                    ],
                    "dataset_labels": ["", ""],
                    "legal_requirements": [],
                    # related publication caused errors when creating an issue in JIRA
                    # with exactly this data below.
                    # the error could not be reproduced by testing with methods below.
                    # tested for SAND and DSUB projects.
                    "related_publications": [
                        "",
                        "doi: 10.1002/ece3.1817",
                        "doi.org/10.1556/034.62.2020.1-2.8",
                        "doi.org/10.1111/plb.13174",
                    ],
                }
            },
        )
        client = JiraClient(resource=jira_resource)
        data = gfbio_prepare_create_helpdesk_payload(site_config=site_config, submission=submission)
        client.create_submission_issue(site_config=site_config, submission=submission, reporter={})

    @skip("Test against helpdesk server")
    def test_jira_client_get_issue(self):
        jira_resource = ResourceCredential.objects.create(
            title="jira instance",
            url="http://helpdesk.gfbio.org",
            authentication_string="-",
            username="brokeragent",
            password="",
            comment="-",
        )
        client = JiraClient(resource=jira_resource)
        issue = client.jira.issue("SAND-1661")

    @skip("Test against helpdesk server")
    def test_jira_service_desk_comment(self):
        jira_resource = ResourceCredential.objects.create(
            title="jira instance",
            url="http://helpdesk.gfbio.org",
            authentication_string="-",
            username="brokeragent",
            password="",
            comment="-",
        )
        client = JiraClient(resource=jira_resource)
        issue = client.jira.issue("SAND-1661")

        client.add_comment(issue, "should be internal")
        client.add_comment(issue, "should be public", is_internal=False)

        # for l in RequestLog.objects.all():
        #     print('\n')
        #     pprint(l.__dict__)

        # WORKS:
        # sd = client.jira.service_desks()
        # pprint(sd)
        # print(
        #     'http://helpdesk.gfbio.org/rest/servicedeskapi/request/{}/comment'.format(
        #         issue.key))
        # res = requests.post(
        #     'http://helpdesk.gfbio.org/rest/servicedeskapi/request/{}/comment'.format(
        #         issue.key),
        #     auth=('brokeragent', ''),
        #     headers={
        #         'Content-Type': 'application/json'
        #     },
        #     json={
        #         "body": "Hello there (PRIVATE)",
        #         "public": False
        #     }
        # )
        # print(res.content)

        @skip("Test against helpdesk server")
        def test_jira_client_create_remote_link(self):
            # jira_resource = ResourceCredential.objects.create(
            #     title='jira instance',
            #     url='http://helpdesk.gfbio.org',
            #     authentication_string='-',
            #     username='brokeragent',
            #     password='',
            #     comment='-'
            # )
            # client = JiraClient(resource=jira_resource)
            # issue = client.jira.issue("SAND-1710")

            # works
            # remote_link = client.jira.add_remote_link(issue, {
            #     'url': 'https://submissions.gfbio.org',
            #     'title': 'Follow this Link ;-)'
            # })
            # client.add_remote_link("SAND-1710", url='http://www.google.de', title='Google here abcd')
            # issue = client.jira.issue("SAND-1710")
            # client.add_remote_link(issue, url='http://www.google.de',
            #                        title='Google here 1234')

            response = requests.get(
                url="https://helpdesk.gfbio.org/rest/applinks/latest/listApplicationlinks",
                auth=("brokeragent", ""),
                headers={"Content-Type": "application/json"},
            )

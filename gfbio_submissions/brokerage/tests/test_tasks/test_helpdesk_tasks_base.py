# -*- coding: utf-8 -*-

import responses

from gfbio_submissions.brokerage.configuration.settings import (
    JIRA_ISSUE_URL,
    JIRA_COMMENT_SUB_URL,
)
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from .test_tasks_base import TestTasks


class TestHelpDeskTasksBase(TestTasks):
    @classmethod
    def _add_success_responses(cls):
        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(cls.default_site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            "{0}{1}".format(cls.default_site_config.helpdesk_server.url, JIRA_ISSUE_URL),
            json=cls.issue_json,
            status=200,
        )
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/SAND-1661".format(cls.default_site_config.helpdesk_server.url),
            json=cls.issue_json,
        )

    @classmethod
    def _add_client_fail_responses(cls):
        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(cls.default_site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            "{0}{1}".format(cls.default_site_config.helpdesk_server.url, JIRA_ISSUE_URL),
            json={},
            status=400,
        )

    @classmethod
    def _add_server_fail_responses(cls):
        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(cls.default_site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            "{0}{1}".format(cls.default_site_config.helpdesk_server.url, JIRA_ISSUE_URL),
            json={},
            status=500,
        )

    @classmethod
    def _add_comment_reponses(cls):
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(site_config.helpdesk_server.url),
            status=200,
        )
        return "{0}{1}/{2}/{3}".format(
            site_config.helpdesk_server.url,
            JIRA_ISSUE_URL,
            "FAKE_KEY",
            JIRA_COMMENT_SUB_URL,
        )

    @classmethod
    def _add_put_issue_responses(cls, put_status_code=204):
        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(cls.default_site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/SAND-1661".format(cls.default_site_config.helpdesk_server.url),
            json=cls.issue_json,
        )
        url = "{0}/rest/api/2/issue/16814".format(cls.default_site_config.helpdesk_server.url)
        responses.add(responses.PUT, url, body="", status=put_status_code)
        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/16814".format(cls.default_site_config.helpdesk_server.url),
            status=200,
            json=cls.issue_json,
        )

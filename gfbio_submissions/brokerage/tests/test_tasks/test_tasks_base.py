# -*- coding: utf-8 -*-

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import (
    _get_pangaea_soap_response,
    _get_pangaea_ticket_response,
    _get_jira_issue_response,
    _get_ena_data,
    _get_ena_data_without_runs,
)
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User
from ...configuration.settings import PANGAEA_JIRA_TICKET, GFBIO_HELPDESK_TICKET
from ...models.broker_object import BrokerObject
from ...serializers.submission_serializer import SubmissionSerializer


class TestTasks(TestCase):
    # TODO: move to utils or similar ...
    @classmethod
    def _create_submission_via_serializer(cls, runs=False):
        serializer = SubmissionSerializer(
            data={
                "target": "ENA",
                "release": True,
                "data": _get_ena_data() if runs else _get_ena_data_without_runs(),
            }
        )
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)
        return submission

    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        cls.default_site_config = SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            ena_server=resource_cred,
            ena_report_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
            contact="kevin@horstmeier.de",
        )
        cls.second_site_config = SiteConfiguration.objects.create(
            title="default-2",
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration 2",
        )
        permissions = Permission.objects.filter(content_type__app_label="brokerage", name__endswith="upload")
        user = User.objects.create(username="user1")
        user.update_or_create_external_user_id("0815", "goe_id")
        user.name = "Kevin Horstmeier"
        user.email = "khors@me.de"
        user.site_configuration = cls.default_site_config
        user.save()
        user.user_permissions.add(*permissions)

        submission = cls._create_submission_via_serializer()
        submission.additionalreference_set.create(type=GFBIO_HELPDESK_TICKET, reference_key="FAKE_KEY", primary=True)
        submission.additionalreference_set.create(
            type=PANGAEA_JIRA_TICKET, reference_key="PANGAEA_FAKE_KEY", primary=True
        )

        submission = cls._create_submission_via_serializer()
        # submission.submitting_user = '16250'
        # submission.save()

        cls.issue_json = _get_jira_issue_response()
        cls.pangaea_issue_json = _get_pangaea_ticket_response()

    @classmethod
    def _create_test_data(cls, path):
        f = open(path, "w")
        f.write("test123\n")
        f.close()
        f = open(path, "rb")
        return {
            "file": f,
        }

    def _add_default_pangaea_responses(self):
        responses.add(
            responses.POST,
            self.default_site_config.pangaea_token_server.url,
            body=_get_pangaea_soap_response(),
            status=200,
        )
        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(self.default_site_config.pangaea_jira_server.url),
            status=200,
        )

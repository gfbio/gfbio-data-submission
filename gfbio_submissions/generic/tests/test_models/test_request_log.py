# -*- coding: utf-8 -*-

import responses
from django.test import TestCase

from gfbio_submissions.brokerage.models import BrokerObject, Submission
from gfbio_submissions.brokerage.serializers import SubmissionSerializer
from gfbio_submissions.brokerage.tests.utils import _get_ena_data, _get_ena_data_without_runs, _get_ena_xml_response
from gfbio_submissions.brokerage.utils.ena import prepare_ena_data, send_submission_to_ena
from gfbio_submissions.generic.models.RequestLog import RequestLog
from gfbio_submissions.generic.models.ResourceCredential import ResourceCredential
from gfbio_submissions.generic.models.SiteConfiguration import SiteConfiguration
from gfbio_submissions.users.models import User


class RequestLogTest(TestCase):
    # TODO: redundant in various test_classes move to test_utils
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
        User.objects.create(username="user1")
        cls._create_submission_via_serializer()
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )

        SiteConfiguration.objects.create(
            title="Default",
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
        )

    def tearDown(self):
        Submission.objects.all().delete()

    def test_create_request_log(self):
        # submission = Submission.objects.first()
        RequestLog.objects.create(
            type=RequestLog.INCOMING,
            data='{"some_data": 12345}',
            site_user="jdoe",
            # submission_id=submission.broker_submission_id,
            response_status=200,
            response_content="Whatever we return",
        )
        self.assertEqual(1, len(RequestLog.objects.all()))

    def test_str(self):
        submission = Submission.objects.first()
        request_log = RequestLog.objects.create(
            type=RequestLog.INCOMING,
            data='{"some_data": 12345}',
            site_user="jdoe",
            submission_id=submission.broker_submission_id,
            response_status=200,
            response_content="Whatever we return",
        )
        self.assertEqual(str(request_log.request_id), request_log.__str__())

    # submitting_user is no longer supported
    @responses.activate
    def test_send_site_user_type(self):
        submission = Submission.objects.first()
        # submission.submitting_user = '666'
        # submission.save()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response(),
        )

        ena_submission_data = prepare_ena_data(submission=submission)
        response, req_log_request_id = send_submission_to_ena(
            submission=submission,
            archive_access=conf.ena_server,
            ena_submission_data=ena_submission_data,
        )

        request_log = RequestLog.objects.get(request_id=req_log_request_id)
        # submitting_user is no longer supported
        self.assertEqual("", request_log.site_user)
        self.assertEqual(submission.user, request_log.user)
        self.assertFalse(isinstance(request_log.site_user, tuple))

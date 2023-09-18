# -*- coding: utf-8 -*-
from unittest import skip

import requests
import responses
from django.test import TestCase

from gfbio_submissions.brokerage.models.additional_reference import AdditionalReference
from gfbio_submissions.brokerage.models.submission import Submission
# from gfbio_submissions.brokerage.models import Submission, AdditionalReference
from gfbio_submissions.brokerage.tests.utils import _get_pangaea_soap_body, \
    _get_pangaea_soap_response
from gfbio_submissions.brokerage.utils.pangaea import \
    request_pangaea_login_token, parse_pangaea_login_token_response, \
    get_pangaea_login_token
from gfbio_submissions.generic.models import SiteConfiguration, \
    ResourceCredential
from gfbio_submissions.users.models import User

from gfbio_submissions.brokerage.configuration.settings import PANGAEA_JIRA_TICKET, GFBIO_HELPDESK_TICKET

class PangaeaTicketTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username="user1"
        )
        resource_cred = ResourceCredential.objects.create(
            title='Pangaea Credential',
            url='https://ws.pangaea.de/ws/services/PanLogin',
            username='gfbio-broker',
            password='secret'
        )
        SiteConfiguration.objects.create(
            title='Title',
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Comment',
        )
        submission = Submission.objects.create(user=user)
        Submission.objects.create(user=None)
        AdditionalReference.objects.create(
            submission=submission,
            type=PANGAEA_JIRA_TICKET,
            reference_key='PDI-0815',
            primary=True
        )

    @skip('request to PANGAEA server')
    def test_basic_soap_call_for_token(self):
        resource_credential = ResourceCredential.objects.first()
        headers = {
            'Accept': 'text/xml',
            'SOAPAction': 'login'
        }
        body = _get_pangaea_soap_body()
        response = requests.post(url=resource_credential.url, data=body,
                                 headers=headers)

    @skip('request to PANGAEA server')
    def test_request_pangaea_login_token(self):
        resource_credential = ResourceCredential.objects.first()
        response = request_pangaea_login_token(
            resource_credential=resource_credential)
        self.assertTrue(200, response.status_code)
        self.assertIn(
            'xmlns:ns1="urn:java:de.pangaea.login.PanLogin">'
            '<loginReturn xsi:type="xsd:string">', response.content
        )

    @skip('request to PANGAEA server')
    def test_doi_parsing(self):
        site_config = SiteConfiguration.objects.first()
        login_token = get_pangaea_login_token(site_config.pangaea_token_server)
        ticket_key = 'PDI-12428'
        # TODO: PANGAEA_ISSUE_BASE_URL not defined anymore
        url = '{0}{1}'.format('PANGAEA_ISSUE_BASE_URL', ticket_key)
        cookies = dict(PanLoginID=login_token)
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.get(
            url=url,
            headers=headers,
            cookies=cookies,
        )

    @responses.activate
    def test_parse_pangaea_soap_response(self):
        resource_credential = ResourceCredential.objects.first()
        expected_token = 'f3d7aca208aaec8954d45bebc2f59ba1522264db'
        responses.add(
            responses.POST,
            resource_credential.url,
            status=200,
            body=_get_pangaea_soap_response()
        )
        response = request_pangaea_login_token(resource_credential)
        parsed_token = parse_pangaea_login_token_response(response)
        self.assertEqual(expected_token, parsed_token)

    @responses.activate
    def test_get_pangaea_login_token(self):
        resource_credential = ResourceCredential.objects.first()
        expected_token = 'f3d7aca208aaec8954d45bebc2f59ba1522264db'
        responses.add(
            responses.POST,
            resource_credential.url,
            status=200,
            body=_get_pangaea_soap_response()
        )
        self.assertTrue(expected_token,
                        get_pangaea_login_token(resource_credential))

    def test_filter_for_submission_additional_reference(self):
        submissions_with_reference = Submission.objects.filter(
            status=Submission.OPEN).filter(
            additionalreference__type=PANGAEA_JIRA_TICKET)
        all_submissions = Submission.objects.all()

        self.assertEqual(2, len(all_submissions))
        self.assertEqual(1, len(submissions_with_reference))
        self.assertEqual(
            1,
            len(
                submissions_with_reference.first().additionalreference_set.all())
        )
        self.assertEqual(
            1,
            len(
                submissions_with_reference.first().additionalreference_set.filter(
                    type=PANGAEA_JIRA_TICKET)))
        ref = submissions_with_reference.first().additionalreference_set.filter(
            type=PANGAEA_JIRA_TICKET).first()
        self.assertEqual('PDI-0815', ref.reference_key)

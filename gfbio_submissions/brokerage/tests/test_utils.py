# -*- coding: utf-8 -*-
import csv
import datetime
import io
import json
import os
from collections import OrderedDict
from unittest import skip
from unittest.mock import patch

import requests
import responses
from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from jira import JIRA, JIRAError
from requests import ConnectionError
from requests.structures import CaseInsensitiveDict
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    JIRA_ISSUE_URL, JIRA_COMMENT_SUB_URL, \
    JIRA_ATTACHMENT_SUB_URL, GENERIC, ENA_PANGAEA, JIRA_USERNAME_URL_TEMPLATE, \
    JIRA_USERNAME_URL_FULLNAME_TEMPLATE
from gfbio_submissions.brokerage.exceptions import TransferClientError, \
    raise_response_exceptions, TransferServerError
from gfbio_submissions.brokerage.models import Submission, ResourceCredential, \
    SiteConfiguration, AdditionalReference, \
    TaskProgressReport, SubmissionUpload, BrokerObject
from gfbio_submissions.brokerage.serializers import SubmissionSerializer
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.tests.utils import _get_ena_xml_response, \
    _get_pangaea_soap_body, _get_pangaea_soap_response, \
    _get_pangaea_attach_response, _get_test_data_dir_path, \
    _get_pangaea_comment_response, \
    _get_pangaea_ticket_response
from gfbio_submissions.brokerage.utils import csv
from gfbio_submissions.brokerage.utils.csv import parse_molecular_csv, \
    check_for_molecular_content
from gfbio_submissions.brokerage.utils.ena import \
    download_submitted_run_files_to_stringIO, prepare_ena_data
from gfbio_submissions.brokerage.utils.gfbio import \
    gfbio_get_user_by_id, gfbio_prepare_create_helpdesk_payload, \
    get_gfbio_helpdesk_username
from gfbio_submissions.brokerage.utils.pangaea import \
    request_pangaea_login_token, parse_pangaea_login_token_response, \
    get_pangaea_login_token
from gfbio_submissions.brokerage.utils.submission_transfer import \
    SubmissionTransferHandler
from gfbio_submissions.brokerage.utils.task_utils import \
    get_submission_and_site_configuration
from gfbio_submissions.users.models import User


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
        site_conf = SiteConfiguration.objects.create(
            title='Title',
            site=user,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Comment',
        )
        submission = Submission.objects.create(site=user)
        Submission.objects.create(site=user)
        reference = AdditionalReference.objects.create(
            submission=submission,
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
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

    # @skip('request to PANGAEA server')
    # def test_create_pangaea_ticket(self):
    #     site_config = SiteConfiguration.objects.first()
    #     login_token = get_pangaea_login_token(site_config.pangaea_token_server)
    #     response = create_pangaea_jira_ticket(login_token,
    #                                           site_configuration=site_config)

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
            additionalreference__type=AdditionalReference.PANGAEA_JIRA_TICKET)
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
                    type=AdditionalReference.PANGAEA_JIRA_TICKET)))
        ref = submissions_with_reference.first().additionalreference_set.filter(
            type=AdditionalReference.PANGAEA_JIRA_TICKET).first()
        self.assertEqual('PDI-0815', ref.reference_key)


class TestServiceMethods(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create(
            username="user1"
        )
        resource_credential = ResourceCredential.objects.create(
            url='https://gfbio-pub2.inf-bb.uni-jena.de',
            title='gfbio_portal',
            authentication_string='-',
            username='broker.agent@gfbio.org',
            password='',
            comment='comment',
        )
        SiteConfiguration.objects.create(
            title='default',
            site=None,
            ena_server=resource_credential,
            pangaea_token_server=resource_credential,
            pangaea_jira_server=resource_credential,
            gfbio_server=resource_credential,
            helpdesk_server=resource_credential,
            comment='',
        )
        SubmissionTest._create_submission_via_serializer()

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_gfbio_get_user_by_id(self, mock_requests):
        mock_requests.get.return_value.status_code = 200
        mock_requests.get.return_value.ok = True
        response_data = {"firstname": "Marc", "middlename": "",
                         "emailaddress": "maweber@mpi-bremen.de",
                         "fullname": "Marc Weber",
                         "screenname": "maweber", "userid": 16250,
                         "lastname": "Weber"}
        mock_requests.get.return_value.content = json.dumps(response_data)
        conf = SiteConfiguration.objects.first()
        submission = Submission.objects.first()
        response = gfbio_get_user_by_id(16250, conf, submission=submission)
        self.assertEqual(200, response.status_code)
        content = json.loads(response.content)
        self.assertDictEqual(response_data, content)

        response = gfbio_get_user_by_id('16250', conf, submission=submission)
        self.assertEqual(200, response.status_code)
        content = json.loads(response.content)
        self.assertDictEqual(response_data, content)


class TestGFBioJiraApi(TestCase):
    base_url = 'http://helpdesk.gfbio.org'

    @skip('Test against helpdesk server')
    def test_create_request(self):
        url = 'http://helpdesk.gfbio.org{0}'.format(JIRA_ISSUE_URL)
        response = requests.post(
            url=url,
            auth=('brokeragent', ''),
            headers={
                'Content-Type': 'application/json'
            },
            data=json.dumps({
                'fields': {
                    'project': {
                        'key': 'SAND'
                    },
                    'summary': 'Testing REST API programmatic',
                    'description': 'Generating JIRA issues via django unit-test.',
                    'issuetype': {
                        'name': 'IT Help'
                    },
                    'reporter': {
                        'name': 'testuser1'
                    },
                    'customfield_10010': 'sand/data-submission'
                }
            })
        )

    @skip('Test against helpdesk server')
    def test_comment_existing_ticket(self):
        ticket_key = 'SAND-1535'
        ticket_action = 'comment'
        url = '{0}{1}/{2}/{3}'.format(self.base_url, JIRA_ISSUE_URL,
                                      ticket_key, ticket_action)
        response = requests.post(
            url=url,
            auth=('brokeragent', ''),
            headers={
                'Content-Type': 'application/json'
            },
            data=json.dumps({
                'body': 'programmatic update of ticket {}'.format(ticket_key)
            })
        )
        print(response.status_code)
        print(response.content)
        # 201
        # b'{"self":"https://helpdesk.gfbio.org/rest/api/2/issue/16029/comment/21606","id":"21606","author":{"self":"https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent","name":"brokeragent","key":"brokeragent@gfbio.org","emailAddress":"brokeragent@gfbio.org","avatarUrls":{"48x48":"https://helpdesk.gfbio.org/secure/useravatar?ownerId=brokeragent%40gfbio.org&avatarId=11100","24x24":"https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.org&avatarId=11100","16x16":"https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=11100","32x32":"https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"},"displayName":"Broker Agent","active":true,"timeZone":"Europe/Berlin"},"body":"programmatic update of ticket SAND-1535","updateAuthor":{"self":"https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent","name":"brokeragent","key":"brokeragent@gfbio.org","emailAddress":"brokeragent@gfbio.org","avatarUrls":{"48x48":"https://helpdesk.gfbio.org/secure/useravatar?ownerId=brokeragent%40gfbio.org&avatarId=11100","24x24":"https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.org&avatarId=11100","16x16":"https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=11100","32x32":"https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"},"displayName":"Broker Agent","active":true,"timeZone":"Europe/Berlin"},"created":"2019-09-17T13:46:17.002+0000","updated":"2019-09-17T13:46:17.002+0000"}'

    @skip('Test against helpdesk server')
    def test_get_comments(self):
        ticket_key = 'SAND-1535'
        ticket_action = 'comment'
        url = '{0}{1}/{2}/{3}'.format(self.base_url, JIRA_ISSUE_URL,
                                      ticket_key, ticket_action)
        response = requests.get(
            url=url,
            auth=('brokeragent', ''),
            headers={
                'Content-Type': 'application/json'
            }
        )
        print(response.status_code)
        print(response.content)
        # 200
        # b'{"startAt":0,"maxResults":1048576,"total":1,"comments":[{"self":"https://helpdesk.gfbio.org/rest/api/2/issue/16029/comment/21606","id":"21606","author":{"self":"https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent","name":"brokeragent","key":"brokeragent@gfbio.org","emailAddress":"brokeragent@gfbio.org","avatarUrls":{"48x48":"https://helpdesk.gfbio.org/secure/useravatar?ownerId=brokeragent%40gfbio.org&avatarId=11100","24x24":"https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.org&avatarId=11100","16x16":"https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=11100","32x32":"https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"},"displayName":"Broker Agent","active":true,"timeZone":"Europe/Berlin"},"body":"programmatic update of ticket SAND-1535","updateAuthor":{"self":"https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent","name":"brokeragent","key":"brokeragent@gfbio.org","emailAddress":"brokeragent@gfbio.org","avatarUrls":{"48x48":"https://helpdesk.gfbio.org/secure/useravatar?ownerId=brokeragent%40gfbio.org&avatarId=11100","24x24":"https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.org&avatarId=11100","16x16":"https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=11100","32x32":"https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"},"displayName":"Broker Agent","active":true,"timeZone":"Europe/Berlin"},"created":"2019-09-17T13:46:17.002+0000","updated":"2019-09-17T13:46:17.002+0000"}]}'

    @skip('Test against helpdesk server')
    def test_get_and_update_existing_ticket(self):
        # was generic submission, done via gfbio-portal
        ticket_key = 'SAND-1535'
        url = '{0}{1}/{2}'.format(self.base_url, JIRA_ISSUE_URL,
                                  ticket_key, )
        response = requests.get(
            url=url,
            auth=('brokeragent', ''),
        )
        response = requests.put(
            url=url,
            auth=('brokeragent', ''),
            headers={
                'Content-Type': 'application/json'
            },
            data=json.dumps({
                'fields': {
                    # single value/string
                    'customfield_10205': 'New Name Marc Weber, Alfred E. Neumann',
                    # array of values/strings
                    'customfield_10216': [
                        {'value': 'Uncertain'},
                        {'value': 'Nagoya Protocol'},
                        {'value': 'Sensitive Personal Information'},
                    ]
                }
            })
        )
        # self.assertEqual(204, response.status_code)
        # self.assertEqual(0, len(response.content))
        print(response.status_code)
        print(response.content)

    @skip('Test against helpdesk server')
    def test_add_attachment(self):
        ticket_key = 'SAND-1535'
        url = '{0}{1}/{2}/{3}'.format(
            self.base_url,
            JIRA_ISSUE_URL,
            ticket_key,
            JIRA_ATTACHMENT_SUB_URL,
        )
        headers = CaseInsensitiveDict({'content-type': None,
                                       'X-Atlassian-Token': 'nocheck'})

        data = TestHelpDeskTicketMethods._create_test_data(
            '/tmp/test_primary_data_file')
        # files = {'file': file}
        # files = {'file': open(file, 'rb')}
        response = requests.post(
            url=url,
            auth=('brokeragent', ''),
            headers=headers,
            files=data,
        )
        # 200
        # b'[{"self":"https://helpdesk.gfbio.org/rest/api/2/attachment/13820",
        # "id":"13820","filename":"test_primary_data_file","author":
        # {"self":"https://helpdesk.gfbio.org/rest/api/2/user?username=
        # brokeragent","name":"brokeragent","key":"brokeragent@gfbio.org",
        # "emailAddress":"brokeragent@gfbio.org","avatarUrls":{"48x48":
        # "https://helpdesk.gfbio.org/secure/useravatar?ownerId=
        # brokeragent%40gfbio.org&avatarId=11100","24x24":
        # "https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=
        # brokeragent%40gfbio.org&avatarId=11100","16x16":
        # "https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=
        # brokeragent%40gfbio.org&avatarId=11100","32x32":
        # "https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=
        # brokeragent%40gfbio.org&avatarId=11100"},"displayName":
        # "Broker Agent","active":true,"timeZone":"Europe/Berlin"},
        # "created":"2019-06-05T20:06:12.318+0000","size":8,
        # "content":"https://helpdesk.gfbio.org/secure/attachment/
        # 13820/test_primary_data_file"}]'

    @skip('Test against helpdesk server')
    def test_delete_attachment(self):
        # ticket_key = 'SAND-1535'
        # testing get ticket -> WORKS
        #  http://helpdesk.gfbio.org/rest/api/2/issue/SAND-1535
        # url = '{0}{1}/{2}'.format(self.base_url, HELPDESK_API_SUB_URL,
        #                           ticket_key, )
        # response = requests.get(
        #     url=url,
        #     auth=('brokeragent', ''),
        #     headers={
        #         'Content-Type': 'application/json'
        #     },
        # )
        #
        # testing get attachment -> WORKS
        # url = '{0}{1}/{2}'.format(self.base_url, '/rest/api/2/attachment',
        #                           '13791', )
        # print(url)
        # response = requests.get(
        #     url=url,
        #     auth=('brokeragent', ''),
        #     headers={
        #         'Content-Type': 'application/json'
        #     },
        # )
        # http://helpdesk.gfbio.org/rest/api/2/attachment/13791
        # 200
        # b'{"self":"https://helpdesk.gfbio.org/rest/api/2/attachment/13791",
        # "filename":"File1.forward.fastq.gz","author":{"self":
        # "https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent",
        # "key":"brokeragent@gfbio.org","name":"brokeragent","avatarUrls":
        # {"48x48":"https://helpdesk.gfbio.org/secure/useravatar?ownerId=
        # brokeragent%40gfbio.org&avatarId=11100","24x24":"https://helpdesk.
        # gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.
        # org&avatarId=11100","16x16":"https://helpdesk.gfbio.org/secure/
        # useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=
        # 11100","32x32":"https://helpdesk.gfbio.org/secure/useravatar?
        # size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"},
        # "displayName":"Broker Agent","active":true},"created":
        # "2019-06-04T19:39:21.138+0000","size":66,"properties":{},
        # "content":"https://helpdesk.gfbio.org/secure/attachment/13791/
        # File1.forward.fastq.gz"}'

        # testing delete -> WORKS
        url = '{0}{1}/{2}'.format(self.base_url, '/rest/api/2/attachment',
                                  '13791', )
        response = requests.delete(
            url=url,
            auth=('brokeragent', ''),
            headers={
                'Content-Type': 'application/json'
            },
        )
        # http://helpdesk.gfbio.org/rest/api/2/attachment/13791
        # 204
        # b''

    @skip('Test against helpdesk server')
    def test_update_ticket_with_siteconfig(self):

        # WORKS:
        ticket_key = 'SAND-1539'
        url = '{0}{1}/{2}'.format(self.base_url, JIRA_ISSUE_URL,
                                  ticket_key, )
        response = requests.put(
            url=url,
            auth=('brokeragent', ''),
            headers={
                'Content-Type': 'application/json'
            },
            data=json.dumps({
                # 'fields': {
                #     'customfield_10205': 'Kevin Horsmeier',
                #     'customfield_10216': [
                #         {'value': 'Uncertain'},
                #     ]
                # }
                'fields': {
                    # 'customfield_10010': 'sand/generic-data',
                    'customfield_10202': {
                        'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10805',
                        'value': 'CC BY-NC-ND 4.0', 'id': '10805'},
                    'issuetype': {'name': 'Data Submission'},
                    'customfield_10307': 'pub1',
                    'description': 'remote debug 4',
                    'customfield_10208': 'remote debug 4',
                    'customfield_10311': '',
                    'customfield_10303': '7e6fa310-6031-4e41-987b-271d89916eb2',
                    'customfield_10205': ',;', 'customfield_10216': [
                        {'value': 'Sensitive Personal Information'},
                        {'value': 'Uncertain'}],
                    'summary': 'remote debug 4 EDIT TITLE AGAIN Part 2 "Retur...',
                    # 'reporter': {
                    #     'name': 'No valid user, name or email available'},
                    'customfield_10313': 'Algae & Protists, Zoology, Geoscience, Microbiology',
                    'project': {'key': 'SAND'},
                    'customfield_10200': '2020-01-24',
                    'customfield_10314': '',
                    'customfield_10308': ['LABEL1', 'label2'],
                    'customfield_10600': '',
                    'customfield_10229': [{'value': 'Dublin Core'}],
                    'customfield_10201': 'remote debug 4 EDIT TITLE AGAIN Part 2 "Return of the edit"'
                }
            })
        )
        # ######################################

        # jira = JIRA(server='http://helpdesk.gfbio.org/',
        #             basic_auth=('brokeragent', ''))
        #
        # issue = jira.issue('SAND-1539')
        # res = issue.update(notify=True, fields={
        #     'customfield_10205': 'New Name Marc Weber, Alfred E. Neumann',
        #     'customfield_10216': [
        #         {'value': 'Uncertain'},
        #         {'value': 'Nagoya Protocol'},
        #         {'value': 'Sensitive Personal Information'},
        #     ]
        # })
        # print(res)

        # issue = jira.issue('SAND-1540')
        # res = issue.update(notify=True, fields={'summary': 'new summary Part 2',
        #                                         'description': 'A new summary was added. AGAIN'})
        # print(res)
        pass

    # @skip('Test against helpdesk server')
    @responses.activate
    def test_python_jira_500(self):
        # jira-python fires multiple requests to respective jira servers
        # mocking this one provokes a 500 exception like one to be expected on server errors

        # if mocked request does not match url python-jiras own retry policy will apply
        # e.g. get_server_info=True. Then exception is thrown

        responses.add(responses.GET,
                      'http://helpdesk.gfbio.org/rest/api/2/field',
                      json={'server_error': 'mocked'}, status=500)

        options = {
            'server': 'http://helpdesk.gfbio.org/'
        }

        # alternativ
        # jira = JIRA(server='http://helpdesk.gfbio.org/',
        #             basic_auth=('brokeragent', ''))

        try:
            jira = JIRA(options=options,
                        basic_auth=('brokeragent', ''),
                        max_retries=1, get_server_info=True)
        except ConnectionError as ex:
            print('GENERIC EXCEPTION ', ex)
            print(ex.__dict__)
            print(ex.request.__dict__)
        except JIRAError as e:
            print(e.__dict__)
            print('status_code ', e.status_code)
            print('text ', e.text)
            print('response ', e.response)
            print('response. status_code ', e.response.status_code)

    # @skip('Test against helpdesk server')
    @responses.activate
    def test_python_jira_400(self):

        responses.add(responses.GET,
                      'http://helpdesk.gfbio.org/rest/api/2/field',
                      json={'client_error': 'mocked'}, status=400)
        options = {
            'server': 'http://helpdesk.gfbio.org/'
        }

        # alternativ
        # jira = JIRA(server='http://helpdesk.gfbio.org/',
        #             basic_auth=('brokeragent', ''))

        try:
            jira = JIRA(options=options,
                        basic_auth=('brokeragent', ''),
                        max_retries=1, get_server_info=False)
        except JIRAError as e:
            print('JIRA ERROR ', e)
            # print('status_code ', e.status_code)
            # print('text ', e.text)
            # print('response ', e.response)
            # print('response. status_code ', e.response.status_code)
        # issues = jira.search_issues('assignee="Marc Weber"')
        # issue = jira.issue('SAND-1539')

        # pprint(issue.__dict__)
        # print('\n\n')

        # print(issue.fields.summary)
        # print('issues ', issues)
        # try:
        #     issue = jira.issue('SAND-1539xx')
        #     print(issue.fields.summary)
        #     print('issues ', issues)
        # except JIRAError as e:
        #     print(e.__dict__)
        #     print('status_code ', e.status_code)
        #     print('text ', e.text)
        #     print('response ', e.response)
        #     print('response. status_code ', e.response.status_code)

        # responses.add(responses.GET, 'http://helpdesk.gfbio.org/rest/api/2/field',
        #               json={'what': 'fake_response'}, status=500)
        # try:
        #     issue = jira.issue('SAND-1539oo')
        #     print(issue.fields.summary)
        #     print('issues ', issues)
        # except requests.exceptions.ConnectionError as e:
        #     print(e)
        # except JIRAError as e:
        #     print(e.__dict__)
        #     print('status_code ', e.status_code)
        #     print('text ', e.text)
        #     print('response ', e.response)
        #     print('response. status_code ', e.response.status_code)

    @skip('Test against pangaea servers')
    def test_pangaea_jira(self):
        rc = ResourceCredential.objects.create(
            title='t',
            url='https://ws.pangaea.de/ws/services/PanLogin',
            authentication_string='-',
            username='gfbio-broker',
            password='',
            comment='-'
        )
        login_token = get_pangaea_login_token(rc)
        cookies = dict(PanLoginID=login_token)
        print('COOKIES ', cookies)

        options = {
            'server': 'https://issues.pangaea.de',
            'cookies': cookies,
        }
        jira = JIRA(options)
        print(jira)
        print('projects', jira.projects)
        # PDI-21091
        issues = jira.search_issues('assignee="brokeragent"')
        print('issues ', issues)
        issue = jira.issue('PDI-21091')
        print('issue ', issue.fields.summary)

    @skip('Test against helpdesk server')
    def test_python_jira_create(self):
        jira = JIRA(server='http://helpdesk.gfbio.org/',
                    basic_auth=('brokeragent', ''))

        # almost analog to gfbio_prepare_create_helpdesk_payload(...)
        issue_dict = {
            'project': {'key': 'SAND'},
            'summary': 'New issue from jira-python',
            'description': 'Look into this one',
            'issuetype': {
                'name': 'Data Submission'
            },
            'reporter': {
                'name': 'maweber@mpi-bremen.de'
            },
            'assignee': {
                'name': 'maweber@mpi-bremen.de'  # or data center
            },
            'customfield_10010': 'sand/molecular-data',
            'customfield_10200': '{0}'.format(
                (datetime.date.today() + datetime.timedelta(
                    days=365)).isoformat()),
            'customfield_10201': 'requirements title',
            'customfield_10208': 'requirements description',
            'customfield_10303': '7fafa310-6031-4e41-987b-271d89916eb2',
            # 'customfield_10311': requirements.get('data_collection_time', ''),
            'customfield_10308': ['LABEL1', 'label2', ],
            'customfield_10313': ', '.join(
                ['Algae & Protists', 'Microbiology']),
            'customfield_10205': 'first_name,last_name;email',
            'customfield_10307': '; '.join(['publication 1234']),
            'customfield_10216': [{'value': l} for l in
                                  ['Sensitive Personal Information',
                                   'Uncertain']],
            'customfield_10314': 'potential project id',
            'customfield_10202': {
                'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10500',
                'value': 'other',
                'id': '10500'
            },
            'customfield_10600': 'http://www.downloadurl.com',
            'customfield_10229': [{'value': 'other'}],

        }
        try:
            new_issue = jira.create_issue(fields=issue_dict)
            # SAND-1540
            # works : https://helpdesk.gfbio.org/projects/SAND/queues/custom/21/SAND-1540
            # <class 'jira.resources.Issue'>
        except JIRAError as e:
            pass
            # print(e.status_code)
            # # 400
            # print(e.response.text)
            # {"errorMessages":[],"errors":{"Metadata Description":"data was
            # not an array","customfield_10202":"Could not find valid 'id' or
            # 'value' in the Parent Option object."}}

        # new_issue = jira.create_issue(
        #     project='PROJ_key_or_id',
        #     summary='New issue from jira-python',
        #     description='Look into this one',
        #     issuetype={'name': 'Bug'}
        # )
        # print(new_issue)

    @skip('Test against helpdesk server')
    def test_python_jira_update(self):
        jira = JIRA(server='http://helpdesk.gfbio.org/',
                    basic_auth=('brokeragent', ''))
        issue = jira.issue('SAND-1543')
        print(issue)
        # comments = jira.comments(issue)
        # print
        # issue.update(summary='new summary', description='A new summary was added')

        # res = issue.update(notify=False, fields={'summary': 'new summary',
        #                                    'description': 'A new summary was added'})
        # jira.exceptions.JIRAError: JiraError HTTP 403 url: https://helpdesk.gfbio.org/rest/api/2/issue/16035?notifyUsers=false
        # 	text: To discard the user notification either admin or project admin permissions are required.

        res = issue.update(notify=True, fields={'summary': 'new summary',
                                                'description': 'A new summary was added'})


class TestSubmissionTransferHandler(TestCase):

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
        resource_cred_2 = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        SiteConfiguration.objects.create(
            title='Title',
            site=user,
            ena_server=resource_cred_2,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Comment',
        )
        SiteConfiguration.objects.create(
            title='default',
            site=None,
            ena_server=resource_cred_2,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Comment',
        )
        submission = SubmissionTest._create_submission_via_serializer()
        submission.additionalreference_set.create(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        submission = Submission.objects.create(site=None)

    def test_instance(self):
        submission = Submission.objects.first()
        transfer_handler = SubmissionTransferHandler(
            submission_id=submission.pk,
            target_archive='ENA'
        )
        self.assertIsInstance(transfer_handler, SubmissionTransferHandler)
        self.assertEqual(submission.pk, transfer_handler.submission_id)
        self.assertEqual('ENA', transfer_handler.target_archive)

    def test_get_submisssion_and_siteconfig_for_task(self):
        submission = Submission.objects.first()
        from gfbio_submissions.brokerage.tasks import \
            create_submission_issue_task
        sub, conf = \
            get_submission_and_site_configuration(
                submission_id=submission.pk, task=create_submission_issue_task,
                include_closed=False)
        # tprs = TaskProgressReport.objects.all()
        # print(tprs.first().__dict__)
        # self.assertEqual(0, len(tprs))
        self.assertIsInstance(sub, Submission)
        self.assertIsInstance(conf, SiteConfiguration)

    @skip('currently this method is not supposed to rise an exception, '
          'so task.chain can proceed in a controlled way')
    def test_invalid_submission_id(self):
        with self.assertRaises(
                SubmissionTransferHandler.TransferInternalError) as exc:
            sub, conf = get_submission_and_site_configuration(
                submission_id=99)

    def test_no_site_config(self):
        from gfbio_submissions.brokerage.tasks import \
            create_submission_issue_task
        sub, conf = \
            get_submission_and_site_configuration(
                submission_id=Submission.objects.last().pk,
                task=create_submission_issue_task,
                include_closed=False)
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        # self.assertEqual(0, len(tprs))
        self.assertIsInstance(conf, SiteConfiguration)
        self.assertEqual('default', conf.title)

    def test_no_site_config_without_default(self):
        from gfbio_submissions.brokerage.tasks import \
            create_submission_issue_task
        site_config = SiteConfiguration.objects.last()
        site_config.delete()
        submission = Submission.objects.last()
        # - older version where exception was raised
        # with self.assertRaises(
        #         TransferInternalError) as exc:
        sub, conf = get_submission_and_site_configuration(
            submission_id=submission.pk,
            task=create_submission_issue_task,
            include_closed=False
        )
        # - now exception is catched and TaskProgressReprort.CANCELLED is returned for sub
        self.assertEqual(TaskProgressReport.CANCELLED, sub)

    def test_raise_400_exception(self):
        response = requests.models.Response()
        response.status_code = 401
        response._content = '{}'
        with self.assertRaises(
                TransferClientError) as exc:
            raise_response_exceptions(response)

    def test_raise_500_exception(self):
        response = requests.models.Response()
        response.status_code = 500
        response._content = '{}'
        with self.assertRaises(
                TransferServerError) as exc:
            raise_response_exceptions(response)

    @responses.activate
    def test_execute_ena_only(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response()
        )
        url = '{0}{1}/{2}/{3}'.format(
            conf.helpdesk_server.url,
            JIRA_ISSUE_URL,
            'FAKE_KEY',
            JIRA_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json={'bla': 'blubb'},
                      status=200)
        sth = SubmissionTransferHandler(submission_id=submission.pk,
                                        target_archive='ENA')
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(0, len(tprs))
        sth.execute_submission_to_ena()
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertLess(0, len(tprs))

    @responses.activate
    def test_execute_ena_pangaea(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()

        responses.add(
            responses.POST,
            site_config.ena_server.url,
            status=200,
            body=_get_ena_xml_response()
        )
        url = '{0}{1}/{2}/{3}'.format(
            site_config.helpdesk_server.url,
            JIRA_ISSUE_URL,
            'FAKE_KEY',
            JIRA_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json={'bla': 'blubb'},
                      status=200)

        responses.add(
            responses.POST,
            site_config.pangaea_token_server.url,
            body=_get_pangaea_soap_response(),
            status=200)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(
                site_config.pangaea_jira_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.pangaea_jira_server.url,
                            JIRA_ISSUE_URL),
            json=_get_pangaea_ticket_response(),
            status=200)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/PDI-12428'.format(
                site_config.helpdesk_server.url),
            json=_get_pangaea_ticket_response()
        )

        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.pangaea_jira_server.url,
                          JIRA_ISSUE_URL,
                          'PDI-12428',
                          JIRA_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_pangaea_attach_response(),
                      status=200)
        responses.add(
            responses.POST,
            '{0}/{1}/comment'.format(site_config.pangaea_jira_server.url,
                                     'PANGAEA_FAKE_KEY'),
            json=_get_pangaea_comment_response(),
            status=200)
        # responses.add(
        #     responses.POST,
        #     site_config.pangaea_token_server.url,
        #     body=_get_pangaea_soap_response(),
        #     status=200)
        # responses.add(
        #     responses.POST,
        #     PANGAEA_ISSUE_BASE_URL,
        #     json={'id': '31444', 'key': 'PANGAEA_FAKE_KEY',
        #           'self': 'http://issues.pangaea.de/rest/api/2/issue/31444'},
        #     status=201)
        # responses.add(
        #     responses.POST,
        #     '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
        #                                 'PANGAEA_FAKE_KEY'),
        #     json=_get_pangaea_attach_response(),
        #     status=200)
        # responses.add(
        #     responses.POST,
        #     '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
        #                             'PANGAEA_FAKE_KEY'),
        #     json=_get_pangaea_comment_response(),
        #     status=200)
        sth = SubmissionTransferHandler(submission_id=submission.pk,
                                        target_archive='ENA_PANGAEA')
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(0, len(tprs))
        sth.execute_submission_to_ena_and_pangaea()
        self.assertLess(0, len(TaskProgressReport.objects.all()))


class TestHelpDeskTicketMethods(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='upload')
        user.user_permissions.add(*permissions)
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        cls.api_client = client
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        SiteConfiguration.objects.create(
            title='default',
            site=None,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
            contact='kevin@horstmeier.de'
        )
        submission = SubmissionTest._create_submission_via_serializer()
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )

    @classmethod
    def _create_test_data(cls, path, delete=True):
        if delete:
            cls._delete_test_data()
        f = open(path, 'w')
        f.write('test123\n')
        f.close()
        f = open(path, 'rb')
        return {
            'file': f,
        }

    @staticmethod
    def _delete_test_data():
        SubmissionUpload.objects.all().delete()

    def test_prepare_helpdesk_payload(self):
        with open(os.path.join(
                _get_test_data_dir_path(),
                'generic_data.json'), 'r') as data_file:
            data = json.load(data_file)
        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': data
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        self.assertEqual({'name': 'ikostadi'}, payload['assignee'])
        self.assertEqual('sand/molecular-data',
                         payload['customfield_10010'])
        self.assertEqual('MIxS',
                         payload['customfield_10229'][0]['value'])

        data['requirements'].pop('data_center')
        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': data
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        self.assertNotIn('assignee', payload.keys())
        self.assertEqual('sand/generic-data',
                         payload['customfield_10010'])

        self.assertEqual('other',
                         payload['customfield_10229'][0]['value'])

        data['requirements'][
            'data_center'] = 'GFBio Data Centers - our curators will suggest the appropriate one(s)'
        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': data
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        self.assertNotIn('assignee', payload.keys())

    def test_prepare_helpdesk_payload_metadataschema_is_none(self):
        with open(os.path.join(
                _get_test_data_dir_path(),
                'generic_data.json'), 'r') as data_file:
            data = json.load(data_file)
        data['requirements'].pop('data_center')
        data['requirements']['metadata_schema'] = 'None'

        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': data
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        self.assertEqual('other',
                         payload['customfield_10229'][0]['value'])

    @responses.activate
    def test_get_gfbio_helpdesk_username(self):
        url = JIRA_USERNAME_URL_TEMPLATE.format('deleteMe',
                                                'delete@me.de', )
        responses.add(responses.GET, url, body=b'deleteMe', status=200)
        response = get_gfbio_helpdesk_username('deleteMe', 'delete@me.de', )
        self.assertEqual(200, response.status_code)
        self.assertEqual(b'deleteMe', response.content)

    @responses.activate
    def test_get_gfbio_helpdesk_username_with_fullname(self):
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format('deleteMe',
                                                         'delete@me.de',
                                                         'Delete me if you want')
        responses.add(responses.GET, url, body=b'deleteMe', status=200)
        response = get_gfbio_helpdesk_username('deleteMe', 'delete@me.de',
                                               'Delete me if you want')
        self.assertEqual(200, response.status_code)
        self.assertEqual(b'deleteMe', response.content)


class TestDownloadEnaReport(TestCase):

    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        SiteConfiguration.objects.create(
            title='default',
            site=None,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
            contact='kevin@horstmeier.de'
        )

    # TODO: remove later, since real credentials are needed
    # TODO: mock ftp request -> https://stackoverflow.com/questions/35654355/mocking-ftp-in-unit-test
    @skip('real request to ena ftp unit mock is in place')
    def test_ftp_access(self):
        rc = ResourceCredential.objects.create(
            title='ena_ftp',
            url='webin.ebi.ac.uk',
            authentication_string='',
            username='Webin-40945',
            password='',
            comment='',
        )
        site_conf = SiteConfiguration.objects.first()
        site_conf.ena_ftp = rc
        site_conf.save()

        decompressed_file = io.StringIO()
        report = download_submitted_run_files_to_stringIO(
            site_config=site_conf,
            decompressed_io=decompressed_file,
        )
        self.assertTrue(len(report) > 0)
        decompressed_file.seek(0)
        reader = csv.DictReader(decompressed_file, delimiter=str('\t'))
        row = reader.next()
        self.assertTrue('STUDY_ID' in row.keys())
        decompressed_file.close()


class TestCSVParsing(TestCase):

    @classmethod
    def create_csv_submission_upload(cls, submission, user,
                                     file_sub_path='csv_files/molecular_metadata.csv'):
        with open(os.path.join(_get_test_data_dir_path(), file_sub_path),
                  'rb') as data_file:
            submission_upload = SubmissionUpload.objects.create(
                submission=submission,
                site=user,
                user=user,
                meta_data=True,
                file=SimpleUploadedFile(
                    'csv_files/upload_molecular_metadata.csv',
                    data_file.read()),
            )

    @classmethod
    def _strip(cls, d):
        aliases = ['sample_alias', 'experiment_alias', 'sample_descriptor']
        for k, v in d.items():
            if isinstance(v, list):
                for e in v:
                    cls._strip(e)
            elif isinstance(v, dict):
                cls._strip(v)
            else:
                if k in aliases:
                    d[k] = ''
        return d

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='upload')
        user.user_permissions.add(*permissions)
        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': {
                'requirements': {
                    'title': 'Mol content test',
                    'description': 'Reduced data for testing',
                    'data_center': 'ENA – European Nucleotide Archive',
                }
            }
        })
        serializer.is_valid()
        submission = serializer.save(site=user)
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        cls.create_csv_submission_upload(submission, user)
        cls.expected_parse_result = {'experiments': [{'design': {
            'library_descriptor': {
                'library_layout': {
                    'layout_type': 'paired',
                    'nominal_length': 420},
                'library_selection': 'PCR',
                'library_source': 'METAGENOMIC',
                'library_strategy': 'AMPLICON'},
            'sample_descriptor': 'oa2Xu'},
            'files': {
                'forward_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                'forward_read_file_name': 'File1.forward.fastq.gz',
                'reverse_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                'reverse_read_file_name': 'File1.reverse.fastq.gz'},
            'experiment_alias': '4aNiEu',
            'platform': 'Illumina HiSeq 1000'},
            {'design': {
                'library_descriptor': {
                    'library_layout': {
                        'layout_type': 'paired',
                        'nominal_length': 420},
                    'library_selection': 'PCR',
                    'library_source': 'METAGENOMIC',
                    'library_strategy': 'AMPLICON'},
                'sample_descriptor': 'oaI2E-'},
                'files': {
                    'forward_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                    'forward_read_file_name': 'File2.forward.fastq.gz',
                    'reverse_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                    'reverse_read_file_name': 'File2.reverse.fastq.gz'},
                'experiment_alias': 'ncs2E-',
                'platform': 'Illumina HiSeq 1000'},
            {'design': {
                'library_descriptor': {
                    'library_layout': {
                        'layout_type': 'paired',
                        'nominal_length': 420},
                    'library_selection': 'PCR',
                    'library_source': 'METAGENOMIC',
                    'library_strategy': 'AMPLICON'},
                'sample_descriptor': 'ncnWEu'},
                'files': {
                    'forward_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                    'forward_read_file_name': 'File3.forward.fastq.gz',
                    'reverse_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                    'reverse_read_file_name': 'File3.reverse.fastq.gz'},
                'experiment_alias': 'nNCgEu',
                'platform': 'Illumina HiSeq 1000'},
            {'design': {
                'library_descriptor': {
                    'library_layout': {
                        'layout_type': 'paired',
                        'nominal_length': 420},
                    'library_selection': 'PCR',
                    'library_source': 'METAGENOMIC',
                    'library_strategy': 'AMPLICON'},
                'sample_descriptor': 'naXgPe'},
                'files': {
                    'forward_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                    'forward_read_file_name': 'File4.forward.fastq.gz',
                    'reverse_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                    'reverse_read_file_name': 'File4.reverse.fastq.gz'},
                'experiment_alias': '4NRiE-',
                'platform': 'Illumina HiSeq 1000'},
            {'design': {
                'library_descriptor': {
                    'library_layout': {
                        'layout_type': 'paired',
                        'nominal_length': 420},
                    'library_selection': 'PCR',
                    'library_source': 'METAGENOMIC',
                    'library_strategy': 'AMPLICON'},
                'sample_descriptor': 'od_iEs'},
                'files': {
                    'forward_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                    'forward_read_file_name': 'File5.forward.fastq.gz',
                    'reverse_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                    'reverse_read_file_name': 'File5.reverse.fastq.gz'},
                'experiment_alias': 'xdi2bs',
                'platform': 'Illumina HiSeq 1000'}],
            'samples': [{'sample_alias': 'oa2Xu',
                         'sample_attributes': [
                             OrderedDict([('tag',
                                           'sample_description'),
                                          ('value',
                                           'A description, with '
                                           'commmas, ...')]),
                             OrderedDict([('tag',
                                           'investigation type'),
                                          ('value',
                                           'mimarks-survey')]),
                             OrderedDict([('tag',
                                           'environmental package'),
                                          ('value',
                                           'sediment')]),
                             OrderedDict([('tag',
                                           'collection date'),
                                          ('value',
                                           '2015-07-26')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(latitude)'),
                                          ('value',
                                           '79.065100'),
                                          ('unit',
                                           'DD')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(longitude)'),
                                          ('value',
                                           '4.1810000-0.5'),
                                          ('unit',
                                           'DD')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(depth)'),
                                          ('value',
                                           '0-0.5'),
                                          ('unit',
                                           'm')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(elevation)'),
                                          ('value',
                                           '-2465.5'),
                                          ('unit',
                                           'm')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(country and/or sea)'),
                                          ('value',
                                           'Atlantic Ocean')]),
                             OrderedDict([('tag',
                                           'environment (biome)'),
                                          ('value',
                                           'marine benthic biome '
                                           '(ENVO:01000024)')]),
                             OrderedDict([('tag',
                                           'environment (material)'),
                                          ('value',
                                           'marine sediment '
                                           '(ENVO:00002113)')]),
                             OrderedDict([('tag',
                                           'environment (feature)'),
                                          ('value',
                                           'marine benthic feature '
                                           '(ENVO:01000105)')]),
                             OrderedDict([('tag',
                                           'temperature'),
                                          ('value',
                                           '33'),
                                          ('unit',
                                           '&#176;C')])],
                         'sample_description': 'A description, with commmas, ...',
                         'sample_title': 'Sample No. 1',
                         'taxon_id': 1234},
                        {'sample_alias': 'oaI2E-',
                         'sample_attributes': [
                             OrderedDict([('tag',
                                           'sample_description'),
                                          ('value',
                                           '')]),
                             OrderedDict([('tag',
                                           'investigation type'),
                                          ('value',
                                           'mimarks-survey')]),
                             OrderedDict([('tag',
                                           'environmental package'),
                                          ('value',
                                           'sediment')]),
                             OrderedDict([('tag',
                                           'collection date'),
                                          ('value',
                                           '2015-07-26')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(latitude)'),
                                          ('value',
                                           '79.065100'),
                                          ('unit',
                                           'DD')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(longitude)'),
                                          ('value',
                                           '4.1810000-0.5'),
                                          ('unit',
                                           'DD')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(depth)'),
                                          ('value',
                                           '0-0.5'),
                                          ('unit',
                                           'm')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(elevation)'),
                                          ('value',
                                           '-2465.5'),
                                          ('unit',
                                           'm')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(country and/or sea)'),
                                          ('value',
                                           'Atlantic Ocean')]),
                             OrderedDict([('tag',
                                           'environment (biome)'),
                                          ('value',
                                           'marine benthic biome '
                                           '(ENVO:01000024)')]),
                             OrderedDict([('tag',
                                           'environment (material)'),
                                          ('value',
                                           'marine sediment '
                                           '(ENVO:00002113)')]),
                             OrderedDict([('tag',
                                           'environment (feature)'),
                                          ('value',
                                           'marine benthic feature '
                                           '(ENVO:01000105)')]),
                             OrderedDict([('tag',
                                           'temperature'),
                                          ('value',
                                           '2'),
                                          ('unit',
                                           '&#176;C')])],
                         'sample_description': '',
                         'sample_title': 'Sample No. 2',
                         'taxon_id': 1234},
                        {'sample_alias': 'ncnWEu',
                         'sample_attributes': [
                             OrderedDict([('tag',
                                           'sample_description'),
                                          ('value',
                                           'A description, with '
                                           'commmas, ...')]),
                             OrderedDict([('tag',
                                           'investigation type'),
                                          ('value',
                                           'mimarks-survey')]),
                             OrderedDict([('tag',
                                           'environmental package'),
                                          ('value',
                                           'sediment')]),
                             OrderedDict([('tag',
                                           'collection date'),
                                          ('value',
                                           '2015-07-26')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(latitude)'),
                                          ('value',
                                           '79.065100'),
                                          ('unit',
                                           'DD')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(longitude)'),
                                          ('value',
                                           '4.1810000-0.5'),
                                          ('unit',
                                           'DD')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(depth)'),
                                          ('value',
                                           '0-0.5'),
                                          ('unit',
                                           'm')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(elevation)'),
                                          ('value',
                                           '-2465.5'),
                                          ('unit',
                                           'm')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(country and/or sea)'),
                                          ('value',
                                           'Atlantic Ocean')]),
                             OrderedDict([('tag',
                                           'environment (biome)'),
                                          ('value',
                                           'marine benthic biome '
                                           '(ENVO:01000024)')]),
                             OrderedDict([('tag',
                                           'environment (material)'),
                                          ('value',
                                           'marine sediment '
                                           '(ENVO:00002113)')]),
                             OrderedDict([('tag',
                                           'environment (feature)'),
                                          ('value',
                                           'marine benthic feature '
                                           '(ENVO:01000105)')]),
                             OrderedDict([('tag',
                                           'temperature'),
                                          ('value',
                                           '33'),
                                          ('unit',
                                           '&#176;C')])],
                         'sample_description': 'A description, with commmas, ...',
                         'sample_title': 'Sample No. 3',
                         'taxon_id': 1234},
                        {'sample_alias': 'naXgPe',
                         'sample_attributes': [
                             OrderedDict([('tag',
                                           'sample_description'),
                                          ('value',
                                           'A description, with '
                                           'commmas, ...')]),
                             OrderedDict([('tag',
                                           'investigation type'),
                                          ('value',
                                           'mimarks-survey')]),
                             OrderedDict([('tag',
                                           'environmental package'),
                                          ('value',
                                           'sediment')]),
                             OrderedDict([('tag',
                                           'collection date'),
                                          ('value',
                                           '2015-07-26')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(latitude)'),
                                          ('value',
                                           '79.065100'),
                                          ('unit',
                                           'DD')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(longitude)'),
                                          ('value',
                                           '4.1810000-0.5'),
                                          ('unit',
                                           'DD')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(depth)'),
                                          ('value',
                                           '0-0.5'),
                                          ('unit',
                                           'm')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(elevation)'),
                                          ('value',
                                           '-2465.5'),
                                          ('unit',
                                           'm')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(country and/or sea)'),
                                          ('value',
                                           'Atlantic Ocean')]),
                             OrderedDict([('tag',
                                           'environment (biome)'),
                                          ('value',
                                           'marine benthic biome '
                                           '(ENVO:01000024)')]),
                             OrderedDict([('tag',
                                           'environment (material)'),
                                          ('value',
                                           'marine sediment '
                                           '(ENVO:00002113)')]),
                             OrderedDict([('tag',
                                           'environment (feature)'),
                                          ('value',
                                           'marine benthic feature '
                                           '(ENVO:01000105)')]),
                             OrderedDict([('tag',
                                           'temperature'),
                                          ('value',
                                           '78'),
                                          ('unit',
                                           '&#176;C')])],
                         'sample_description': 'A description, with commmas, ...',
                         'sample_title': 'Sample No. 4',
                         'taxon_id': 1234},
                        {'sample_alias': 'od_iEs',
                         'sample_attributes': [
                             OrderedDict([('tag',
                                           'sample_description'),
                                          ('value',
                                           'A description, with '
                                           'commmas, ...')]),
                             OrderedDict([('tag',
                                           'investigation type'),
                                          ('value',
                                           'mimarks-survey')]),
                             OrderedDict([('tag',
                                           'environmental package'),
                                          ('value',
                                           'sediment')]),
                             OrderedDict([('tag',
                                           'collection date'),
                                          ('value',
                                           '2015-07-26')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(latitude)'),
                                          ('value',
                                           '79.065100'),
                                          ('unit',
                                           'DD')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(longitude)'),
                                          ('value',
                                           '4.1810000-0.5'),
                                          ('unit',
                                           'DD')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(depth)'),
                                          ('value',
                                           '0-0.5'),
                                          ('unit',
                                           'm')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(elevation)'),
                                          ('value',
                                           '-2465.5'),
                                          ('unit',
                                           'm')]),
                             OrderedDict([('tag',
                                           'geographic location '
                                           '(country and/or sea)'),
                                          ('value',
                                           'Atlantic Ocean')]),
                             OrderedDict([('tag',
                                           'environment (biome)'),
                                          ('value',
                                           'marine benthic biome '
                                           '(ENVO:01000024)')]),
                             OrderedDict([('tag',
                                           'environment (material)'),
                                          ('value',
                                           'marine sediment '
                                           '(ENVO:00002113)')]),
                             OrderedDict([('tag',
                                           'environment (feature)'),
                                          ('value',
                                           'marine benthic feature '
                                           '(ENVO:01000105)')]),
                             OrderedDict([('tag',
                                           'temperature'),
                                          ('value',
                                           '1'),
                                          ('unit',
                                           '&#176;C')])],
                         'sample_description': 'A description, with commmas, ...',
                         'sample_title': 'Sample No. 5',
                         'taxon_id': 1234}],
            'study_type': 'Other'}
        cls._strip(cls.expected_parse_result)

    def test_setUp_result(self):
        sub = Submission.objects.first()

    def test_parse_molecular_csv(self):
        file_names = [
            'csv_files/molecular_metadata.csv',
            'csv_files/mol_5_items_comma_some_double_quotes.csv',
            'csv_files/mol_5_items_comma_no_quoting_in_header.csv',
            'csv_files/mol_5_items_semi_no_quoting.csv',
            'csv_files/mol_comma_with_empty_rows_cols.csv',
        ]
        for fn in file_names:
            with open(os.path.join(_get_test_data_dir_path(), fn),
                      'r') as data_file:
                requirements = parse_molecular_csv(data_file)
        requirements_keys = requirements.keys()
        self.assertIn('experiments', requirements_keys)
        self.assertIn('samples', requirements_keys)

    def test_parse_comma_with_some_quotes(self):
        with open(os.path.join(
                _get_test_data_dir_path(),
                'csv_files/mol_5_items_comma_some_double_quotes.csv'),
                'r') as data_file:
            requirements = parse_molecular_csv(data_file)
        requirements_keys = requirements.keys()
        self.assertIn('experiments', requirements_keys)
        self.assertIn('samples', requirements_keys)
        self.assertDictEqual(self.expected_parse_result,
                             self._strip(requirements))

    def test_parse_comma_no_quotes_in_header(self):
        with open(os.path.join(
                _get_test_data_dir_path(),
                'csv_files/mol_5_items_comma_no_quoting_in_header.csv'),
                'r') as data_file:
            requirements = parse_molecular_csv(data_file)
        requirements_keys = requirements.keys()
        self.assertIn('experiments', requirements_keys)
        self.assertIn('samples', requirements_keys)
        self.assertDictEqual(self.expected_parse_result,
                             self._strip(requirements))

    def test_parse_comma_with_empty_rows(self):
        with open(os.path.join(
                _get_test_data_dir_path(),
                'csv_files/mol_comma_with_empty_rows_cols.csv'),
                'r') as data_file:
            requirements = parse_molecular_csv(data_file)
        requirements_keys = requirements.keys()
        self.assertIn('experiments', requirements_keys)
        self.assertIn('samples', requirements_keys)
        # 8 rows: 1 empty, 1 only commas, rest is complete or partly empty
        # results in 7 items
        self.assertEqual(7, len(requirements.get('samples', [])))
        self.assertEqual(7, len(requirements.get('experiments', [])))

    def test_parse_semi_no_quoting(self):
        with open(os.path.join(
                _get_test_data_dir_path(),
                'csv_files/mol_5_items_semi_no_quoting.csv'),
                'r') as data_file:
            requirements = parse_molecular_csv(data_file)
        requirements_keys = requirements.keys()
        self.assertIn('experiments', requirements_keys)
        self.assertIn('samples', requirements_keys)
        self.assertDictEqual(self.expected_parse_result,
                             self._strip(requirements))

    def test_parse_semi_double_quoting(self):
        with open(os.path.join(
                _get_test_data_dir_path(),
                'csv_files/mol_5_items_semi_double_quoting.csv'),
                'r') as data_file:
            requirements = parse_molecular_csv(data_file)
        requirements_keys = requirements.keys()
        self.assertIn('experiments', requirements_keys)
        self.assertIn('samples', requirements_keys)
        self.assertDictEqual(self.expected_parse_result,
                             self._strip(requirements))

    def test_parse_real_world_example(self):
        with open(os.path.join(
                _get_test_data_dir_path(),
                'csv_files/PS99_sediment_gfbio_submission_form.csv'),
                'r') as data_file:
            requirements = parse_molecular_csv(data_file)
        self.assertEqual(7, len(requirements['samples']))
        self.assertEqual(7, len(requirements['experiments']))

    def test_parse_to_xml_real_world_single_layout(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(),
                                          'csv_files/SO45_mod.csv'
                                          )

        is_mol_content, errors = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)

        BrokerObject.objects.add_submission_data(submission)
        ena_submission_data = prepare_ena_data(submission=submission)

        file_name, file_content = ena_submission_data['RUN']
        self.assertEqual(4, file_content.count(
            'filename="{0}'.format(submission.broker_submission_id)))

        file_name, file_content = ena_submission_data['EXPERIMENT']
        self.assertEqual(4, file_content.count(
            '<LIBRARY_LAYOUT><SINGLE /></LIBRARY_LAYOUT>'))
        self.assertNotIn('<LIBRARY_LAYOUT><PAIRED', file_content)

    def test_check_for_molecular_content_comma_sep(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()
        self.create_csv_submission_upload(submission, User.objects.first(),
                                          'csv_files/dsub-269_template.csv')

        is_mol_content, errors = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)
        BrokerObject.objects.add_submission_data(submission)
        self.assertEqual(25,
                         len(BrokerObject.objects.filter(type='experiment')))
        self.assertEqual(len(BrokerObject.objects.filter(type='experiment')),
                         len(BrokerObject.objects.filter(type='run')))

    def test_parse_tab(self):
        self.maxDiff = None
        with open(os.path.join(
                _get_test_data_dir_path(),
                'csv_files/mol_5_items_tab.csv'),
                'r') as data_file:
            requirements = parse_molecular_csv(data_file)
        requirements_keys = requirements.keys()
        self.assertIn('experiments', requirements_keys)
        self.assertIn('samples', requirements_keys)
        self.assertDictEqual(self.expected_parse_result,
                             self._strip(requirements))

    def test_check_for_molecular_content(self):
        submission = Submission.objects.first()
        self.assertEqual(GENERIC, submission.target)
        self.assertIn('data_center', submission.data['requirements'].keys())
        print(submission.data['requirements']['data_center'])
        self.assertEqual('ENA – European Nucleotide Archive',
                         submission.data['requirements']['data_center'])
        self.assertNotIn('samples', submission.data['requirements'].keys())
        self.assertNotIn('experiments', submission.data['requirements'].keys())

        is_mol_content, errors = check_for_molecular_content(submission)

        self.assertTrue(is_mol_content)
        self.assertListEqual([], errors)
        submission = Submission.objects.first()
        self.assertIn('samples', submission.data['requirements'].keys())
        self.assertIn('experiments', submission.data['requirements'].keys())
        self.assertEqual(ENA_PANGAEA, submission.target)

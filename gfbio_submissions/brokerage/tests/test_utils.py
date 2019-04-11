# -*- coding: utf-8 -*-
import csv
import io
import json
import os
from unittest import skip
from uuid import uuid4

import requests
import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from django.urls import reverse
from django.utils.encoding import smart_text
from mock import patch
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    PANGAEA_ISSUE_BASE_URL, HELPDESK_API_SUB_URL, HELPDESK_COMMENT_SUB_URL, \
    HELPDESK_ATTACHMENT_SUB_URL, DEFAULT_ENA_CENTER_NAME
from gfbio_submissions.brokerage.models import Submission, CenterName, \
    ResourceCredential, SiteConfiguration, RequestLog, AdditionalReference, \
    TaskProgressReport, SubmissionUpload
from gfbio_submissions.brokerage.serializers import SubmissionSerializer
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.tests.utils import _get_ena_xml_response, \
    _get_pangaea_soap_body, _get_pangaea_soap_response, \
    _get_pangaea_attach_response, _get_pangaea_comment_response, \
    _get_jira_attach_response, _get_test_data_dir_path
from gfbio_submissions.brokerage.utils.ena import Enalizer, prepare_ena_data, \
    send_submission_to_ena, download_submitted_run_files_to_stringIO
from gfbio_submissions.brokerage.utils.gfbio import \
    gfbio_get_user_by_id, \
    gfbio_helpdesk_create_ticket, gfbio_helpdesk_comment_on_ticket, \
    gfbio_helpdesk_attach_file_to_ticket, gfbio_prepare_create_helpdesk_payload, \
    gfbio_update_helpdesk_ticket
from gfbio_submissions.brokerage.utils.pangaea import \
    request_pangaea_login_token, parse_pangaea_login_token_response, \
    get_pangaea_login_token, create_pangaea_jira_ticket
from gfbio_submissions.brokerage.utils.submission_transfer import \
    SubmissionTransferHandler
from gfbio_submissions.users.models import User


class EnalizerTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create(
            username="user1"
        )
        SubmissionTest._create_submission_via_serializer()
        SubmissionTest._create_submission_via_serializer(runs=True)
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )

        SiteConfiguration.objects.create(
            title='Default',
            site=None,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )

    def tearDown(self):
        Submission.objects.all().delete()

    def test_with_files_in_experiments(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission=submission, alias_postfix='test')
        self.assertTrue(enalizer.study_alias.endswith(':test'))
        self.assertEqual(enalizer.study_alias,
                         enalizer.experiment[0]['study_ref'])
        self.assertEqual(1, len(enalizer.run))

    def test_with_additional_files_in_experiments(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission=submission, alias_postfix='test-runs')
        self.assertTrue(enalizer.study_alias.endswith(':test-runs'))
        self.assertEqual(enalizer.study_alias,
                         enalizer.experiment[0]['study_ref'])
        self.assertEqual(6, len(enalizer.run))

    def test_center_name(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission=submission, alias_postfix='test')
        self.assertEqual(DEFAULT_ENA_CENTER_NAME, enalizer.center_name)
        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        submission.center_name = center_name
        submission.save()
        enalizer_2 = Enalizer(submission=submission, alias_postfix='test')
        self.assertEqual('CustomCenter', enalizer_2.center_name)

    def test_study_xml(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-study')
        data = enalizer.prepare_submission_data()
        k, study_xml = data.get('STUDY')
        self.assertEqual('study.xml', k)
        self.assertIn('<STUDY_SET>', study_xml)
        self.assertIn('<STUDY', study_xml)
        self.assertIn('<DESCRIPTOR>', study_xml)
        self.assertIn('<STUDY_TYPE', study_xml)
        self.assertIn('<STUDY_TITLE>', study_xml)
        self.assertIn('<STUDY_ABSTRACT>', study_xml)
        study_xml_standalone = enalizer.create_study_xml()
        self.assertEqual(study_xml, smart_text(study_xml_standalone))

    def test_study_xml_center_name(self):
        submission = Submission.objects.first()
        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        submission.center_name = center_name
        submission.save()
        ena = Enalizer(submission, 'test-enalizer-study')
        data = ena.prepare_submission_data()
        k, study_xml = data.get('STUDY')
        self.assertEqual('study.xml', k)
        self.assertIn('center_name="CustomCenter"', study_xml)
        study_xml_standalone = ena.create_study_xml()
        self.assertEqual(study_xml, smart_text(study_xml_standalone))

    def test_sample_xml(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-sample')
        data = enalizer.prepare_submission_data()

        k, sample_xml = data.get('SAMPLE')
        self.assertEqual('sample.xml', k)
        submission_samples = submission.brokerobject_set.filter(type='sample')
        # FIXME: order of samples seem to be random
        print('\n\n-------------------------------------\n\n')
        print(sample_xml)
        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="{1}">'
            '<TITLE>sample title</TITLE>'
            '<SAMPLE_NAME>'
            '<TAXON_ID>530564</TAXON_ID>'
            '</SAMPLE_NAME>'
            '<DESCRIPTION />'.format(submission_samples[0].pk,
                                     DEFAULT_ENA_CENTER_NAME), sample_xml)
        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="{1}">'
            '<TITLE>sample title 2</TITLE>'
            '<SAMPLE_NAME>'
            '<TAXON_ID>530564</TAXON_ID>'
            '</SAMPLE_NAME>'
            '<DESCRIPTION />'.format(submission_samples[1].pk,
                                     DEFAULT_ENA_CENTER_NAME), sample_xml)

    def test_sample_xml_center_name(self):
        submission = Submission.objects.first()
        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        submission.center_name = center_name
        submission.save()
        enalizer = Enalizer(submission, 'test-enalizer-sample')
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertEqual('sample.xml', k)
        self.assertIn('center_name="CustomCenter"', sample_xml)

    def test_sample_xml_checklist_mapping(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-sample')
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertIn(
            '<SAMPLE_ATTRIBUTE>'
            '<TAG>ENA-CHECKLIST</TAG>'
            '<VALUE>ERC000024</VALUE>'
            '</SAMPLE_ATTRIBUTE>',
            sample_xml)
        self.assertIn(
            '<SAMPLE_ATTRIBUTE>'
            '<TAG>ENA-CHECKLIST</TAG>'
            '<VALUE>ERC000023</VALUE>'
            '</SAMPLE_ATTRIBUTE>',
            sample_xml)

    def test_additional_renamed_checklist_attribute(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-sample')
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertIn('<TAG>water environmental package</TAG>', sample_xml)
        self.assertIn(
            '<TAG>wastewater sludge environmental package</TAG>',
            sample_xml
        )

    def test_sample_xml_checklist_mapping_no_package(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, 'test-enalizer-sample')
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertNotIn('<TAG>ENA-CHECKLIST</TAG>', sample_xml)

    def test_additional_no_renamed_checklist_attribute(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, 'test-enalizer-sample')
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertNotIn('<TAG>water environmental package</TAG>', sample_xml)
        self.assertNotIn(
            '<TAG>wastewater sludge environmental package</TAG>',
            sample_xml
        )

    def test_sample_xml_checklist_mapping_wrong_package(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, 'test-enalizer-sample')
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertNotIn('<TAG>ENA-CHECKLIST</TAG>', sample_xml)

    def test_add_insdc_attribute(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-sample')
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertEqual(2, sample_xml.count(
            '<SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE>'))

    def test_experiment_xml(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, 'test-enalizer-sample')

        self.assertFalse(enalizer.experiments_contain_files)
        data = enalizer.prepare_submission_data()
        k, experiment_xml = data.get('EXPERIMENT')
        self.assertEqual('experiment.xml', k)
        submission_experiments = submission.brokerobject_set.filter(
            type='experiment')
        submission_study = submission.brokerobject_set.filter(
            type='study').first()
        for i in range(5):
            self.assertIn(
                '<EXPERIMENT alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="{1}">'
                '<STUDY_REF refname="{2}:test-enalizer-sample" />'
                ''.format(
                    submission_experiments[i].pk,
                    DEFAULT_ENA_CENTER_NAME,
                    submission_study.pk,
                ), experiment_xml)

        self.assertTrue(enalizer.experiments_contain_files)

    def test_experiment_xml_center_name(self):
        submission = Submission.objects.last()
        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        submission.center_name = center_name
        submission.save()
        enalizer = Enalizer(submission, 'test-enalizer-sample')
        self.assertFalse(enalizer.experiments_contain_files)
        data = enalizer.prepare_submission_data()
        k, experiment_xml = data.get('EXPERIMENT')
        self.assertEqual('experiment.xml', k)
        self.assertIn('center_name="CustomCenter"', experiment_xml)
        self.assertTrue(enalizer.experiments_contain_files)

    def test_add_experiment_platform_as_sample_attribute(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-experiment')
        data = enalizer.prepare_submission_data()
        k, experiment_xml = data.get('EXPERIMENT')
        k, sample_xml = data.get('SAMPLE')
        self.assertIn(
            '<PLATFORM>'
            '<AB><INSTRUMENT_MODEL>AB 3730xL Genetic Analyzer</INSTRUMENT_MODEL></AB>'
            '</PLATFORM>',
            experiment_xml)

        self.assertIn(
            '<SAMPLE_ATTRIBUTE>'
            '<TAG>sequencing method</TAG>'
            '<VALUE>AB 3730xL Genetic Analyzer</VALUE>'
            '</SAMPLE_ATTRIBUTE>',
            sample_xml)

    def test_add_experiment_platform_without_initial_sample_attributes(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, 'test-enalizer-experiment')
        data = enalizer.prepare_submission_data()
        k, experiment_xml = data.get('EXPERIMENT')
        k, sample_xml = data.get('SAMPLE')
        self.assertIn(
            '<PLATFORM><ILLUMINA><INSTRUMENT_MODEL>Illumina HiSeq 1000</INSTRUMENT_MODEL></ILLUMINA></PLATFORM>',
            experiment_xml)
        self.assertIn(
            '<SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE>',
            sample_xml)

    def test_run_xml_with_files_in_experiment(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-experiment')
        self.assertFalse(enalizer.experiments_contain_files)
        enalizer.prepare_submission_data()
        self.assertTrue(enalizer.experiments_contain_files)

    def test_run_xml_with_additional_files_in_experiment(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, 'test-enalizer-experiment')
        self.assertFalse(enalizer.experiments_contain_files)
        enalizer.prepare_submission_data()
        self.assertTrue(enalizer.experiments_contain_files)

    def test_submission_data_content(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-experiment')
        ena_submission_data = enalizer.prepare_submission_data(
            broker_submission_id=submission.broker_submission_id)
        self.assertListEqual(sorted(['RUN', 'SAMPLE', 'STUDY', 'EXPERIMENT']),
                             sorted(list(ena_submission_data.keys())))
        self.assertNotIn('SUBMISSION', ena_submission_data.keys())

    def test_submission_alias(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-experiment')
        test_id = uuid4()
        submission_xml = enalizer.prepare_submission_xml_for_sending(
            action='ADD',
            outgoing_request_id=test_id)
        k, v = submission_xml
        self.assertEqual('submission.xml', k)
        self.assertIn('alias="{0}"'.format(test_id), v)

    # integration test. Enalizer is instantiated in tested methods
    @responses.activate
    def test_send_submission_to_ena(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response()
        )
        ena_submission_data = prepare_ena_data(submission=submission)
        response, req_log_request_id = send_submission_to_ena(
            submission=submission,
            archive_access=conf.ena_server,
            ena_submission_data=ena_submission_data,
        )
        self.assertEqual(
            req_log_request_id,
            RequestLog.objects.get(request_id=req_log_request_id).request_id
        )
        self.assertEqual(200, response.status_code)

    @responses.activate
    def test_send_submission_to_ena_without_run_or_experiment(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response()
        )

        ena_submission_data = prepare_ena_data(
            submission=submission)
        ena_submission_data.pop('EXPERIMENT')
        ena_submission_data.pop('RUN')
        response, req_log_request_id = send_submission_to_ena(
            submission=submission,
            archive_access=conf.ena_server,
            ena_submission_data=ena_submission_data,
        )
        self.assertEqual(
            req_log_request_id,
            RequestLog.objects.get(request_id=req_log_request_id).request_id)
        self.assertEqual(200, response.status_code)

    def test_prepare_ena_data_add(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission=submission,
                            alias_postfix=submission.broker_submission_id)
        file_name, xml = enalizer.prepare_submission_xml_for_sending(
            action='ADD')
        self.assertIn('<ADD', xml)

    def test_prepare_ena_data_validate(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission=submission,
                            alias_postfix=submission.broker_submission_id)
        file_name, xml = enalizer.prepare_submission_xml_for_sending()
        self.assertIn('<VALIDATE', xml)


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
            pangaea_server=resource_cred,
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

    @skip('request to PANGAEA server')
    def test_create_pangaea_ticket(self):
        site_config = SiteConfiguration.objects.first()
        login_token = get_pangaea_login_token(site_config.pangaea_server)
        response = create_pangaea_jira_ticket(login_token,
                                              site_configuration=site_config)

    @skip('request to PANGAEA server')
    def test_doi_parsing(self):
        site_config = SiteConfiguration.objects.first()
        login_token = get_pangaea_login_token(site_config.pangaea_server)
        ticket_key = 'PDI-12428'
        url = '{0}{1}'.format(PANGAEA_ISSUE_BASE_URL, ticket_key)
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
            pangaea_server=resource_credential,
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


class TestGFBioJira(TestCase):
    base_url = 'http://helpdesk.gfbio.org'

    @skip('Test against helpdesk server')
    def test_create_request(self):
        url = 'http://helpdesk.gfbio.org{0}'.format(HELPDESK_API_SUB_URL)
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
        ticket_key = 'SAND-38'
        ticket_action = 'comment'
        url = '{0}{1}/{2}/{3}'.format(self.base_url, HELPDESK_API_SUB_URL,
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

    @skip('Test against helpdesk server')
    def test_get_and_update_existing_ticket(self):
        # was generic submission, done via gfbio-portal
        ticket_key = 'SAND-1460'
        url = '{0}{1}/{2}'.format(self.base_url, HELPDESK_API_SUB_URL,
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
        self.assertEqual(204, response.status_code)
        self.assertEqual(0, len(response.content))


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
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Comment',
        )
        SiteConfiguration.objects.create(
            title='default',
            site=None,
            ena_server=resource_cred_2,
            pangaea_server=resource_cred,
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
        sub, conf = \
            SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
                submission_id=submission.pk)
        reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(reports))
        self.assertIsInstance(sub, Submission)
        self.assertIsInstance(conf, SiteConfiguration)

    @skip('currently this method is not supposed to rise an exception, '
          'so task.chain can proceed in a controlled way')
    def test_invalid_submission_id(self):
        with self.assertRaises(
                SubmissionTransferHandler.TransferInternalError) as exc:
            sub, conf = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
                submission_id=99)

    def test_no_site_config(self):
        sub, conf = \
            SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
                submission_id=Submission.objects.last().pk)
        reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(reports))
        self.assertIsInstance(conf, SiteConfiguration)
        self.assertEqual('default', conf.title)

    def test_no_site_config_without_default(self):
        site_config = SiteConfiguration.objects.last()
        site_config.delete()
        submission = Submission.objects.last()
        with self.assertRaises(
                SubmissionTransferHandler.TransferInternalError) as exc:
            sub, conf = SubmissionTransferHandler.get_submission_and_siteconfig_for_task(
                submission_id=submission.pk)

    def test_raise_400_exception(self):
        response = requests.models.Response()
        response.status_code = 401
        response._content = '{}'
        with self.assertRaises(
                SubmissionTransferHandler.TransferClientError) as exc:
            SubmissionTransferHandler.raise_response_exceptions(response)

    def test_raise_500_exception(self):
        response = requests.models.Response()
        response.status_code = 500
        response._content = '{}'
        with self.assertRaises(
                SubmissionTransferHandler.TransferServerError) as exc:
            SubmissionTransferHandler.raise_response_exceptions(response)

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
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json={'bla': 'blubb'}, status=200)
        sth = SubmissionTransferHandler(submission_id=submission.pk,
                                        target_archive='ENA')
        self.assertEqual(0, len(TaskProgressReport.objects.all()))
        sth.execute_submission_to_ena()
        self.assertLess(0, len(TaskProgressReport.objects.all()))

    @responses.activate
    def test_execute_ena_pangaea(self):
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
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json={'bla': 'blubb'}, status=200)
        responses.add(
            responses.POST,
            conf.pangaea_server.url,
            body=_get_pangaea_soap_response(),
            status=200)
        responses.add(
            responses.POST,
            PANGAEA_ISSUE_BASE_URL,
            json={'id': '31444', 'key': 'PANGAEA_FAKE_KEY',
                  'self': 'http://issues.pangaea.de/rest/api/2/issue/31444'},
            status=201)
        responses.add(
            responses.POST,
            '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
                                        'PANGAEA_FAKE_KEY'),
            json=_get_pangaea_attach_response(),
            status=200)
        responses.add(
            responses.POST,
            '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
                                    'PANGAEA_FAKE_KEY'),
            json=_get_pangaea_comment_response(),
            status=200)
        sth = SubmissionTransferHandler(submission_id=submission.pk,
                                        target_archive='ENA_PANGAEA')
        self.assertEqual(0, len(TaskProgressReport.objects.all()))
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
            pangaea_server=resource_cred,
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
        self.assertEqual({'name': 'ikostadi'}, payload['fields']['assignee'])

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
        self.assertNotIn('assignee', payload['fields'].keys())

    @responses.activate
    def test_create_helpdesk_ticket(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            HELPDESK_API_SUB_URL),
            json={'bla': 'blubb'},
            status=200)
        self.assertEqual(0, len(RequestLog.objects.all()))
        data = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        response = gfbio_helpdesk_create_ticket(
            site_config=site_config,
            submission=submission,
            data=data,
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    # TODO: rename/refactor once generic ticket is implemented
    #   or refactoring of this method is finished
    @responses.activate
    def test_create_helpdesk_ticket_generic_target(self):
        data = {}
        with open(os.path.join(
                _get_test_data_dir_path(),
                'generic_data.json'), 'r') as data_file:
            data = json.load(data_file)
        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': data
        })
        valid = serializer.is_valid()
        submission = serializer.save(site=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            HELPDESK_API_SUB_URL),
            json={'bla': 'blubb'},
            status=200)
        # datacenter jira user mappings
        # https://gfbio.biowikifarm.net/internal/Data_Centers_Contact_Persons
        data = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        response = gfbio_helpdesk_create_ticket(
            site_config=site_config,
            submission=submission,
            data=data,
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    @responses.activate
    def test_create_helpdesk_ticket_unicode_text(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            HELPDESK_API_SUB_URL),
            json={'bla': 'blubb'},
            status=200)

        self.assertEqual(0, len(RequestLog.objects.all()))
        data = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        response = gfbio_helpdesk_create_ticket(
            site_config=site_config,
            submission=submission,
            data=data,
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    @responses.activate
    def test_update_helpdesk_ticket(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = '{0}{1}/{2}'.format(
            site_config.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY'
        )
        responses.add(responses.PUT, url, body='', status=204)
        response = gfbio_update_helpdesk_ticket(
            site_configuration=site_config,
            submission=submission,
            ticket_key='FAKE_KEY',
            data={}
        )
        self.assertEqual(204, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    @responses.activate
    def test_comment_on_helpdesk_ticket(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = '{0}{1}/{2}/{3}'.format(
            site_config.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json={'bla': 'blubb'}, status=200)
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = gfbio_helpdesk_comment_on_ticket(
            site_config=site_config,
            ticket_key='FAKE_KEY',
            comment_body='body',
            submission=submission
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    @responses.activate
    def test_attach_template_to_helpdesk_ticket(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          HELPDESK_API_SUB_URL,
                          'FAKE_KEY',
                          HELPDESK_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        data['attach_to_ticket'] = True
        self.api_client.post(url, data, format='multipart')
        pd = submission.submissionupload_set.first()
        response = gfbio_helpdesk_attach_file_to_ticket(
            site_config, 'FAKE_KEY', pd.file, submission)
        self.assertEqual(200, response.status_code)
        request_logs = RequestLog.objects.all()
        self.assertEqual(2, len(request_logs))

    @responses.activate
    def test_attach_multiple_files_to_helpdesk_ticket(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        response_json = _get_jira_attach_response()
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          HELPDESK_API_SUB_URL,
                          'FAKE_KEY',
                          HELPDESK_ATTACHMENT_SUB_URL,
                      ),
                      json=response_json,
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file_1')
        data['attach_to_ticket'] = True
        self.api_client.post(url, data, format='multipart')
        pd = submission.submissionupload_set.first()
        gfbio_helpdesk_attach_file_to_ticket(
            site_config, 'FAKE_KEY', pd.file, submission)
        self.assertEqual(
            1,
            len(SubmissionUpload.objects.filter(submission=submission))
        )

        data = self._create_test_data('/tmp/test_primary_data_file_2',
                                      delete=False)
        data['attach_to_ticket'] = True
        self.api_client.post(url, data, format='multipart')
        pd = submission.submissionupload_set.last()
        response = gfbio_helpdesk_attach_file_to_ticket(
            site_config, 'FAKE_KEY', pd.file, submission)
        self.assertEqual(
            2,
            len(SubmissionUpload.objects.filter(submission=submission))
        )

    @responses.activate
    def test_attach_template_without_submitting_user(self):
        submission = Submission.objects.first()
        submission.submitting_user = None
        submission.save()
        site_config = SiteConfiguration.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          HELPDESK_API_SUB_URL,
                          'FAKE_KEY',
                          HELPDESK_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        data['attach_to_ticket'] = True
        self.api_client.post(url, data, format='multipart')
        pd = submission.submissionupload_set.first()
        response = gfbio_helpdesk_attach_file_to_ticket(site_config, 'FAKE_KEY',
                                                        pd.file,
                                                        submission)
        self.assertEqual(200, response.status_code)
        request_logs = RequestLog.objects.all()
        self.assertEqual(2, len(request_logs))
        self.assertEqual('', request_logs.first().site_user)


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
            pangaea_server=resource_cred,
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

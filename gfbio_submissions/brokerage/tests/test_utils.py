# -*- coding: utf-8 -*-
import json
from unittest import skip
from uuid import uuid4

import requests
import responses
from django.test import TestCase
from django.utils.encoding import smart_text
from mock import patch

from gfbio_submissions.brokerage.configuration.settings import \
    PANGAEA_ISSUE_BASE_URL, HELPDESK_API_SUB_URL
from gfbio_submissions.brokerage.models import Submission, CenterName, \
    ResourceCredential, SiteConfiguration, RequestLog, AdditionalReference
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.tests.utils import _get_ena_xml_response, \
    _get_pangaea_soap_body, _get_pangaea_soap_response
from gfbio_submissions.brokerage.utils.ena import Enalizer, prepare_ena_data, \
    send_submission_to_ena
from gfbio_submissions.brokerage.utils.gfbio import \
    gfbio_assemble_research_object_id_json, gfbio_get_user_by_id
from gfbio_submissions.brokerage.utils.pangaea import \
    request_pangaea_login_token, parse_pangaea_login_token_response, \
    get_pangaea_login_token, create_pangaea_jira_ticket
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
        self.assertEqual('GFBIO', enalizer.center_name)
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
        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO">'
            '<TITLE>sample title</TITLE>'
            '<SAMPLE_NAME>'
            '<TAXON_ID>530564</TAXON_ID>'
            '</SAMPLE_NAME>'
            '<DESCRIPTION />'.format(submission_samples[0].pk), sample_xml)
        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO">'
            '<TITLE>sample title 2</TITLE>'
            '<SAMPLE_NAME>'
            '<TAXON_ID>530564</TAXON_ID>'
            '</SAMPLE_NAME>'
            '<DESCRIPTION />'.format(submission_samples[1].pk), sample_xml)

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
                '<EXPERIMENT alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO">'
                '<STUDY_REF refname="{1}:test-enalizer-sample" />'
                ''.format(
                    submission_experiments[i].pk,
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
        print(ena_submission_data)
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

    def test_assemble_research_object_json(self):
        submission = Submission.objects.first()
        prepared_json, broker_object_pks = \
            gfbio_assemble_research_object_id_json(submission.brokerobject_set)
        self.assertTrue(isinstance(prepared_json, str))
        self.assertTrue(isinstance(broker_object_pks, list))
        json_result = json.loads(prepared_json)
        self.assertTrue(isinstance(json_result[0]['extendeddata'], str))

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

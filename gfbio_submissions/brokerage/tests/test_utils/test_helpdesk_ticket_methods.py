# -*- coding: utf-8 -*-

import json
import os
from unittest import skip

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    JIRA_USERNAME_URL_TEMPLATE, \
    JIRA_USERNAME_URL_FULLNAME_TEMPLATE
from gfbio_submissions.brokerage.models import AdditionalReference, \
    SubmissionUpload, BrokerObject
from gfbio_submissions.brokerage.serializers import SubmissionSerializer
from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path, \
    _get_ena_data, _get_ena_data_without_runs
from gfbio_submissions.brokerage.utils.gfbio import \
    gfbio_prepare_create_helpdesk_payload, \
    get_gfbio_helpdesk_username
from gfbio_submissions.generic.models import SiteConfiguration, \
    ResourceCredential
from gfbio_submissions.users.models import User


class TestHelpDeskTicketMethods(TestCase):

    # TODO: move to utils or similar ...
    @classmethod
    def _create_submission_via_serializer(cls, runs=False):
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': _get_ena_data() if runs else _get_ena_data_without_runs()
        })
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)
        return submission

    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        site_conf = SiteConfiguration.objects.create(
            title='default',
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
            contact='kevin@horstmeier.de'
        )
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='upload')
        user.user_permissions.add(*permissions)
        user.site_configuration = site_conf
        user.save()
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        cls.api_client = client

        submission = cls._create_submission_via_serializer()
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
        submission = serializer.save(user=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        self.assertNotIn('assignee', payload.keys())
        self.assertEqual('sand/molecular-data',
                         payload['customfield_10010'])
        # self.assertEqual('MIxS',
        #                  payload['customfield_10229'][0]['value'])

        data['requirements'].pop('data_center')
        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': data
        })
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        self.assertNotIn('assignee', payload.keys())
        self.assertEqual('sand/generic-data',
                         payload['customfield_10010'])

        # self.assertEqual('other',
        #                  payload['customfield_10229'][0]['value'])

        data['requirements'][
            'data_center'] = 'GFBio Data Centers - our curators will suggest the appropriate one(s)'
        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': data
        })
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        self.assertNotIn('assignee', payload.keys())

    def test_ipk_datacenter_assignee(self):
        with open(os.path.join(
                _get_test_data_dir_path(),
                'generic_data.json'), 'r') as data_file:
            data = json.load(data_file)
            data['requirements']['data_center'] = 'IPK - Leibniz Institute of Plant Genetics and Crop Plant Research'

        serializer = SubmissionSerializer(data={
            'target': 'GENERIC',
            'release': True,
            'data': data
        })
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission)
        self.assertIn('assignee', payload.keys())
        self.assertDictEqual({'name': 'ipk'}, payload.get('assignee', {}))


    @skip('metadata_schema is no longer used. compare GFBIO-2742')
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
        submission = serializer.save(user=User.objects.first())
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

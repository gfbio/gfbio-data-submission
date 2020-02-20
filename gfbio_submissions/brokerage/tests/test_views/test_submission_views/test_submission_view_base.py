# -*- coding: utf-8 -*-
import base64
import json
import os
from pprint import pprint

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIRequestFactory, APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    JIRA_USERNAME_URL_TEMPLATE, JIRA_ISSUE_URL
from gfbio_submissions.brokerage.models import ResourceCredential, \
    SiteConfiguration, SubmissionUpload
from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
from gfbio_submissions.users.models import User


class TestSubmissionView(TestCase):

    @classmethod
    def setUpTestData(cls):
        print('\nTESTSUBMISSIONVIEW SETUP TEST DATA')

        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        cls.site_config = SiteConfiguration.objects.create(
            title='default',
            release_submissions=False,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )
        # cls.site_config = site_config
        # pprint(cls.site_config.__dict__)

        cls.permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submission')
        # user = User.objects.create_user(
        #     username='horst', email='horst@horst.de', password='password',
        #     site_configuration=cls.site_config, is_user=True,
        #     is_site=True)
        # user.user_permissions.add(*cls.permissions)
        upload_permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submissionupload'
        )
        # user.user_permissions.add(*upload_permissions)

        user = User.objects.create_user(
            username='horst', password='password', )
        # permissions = Permission.objects.filter(
        #     content_type__app_label='brokerage',
        #     codename__endswith='submission'
        # )
        user.user_permissions.add(*cls.permissions)
        user.user_permissions.add(*upload_permissions)
        user.site_configuration = cls.site_config
        user.email = 'horst@horst.de'
        user.save()
        token = Token.objects.create(user=user)

        print('user in base prepare')
        pprint(user.__dict__)

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        cls.api_client = client
        # print('\nUSER SC: ', user.site_configuration)
        # pprint(user.site_configuration.__dict__)

        user = User.objects.create_user(
            username='kevin', email='kevin@kevin.de', password='secret',
            is_staff=True, is_site=True)
        user.user_permissions.add(*cls.permissions)

        regular_user = User.objects.create_user(
            username='regular_user',
            # email='re@gu.la',
            password='secret',
            is_staff=False, is_site=False, is_user=True)
        regular_user.email = 're@gu.la'
        regular_user.user_permissions.add(*cls.permissions)
        regular_user.save()

        regular_user = User.objects.create_user(
            username='regular_user_2', email='re2@gu.la', password='secret',
            is_staff=False, is_site=False, is_user=True)
        regular_user.user_permissions.add(*cls.permissions)

        User.objects.create_superuser(
            username='admin', email='admin@admin.de', password='psst')

        cls.factory = APIRequestFactory()

        # client = APIClient()
        # print(' # ##### ')
        # print('Basic ' + base64.b64encode(
        #     b'horst:password').decode('utf-8'))
        # client.credentials(
        #     HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
        #         b'horst:password').decode('utf-8')
        # )
        # cls.api_client = client
        other_client = APIClient()
        other_client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'kevin:secret').decode('utf-8')
        )
        cls.other_api_client = other_client
        print('\nFINISHED --- TESTSUBMISSIONVIEW SETUP TEST DATA')

    @staticmethod
    def _add_gfbio_helpdesk_user_service_response(user_name='regular_user',
                                                  email='re@gu.la'):
        url = JIRA_USERNAME_URL_TEMPLATE.format(user_name, email, )
        responses.add(responses.GET, url, body=b'deleteMe', status=200)

    def _add_create_ticket_response(self):
        self._add_gfbio_helpdesk_user_service_response(user_name='horst',
                                                       email='horst@horst.de')
        self._add_jira_client_responses()
        responses.add(
            responses.POST,
            '{0}{1}'.format(
                self.site_config.helpdesk_server.url,
                JIRA_ISSUE_URL
            ),
            status=200,
            body=json.dumps({'mocked_response': True})
        )

    def _add_jira_client_responses(self):
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(self.site_config.helpdesk_server.url),
            status=200,
        )

    def _add_update_ticket_response(self):
        url = '{0}{1}/{2}'.format(
            self.site_config.helpdesk_server.url,
            JIRA_ISSUE_URL,
            'no_key_available'
        )
        responses.add(responses.PUT, url, body='', status=204)

    def _post_submission(self):
        return self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': False, 'data': {
                'requirements': {
                    'title': 'A Title',
                    'description': 'A Description'}}},
            format='json'
        )

    def _post_submission_with_submitting_user(self, submitting_user='69'):
        return self.api_client.post(
            '/api/submissions/',
            {
                'target': 'ENA',
                'release': False,
                # TODO: remove after site/user refactorings are done
                'submitting_user': '{}'.format(submitting_user),
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            },
            format='json'
        )

    @classmethod
    def _create_test_meta_data(cls, delete=True, invalid=False, update=False):
        file_name = 'csv_files/invalid_molecular_metadata.csv' if invalid else 'csv_files/molecular_metadata.csv'
        if update:
            file_name = 'csv_files/molecular_metadata_for_update.csv'

        if delete:
            cls._delete_test_data()
        csv_file = open(
            os.path.join(_get_test_data_dir_path(), file_name),
            'rb'
        )
        return {
            'file': csv_file,
            'meta_data': True,
        }

    @staticmethod
    def _delete_test_data():
        SubmissionUpload.objects.all().delete()

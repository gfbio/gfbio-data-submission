# -*- coding: utf-8 -*-
import json
import os
import time
from pprint import pprint
from unittest import skip

import requests
from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path


class TestSubmissionServers(TestCase):

    @skip('test against c103-171.cloud.gwdg.de')
    def test_molecular_post_to_gwdg_docker_server(self):
        data = {
            'target': 'ENA', 'release': False, 'data': {
                'requirements': {
                    'title': 'Test from local unit-test-environment '
                             '{0}'.format(time.strftime('%X %x %Z')),
                    'description': 'A description for local '
                                   'unit-test-environment test',
                    'submitting_user': '3',  # marc
                }
            }
        }
        response = requests.post(
            url='https://c103-171.cloud.gwdg.de/api/submissions/',
            data=json.dumps(data),
            headers={
                'Authorization': 'Token a---',
                'Content-Type': 'application/json'}
        )

    @skip('test against c103-171.cloud.gwdg.de')
    def test_generic_post_to_gwdg_docker_server(self):
        headers = {
            'Authorization': 'Token a----',
            'Content-Type': 'application/json'}
        title = 'Test from local unit-test-environment {0}'.format(
            time.strftime('%X %x %Z'))
        data = {
            'target': 'GENERIC', 'release': False,
            'submitting_user': '3',  # marc
            'data': {
                'requirements': {
                    'title': title,
                    'description': 'A Description',
                    'data_center': 'ENA – European Nucleotide Archive',
                }
            }
        }
        response = requests.post(
            url='https://c103-171.cloud.gwdg.de/api/submissions/',
            data=json.dumps(data),
            headers=headers
        )
        content = json.loads(response.content.decode('utf-8'))
        broker_submission_id = content['broker_submission_id']

        files = {
            'file': open(
                os.path.join(
                    _get_test_data_dir_path(),
                    'molecular_metadata.csv'),
                'rb'
            )
        }
        url = 'https://c103-171.cloud.gwdg.de/api/submissions/' \
              '{0}/upload/'.format(broker_submission_id)
        response = requests.post(
            url=url,
            files=files,
            data={'meta_data': True},
            headers={
                'Authorization': 'Token a---',
            }
        )
        content = json.loads(response.content.decode('utf-8'))
        data = {
            'target': 'GENERIC', 'release': True,
            'submitting_user': '3',  # marc
            'data': {
                'requirements': {
                    'title': title,
                    'description': 'A Description',
                    'data_center': 'ENA – European Nucleotide Archive',
                }
            }

        }
        response = requests.put(
            url='https://c103-171.cloud.gwdg.de/api/submissions/{0}/'.format(
                broker_submission_id),
            data=json.dumps(data),
            headers=headers
        )
        print('response ', response.status_code)
        content = json.loads(response.content.decode('utf-8'))
        pprint(content)

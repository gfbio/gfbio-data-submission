# -*- coding: utf-8 -*-
import json
import os
import pprint
import time
from pprint import pp, pprint
from unittest import skip

import requests
from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path


class TestSubmissionServers(TestCase):
    @skip("test against c103-171.cloud.gwdg.de")
    def test_molecular_post_to_gwdg_docker_server(self):
        data = {
            "target": "ENA",
            "release": False,
            "data": {
                "requirements": {
                    "title": "Test from local unit-test-environment " "{0}".format(time.strftime("%X %x %Z")),
                    "description": "A description for local " "unit-test-environment test",
                    "submitting_user": "3",  # marc
                }
            },
        }
        response = requests.post(
            url="https://c103-171.cloud.gwdg.de/api/submissions/",
            data=json.dumps(data),
            headers={"Authorization": "Token a---", "Content-Type": "application/json"},
        )

    @skip("test against c103-171.cloud.gwdg.de")
    def test_generic_post_to_gwdg_docker_server(self):
        headers = {"Authorization": "Token a----", "Content-Type": "application/json"}
        title = "Test from local unit-test-environment {0}".format(time.strftime("%X %x %Z"))
        data = {
            "target": "GENERIC",
            "release": False,
            "submitting_user": "3",  # marc
            "data": {
                "requirements": {
                    "title": title,
                    "description": "A Description",
                    "data_center": "ENA – European Nucleotide Archive",
                }
            },
        }
        response = requests.post(
            url="https://c103-171.cloud.gwdg.de/api/submissions/",
            data=json.dumps(data),
            headers=headers,
        )
        content = json.loads(response.content.decode("utf-8"))
        broker_submission_id = content["broker_submission_id"]

        files = {
            "file": open(
                os.path.join(_get_test_data_dir_path(), "csv_files/molecular_metadata.csv"),
                "rb",
            )
        }
        url = "https://c103-171.cloud.gwdg.de/api/submissions/" "{0}/upload/".format(broker_submission_id)
        response = requests.post(
            url=url,
            files=files,
            data={"meta_data": True},
            headers={
                "Authorization": "Token a---",
            },
        )
        content = json.loads(response.content.decode("utf-8"))
        data = {
            "target": "GENERIC",
            "release": True,
            "submitting_user": "3",  # marc
            "data": {
                "requirements": {
                    "title": title,
                    "description": "A Description",
                    "data_center": "ENA – European Nucleotide Archive",
                }
            },
        }
        response = requests.put(
            url="https://c103-171.cloud.gwdg.de/api/submissions/{0}/".format(broker_submission_id),
            data=json.dumps(data),
            headers=headers,
        )
        content = json.loads(response.content.decode("utf-8"))


class TestSubmissionServersForAtaxWorkflow(TestCase):
    # @classmethod
    # def _create_atax_csv_test_data(cls, delete=True,  attach=False, meta_data=False):
    #     file_name = 'csv_files/specimen_table_Platypelis.csv'
    #
    #     # if delete:
    #     #     cls._delete_test_data()
    #
    #     csv_file = open(
    #         os.path.join(_get_test_data_dir_path(), file_name),
    #         'rb'
    #     )
    #     return {
    #         'file': csv_file,
    #         'meta_data': meta_data,
    #         'attach_to_ticket': attach,
    #     }

    # @skip('test against submissions.gfbio.dev')
    def test_post_with_atax_target(self):
        # TOKEN for user marc6
        # headers = {
        #     'Authorization': 'Token x',
        #     'Content-Type': 'application/json'
        # }
        # TOKEN for user marc
        #
        headers = {
            "Authorization": "Token x",
            # 'Content-Type': 'application/json'
        }

        # --------------------------------------------------------------------------------

        # title = 'Test from local unit-test-environment {0}'.format(
        #     time.strftime('%X %x %Z'))
        # data = {
        #     'target': 'ATAX', 'release': True,
        #     'data': {
        #         'requirements': {
        #             'title': title,
        #             'description': 'A Description',
        #         }
        #     }
        # }
        #
        # response = requests.post(
        #     url='https://submissions.gfbio.dev/api/submissions/',
        #     data=json.dumps(data),
        #     headers=headers
        # )

        # --------------------------------------------------------------------------------

        # data = self._create_atax_csv_test_data(meta_data=True)
        # requests.post(test_url, files = {"form_field_name": test_file})
        # file_name = 'csv_files/specimen_table_Platypelis.csv'
        file_name = "csv_files/specimen_table_Platypelis_with_error.csv"
        # file_name = 'csv_files/measurement_table_Platypelis.csv'
        csv_file = open(os.path.join(_get_test_data_dir_path(), file_name), "rb")
        response = requests.post(
            url="https://submissions.gfbio.dev/api/submissions/2ac5a6c4-e54c-4fd9-8440-9546f15673d1/upload/",
            files={"file": csv_file},
            headers=headers,
        )

        content = json.loads(response.content.decode("utf-8"))
        print(response.status_code)
        pprint(content)

        # --------------------------------------------------------------------------------

        # broker_submission_id = content['broker_submission_id']
        #
        # files = {
        #     'file': open(
        #         os.path.join(
        #             _get_test_data_dir_path(),
        #             'csv_files/molecular_metadata.csv'),
        #         'rb'
        #     )
        # }
        # url = 'https://c103-171.cloud.gwdg.de/api/submissions/' \
        #       '{0}/upload/'.format(broker_submission_id)
        # response = requests.post(
        #     url=url,
        #     files=files,
        #     data={'meta_data': True},
        #     headers={
        #         'Authorization': 'Token a---',
        #     }
        # )
        # content = json.loads(response.content.decode('utf-8'))
        # data = {
        #     'target': 'GENERIC', 'release': True,
        #     'submitting_user': '3',  # marc
        #     'data': {
        #         'requirements': {
        #             'title': title,
        #             'description': 'A Description',
        #             'data_center': 'ENA – European Nucleotide Archive',
        #         }
        #     }
        #
        # }
        # response = requests.put(
        #     url='https://c103-171.cloud.gwdg.de/api/submissions/{0}/'.format(
        #         broker_submission_id),
        #     data=json.dumps(data),
        #     headers=headers
        # )
        # content = json.loads(response.content.decode('utf-8'))

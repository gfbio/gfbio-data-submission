import json
from pprint import pprint

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from gfbio_submissions.brokerage.tests.utils import _get_jira_hook_request_data
from gfbio_submissions.generic.models import RequestLog


class TestAPIEndpoints(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse('brokerage:get_jira_updates')

    def test_jira_endpoint_status_400(self):
        response = self.client.post(self.url, '{foo}',
                                    content_type='application/json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(0, len(RequestLog.objects.all()))

    def test_jira_endpoint_status_201(self):
        self.assertEqual(RequestLog.objects.last(), None)
        data = {"foo": "bar"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(str(data), RequestLog.objects.last().data)

    # TODO: just for prototyping ...
    def test_real_world_request(self):
        hook_content = _get_jira_hook_request_data()
        # pprint(hook_content)
        response = self.client.post(self.url, json.loads(hook_content),
                                    format='json')
        print(response.status_code)
        print(response.content)

        r = RequestLog.objects.all()
        print(r)
        # print(type(r.data))
        # print("""->\n{}\n<-""".format(r.data))
        # data = json.loads(r.data)
        # print(len(r.data))
        # print(r.type)
        # print(r.url)
        # print(r.response_status)
        # print(r.request_details)
        # print(data)

    def test_no_issue(self):
        self.assertEqual(0, len(RequestLog.objects.all()))

        # no issue
        response = self.client.post(self.url, {'a': True},
                                    format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

        # in issue errors
        response = self.client.post(self.url, {"issue": {"key": "SAND-007"}},
                                    format='json')
        self.assertEqual(2, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        # fields
        response = self.client.post(self.url, {
            "issue": {"key": "SAND-007", "fields": {}}},
                                    format='json')
        self.assertEqual(3, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        # only one left missing
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "",  # embargo date
                    }
                }
            },
            format='json')
        self.assertEqual(4, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        # values
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "",  # embargo date
                        "customfield_10303": "",  # broker_submission_id
                    }
                }
            },
            format='json')
        self.assertEqual(5, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        print('\n', response.status_code)
        print(response.content)

        r = RequestLog.objects.all()
        print(r)

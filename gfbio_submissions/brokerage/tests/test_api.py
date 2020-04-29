from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

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
        url = reverse('brokerage:get_jira_updates')
        data = {"foo": "bar"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(str(data), RequestLog.objects.last().data)

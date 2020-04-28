from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from gfbio_submissions.generic.models import RequestLog


class TestAPIEndpoints(APITestCase):
    def test_jira_endpoint_status_400(self):
        """
        Ensure we get status 400 if wrong json data was sent
        """
        self.assertEqual(RequestLog.objects.last(), None)
        url = reverse('brokerage:get_jira_updates')
        response = self.client.post(url, '{foo}', content_type = 'application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_jira_endpoint_status_201(self):
        """
        Ensure we get status 201
        Ensure RequestObject was created
        """
        self.assertEqual(RequestLog.objects.last(), None)
        url = reverse('brokerage:get_jira_updates')
        data= {"foo":"bar"}
        data_str = str(data)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_obj = RequestLog.objects.last()
        self.assertEqual(request_obj.data, data_str)

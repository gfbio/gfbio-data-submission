import base64

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from gfbio_submissions.users.models import User


class TestSubmissionFrontendView(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:password').decode('utf-8')
        )
        cls.api_client = client

    def test_get(self):
        response = self.api_client.get(
            reverse('userinterface:create_submission'))
        self.assertEqual(302, response.status_code)

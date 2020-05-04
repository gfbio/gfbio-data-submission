import json

import arrow
import responses
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from gfbio_submissions.brokerage.models import Submission, AdditionalReference
from gfbio_submissions.brokerage.tests.test_models.test_submission import \
    SubmissionTest
from gfbio_submissions.brokerage.tests.utils import _get_jira_hook_request_data
from gfbio_submissions.generic.models import RequestLog
from gfbio_submissions.users.models import User


class TestAPIEndpoints(APITestCase):

    @classmethod
    @responses.activate
    def setUpTestData(cls):
        super().setUpTestData()

        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password', )
        user.is_user = True
        user.is_site = False
        user.save()

        submission = SubmissionTest._create_submission_via_serializer(
            username='horst', create_broker_objects=True)

        submission.brokerobject_set.create(
            type='study',
            user=submission.user,
            data={'data': True}
        )
        studies = submission.brokerobject_set.filter(type='study')
        studies.first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB0815',
            status='PRIVATE'
        )

        reference = AdditionalReference.objects.create(
            submission=submission,
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            primary=True,
            reference_key='SAND-007'
        )

        cls.url = reverse('brokerage:get_jira_updates')

    def test_jira_endpoint_status_400(self):
        response = self.client.post(self.url, '{foo}',
                                    content_type='application/json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(0, len(RequestLog.objects.all()))

    def test_jira_endpoint_status_201(self):
        self.assertEqual(RequestLog.objects.last(), None)
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2021-03-09",
                        "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
                    }
                }
            },
            format='json')

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))
        # tODO: add test for content

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

    def test_real_world_request(self):
        submission = Submission.objects.first()

        hook_content = _get_jira_hook_request_data()
        payload = json.loads(hook_content)
        payload['issue']['key'] = 'SAND-007'
        payload['issue']['fields']['customfield_10303'] = '{}'.format(
            submission.broker_submission_id)

        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(status.HTTP_201_CREATED,
                         RequestLog.objects.first().response_status)
        # TODO: check response content

    def test_no_issue_in_request(self):
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(self.url, {'a': True},
                                    format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_error_in_issue(self):
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(self.url, {"issue": {"key": "SAND-007"}},
                                    format='json')

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(b'fields', response.content)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_missing_fields(self):
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(self.url, {
            "issue": {"key": "SAND-007", "fields": {}}},
                                    format='json')
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertIn(b'\'customfield_10200\' is a required property',
                      response.content)
        self.assertIn(b'\'customfield_10303\' is a required property',
                      response.content)
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_errors_in_field(self):
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "",
                    }
                }
            },
            format='json')
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertIn(b'\'customfield_10303\' is a required property',
                      response.content)
        self.assertIn(b'customfield_10200 : \'\' is too short',
                      response.content)
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_broker_submission_id_field_error(self):
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url, {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2022-03-01",
                        "customfield_10303": "",
                    }
                }
            },
            format='json')
        self.assertEqual(1, len(RequestLog.objects.all()))

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(b'customfield_10303 : \'\' does not match',
                      response.content)
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_date_format_check(self):
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2021-xxx-09",
                        "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",

                    }
                }
            },
            format='json')

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        self.assertIn(b'\'customfield_10200\': Could not match input',
                      response.content)

        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_timestamp_date(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2021-03-09T00:00:00+00:00",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),

                    }
                }
            },
            format='json')
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_201_CREATED,
                         RequestLog.objects.first().response_status)

    def test_date_in_the_past(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2020-04-09T00:00:00+00:00",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                    }
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(b'\'customfield_10200\': embargo date in the past',
                      response.content)

        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_date_in_the_far_future(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2049-04-09T00:00:00+00:00",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                    }
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(
            b'\'customfield_10200\': embargo date too far in the future',
            response.content)

        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_embargo_today(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().for_json(),
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                    }
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(
            b'\'customfield_10200\': embargo date in the past',
            response.content)

        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_missing_issue_reference(self):
        submission = Submission.objects.first()
        submission.additionalreference_set.all().delete()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().shift(
                            years=1).for_json(),
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                    }
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(
            b'no related issue with key',
            response.content)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_invalid_submission(self):
        submission = Submission.objects.first()
        submission.additionalreference_set.all().delete()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().shift(
                            years=1).for_json(),
                        "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
                    }
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(
            b'Submission matching query does not exist',
            response.content)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_invalid_ena_status(self):
        submission = Submission.objects.first()
        submission.brokerobject_set.all().delete()
        submission.brokerobject_set.create(
            type='study',
            user=submission.user,
            data={'data': True}
        )
        studies = submission.brokerobject_set.filter(type='study')
        studies.first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB0815',
            status='NOT-PRIVATE'
        )
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().shift(
                            years=1).for_json(),
                        "customfield_10303": "{0}".format(
                            submission.broker_submission_id),
                    }
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        self.assertIn(
            b'status prevents update of submission',
            response.content)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

import json

import arrow
import responses
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from gfbio_submissions.brokerage.models import Submission, AdditionalReference, \
    BrokerObject
from gfbio_submissions.brokerage.serializers import SubmissionSerializer
from gfbio_submissions.brokerage.tests.utils import _get_jira_hook_request_data, \
    _get_ena_data, _get_ena_data_without_runs
from gfbio_submissions.generic.models import RequestLog
from gfbio_submissions.users.models import User


class TestJiraIssueUpdateView(APITestCase):

    # TODO: move to utils or similar ...
    @classmethod
    def _create_submission_via_serializer(cls, runs=False, username=None,
                                          create_broker_objects=True):
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': _get_ena_data() if runs else _get_ena_data_without_runs()
        })
        serializer.is_valid()
        user = User.objects.get(
            username=username) if username else User.objects.first()
        submission = serializer.save(user=user)
        if create_broker_objects:
            BrokerObject.objects.add_submission_data(submission)
        return submission

    @classmethod
    @responses.activate
    def setUpTestData(cls):
        super().setUpTestData()

        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password', )
        user.is_user = True
        user.is_site = False
        user.save()

        submission = cls._create_submission_via_serializer(
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

        AdditionalReference.objects.create(
            submission=submission,
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            primary=True,
            reference_key='SAND-007'
        )

        cls.base_url = reverse('brokerage:submissions_jira_update')
        cls.url = '{}{}'.format(
            cls.base_url,
            '?user_id=maweber%40mpi-bremen.de&user_key=maweber%40mpi-bremen.de')

    @classmethod
    def tearDownClass(cls):
        Submission.objects.first().additionalreference_set.all().delete()
        super(TestJiraIssueUpdateView, cls).tearDownClass()

    def test_jira_invalid_request_data(self):
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(self.url, '{foo}',
                                    content_type='application/json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(0, len(RequestLog.objects.all()))

    def test_jira_endpoint_status_400(self):
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(self.url, {"foo", "bar"},
                                    content_type='application/json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(0, len(RequestLog.objects.all()))

    def test_jira_endpoint_status_201(self):
        submission = Submission.objects.first()
        one_year = arrow.now().shift(years=1)
        self.assertEqual(RequestLog.objects.last(), None)
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": one_year.for_json(),
                        "customfield_10303": "{0}".format(
                            submission.broker_submission_id),
                    }
                }
            },
            format='json')

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    def test_successful_embargo_update(self):
        submission = Submission.objects.first()
        six_months = arrow.now().shift(months=6)
        submission.embargo = six_months.date()
        submission.save()
        self.assertEqual(six_months.date(), submission.embargo)

        one_year = arrow.now().shift(years=1)

        self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": one_year.for_json(),
                        "customfield_10303": "{0}".format(
                            submission.broker_submission_id),
                    }
                }
            },
            format='json')

        submission = Submission.objects.first()
        self.assertEqual(one_year.date(), submission.embargo)

    def test_brokeragent_get_paramter(self):
        submission = Submission.objects.first()
        six_months = arrow.now().shift(months=6)
        submission.embargo = six_months.date()
        submission.save()
        url = '{}{}'.format(self.base_url,
                            '?user_id=brokeragent%40mpi-bremen.de&user_key=maweber%40mpi-bremen.de')

        one_year = arrow.now().shift(years=1)
        response = self.client.post(
            url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": one_year.for_json(),
                        "customfield_10303": "{0}".format(
                            submission.broker_submission_id),
                    }
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    def test_jirauser_get_parameter(self):
        submission = Submission.objects.first()
        six_months = arrow.now().shift(months=6)
        submission.embargo = six_months.date()
        submission.save()

        self.assertNotIn('brokeragent', self.url)
        one_year = arrow.now().shift(years=1)
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": one_year.for_json(),
                        "customfield_10303": "{0}".format(
                            submission.broker_submission_id),
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        print(response.status_code)
        print(response.content)
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

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

    def test_real_world_request_no_changelog(self):
        submission = Submission.objects.first()

        hook_content = _get_jira_hook_request_data(no_changelog=True)
        payload = json.loads(hook_content)
        payload['issue']['key'] = 'SAND-007'
        payload['issue']['fields']['customfield_10303'] = '{}'.format(
            submission.broker_submission_id)

        response = self.client.post(self.url, payload, format='json')
        print(response.status_code)
        print(response.content)
        # self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        # self.assertEqual(status.HTTP_201_CREATED,
        #                  RequestLog.objects.first().response_status)
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
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2021-xxx-09",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),

                    }
                },
                "changelog": {}
            },
            format='json')

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        print(response.content)

        # self.assertIn(b'\'customfield_10200\': Could not match input',
        #               response.content)
        #
        # self.assertEqual(1, len(RequestLog.objects.all()))
        # self.assertEqual(status.HTTP_400_BAD_REQUEST,
        #                  RequestLog.objects.first().response_status)

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

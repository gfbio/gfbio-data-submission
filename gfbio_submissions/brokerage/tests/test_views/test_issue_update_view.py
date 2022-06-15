import json
from unittest import skip

import arrow
import requests
import responses
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from gfbio_submissions.brokerage.models import Submission, AdditionalReference, \
    BrokerObject
from gfbio_submissions.brokerage.serializers import SubmissionSerializer
from gfbio_submissions.brokerage.tests.utils import _get_jira_hook_request_data, \
    _get_ena_data, _get_ena_data_without_runs
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models import RequestLog, ResourceCredential
from gfbio_submissions.users.models import User
from gfbio_submissions.generic.models import SiteConfiguration



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

    @staticmethod
    def _create_user(username, email):
        user = User.objects.create_user(
            username=username, email=email, password='password', )
        user.is_user = True
        user.is_site = False
        user.save()

        curators_group, created = Group.objects.get_or_create(name='Curators')
        curators_group.user_set.add(user)
        return user

    @classmethod
    @responses.activate
    def setUpTestData(cls):
        super().setUpTestData()

        cls._create_user('horst', 'horst@horst.de')
        cls._create_user('brokeragent', 'brokeragent@gfbio.org')

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
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": one_year.for_json(),
                        "customfield_10303": "{0}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    def test_jira_brokeragent_error(self):
        submission = Submission.objects.first()
        one_year = arrow.now().shift(years=1)
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "brokeragent@gfbio.org"
                },
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

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    def test_successful_embargo_update(self):
        submission = Submission.objects.first()
        six_months = arrow.now().shift(months=6)
        submission.embargo = six_months.date()
        submission.save()
        self.assertEqual(six_months.date(), submission.embargo)

        one_year = arrow.now().shift(years=1)
        post_data = {
            "user": {
                "emailAddress": "horst@horst.de"
            },
            "issue": {
                "key": "SAND-007",
                "fields": {
                    "customfield_10200": one_year.for_json(),
                    "customfield_10303": "{0}".format(
                        submission.broker_submission_id),
                    "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                }
            },
            "changelog": {
                "items": [
                    {}
                ]
            }
        }
        self.client.post(
            self.url,
            post_data,
            format='json')

        submission = Submission.objects.first()
        self.assertEqual(one_year.date(), submission.embargo)

        # change status to SUPPRESSED
        study = submission.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.first()
        study.status = "SUPPRESSED"
        study.save()
        submission.embargo = six_months.date()
        submission.save()
        self.assertEqual(six_months.date(), submission.embargo)

        self.client.post(
            self.url,
            post_data,
            format='json')

        submission = Submission.objects.first()
        self.assertEqual(one_year.date(), submission.embargo)

    @skip('request to real server')
    def test_real_call_to_development_server(self):
        one_year = arrow.now().shift(years=1)
        # allowany:
        #   400: b'{"issue":["\'user\': user is not in curators group"]}'
        # --> add to curators group
        #   FIXME: filter for 'Curators' in serializer
        # 500: --> add persistent identifier to BO study
        #   FIXME: tests !
        # add url params user_id and user_key
        # NOW THIS BELOW WORKS
        post_data = {
            "user": {
                "emailAddress": "marcw@nord-com.net"
            },
            "issue": {
                "key": "SAND-1797",
                "fields": {
                    "customfield_10200": "2021-09-11T12:47:04.964721+01:00",
                    # one_year.for_json(),
                    "customfield_10303": "a260377d-8509-4bdc-b0bd-b859460d064d",
                }
            },
            "changelog": {
                "items": [
                    {}
                ]
            }
        }

        response = requests.post(
            url='https://c103-171.cloud.gwdg.de/api/submissions/jira/update/'
                '?user_id=marcw@nord-com.net&user_key=marcw@nord-com.net',
            # WORKs WITHOUT AUTH
            # auth=('marc', ''),
            headers={
                'Content-Type': 'application/json'
            },
            json=post_data,
        )

    def test_wrong_status_embargo_update(self):
        submission = Submission.objects.first()
        six_months = arrow.now().shift(months=6)
        submission.embargo = six_months.date()
        submission.save()
        self.assertEqual(six_months.date(), submission.embargo)
        # change status to SUPPRESSED
        study = submission.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.first()
        study.status = "PUBLIC"
        study.save()
        self.assertEqual("PUBLIC", study.status)

        one_year = arrow.now().shift(years=1)
        post_data = {
            "user": {
                "emailAddress": "horst@horst.de"
            },
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
        }
        self.client.post(
            self.url,
            post_data,
            format='json')

        submission = Submission.objects.first()
        self.assertNotEqual(one_year.date(), submission.embargo)

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
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": one_year.for_json(),
                        "customfield_10303": "{0}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    def test_real_world_request(self):
        submission = Submission.objects.first()

        hook_content = _get_jira_hook_request_data()
        payload = json.loads(hook_content)
        payload['user']['emailAddress'] = 'horst@horst.de'
        payload['issue']['key'] = 'SAND-007'
        payload['issue']['fields']['customfield_10303'] = '{}'.format(
            submission.broker_submission_id)

        response = self.client.post(self.url, payload, format='json')
        print(response.content)
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(status.HTTP_201_CREATED,
                         RequestLog.objects.first().response_status)
        # TODO: check response content

    def test_real_world_request_no_changelog(self):
        submission = Submission.objects.first()

        hook_content = _get_jira_hook_request_data(no_changelog=True)
        payload = json.loads(hook_content)
        payload['user']['emailAddress'] = 'horst@horst.de'
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
        response = self.client.post(self.url, {
            "user": {
                "emailAddress": "horst@horst.de"
            },
            "issue": {"key": "SAND-007"},
            "changelog": {
                "items": [
                    {}
                ]
            }},
                                    format='json')

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(b'fields', response.content)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_missing_fields(self):
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(self.url, {
            "user": {
                "emailAddress": "horst@horst.de"
            },
            "issue": {"key": "SAND-007", "fields": {}},
            "changelog": {
                "items": [
                    {}
                ]
            }},
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
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "",
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
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
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2022-03-01",
                        "customfield_10303": "",
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
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
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2021-xxx-09",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
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
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2023-03-09T00:00:00+00:00",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_201_CREATED,
                         RequestLog.objects.first().response_status)

    def test_jira_reporter_gfbio_unknown(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2023-03-09T00:00:00+00:00",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_201_CREATED,
                         RequestLog.objects.first().response_status)
        submission = Submission.objects.first()
        self.assertEqual(submission.user.username,'repo123_loginame')

    def test_jira_reporter_gfbio_known(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2023-03-09T00:00:00+00:00",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "brokeragent",
                            "emailAddress": "brokeragent@gfbio.org",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_201_CREATED,
                         RequestLog.objects.first().response_status)
        submission = Submission.objects.first()
        self.assertEqual(submission.user.username,'brokeragent')

    def test_jira_reporter_gfbio_same(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2023-03-09T00:00:00+00:00",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "horst",
                            "emailAddress": "horst@horst.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_201_CREATED,
                         RequestLog.objects.first().response_status)
        submission = Submission.objects.first()
        self.assertEqual(submission.user.username,'horst')

    def test_date_in_the_past(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2020-04-09T00:00:00+00:00",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(b'\'customfield_10200\': embargo date in the past',
                      response.content)

        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)

    def test_date_tomorrow(self):
        submission = Submission.objects.first()
        embargo_tomorrow = arrow.now().shift(days=1).format('YYYY-MM-DD')
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": embargo_tomorrow,
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_201_CREATED,
                         RequestLog.objects.first().response_status)

    def test_date_in_the_far_future(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": "2049-04-09T00:00:00+00:00",
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
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
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().for_json(),
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
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

    def test_embargo_is_identical(self):
        submission = Submission.objects.first()
        embargo_date = arrow.now().shift(days=14).format('YYYY-MM-DD')
        embargo_date_hour_offset = arrow.now().shift(days=14, hours=1).format(
            'YYYY-MM-DD')
        submission.embargo = embargo_date
        submission.save()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": embargo_date_hour_offset,
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertNotIn(
            b'\'customfield_10200\': no changes detected',
            response.content)

    def test_missing_issue_reference(self):
        submission = Submission.objects.first()
        submission.additionalreference_set.all().delete()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().shift(
                            years=1).for_json(),
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
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

    def test_missing_user_reference(self):
        submission = Submission.objects.first()
        submission.additionalreference_set.all().delete()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "issue": {
                        "key": "SAND-007",
                        "fields": {
                            "customfield_10200": arrow.now().for_json(),
                            "customfield_10303": "{}".format(
                                submission.broker_submission_id),
                        }
                    },
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(
            b'{"user":["This field is required."]}',
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
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().shift(
                            years=1).for_json(),
                        "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
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
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().shift(
                            years=1).for_json(),
                        "customfield_10303": "{0}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
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

    def test_no_persistent_identifier_to_check_status(self):
        submission = Submission.objects.first()
        bos = submission.brokerobject_set.all()
        for b in bos:
            b.persistentidentifier_set.all().delete()
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "horst@horst.de"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().shift(
                            years=1).for_json(),
                        "customfield_10303": "{0}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(
            b'submission without a primary accession',
            response.content)
        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)


    def test_not_curator(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.client.post(
            self.url,
            {
                "user": {
                    "emailAddress": "test@test.com"
                },
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().shift(
                            years=1).for_json(),
                        "customfield_10303": "{}".format(
                            submission.broker_submission_id),
                        "reporter": {
                            "name": "repo123_loginame",
                            "emailAddress": "repo@repo.de",
                        },
                    }
                },
                "changelog": {
                    "items": [
                        {}
                    ]
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn(b'{"issue":["\'user\': user is not in curators group"]}',
                      response.content)

        self.assertEqual(1, len(RequestLog.objects.all()))
        self.assertEqual(status.HTTP_400_BAD_REQUEST,
                         RequestLog.objects.first().response_status)


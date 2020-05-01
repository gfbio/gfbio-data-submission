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

        # # no issue
        # response = self.client.post(self.url, {'a': True},
        #                             format='json')
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        # self.assertEqual(1, len(RequestLog.objects.all()))
        #
        # # in issue errors
        # response = self.client.post(self.url, {"issue": {"key": "SAND-007"}},
        #                             format='json')
        # self.assertEqual(2, len(RequestLog.objects.all()))
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        #
        # # fields
        # response = self.client.post(self.url, {
        #     "issue": {"key": "SAND-007", "fields": {}}},
        #                             format='json')
        # self.assertEqual(3, len(RequestLog.objects.all()))
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        #
        # # only one left missing
        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": "",  # embargo date
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(4, len(RequestLog.objects.all()))
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        #
        # # values
        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": "",  # embargo date
        #                 "customfield_10303": "",  # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')

        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": "",  # embargo date
        #                 "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",  # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(5, len(RequestLog.objects.all()))
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        #
        # # all valid
        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": "2021-03-09",  # embargo date
        #                 "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",  # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(6, len(RequestLog.objects.all()))
        # self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        # date checks
        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": "2021-03-09",  # embargo date
        #                 "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')

        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": "2021-xxx-09",  # embargo date
        #                 "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')

        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": "2021-03-09T00:00:00+00:00",  # embargo date
        #                 "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # today
        # embargo1 = arrow.now().shift(years=-1)
        # today = arrow.now()
        # embargo2 = arrow.now().shift(years=2)
        # print(embargo1)
        # print(today)
        # print(embargo2)
        # diff = embargo2 - today
        # print(diff)
        # print(diff.days)
        # print(diff.days > 730)
        # embargo - heute:
        #  - negativ -> in der vergangenheit
        #  - positiv -> in der zukunft

        # date_in_the_past = datetime.date.today() - datetime.timedelta(days=1)
        # print('date in th4 pas 1 day', date_in_the_past)
        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": "2020-04-09T00:00:00+00:00",
        #                 # embargo date
        #                 "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": "2029-04-09T00:00:00+00:00",
        #                 # embargo date
        #                 "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": arrow.now().for_json(),
        #                 # embargo date
        #                 "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        # submission = Submission.objects.first()
        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": arrow.now().shift(
        #                     years=1).for_json(),
        #                 # embargo date
        #                 #"customfield_10303": "{0}".format(submission.broker_submission_id),
        #                 "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        # submission = Submission.objects.first()
        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": arrow.now().shift(
        #                     years=1).for_json(),
        #                 # embargo date
        #                 "customfield_10303": "{0}".format(submission.broker_submission_id),
        #                 #"customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        # submission = Submission.objects.first()
        # submission.additionalreference_set.all().delete()
        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": arrow.now().shift(
        #                     years=1).for_json(),
        #                 # embargo date
        #                 "customfield_10303": "{0}".format(
        #                     submission.broker_submission_id),
        #                 # "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        # submission = Submission.objects.first()
        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": arrow.now().shift(
        #                     years=1).for_json(),
        #                 # embargo date
        #                 "customfield_10303": "{0}".format(
        #                     submission.broker_submission_id),
        #                 # "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        # submission = Submission.objects.first()
        # submission.brokerobject_set.create(
        #     type='study',
        #     user=submission.user,
        #     data={'data': True}
        # )
        # studies = submission.brokerobject_set.filter(type='study')
        # studies.first().persistentidentifier_set.create(
        #     archive='ENA',
        #     pid_type='PRJ',
        #     pid='PRJEB0815',
        #     status='PRIVATE'
        # )
        # response = self.client.post(
        #     self.url,
        #     {
        #         "issue": {
        #             "key": "SAND-007",
        #             "fields": {
        #                 "customfield_10200": arrow.now().shift(
        #                     years=1).for_json(),
        #                 # embargo date
        #                 "customfield_10303": "{0}".format(
        #                     submission.broker_submission_id),
        #                 # "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
        #                 # broker_submission_id
        #             }
        #         }
        #     },
        #     format='json')
        # self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        submission = Submission.objects.first()
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
            # status='PRIVATE'
        )
        response = self.client.post(
            self.url,
            {
                "issue": {
                    "key": "SAND-007",
                    "fields": {
                        "customfield_10200": arrow.now().shift(
                            years=1).for_json(),
                        # embargo date
                        "customfield_10303": "{0}".format(
                            submission.broker_submission_id),
                        # "customfield_10303": "a49a1008-866b-4ada-a60d-38cd21273475",
                        # broker_submission_id
                    }
                }
            },
            format='json')
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        print('\n', response.status_code)
        print(response.content)

        r = RequestLog.objects.all()
        print(r)

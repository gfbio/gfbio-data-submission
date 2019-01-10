# -*- coding: utf-8 -*-
import base64
import json

import responses
from celery import chain
from django.contrib.auth.models import Permission
from django.test import TestCase
from django.urls import reverse
from mock import patch
from rest_framework.authtoken.models import Token
from rest_framework.test import APIRequestFactory, APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL, HELPDESK_COMMENT_SUB_URL, HELPDESK_ATTACHMENT_SUB_URL
from gfbio_submissions.brokerage.models import ResourceCredential, \
    SiteConfiguration, Submission, AuditableTextData, PersistentIdentifier, \
    BrokerObject, TaskProgressReport, AdditionalReference, PrimaryDataFile
from gfbio_submissions.brokerage.tasks import prepare_ena_submission_data_task, \
    transfer_data_to_ena_task, process_ena_response_task, \
    create_broker_objects_from_submission_data_task, check_on_hold_status_task, \
    get_gfbio_user_email_task, create_helpdesk_ticket_task, \
    comment_helpdesk_ticket_task, attach_file_to_helpdesk_ticket_task, \
    add_pangaealink_to_helpdesk_ticket_task
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.tests.utils import \
    _get_submission_request_data, _get_ena_xml_response, \
    _get_ena_error_xml_response, _get_jira_response, _get_jira_attach_response
from gfbio_submissions.users.models import User


class TestInitialChainTasks(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submission')
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        user.user_permissions.add(*cls.permissions)
        cls.factory = APIRequestFactory()
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        cls.site_config = SiteConfiguration.objects.create(
            title='default',
            release_submissions=False,
            use_gfbio_services=False,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:password').decode('utf-8')
        )
        cls.api_client = client

    def _add_create_ticket_response(self):
        responses.add(
            responses.POST,
            '{0}{1}'.format(
                self.site_config.helpdesk_server.url,
                HELPDESK_API_SUB_URL
            ),
            status=200,
            body=json.dumps({'mocked_response': True})
        )

    @responses.activate
    def test_min_post_initial_chain(self):
        self._add_create_ticket_response()
        min_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            }))
        self.assertEqual(201, min_response.status_code)

    @responses.activate
    def test_max_post_with_release_initial_chain(self):
        self._add_create_ticket_response()
        max_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': True,
                'data': _get_submission_request_data()
            }))
        self.assertEqual(201, max_response.status_code)

    @responses.activate
    def test_max_post_without_release_initial_chain(self):
        self._add_create_ticket_response()
        max_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': _get_submission_request_data()
            }))
        self.assertEqual(201, max_response.status_code)

    @responses.activate
    def test_put_initial_chain_no_release(self):
        self._add_create_ticket_response()
        response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': _get_submission_request_data()
            }))
        submission = Submission.objects.first()
        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            data={'target': 'ENA', 'release': False, 'data': {
                'requirements': {'title': 'A Title 0815',
                                 'description': 'A Description 2'}}},
            format='json', )


# TODO: split task tests accoding to subject/target
class TestCeleryTasks(TestCase):

    @classmethod
    def setUpTestData(cls):
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            name__endswith='primary data file')
        user = User.objects.create(
            username='user1'
        )
        user.user_permissions.add(*permissions)
        submission = SubmissionTest._create_submission_via_serializer()
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        submission.additionalreference_set.create(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key='PANGAEA_FAKE_KEY',
            primary=True
        )
        submission = SubmissionTest._create_submission_via_serializer()
        submission.submitting_user = '16250'
        submission.save()
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )

        SiteConfiguration.objects.create(
            title='default',
            site=None,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
            contact='kevin@horstmeier.de'
        )
        SiteConfiguration.objects.create(
            title='default-2',
            site=None,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration 2',
        )

    @classmethod
    def _create_test_data(cls, path, delete=True):
        if delete:
            cls._delete_test_data()
        f = open(path, 'w')
        f.write('test123\n')
        f.close()
        f = open(path, 'rb')
        return {
            'data_file': f,
        }

    @staticmethod
    def _delete_test_data():
        PrimaryDataFile.objects.all().delete()

    # def setUp(self):
    #     print(' ', len(Submission.objects.all()), ' ',
    #           len(BrokerObject.objects.all()), ' ',
    #           len(PersistentIdentifier.objects.all()), )
    #     SubmissionTest._create_submission_via_serializer()
    #
    # def tearDown(self):
    #     print('Tear DOWN')
    #     BrokerObject.objects.all().delete()
    #     # Submission.objects.all().delete()
    #     PersistentIdentifier.objects.all().delete()
    #     print(' ', len(Submission.objects.all()), ' ',
    #           len(BrokerObject.objects.all()), ' ',
    #           len(PersistentIdentifier.objects.all()), )

    # def tearDown(self):
    #     BrokerObject.objects.all().delete()
    #     PersistentIdentifier.objects.all().delete()

    # def _add_create_ticket_response(self):
    #     responses.add(
    #         responses.POST,
    #         '{0}{1}'.format(
    #             self.site_config.helpdesk_server.url,
    #             HELPDESK_API_SUB_URL
    #         ),
    #         status=200,
    #         body=json.dumps({'mocked_response': True})
    #     )

    def test_prepare_ena_submission_data_task(self):
        submission = Submission.objects.first()
        text_data = AuditableTextData.objects.all()
        self.assertEqual(0, len(text_data))
        result = prepare_ena_submission_data_task.apply_async(
            kwargs={
                'submission_id': submission.pk
            }
        )
        ret_val = result.get()
        self.assertTrue(result.successful())
        ret_val = result.get()
        self.assertTrue(isinstance(ret_val, dict))
        self.assertIn('SAMPLE', ret_val.keys())
        text_data = AuditableTextData.objects.all()
        self.assertEqual(4, len(text_data))

    @responses.activate
    def test_transfer_to_ena_task_successful(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response()
        )
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=submission.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=submission.pk
            )
        )()
        text_data = AuditableTextData.objects.filter(submission=submission)
        self.assertEqual(4, len(text_data))
        self.assertTrue(result.successful())
        ret_val = result.get()
        self.assertTrue(isinstance(ret_val, tuple))

    # TODO: add test where nonsense content is returned like '' or {}
    @responses.activate
    def test_transfer_to_ena_task_client_error(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=400,
            body=_get_ena_error_xml_response()
        )
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=submission.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=submission.pk
            )
        )()
        ret_val = result.get()
        self.assertTrue(result.successful())
        ret_val = result.get()
        self.assertTrue(isinstance(ret_val, tuple))

    @responses.activate
    def test_transfer_to_ena_task_server_error(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=500,
            body='{}'
        )
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=submission.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=submission.pk
            )
        )()

        ret_val = result.get()
        self.assertFalse(result.successful())
        self.assertIsNone(ret_val)

    # TODO: add test where nonsense content is returned like '' or {}
    # @patch('gfbio_submissions.brokerage.utils.ena.requests')
    @responses.activate
    def test_process_ena_response_task_successful(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response()
        )
        self.assertEqual(0, len(PersistentIdentifier.objects.all()))
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=submission.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=submission.pk
            ),
            process_ena_response_task.s(
                submission_id=submission.pk
            )
        )()

        ret_val = result.get()
        self.assertTrue(result.successful())
        self.assertTrue(ret_val)
        self.assertLess(0, len(PersistentIdentifier.objects.all()))

    def test_create_broker_objects_from_submission_data_task(self):
        submission = Submission.objects.last()
        submission.release = True
        submission.status = Submission.SUBMITTED
        submission.save()
        BrokerObject.objects.filter(submissions=submission).delete()
        broker_objects = BrokerObject.objects.filter(submissions=submission)
        self.assertEqual(0, len(broker_objects))
        result = create_broker_objects_from_submission_data_task.apply_async(
            kwargs={
                'submission_id': submission.id
            },
        )
        self.assertTrue(result.successful())
        broker_objects = BrokerObject.objects.filter(submissions=submission)
        self.assertEqual(5, len(broker_objects))

    def test_check_on_hold_status_task(self):
        result = check_on_hold_status_task.apply_async(
            kwargs={
                'submission_id': Submission.objects.first().id
            }
        )
        self.assertTrue(result.successful())

    @patch('gfbio_submissions.brokerage.tasks.logger')
    def test_check_on_hold_proceed_without_email(self, mock_logger):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.last()
        conf.release_submissions = True
        conf.save()
        check_on_hold_status_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(mock_logger.info.called)
        reports = TaskProgressReport.objects.all()
        task_names = [r.task_name for r in reports]
        self.assertTrue('tasks.check_on_hold_status_task' in task_names)

    # TODO: this one below
    # TODO: check all test, even if passing, for json exceptions that need repsonse mock

    @responses.activate
    def test_get_gfbio_user_email_task_success(self):
        submission = Submission.objects.last()
        config = SiteConfiguration.objects.first()
        config.use_gfbio_services = True
        config.save()
        responses.add(
            responses.GET,
            'https://www.example.com/api/jsonws/'
            'GFBioProject-portlet.userextension/'
            'get-user-by-id/request-json/%7B%22userid%22:%2016250%7D',
            status=200,
            headers={
                'Accept': 'application/json'
            },
            json={"firstname": "Marc", "middlename": "",
                  "emailaddress": "maweber@mpi-bremen.de",
                  "fullname": "Marc Weber",
                  "screenname": "maweber", "userid": 16250,
                  "lastname": "Weber"})

        result = get_gfbio_user_email_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(result.successful())
        self.assertDictEqual({'first_name': 'Marc', 'last_name': 'Weber',
                              'user_email': 'maweber@mpi-bremen.de',
                              'user_full_name': 'Marc Weber'}, result.get())

    @responses.activate
    def test_get_gfbio_user_email_task_no_gfbio_services(self):
        submission = Submission.objects.last()
        config = SiteConfiguration.objects.first()
        config.use_gfbio_services = False
        config.save()
        data = json.dumps({
            'userid': 16250
        })
        url = '{0}/api/jsonws/GFBioProject-portlet.userextension/get-user-by-id/request-json/{1}'.format(
            config.gfbio_server.url, data)
        responses.add(responses.GET, url, status=200,
                      json={})
        result = get_gfbio_user_email_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @responses.activate
    def test_get_gfbio_user_email_task_error_response(self):
        submission = Submission.objects.last()
        config = SiteConfiguration.objects.first()
        config.use_gfbio_services = False
        config.save()
        data = json.dumps({
            'userid': 16250
        })
        url = '{0}/api/jsonws/GFBioProject-portlet.userextension/get-user-by-id/request-json/{1}'.format(
            config.gfbio_server.url, data)
        responses.add(responses.GET, url, status=200, json={})
        result = get_gfbio_user_email_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @responses.activate
    def test_get_gfbio_user_email_task_corrupt_response(self):
        submission = Submission.objects.last()
        config = SiteConfiguration.objects.first()
        config.use_gfbio_services = True
        config.save()
        responses.add(
            responses.GET,
            'https://www.example.com/api/jsonws/'
            'GFBioProject-portlet.userextension/'
            'get-user-by-id/request-json/%7B%22userid%22:%2016250%7D',
            status=200,
            headers={
                'Accept': 'application/json'
            },
            body='xyz')

        result = get_gfbio_user_email_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @responses.activate
    def test_get_gfbio_user_email_task_400_response(self):
        submission = Submission.objects.last()
        config = SiteConfiguration.objects.first()
        config.use_gfbio_services = True
        config.save()
        responses.add(
            responses.GET,
            'https://www.example.com/api/jsonws/'
            'GFBioProject-portlet.userextension/'
            'get-user-by-id/request-json/%7B%22userid%22:%2016250%7D',
            status=400,
            headers={
                'Accept': 'application/json'
            },
            json='')
        result = get_gfbio_user_email_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @responses.activate
    def test_create_helpdesk_ticket_task_success(self):
        submission = Submission.objects.last()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            HELPDESK_API_SUB_URL),
            json={"bla": "blubb"},
            status=200)
        self.assertEqual(0, len(submission.additionalreference_set.all()))
        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual(1, len(submission.additionalreference_set.all()))

    @responses.activate
    def test_create_helpdesk_ticket_task_unicode_text(self):
        submission = Submission.objects.last()
        site_config = SiteConfiguration.objects.first()
        self.assertEqual(0, len(submission.additionalreference_set.all()))
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            HELPDESK_API_SUB_URL
                            ),
            json={"bla": "blubb"},
            status=200)
        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual(1, len(submission.additionalreference_set.all()))

    @responses.activate
    def test_comment_helpdesk_ticket_task_success(self):
        site_config = SiteConfiguration.objects.first()
        url = '{0}{1}/{2}/{3}'.format(
            site_config.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json={"bla": "blubb"}, status=200)
        submission = Submission.objects.first()
        result = comment_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.id,
                'comment_body': 'test-comment'
            }
        )
        self.assertTrue(result.successful())
        self.assertFalse(result.get())

    # duplicate of above
    # @responses.activate
    # def test_comment_helpdesk_ticket_task(self):
    #     submission = Submission.objects.first()
    #     submission.additionalreference_set.create(
    #         type=AdditionalReference.GFBIO_HELPDESK_TICKET,
    #         reference_key='FAKE_KEY',
    #         primary=True
    #     )
    #     site_config = SiteConfiguration.objects.first()
    #     url = '{0}{1}/{2}/{3}'.format(
    #         site_config.helpdesk_server.url,
    #         HELPDESK_API_SUB_URL,
    #         'FAKE_KEY',
    #         HELPDESK_COMMENT_SUB_URL,
    #     )
    #     responses.add(responses.POST,
    #                   url,
    #                   json={"bla": "blubb"},
    #                   status=200)
    #     submission = Submission.objects.get(pk=1)
    #     result = comment_helpdesk_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': submission.pk,
    #             'comment_body': 'test-comment'
    #         }
    #     )
    #     self.assertTrue(result.successful())

    @responses.activate
    def test_attach_to_helpdesk_ticket_task_no_primarydatafile(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = '{0}{1}/{2}/{3}'.format(
            site_config.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_ATTACHMENT_SUB_URL,
        )
        responses.add(responses.POST,
                      url,
                      json=_get_jira_response(),
                      status=200)
        # submission = Submission.objects.get(pk=1)
        result = attach_file_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())
        self.assertFalse(result.get())

    @responses.activate
    def test_attach_to_helpdesk_ticket_task_with_primarydatafile(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          HELPDESK_API_SUB_URL,
                          'FAKE_KEY',
                          HELPDESK_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        token = Token.objects.create(user=submission.site)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        # POST will already trigger attach_file_to_helpdesk_ticket_task
        # via PrimaryDataFile save method
        client.post(url, data, format='multipart')
        # attach_file_to_helpdesk_ticket_task was already triggered by POST above
        # via PrimaryDataFile save method
        result = attach_file_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())
        self.assertTrue(result.get())

    @patch(
        'gfbio_submissions.brokerage.tasks.apply_timebased_task_retry_policy')
    def test_attach_primarydatafile_without_ticket(self, mock):
        submission = Submission.objects.last()
        result = attach_file_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(mock.called)

    @responses.activate
    def test_add_pangaealink_to_helpdesk_ticket_task_success(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = '{0}{1}/{2}/{3}'.format(
            site_config.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url,
                      json={"bla": "blubb"},
                      status=200)
        result = add_pangaealink_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.successful())

    @responses.activate
    def test_add_pangaealink_to_helpdesk_ticket_task_client_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = '{0}{1}/{2}/{3}'.format(
            site_config.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, status=400, json={"bla": "blubb"})
        result = add_pangaealink_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())

    # FIXME: what about retries ? are they executed ?
    @responses.activate
    def test_add_pangaealink_to_helpdesk_ticket_task_server_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = '{0}{1}/{2}/{3}'.format(
            site_config.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, status=500, json={"bla": "blubb"})
        result = add_pangaealink_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertFalse(result.successful())

    @responses.activate
    def test_create_helpdesk_ticket_task_client_error(self):
        submission = Submission.objects.last()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            HELPDESK_API_SUB_URL),
            json={},
            status=400)
        # responses.add(responses.POST,
        #               url,
        #               json={},
        #               status=400)

        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())

    # @responses.activate
    # def test_create_helpdesk_ticket_task_server_error(self):
    #     sc = SiteConfiguration.objects.get(pk=1)
    #     url = '{0}{1}'.format(
    #         sc.helpdesk_server.url,
    #         HELPDESK_API_SUB_URL
    #     )
    #     responses.add(responses.POST, url, status=500,
    #                   json={"bla": "blubb"})
    #     result = create_helpdesk_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': 1,
    #             'summary': 'Test',
    #             'description': 'Test'
    #
    #         }
    #     )
    #     self.assertFalse(result.successful())
    #
    # # ---------------------- Pangaea tasks -------------------------------------
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_request_pangaea_login_token_task_success(self, mock_requests):
    #     access = ResourceCredential()
    #     access.username = 'gfbio-broker'
    #     access.password = 'h_qB-RxCY)7y'
    #     access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
    #     access.save()
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #
    #     mock_requests.post.return_value.status_code = 200
    #     mock_requests.post.return_value.ok = True
    #     mock_requests.post.return_value.content = textwrap.dedent(
    #         """<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><ns1:loginResponse soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:ns1="urn:java:de.pangaea.login.PanLogin"><loginReturn xsi:type="xsd:string">f3d7aca208aaec8954d45bebc2f59ba1522264db</loginReturn></ns1:loginResponse></soapenv:Body></soapenv:Envelope>""")
    #     result = request_pangaea_login_token_task.apply_async(
    #         kwargs={
    #             'submission_id': 1,
    #         }
    #     )
    #     self.assertTrue(result.successful())
    #     self.assertEqual('f3d7aca208aaec8954d45bebc2f59ba1522264db',
    #                      result.get())
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(1, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual('http://www.example2.com',
    #                      request_logs.first().url)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_request_pangaea_login_token_task_client_error(self, mock_requests):
    #     access = ResourceCredential()
    #     access.username = 'gfbio-broker'
    #     access.password = 'h_qB-RxCY)7y'
    #     access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
    #     access.save()
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #
    #     mock_requests.post.return_value.status_code = 400
    #     mock_requests.post.return_value.ok = False
    #     mock_requests.post.return_value.content = ''
    #     result = request_pangaea_login_token_task.apply_async(
    #         kwargs={
    #             'submission_id': 1,
    #         }
    #     )
    #     self.assertTrue(result.successful())
    #     self.assertEqual('', result.get())
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(1, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual('http://www.example2.com',
    #                      request_logs.first().url)
    #
    # @responses.activate
    # def test_request_pangaea_login_token_task_server_error(self):
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #     sc = SiteConfiguration.objects.get(pk=1)
    #     responses.add(responses.POST, sc.pangaea_server.url, status=500,
    #                   body='')
    #     result = request_pangaea_login_token_task.apply_async(
    #         kwargs={
    #             'submission_id': 1,
    #         }
    #     )
    #     self.assertFalse(result.successful())
    #
    #     request_logs = RequestLog.objects.all()
    #     # 3 logentries for 3 retries
    #     self.assertEqual(3, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual('http://www.example2.com',
    #                      request_logs.first().url)
    #
    # @responses.activate
    # def test_create_pangaea_jira_ticket_task_success(self):
    #     submission = Submission.objects.get(pk=1)
    #
    #     self.assertEqual(3, len(submission.additionalreference_set.all()))
    #     login_token = 'f3d7aca208aaec8954d45bebc2f59ba1522264db'
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #     responses.add(responses.POST,
    #                   PANGAEA_ISSUE_BASE_URL,
    #                   json={"id": "31444", "key": "PDI-11735",
    #                         "self": "http://issues.pangaea.de/rest/api/2/issue/31444"},
    #                   status=201)
    #     result = create_pangaea_jira_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': submission.pk,
    #             'login_token': login_token
    #         }
    #     )
    #     res = result.get()
    #     self.assertTrue(result.successful())
    #     self.assertDictEqual(
    #         {'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
    #          'ticket_key': 'PDI-11735'}, res)
    #     additional_references = submission.additionalreference_set.all()
    #     self.assertEqual(4, len(additional_references))
    #     ref = additional_references.last()
    #     self.assertEqual('PDI-11735', ref.reference_key)
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(1, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
    #                      request_logs.first().url)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_create_pangaea_jira_ticket_task_client_error(self, mock_requests):
    #     submission = Submission.objects.get(pk=1)
    #
    #     self.assertEqual(3, len(submission.additionalreference_set.all()))
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #
    #     mock_requests.post.return_value.status_code = 400
    #     mock_requests.post.return_value.ok = False
    #     mock_requests.post.return_value.content = ''
    #     result = create_pangaea_jira_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': submission.pk,
    #             'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db'
    #
    #         }
    #     )
    #     self.assertTrue(result.successful())
    #     self.assertIsNone(result.get())
    #     additional_references = submission.additionalreference_set.all()
    #     self.assertEqual(3, len(additional_references))
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(1, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
    #                      request_logs.first().url)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_create_pangaea_jira_ticket_task_server_error(self, mock_requests):
    #     submission = Submission.objects.get(pk=1)
    #
    #     self.assertEqual(3, len(submission.additionalreference_set.all()))
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #
    #     mock_requests.post.return_value.status_code = 500
    #     mock_requests.post.return_value.ok = False
    #     mock_requests.post.return_value.content = ''
    #     result = create_pangaea_jira_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': submission.pk,
    #             'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db'
    #
    #         }
    #     )
    #     self.assertFalse(result.successful())
    #     additional_references = submission.additionalreference_set.all()
    #     self.assertEqual(3, len(additional_references))
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(3, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
    #                      request_logs.first().url)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_attach_file_to_pangaea_ticket_task_success(self, mock_requests):
    #     sub = FullWorkflowTest._prepare()
    #     sub.submitting_user = 'gfbio'
    #     sub.save()
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #
    #     mock_requests.post.return_value.status_code = 200
    #     mock_requests.post.return_value.ok = True
    #     mock_requests.post.return_value.content = '[{"self":"http://issues.pangaea.de/rest/api/2/attachment/49860","id":"49860","filename":"report.csv","author":{"self":"http://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"http://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"http://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"http://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"http://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"created":"2016-02-26T14:47:46.000+0000","size":38,"content":"http://issues.pangaea.de/secure/attachment/49860/report.csv"}]'
    #     result = attach_file_to_pangaea_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': sub.pk,
    #             'kwargs': {
    #                 'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
    #                 'ticket_key': 'PDI-11735'
    #             }
    #         }
    #     )
    #     res = result.get()
    #     self.assertTrue(result.successful())
    #     self.assertDictEqual(
    #         {'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
    #          'ticket_key': 'PDI-11735'}, res)
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(1, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual(
    #         'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/attachments',
    #         request_logs.first().url)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_attach_file_to_pangaea_ticket_task_client_error(self,
    #                                                          mock_requests):
    #     sub = FullWorkflowTest._prepare()
    #     sub.submitting_user = 'gfbio'
    #     sub.save()
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #
    #     mock_requests.post.return_value.status_code = 400
    #     mock_requests.post.return_value.ok = False
    #     mock_requests.post.return_value.content = ''
    #     result = attach_file_to_pangaea_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': sub.pk,
    #             'kwargs': {
    #                 'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
    #                 'ticket_key': 'PDI-11735'
    #             }
    #         }
    #     )
    #     res = result.get()
    #     self.assertTrue(result.successful())
    #     self.assertDictEqual(
    #         {'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
    #          'ticket_key': 'PDI-11735'}, res)
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(1, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual(
    #         'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/attachments',
    #         request_logs.first().url)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_attach_file_to_pangaea_ticket_task_server_error(self,
    #                                                          mock_requests):
    #     sub = FullWorkflowTest._prepare()
    #     sub.submitting_user = 'gfbio'
    #     sub.save()
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #
    #     mock_requests.post.return_value.status_code = 500
    #     mock_requests.post.return_value.ok = False
    #     mock_requests.post.return_value.content = ''
    #     result = attach_file_to_pangaea_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': sub.pk,
    #             'kwargs': {
    #                 'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
    #                 'ticket_key': 'PDI-11735'
    #             }
    #         }
    #     )
    #     self.assertFalse(result.successful())
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(3, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual(
    #         'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/attachments',
    #         request_logs.first().url)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_comment_on_pangaea_ticket_task_success(self, mock_requests):
    #     sub = FullWorkflowTest._prepare()
    #     sub.submitting_user = 'gfbio'
    #     sub.save()
    #     sub.brokerobject_set.filter(
    #         type='study').first().persistentidentifier_set.create(
    #         archive='ENA',
    #         pid_type='PRJ',
    #         pid='PRJEB20411',
    #         outgoing_request_id=uuid.uuid4()
    #     )
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #
    #     mock_requests.post.return_value.status_code = 200
    #     mock_requests.post.return_value.ok = True
    #     mock_requests.post.return_value.content = '{"self":"http://issues.pangaea.de/rest/api/2/issue/31444/comment/72996","id":"72996","author":{"self":"http://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"http://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"http://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"http://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"http://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"body":"This should be some descripitive text regarding attached files, containing ENA-Accession numbers","updateAuthor":{"self":"http://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"http://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"http://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"http://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"http://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"created":"2016-02-26T14:47:46.982+0000","updated":"2016-02-26T14:47:46.982+0000"}'
    #     result = comment_on_pangaea_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': sub.pk,
    #             'kwargs': {
    #                 'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
    #                 'ticket_key': 'PDI-11735'
    #             },
    #             'comment_body': 'ACC 12345'
    #         }
    #     )
    #     res = result.get()
    #     self.assertTrue(result.successful())
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(1, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual(
    #         'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/comment',
    #         request_logs.first().url)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_comment_on_pangaea_ticket_task_client_error(self, mock_requests):
    #     sub = FullWorkflowTest._prepare()
    #     sub.submitting_user = 'gfbio'
    #     sub.save()
    #     sub.brokerobject_set.filter(
    #         type='study').first().persistentidentifier_set.create(
    #         archive='ENA',
    #         pid_type='PRJ',
    #         pid='PRJEB20411',
    #         outgoing_request_id=uuid.uuid4()
    #     )
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #
    #     mock_requests.post.return_value.status_code = 400
    #     mock_requests.post.return_value.ok = False
    #     mock_requests.post.return_value.content = ''
    #     result = comment_on_pangaea_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': sub.pk,
    #             'kwargs': {
    #                 'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
    #                 'ticket_key': 'PDI-11735'
    #             },
    #             'comment_body': 'ACC 12345'
    #         }
    #     )
    #     # expects resuls from previous chain element
    #     self.assertTrue(result.successful())
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(1, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual(
    #         'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/comment',
    #         request_logs.first().url)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_comment_on_pangaea_ticket_task_server_error(self, mock_requests):
    #     sub = FullWorkflowTest._prepare()
    #     sub.submitting_user = 'gfbio'
    #     sub.save()
    #     sub.brokerobject_set.filter(
    #         type='study').first().persistentidentifier_set.create(
    #         archive='ENA',
    #         pid_type='PRJ',
    #         pid='PRJEB20411',
    #         outgoing_request_id=uuid.uuid4()
    #     )
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(0, len(request_logs))
    #
    #     mock_requests.post.return_value.status_code = 500
    #     mock_requests.post.return_value.ok = False
    #     mock_requests.post.return_value.content = ''
    #     result = comment_on_pangaea_ticket_task.apply_async(
    #         kwargs={
    #             'submission_id': sub.pk,
    #             'kwargs': {
    #                 'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
    #                 'ticket_key': 'PDI-11735'
    #             },
    #             'comment_body': 'ACC 12345'
    #         }
    #     )
    #     self.assertFalse(result.successful())
    #
    #     request_logs = RequestLog.objects.all()
    #     self.assertEqual(3, len(request_logs))
    #     self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
    #     self.assertEqual(
    #         'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/comment',
    #         request_logs.first().url)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_check_for_pangaea_doi_task_success(self, mock_requests):
    #     access = ResourceCredential()
    #     access.username = 'gfbio-broker'
    #     access.password = 'xxx'
    #     access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
    #     access.save()
    #
    #     persistent_identifiers = PersistentIdentifier.objects.all()
    #     self.assertEqual(0, len(persistent_identifiers))
    #
    #     mock_requests.post.return_value.status_code = 200
    #     mock_requests.post.return_value.ok = True
    #     mock_requests.post.return_value.content = textwrap.dedent(
    #         """<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><ns1:loginResponse soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:ns1="urn:java:de.pangaea.login.PanLogin"><loginReturn xsi:type="xsd:string">f3d7aca208aaec8954d45bebc2f59ba1522264db</loginReturn></ns1:loginResponse></soapenv:Body></soapenv:Envelope>""")
    #
    #     mock_requests.get.return_value.status_code = 200
    #     mock_requests.get.return_value.ok = True
    #     mock_requests.get.return_value.content = '{"expand":"renderedFields,names,schema,transitions,operations,editmeta,changelog","id":"33002","self":"https://issues.pangaea.de/rest/api/2/issue/33002","key":"PDI-12428","fields":{"issuetype":{"self":"https://issues.pangaea.de/rest/api/2/issuetype/6","id":"6","description":"Submission of data to PANGAEA","iconUrl":"https://issues.pangaea.de/images/icons/issuetypes/newfeature.png","name":"Data Submission","subtask":false},"timespent":null,"timeoriginalestimate":null,"description":null,"project":{"self":"https://issues.pangaea.de/rest/api/2/project/10010","id":"10010","key":"PDI","name":"PANGAEA Data Archiving & Publication","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/projectavatar?avatarId=10011","24x24":"https://issues.pangaea.de/secure/projectavatar?size=small&avatarId=10011","16x16":"https://issues.pangaea.de/secure/projectavatar?size=xsmall&avatarId=10011","32x32":"https://issues.pangaea.de/secure/projectavatar?size=medium&avatarId=10011"}},"aggregatetimespent":null,"resolution":null,"timetracking":{},"attachment":[{"self":"https://issues.pangaea.de/rest/api/2/attachment/53276","id":"53276","filename":"contextual_data.csv","author":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"created":"2016-06-02T10:38:06.000+0000","size":1502,"content":"https://issues.pangaea.de/secure/attachment/53276/contextual_data.csv"}],"aggregatetimeestimate":null,"resolutiondate":null,"workratio":-1,"summary":"Automated request by GFBio BrokerAgent","lastViewed":"2016-06-02T12:06:25.250+0000","watches":{"self":"https://issues.pangaea.de/rest/api/2/issue/PDI-12428/watchers","watchCount":0,"isWatching":false},"creator":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"subtasks":[],"created":"2016-06-02T10:37:50.000+0000","reporter":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"customfield_10120":null,"customfield_10220":null,"aggregateprogress":{"progress":0,"total":0},"priority":{"self":"https://issues.pangaea.de/rest/api/2/priority/3","iconUrl":"https://issues.pangaea.de/images/icons/priorities/major.png","name":"Major","id":"3"},"customfield_10122":null,"customfield_10320":null,"customfield_10002":"gfbio-broker","customfield_10420":null,"customfield_10003":{"self":"https://issues.pangaea.de/rest/api/2/customFieldOption/10000","value":"CC-BY: Creative Commons Attribution 3.0 Unported","id":"10000"},"customfield_10421":null,"customfield_10520":"doi:10.1594/PANGAEA.786576","labels":[],"customfield_10004":null,"timeestimate":null,"aggregatetimeoriginalestimate":null,"progress":{"progress":0,"total":0},"comment":{"startAt":0,"maxResults":1,"total":1,"comments":[{"self":"https://issues.pangaea.de/rest/api/2/issue/33002/comment/77173","id":"77173","author":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"body":"ENA Accession No. of study ERP015860. broker_submission_id: 9cb23074-689e-4058-a9e9-ccba1fe2ab1d. ","updateAuthor":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"created":"2016-06-02T10:38:22.000+0000","updated":"2016-06-02T10:38:22.000+0000"}]},"issuelinks":[],"worklog":{"startAt":0,"maxResults":20,"total":0,"worklogs":[]},"assignee":{"self":"https://issues.pangaea.de/rest/api/2/user?username=jfelden","name":"jfelden","key":"jfelden","emailAddress":"jfelden@marum.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10067","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10067","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10067","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10067"},"displayName":"Janine Felden","active":true,"timeZone":"Europe/Berlin"},"updated":"2016-06-02T12:03:16.000+0000","status":{"self":"https://issues.pangaea.de/rest/api/2/status/1","description":"The issue is open and ready for the assignee to start work on it.","iconUrl":"https://issues.pangaea.de/images/icons/statuses/open.png","name":"Open","id":"1","statusCategory":{"self":"https://issues.pangaea.de/rest/api/2/statuscategory/2","id":2,"key":"new","colorName":"blue-gray","name":"To Do"}}}}'
    #
    #     result = check_for_pangaea_doi_task.apply_async(
    #         kwargs={
    #             'resource_credential_id': access.pk
    #         }
    #     )
    #     self.assertTrue(result.successful())
    #
    #     persistent_identifiers = PersistentIdentifier.objects.all()
    #     self.assertEqual(1, len(persistent_identifiers))
    #
    #     pid = persistent_identifiers.first()
    #     self.assertEqual('PAN', pid.archive)
    #     self.assertEqual('DOI', pid.pid_type)
    #     self.assertEqual('doi:10.1594/PANGAEA.786576', pid.pid)
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_check_for_pangaea_doi_task_success_bytestring(self, mock_requests):
    #     access = ResourceCredential()
    #     access.username = 'gfbio-broker'
    #     access.password = 'xxx'
    #     access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
    #     access.save()
    #
    #     persistent_identifiers = PersistentIdentifier.objects.all()
    #     self.assertEqual(0, len(persistent_identifiers))
    #
    #     mock_requests.post.return_value.status_code = 200
    #     mock_requests.post.return_value.ok = True
    #     mock_requests.post.return_value.content = textwrap.dedent(
    #         """<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><ns1:loginResponse soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:ns1="urn:java:de.pangaea.login.PanLogin"><loginReturn xsi:type="xsd:string">f3d7aca208aaec8954d45bebc2f59ba1522264db</loginReturn></ns1:loginResponse></soapenv:Body></soapenv:Envelope>""")
    #
    #     mock_requests.get.return_value.status_code = 200
    #     mock_requests.get.return_value.ok = True
    #     mock_requests.get.return_value.content = b'{"expand":"renderedFields,names,schema,transitions,operations,editmeta,changelog","id":"33002","self":"https://issues.pangaea.de/rest/api/2/issue/33002","key":"PDI-12428","fields":{"issuetype":{"self":"https://issues.pangaea.de/rest/api/2/issuetype/6","id":"6","description":"Submission of data to PANGAEA","iconUrl":"https://issues.pangaea.de/images/icons/issuetypes/newfeature.png","name":"Data Submission","subtask":false},"timespent":null,"timeoriginalestimate":null,"description":null,"project":{"self":"https://issues.pangaea.de/rest/api/2/project/10010","id":"10010","key":"PDI","name":"PANGAEA Data Archiving & Publication","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/projectavatar?avatarId=10011","24x24":"https://issues.pangaea.de/secure/projectavatar?size=small&avatarId=10011","16x16":"https://issues.pangaea.de/secure/projectavatar?size=xsmall&avatarId=10011","32x32":"https://issues.pangaea.de/secure/projectavatar?size=medium&avatarId=10011"}},"aggregatetimespent":null,"resolution":null,"timetracking":{},"attachment":[{"self":"https://issues.pangaea.de/rest/api/2/attachment/53276","id":"53276","filename":"contextual_data.csv","author":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"created":"2016-06-02T10:38:06.000+0000","size":1502,"content":"https://issues.pangaea.de/secure/attachment/53276/contextual_data.csv"}],"aggregatetimeestimate":null,"resolutiondate":null,"workratio":-1,"summary":"Automated request by GFBio BrokerAgent","lastViewed":"2016-06-02T12:06:25.250+0000","watches":{"self":"https://issues.pangaea.de/rest/api/2/issue/PDI-12428/watchers","watchCount":0,"isWatching":false},"creator":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"subtasks":[],"created":"2016-06-02T10:37:50.000+0000","reporter":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"customfield_10120":null,"customfield_10220":null,"aggregateprogress":{"progress":0,"total":0},"priority":{"self":"https://issues.pangaea.de/rest/api/2/priority/3","iconUrl":"https://issues.pangaea.de/images/icons/priorities/major.png","name":"Major","id":"3"},"customfield_10122":null,"customfield_10320":null,"customfield_10002":"gfbio-broker","customfield_10420":null,"customfield_10003":{"self":"https://issues.pangaea.de/rest/api/2/customFieldOption/10000","value":"CC-BY: Creative Commons Attribution 3.0 Unported","id":"10000"},"customfield_10421":null,"customfield_10520":"doi:10.1594/PANGAEA.786576","labels":[],"customfield_10004":null,"timeestimate":null,"aggregatetimeoriginalestimate":null,"progress":{"progress":0,"total":0},"comment":{"startAt":0,"maxResults":1,"total":1,"comments":[{"self":"https://issues.pangaea.de/rest/api/2/issue/33002/comment/77173","id":"77173","author":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"body":"ENA Accession No. of study ERP015860. broker_submission_id: 9cb23074-689e-4058-a9e9-ccba1fe2ab1d. ","updateAuthor":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"created":"2016-06-02T10:38:22.000+0000","updated":"2016-06-02T10:38:22.000+0000"}]},"issuelinks":[],"worklog":{"startAt":0,"maxResults":20,"total":0,"worklogs":[]},"assignee":{"self":"https://issues.pangaea.de/rest/api/2/user?username=jfelden","name":"jfelden","key":"jfelden","emailAddress":"jfelden@marum.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10067","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10067","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10067","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10067"},"displayName":"Janine Felden","active":true,"timeZone":"Europe/Berlin"},"updated":"2016-06-02T12:03:16.000+0000","status":{"self":"https://issues.pangaea.de/rest/api/2/status/1","description":"The issue is open and ready for the assignee to start work on it.","iconUrl":"https://issues.pangaea.de/images/icons/statuses/open.png","name":"Open","id":"1","statusCategory":{"self":"https://issues.pangaea.de/rest/api/2/statuscategory/2","id":2,"key":"new","colorName":"blue-gray","name":"To Do"}}}}'
    #
    #     result = check_for_pangaea_doi_task.apply_async(
    #         kwargs={
    #             'resource_credential_id': access.pk
    #         }
    #     )
    #     self.assertTrue(result.successful())
    #
    #     persistent_identifiers = PersistentIdentifier.objects.all()
    #     self.assertEqual(1, len(persistent_identifiers))
    #
    #     pid = persistent_identifiers.first()
    #     self.assertEqual('PAN', pid.archive)
    #     self.assertEqual('DOI', pid.pid_type)
    #     self.assertEqual('doi:10.1594/PANGAEA.786576', pid.pid)
    #
    # # ---------------- CHAIN TESTS ---------------------------------------------
    #
    # @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    # def test_pangaea_chain(self, mock_requests):
    #     access = ResourceCredential()
    #     access.username = 'gfbio-broker'
    #     access.password = 'h_qB-RxCY)7y'
    #     access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
    #     access.save()
    #     # with patch('config.celeryconfig.CELERY_ALWAYS_EAGER', True,
    #     #           create=True):
    #     # Test chain first transition
    #     # Result: token handed over correctly
    #     # mock_requests.post.return_value.status_code = 200
    #     # mock_requests.post.return_value.ok = True
    #     # mock_requests.post.return_value.content = textwrap.dedent("""<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><ns1:loginResponse soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:ns1="urn:java:de.pangaea.login.PanLogin"><loginReturn xsi:type="xsd:string">f3d7aca208aaec8954d45bebc2f59ba1522264db</loginReturn></ns1:loginResponse></soapenv:Body></soapenv:Envelope>""")
    #     # result = chain(
    #     #         request_pangaea_login_token_task.s(
    #     #                 submission_id=1,
    #     #                 resource_credential_id=access.pk),
    #     #         create_pangaea_jira_ticket_task.s(
    #     #             submission_id=1,
    #     #         )
    #     #
    #     # )()
    #     #
    #     # Result: attach file  works with kwargs ...
    #     mock_requests.post.return_value.status_code = 201
    #     mock_requests.post.return_value.ok = True
    #     mock_requests.post.return_value.content = '{"id":"31444","key":"PDI-11735","self":"http://issues.pangaea.de/rest/api/2/issue/31444"}'
    #
    #     submission = Submission.objects.get(pk=1)
    #
    #     result = chain(
    #         create_pangaea_jira_ticket_task.s(
    #             submission_id=1,
    #             login_token='f3d7aca208aaec8954d45bebc2f59ba1522264db'
    #         ),
    #         attach_file_to_pangaea_ticket_task.s(
    #             submission_id=1,
    #         )
    #
    #     )()
    #
    # @responses.activate
    # def test_initiate_submission_chain_success(self):
    #     len_auditable_text_datas = len(AuditableTextData.objects.all())
    #     sc = SiteConfiguration.objects.get(pk=1)
    #     data = json.dumps({
    #         'userid': 23
    #     })
    #     url = '{0}/api/jsonws/GFBioProject-portlet.userextension/get-user-by-id/request-json/{1}'.format(
    #         sc.gfbio_server.url, data)
    #
    #     comment_url = '{0}{1}/{2}/{3}'.format(
    #         sc.helpdesk_server.url,
    #         HELPDESK_API_SUB_URL,
    #         'no_key_available',
    #         HELPDESK_COMMENT_SUB_URL,
    #     )
    #
    #     responses.add(responses.POST, url, status=200,
    #                   json={"firstname": "Marc", "middlename": "",
    #                         "emailaddress": "maweber@mpi-bremen.de",
    #                         "fullname": "Marc Weber",
    #                         "screenname": "maweber", "userid": 16250,
    #                         "lastname": "Weber"})
    #     responses.add(responses.POST,
    #                   '{0}{1}'.format(sc.helpdesk_server.url,
    #                                   HELPDESK_API_SUB_URL
    #                                   ),
    #                   json={"bla": "blubb"},
    #                   status=200)
    #     responses.add(responses.POST,
    #                   comment_url,
    #                   json={"bla": "blubb"},
    #                   status=200)
    #     sub = FullWorkflowTest._prepare()
    #     sub.release = False
    #     sub.save()
    #
    #     trigger_submission_transfer(submission_id=sub.id)
    #
    #     self.assertEqual(len(AuditableTextData.objects.all()),
    #                      len_auditable_text_datas)
    #
    #     sub.release = True
    #     sub.save()
    #
    #     trigger_submission_transfer(submission_id=sub.id)
    #     self.assertGreater(len(AuditableTextData.objects.all()),
    #                        len_auditable_text_datas)

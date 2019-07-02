# -*- coding: utf-8 -*-
import base64
import json
import uuid
from uuid import uuid4

import responses
from celery import chain
from django.contrib.auth.models import Permission
from django.test import TestCase
from django.urls import reverse
from mock import patch
from rest_framework.authtoken.models import Token
from rest_framework.test import APIRequestFactory, APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL, HELPDESK_COMMENT_SUB_URL, HELPDESK_ATTACHMENT_SUB_URL, \
    PANGAEA_ISSUE_BASE_URL, HELPDESK_API_ATTACHMENT_URL
from gfbio_submissions.brokerage.models import ResourceCredential, \
    SiteConfiguration, Submission, AuditableTextData, PersistentIdentifier, \
    BrokerObject, TaskProgressReport, AdditionalReference, PrimaryDataFile, \
    RequestLog, CenterName, SubmissionUpload
from gfbio_submissions.brokerage.tasks import prepare_ena_submission_data_task, \
    transfer_data_to_ena_task, process_ena_response_task, \
    create_broker_objects_from_submission_data_task, check_on_hold_status_task, \
    get_user_email_task, create_helpdesk_ticket_task, \
    comment_helpdesk_ticket_task, attach_file_to_helpdesk_ticket_task, \
    add_pangaealink_to_helpdesk_ticket_task, request_pangaea_login_token_task, \
    create_pangaea_jira_ticket_task, attach_file_to_pangaea_ticket_task, \
    comment_on_pangaea_ticket_task, check_for_pangaea_doi_task, \
    trigger_submission_transfer, update_helpdesk_ticket_task, \
    delete_attachment_task
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.tests.utils import \
    _get_submission_request_data, _get_ena_xml_response, \
    _get_ena_error_xml_response, _get_jira_attach_response, \
    _get_pangaea_soap_response, _get_pangaea_attach_response, \
    _get_pangaea_comment_response, _get_pangaea_ticket_response
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
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))
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
        task_reports = TaskProgressReport.objects.all()
        expected_tasknames = ['tasks.get_user_email_task',
                              'tasks.create_helpdesk_ticket_task',
                              'tasks.trigger_submission_transfer', ]
        self.assertEqual(3, len(task_reports))
        for t in task_reports:
            self.assertIn(t.task_name, expected_tasknames)

    @responses.activate
    def test_no_release_initial_chain(self):
        self._add_create_ticket_response()
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))
        min_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'GENERIC',
                'release': False,
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            }))
        self.assertEqual(201, min_response.status_code)
        task_reports = TaskProgressReport.objects.all()
        expected_tasknames = ['tasks.get_user_email_task',
                              'tasks.create_helpdesk_ticket_task',
                              'tasks.trigger_submission_transfer', ]
        self.assertEqual(3, len(task_reports))
        for t in task_reports:
            self.assertIn(t.task_name, expected_tasknames)

    @responses.activate
    def test_max_post_with_release_initial_chain(self):
        self._add_create_ticket_response()
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))
        max_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': True,
                'data': _get_submission_request_data()
            }))
        self.assertEqual(201, max_response.status_code)
        task_reports = TaskProgressReport.objects.all()
        expected_tasknames = ['tasks.get_user_email_task',
                              'tasks.create_helpdesk_ticket_task',
                              'tasks.trigger_submission_transfer',
                              'tasks.create_broker_objects_from_submission_data_task',
                              'tasks.prepare_ena_submission_data_task',
                              'tasks.check_on_hold_status_task',
                              'tasks.update_helpdesk_ticket_task', ]
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(6, len(tprs))
        for t in task_reports:
            self.assertIn(t.task_name, expected_tasknames)

    @responses.activate
    def test_max_post_without_release_initial_chain(self):
        self._add_create_ticket_response()
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))
        max_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': _get_submission_request_data()
            }))
        self.assertEqual(201, max_response.status_code)
        task_reports = TaskProgressReport.objects.all()
        expected_tasknames = ['tasks.get_user_email_task',
                              'tasks.create_helpdesk_ticket_task',
                              'tasks.trigger_submission_transfer', ]
        self.assertEqual(3, len(task_reports))
        for t in task_reports:
            self.assertIn(t.task_name, expected_tasknames)

    @responses.activate
    def test_put_initial_chain_no_release(self):
        self._add_create_ticket_response()
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))
        self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': _get_submission_request_data()
            }))
        submission = Submission.objects.first()
        self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            data={'target': 'ENA', 'release': False, 'data': {
                'requirements': {'title': 'A Title 0815',
                                 'description': 'A Description 2'}}},
            format='json', )
        task_reports = TaskProgressReport.objects.all()
        # trigger_submission_transfer from initial post
        # trigger_submission_transfer_for_updates
        expected_tasknames = ['tasks.get_user_email_task',
                              'tasks.create_helpdesk_ticket_task',
                              'tasks.trigger_submission_transfer',
                              'tasks.trigger_submission_transfer_for_updates',
                              'tasks.update_helpdesk_ticket_task', ]
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(4, len(tprs))
        for t in task_reports:
            self.assertIn(t.task_name, expected_tasknames)


class TestTasks(TestCase):

    @classmethod
    def setUpTestData(cls):
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            name__endswith='upload')
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
            'file': f,
        }

    @staticmethod
    def _delete_test_data():
        PrimaryDataFile.objects.all().delete()


class TestTasksTriggeredBySubmissionSave(TestTasks):

    def test_center_name_change(self):
        center_name, created = CenterName.objects.get_or_create(
            center_name='ABCD')
        center_name_2, created = CenterName.objects.get_or_create(
            center_name='EFGH')
        sub = Submission.objects.first()
        text_datas = sub.auditabletextdata_set.all()
        self.assertEqual(0, len(text_datas))

        sub.center_name = center_name
        sub.save()
        text_datas = sub.auditabletextdata_set.all()
        len_text_datas = len(text_datas)
        self.assertLess(0, len_text_datas)
        for a in text_datas:
            self.assertIn('center_name="ABCD"', a.text_data)

        sub.center_name = center_name_2
        sub.save()
        text_datas = sub.auditabletextdata_set.all()
        self.assertEqual(len_text_datas, len(text_datas))
        for a in text_datas:
            self.assertIn('center_name="EFGH"', a.text_data)

    def test_center_name_change_without_brokerobjects(self):
        submission = SubmissionTest._create_submission_via_serializer()
        center_name, created = CenterName.objects.get_or_create(
            center_name='ABCD')
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(0, len(tprs))
        submission.brokerobject_set.all().delete()
        submission.center_name = center_name
        submission.save()
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(2, len(tprs))
        task_report = tprs.first()
        self.assertEqual(TaskProgressReport.CANCELLED,
                         task_report.task_return_value)
        task_report = tprs.last()
        self.assertEqual(TaskProgressReport.CANCELLED,
                         task_report.task_return_value)


class TestSubmissionTransferTasks(TestTasks):

    def test_prepare_ena_submission_data_task(self):
        submission = Submission.objects.first()
        text_data = AuditableTextData.objects.all()
        self.assertEqual(0, len(text_data))
        result = prepare_ena_submission_data_task.apply_async(
            kwargs={
                'submission_id': submission.pk
            }
        )
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
    @responses.activate
    def test_process_ena_response_task_successful(self):
        submission = Submission.objects.first()
        # fix ids to match ena_response.xml test-data aliases when running
        # multiple tests
        related_broker_objects = BrokerObject.objects.filter(
            submissions=submission)
        for i in range(0, len(related_broker_objects)):
            related_broker_objects[i].pk = i + 1
            related_broker_objects[i].save()

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


class TestSubmissionPreparationTasks(TestTasks):

    def test_create_broker_objects_from_submission_data_task(self):
        submission = Submission.objects.first()
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
        conf = SiteConfiguration.objects.first()
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


class TestPortalServiceTasks(TestTasks):

    # TODO: check all test, even if passing, for json exceptions that need repsonse mock
    @responses.activate
    def test_get_user_email_task_success(self):
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
            json={'firstname': 'Marc', 'middlename': '',
                  'emailaddress': 'maweber@mpi-bremen.de',
                  'fullname': 'Marc Weber',
                  'screenname': 'maweber', 'userid': 16250,
                  'lastname': 'Weber'})

        result = get_user_email_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(result.successful())
        self.assertDictEqual({'user_full_name': 'Marc Weber',
                              'user_email': 'maweber@mpi-bremen.de',
                              'last_name': '', 'first_name': ''}, result.get())

    @responses.activate
    def test_get_user_email_task_no_gfbio_services(self):
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
        result = get_user_email_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @responses.activate
    def test_get_user_email_task_error_response(self):
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
        result = get_user_email_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @responses.activate
    def test_get_user_email_task_corrupt_response(self):
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

        result = get_user_email_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @responses.activate
    def test_get_user_email_task_400_response(self):
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
        result = get_user_email_task.apply_async(
            kwargs={
                'submission_id': submission.id
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())


class TestGFBioHelpDeskTasks(TestTasks):

    @responses.activate
    def test_create_helpdesk_ticket_task_success(self):
        submission = Submission.objects.last()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            HELPDESK_API_SUB_URL),
            json={'bla': 'blubb'},
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
    def test_create_helpdesk_ticket_task_for_unknown_reporter(self):
        submission = Submission.objects.last()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            HELPDESK_API_SUB_URL),
            body='{"errorMessages":[],"errors":{"reporter":"The reporter specified is not a user."}}',
            status=400)
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            HELPDESK_API_SUB_URL),
            body='',
            status=200)
        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.successful())
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(2, len(tprs))

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
            json={'bla': 'blubb'},
            status=200)
        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual(1, len(submission.additionalreference_set.all()))

    @responses.activate
    def test_update_helpdesk_ticket_task_success(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = '{0}{1}/{2}'.format(
            site_config.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY'
        )
        responses.add(responses.PUT, url, body='', status=204)
        data = {
            'fields': {
                'customfield_10205': 'New Name Marc Weber, Alfred E. Neumann',
            }
        }
        result = update_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.id,
                'data': data
            }
        )
        self.assertTrue(result.successful())
        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertTrue(request_logs[0].url.endswith('FAKE_KEY'))

    @responses.activate
    def test_comment_helpdesk_ticket_task_success(self):
        site_config = SiteConfiguration.objects.first()
        url = '{0}{1}/{2}/{3}'.format(
            site_config.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json={'bla': 'blubb'}, status=200)
        submission = Submission.objects.first()
        result = comment_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.id,
                'comment_body': 'test-comment'
            }
        )
        self.assertTrue(result.successful())
        self.assertFalse(result.get())

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
                      json=_get_jira_attach_response(),
                      status=200)
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
        url = reverse('brokerage:submissions_upload', kwargs={
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
        data['attach_to_ticket'] = True
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
                'submission_upload_id': SubmissionUpload.objects.first().pk,
            }
        )
        self.assertTrue(result.successful())
        self.assertTrue(result.get())
        submission_upload = SubmissionUpload.objects.first()
        self.assertEqual(10814, submission_upload.attachment_id)

    @responses.activate
    def test_delete_attachment_task(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
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
        data['attach_to_ticket'] = True
        token = Token.objects.create(user=submission.site)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        # POST will already trigger attach_file_to_helpdesk_ticket_task
        # via PrimaryDataFile save method
        client.post(url, data, format='multipart')
        # TODO: everything above is only preparation to setup SubmissionUpload
        #   properly
        submission_upload = SubmissionUpload.objects.first()
        url = '{0}{1}/{2}'.format(
            site_config.helpdesk_server.url,
            HELPDESK_API_ATTACHMENT_URL,
            submission_upload.attachment_id)
        responses.add(responses.DELETE, url, body=b'', status=204)
        result = delete_attachment_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'attachment_id': SubmissionUpload.objects.first().attachment_id,
            }
        )
        self.assertTrue(result.successful())
        self.assertTrue(result.get())

    @patch(
        'gfbio_submissions.brokerage.tasks.apply_timebased_task_retry_policy')
    def test_attach_primarydatafile_without_ticket(self, mock):
        submission = Submission.objects.last()
        attach_file_to_helpdesk_ticket_task.apply_async(
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
                      json={'bla': 'blubb'},
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
        responses.add(responses.POST, url, status=400, json={'bla': 'blubb'})
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
        responses.add(responses.POST, url, status=500, json={'bla': 'blubb'})
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
        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())

    @responses.activate
    def test_create_helpdesk_ticket_task_server_error(self):
        submission = Submission.objects.last()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            HELPDESK_API_SUB_URL),
            json={},
            status=500)
        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'summary': 'Test',
                'description': 'Test'

            }
        )
        self.assertFalse(result.successful())


class TestPangaeaTasks(TestTasks):

    @responses.activate
    def test_request_pangaea_login_token_task_success(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            site_config.pangaea_server.url,
            body=_get_pangaea_soap_response(),
            status=200)
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        result = request_pangaea_login_token_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual('f3d7aca208aaec8954d45bebc2f59ba1522264db',
                         result.get())

        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('https://www.example.com',
                         request_logs.first().url)

    @responses.activate
    def test_request_pangaea_login_token_task_client_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            site_config.pangaea_server.url,
            body='',
            status=400)
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        result = request_pangaea_login_token_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual('', result.get())
        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('https://www.example.com',
                         request_logs.first().url)

    @responses.activate
    def test_request_pangaea_login_token_task_server_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            site_config.pangaea_server.url,
            status=500,
            body='')
        result = request_pangaea_login_token_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertFalse(result.successful())

        request_logs = RequestLog.objects.all()
        # 3 logentries for 3 retries
        self.assertEqual(3, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('https://www.example.com',
                         request_logs.first().url)

    @responses.activate
    def test_create_pangaea_jira_ticket_task_success(self):
        submission = Submission.objects.first()
        login_token = 'f3d7aca208aaec8954d45bebc2f59ba1522264db'
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            PANGAEA_ISSUE_BASE_URL,
            json={'id': '31444', 'key': 'PDI-11735',
                  'self': 'http://issues.pangaea.de/rest/api/2/issue/31444'},
            status=201)
        result = create_pangaea_jira_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'login_token': login_token
            }
        )
        res = result.get()
        self.assertTrue(result.successful())
        self.assertDictEqual(
            {'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
             'ticket_key': 'PDI-11735'}, res)
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(3, len(additional_references))
        ref = additional_references.last()
        self.assertEqual('PDI-11735', ref.reference_key)

        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
                         request_logs.first().url)

    @responses.activate
    def test_create_pangaea_jira_ticket_task_client_error(self):
        submission = Submission.objects.first()
        len_before = len(submission.additionalreference_set.all())
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            PANGAEA_ISSUE_BASE_URL,
            status=400)
        result = create_pangaea_jira_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db'

            }
        )
        self.assertTrue(result.successful())
        self.assertIsNone(result.get())
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(len_before, len(additional_references))
        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
                         request_logs.first().url)

    @responses.activate
    def test_create_pangaea_jira_ticket_task_server_error(self):
        submission = Submission.objects.first()
        len_before = len(submission.additionalreference_set.all())
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            PANGAEA_ISSUE_BASE_URL,
            status=500)
        result = create_pangaea_jira_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db'

            }
        )
        self.assertFalse(result.successful())
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(len_before, len(additional_references))

        request_logs = RequestLog.objects.all()
        self.assertEqual(3, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
                         request_logs.first().url)

    @responses.activate
    def test_attach_file_to_pangaea_ticket_task_success(self):
        submission = Submission.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
                                        'PANGAEA_FAKE_KEY'),
            json=_get_pangaea_attach_response(),
            status=200)
        result = attach_file_to_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                }
            }
        )
        res = result.get()
        self.assertTrue(result.successful())
        self.assertDictEqual(
            {'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
             'ticket_key': 'PANGAEA_FAKE_KEY'}, res)
        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
                                        'PANGAEA_FAKE_KEY'),
            request_logs.first().url)

    @responses.activate
    def test_attach_file_to_pangaea_ticket_task_client_error(self):
        submission = Submission.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
                                        'PANGAEA_FAKE_KEY'),
            json={},
            status=400)
        result = attach_file_to_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                }
            }
        )
        res = result.get()
        self.assertTrue(result.successful())
        self.assertDictEqual(
            {'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
             'ticket_key': 'PANGAEA_FAKE_KEY'}, res)
        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
                                        'PANGAEA_FAKE_KEY'),
            request_logs.first().url)

    @responses.activate
    def test_attach_file_to_pangaea_ticket_task_server_error(self):
        submission = Submission.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
                                        'PANGAEA_FAKE_KEY'),
            json={},
            status=500)
        result = attach_file_to_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                }
            }
        )
        self.assertFalse(result.successful())
        request_logs = RequestLog.objects.all()
        self.assertEqual(3, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
                                        'PANGAEA_FAKE_KEY'),
            request_logs.first().url)

    @responses.activate
    def test_comment_on_pangaea_ticket_task_success(self):
        submission = Submission.objects.first()
        submission.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB20411',
            outgoing_request_id=uuid.uuid4()
        )
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
                                    'PANGAEA_FAKE_KEY'),
            json=_get_pangaea_comment_response(),
            status=200)
        result = comment_on_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                },
                'comment_body': 'ACC 12345'
            }
        )
        self.assertTrue(result.successful())
        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL, 'PANGAEA_FAKE_KEY'),
            request_logs.first().url)

    @responses.activate
    def test_comment_on_pangaea_ticket_task_client_error(self):
        submission = Submission.objects.first()
        submission.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB20411',
            outgoing_request_id=uuid.uuid4()
        )
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
                                    'PANGAEA_FAKE_KEY'),
            status=400)
        result = comment_on_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                },
                'comment_body': 'ACC 12345'
            }
        )
        # expects results from previous chain element
        self.assertTrue(result.successful())
        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
                                    'PANGAEA_FAKE_KEY'),
            request_logs.first().url)

    @responses.activate
    def test_comment_on_pangaea_ticket_task_server_error(self):
        submission = Submission.objects.first()
        submission.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB20411',
            outgoing_request_id=uuid.uuid4()
        )
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(
            responses.POST,
            '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
                                    'PANGAEA_FAKE_KEY'),
            status=500)
        result = comment_on_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                },
                'comment_body': 'ACC 12345'
            }
        )
        self.assertFalse(result.successful())
        request_logs = RequestLog.objects.all()
        self.assertEqual(3, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
                                    'PANGAEA_FAKE_KEY'),
            request_logs.first().url)

    @responses.activate
    def test_check_for_pangaea_doi_task_success(self, ):
        site_config = SiteConfiguration.objects.first()
        persistent_identifiers = PersistentIdentifier.objects.all()
        self.assertEqual(0, len(persistent_identifiers))
        responses.add(
            responses.POST,
            site_config.pangaea_server.url,
            body=_get_pangaea_soap_response(),
            status=200)
        responses.add(
            responses.GET,
            '{0}{1}'.format(PANGAEA_ISSUE_BASE_URL, 'PANGAEA_FAKE_KEY'),
            json=_get_pangaea_ticket_response(),
            status=200)

        responses.add(
            responses.POST,
            '{0}{1}/{2}/{3}'.format(
                site_config.helpdesk_server.url,
                HELPDESK_API_SUB_URL,
                'FAKE_KEY',
                HELPDESK_COMMENT_SUB_URL),
            json={'bla': 'blubb'},
            status=200)
        result = check_for_pangaea_doi_task.apply_async(
            kwargs={
                'resource_credential_id': site_config.pangaea_server.pk
            }
        )
        self.assertTrue(result.successful())
        persistent_identifiers = PersistentIdentifier.objects.all()
        self.assertEqual(1, len(persistent_identifiers))
        pid = persistent_identifiers.first()
        self.assertEqual('PAN', pid.archive)
        self.assertEqual('DOI', pid.pid_type)
        self.assertEqual('doi:10.1594/PANGAEA.786576', pid.pid)


class TestTaskChains(TestTasks):
    @responses.activate
    def test_pangaea_chain(self):
        submission = Submission.objects.first()
        responses.add(
            responses.POST,
            PANGAEA_ISSUE_BASE_URL,
            json={'id': '31444', 'key': 'PANGAEA_FAKE_KEY',
                  'self': 'http://issues.pangaea.de/rest/api/2/issue/31444'},
            status=201)
        responses.add(
            responses.POST,
            '{0}{1}/attachments'.format(
                PANGAEA_ISSUE_BASE_URL,
                'PANGAEA_FAKE_KEY'),
            json=_get_pangaea_attach_response(),
            status=200)
        result = chain(
            create_pangaea_jira_ticket_task.s(
                submission_id=submission.pk,
                login_token='f3d7aca208aaec8954d45bebc2f59ba1522264db'
            ),
            attach_file_to_pangaea_ticket_task.s(
                submission_id=submission.pk,
            )

        )()
        self.assertTrue(result.successful())

    @responses.activate
    def test_initiate_submission_chain_success(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()

        len_auditable_data = len(AuditableTextData.objects.all())

        data = json.dumps({
            'userid': 23
        })
        url = '{0}/api/jsonws/' \
              'GFBioProject-portlet.userextension/get-user-by-id/' \
              'request-json/{1}'.format(site_config.gfbio_server.url,
                                        data)

        responses.add(responses.POST, url, status=200,
                      json={'firstname': 'Marc', 'middlename': '',
                            'emailaddress': 'maweber@mpi-bremen.de',
                            'fullname': 'Marc Weber',
                            'screenname': 'maweber', 'userid': 16250,
                            'lastname': 'Weber'})

        responses.add(responses.POST,
                      '{0}{1}'.format(site_config.helpdesk_server.url,
                                      HELPDESK_API_SUB_URL
                                      ),
                      json={'bla': 'blubb'},
                      status=200)

        responses.add(
            responses.POST,
            '{0}{1}/{2}/{3}'.format(
                site_config.helpdesk_server.url,
                HELPDESK_API_SUB_URL,
                'FAKE_KEY',
                HELPDESK_COMMENT_SUB_URL,
            ),
            json={'bla': 'blubb'},
            status=200)

        trigger_submission_transfer(submission_id=submission.id)

        self.assertLess(len_auditable_data,
                        len(AuditableTextData.objects.all()))


class TestTaskProgressReportInTasks(TestTasks):

    @staticmethod
    def _run_task(submission_id=1):
        create_broker_objects_from_submission_data_task.apply_async(
            kwargs={
                'submission_id': submission_id
            }
        )

    @responses.activate
    def test_create_with_retry_task(self):
        submission = Submission.objects.first()
        submission.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB20411',
            outgoing_request_id=uuid.uuid4()
        )
        responses.add(
            responses.POST,
            '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
                                    'PANGAEA_FAKE_KEY'),
            status=500)
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(0, len(tprs))
        comment_on_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                },
                'comment_body': 'ACC 12345'
            }
        )
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(1, len(tprs))
        reports = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        report = reports.last()
        self.assertEqual('RETRY', report.status)
        self.assertEqual('500', report.task_exception)

    def test_task_report_creation(self):
        submission = Submission.objects.first()
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(0, len(tprs))

        self._run_task(submission_id=submission.pk)
        task_reports = TaskProgressReport.objects.all()

        self.assertEqual(2, len(task_reports))
        report = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task').first()
        self.assertEqual(
            'tasks.create_broker_objects_from_submission_data_task',
            report.task_name
        )

    def test_task_report_update_after_return(self):
        self._run_task(submission_id=Submission.objects.first().pk)
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(1, len(tprs))
        tpr = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task').first()
        self.assertEqual('SUCCESS', tpr.status)
        self.assertNotEqual('', tpr.task_kwargs)

    def test_task_report_update_invalid_task_id(self):
        self._run_task(submission_id=Submission.objects.first().pk)
        report, created = TaskProgressReport.objects.update_report_after_return(
            status='TEST',
            task_id=uuid4(),
        )
        self.assertTrue(created)
        self.assertEqual('unnamed_task', report.__str__())

    def test_task_report_update_on_wrong_submission(self):
        self._run_task(submission_id=1111)
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(1, len(tprs))
        tpr = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task').first()
        self.assertEqual('SUCCESS', tpr.status)
        self.assertEqual('CANCELLED', tpr.task_return_value)

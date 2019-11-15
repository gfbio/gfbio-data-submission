# -*- coding: utf-8 -*-
import base64
import json
import uuid
from unittest import skip
from unittest.mock import patch
from urllib.parse import quote
from uuid import uuid4

import responses
from celery import chain
from django.contrib.auth.models import Permission
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIRequestFactory, APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    JIRA_ISSUE_URL, JIRA_COMMENT_SUB_URL, JIRA_ATTACHMENT_SUB_URL, \
    JIRA_ATTACHMENT_URL, JIRA_USERNAME_URL_TEMPLATE, \
    JIRA_USERNAME_URL_FULLNAME_TEMPLATE, JIRA_FALLBACK_USERNAME, \
    SUBMISSION_DELAY, JIRA_FALLBACK_EMAIL
from gfbio_submissions.brokerage.models import ResourceCredential, \
    SiteConfiguration, Submission, AuditableTextData, PersistentIdentifier, \
    BrokerObject, TaskProgressReport, AdditionalReference, RequestLog, \
    CenterName, SubmissionUpload
from gfbio_submissions.brokerage.tasks import prepare_ena_submission_data_task, \
    transfer_data_to_ena_task, process_ena_response_task, \
    create_broker_objects_from_submission_data_task, check_on_hold_status_task, \
    create_submission_issue_task, \
    add_accession_to_submission_issue_task, attach_to_submission_issue_task, \
    add_pangaealink_to_submission_issue_task, \
    create_pangaea_issue_task, attach_to_pangaea_issue_task, \
    add_accession_to_pangaea_issue_task, check_for_pangaea_doi_task, \
    trigger_submission_transfer, \
    delete_submission_issue_attachment_task, add_posted_comment_to_issue_task, \
    update_submission_issue_task, get_gfbio_helpdesk_username_task
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.tests.utils import \
    _get_submission_request_data, _get_ena_xml_response, \
    _get_ena_error_xml_response, _get_jira_attach_response, \
    _get_pangaea_soap_response, _get_pangaea_attach_response, \
    _get_pangaea_comment_response, _get_pangaea_ticket_response, \
    _get_jira_issue_response
from gfbio_submissions.submission_ui.configuration.settings import HOSTING_SITE
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
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:password').decode('utf-8')
        )
        cls.api_client = client

    def _add_jira_client_responses(self):
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(self.site_config.helpdesk_server.url),
            status=200,
        )

    def _add_create_ticket_response(self):
        self._add_jira_client_responses()
        responses.add(
            responses.POST,
            '{0}{1}'.format(
                self.site_config.helpdesk_server.url,
                JIRA_ISSUE_URL
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
        expected_tasknames = ['tasks.get_gfbio_helpdesk_username_task',
                              'tasks.create_submission_issue_task',
                              'tasks.check_for_molecular_content_in_submission_task',
                              'tasks.trigger_submission_transfer', ]
        self.assertEqual(4, len(task_reports))
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
        expected_tasknames = ['tasks.get_gfbio_helpdesk_username_task',
                              'tasks.create_submission_issue_task',
                              'tasks.check_for_molecular_content_in_submission_task',
                              'tasks.trigger_submission_transfer', ]
        self.assertEqual(4, len(task_reports))
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
        expected_tasknames = ['tasks.get_gfbio_helpdesk_username_task',
                              'tasks.create_submission_issue_task',
                              'tasks.check_for_molecular_content_in_submission_task',
                              'tasks.trigger_submission_transfer',
                              'tasks.create_broker_objects_from_submission_data_task',
                              'tasks.prepare_ena_submission_data_task',
                              'tasks.check_on_hold_status_task',
                              'tasks.update_helpdesk_ticket_task', ]
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(7, len(tprs))
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
        expected_tasknames = ['tasks.get_gfbio_helpdesk_username_task',
                              'tasks.create_submission_issue_task',
                              'tasks.check_for_molecular_content_in_submission_task',
                              'tasks.trigger_submission_transfer', ]
        self.assertEqual(4, len(task_reports))
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
        responses.add(responses.PUT,
                      'https://www.example.com/rest/api/2/issue/no_key_available',
                      body='', status=200)
        self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            data={'target': 'ENA', 'release': False, 'data': {
                'requirements': {'title': 'A Title 0815',
                                 'description': 'A Description 2'}}},
            format='json', )
        task_reports = TaskProgressReport.objects.all()
        expected_tasknames = ['tasks.get_gfbio_helpdesk_username_task',
                              'tasks.create_submission_issue_task',
                              'tasks.update_submission_issue_task',
                              'tasks.trigger_submission_transfer',
                              'tasks.check_for_molecular_content_in_submission_task',
                              'tasks.trigger_submission_transfer_for_updates',
                              'tasks.update_helpdesk_ticket_task', ]
        self.assertEqual(7, len(task_reports))
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
        user.goesternid = '0815'
        user.name = 'Kevin Horstmeier'
        user.email = 'khors@me.de'
        user.save()
        user.user_permissions.add(*permissions)

        site = User.objects.create(
            username=HOSTING_SITE
        )
        site.name = 'hosting site'
        site.email = 'hosting@site.de'
        site.is_site = True
        site.is_user = False
        site.save()
        site.user_permissions.add(*permissions)

        external_site = User.objects.create(
            username='external_site'
        )
        external_site.name = 'external site'
        external_site.email = 'external@site.de'
        external_site.is_site = True
        external_site.is_user = False
        external_site.save()
        external_site.user_permissions.add(*permissions)

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
        submission.site = site
        submission.save()

        submission = SubmissionTest._create_submission_via_serializer()
        submission.submitting_user = '16250'
        submission.site = external_site
        submission.save()
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        # cls.default_site_config = SiteConfiguration.objects.create(
        #     title='default',
        #     site=None,
        #     ena_server=resource_cred,
        #     pangaea_token_server=resource_cred,
        #     pangaea_jira_server=resource_cred,
        #     helpdesk_server=resource_cred,
        #     comment='Default configuration',
        #     contact='kevin@horstmeier.de'
        # )
        cls.default_site_config = SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            site=site,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
            contact='kevin@horstmeier.de'
        )
        cls.second_site_config = SiteConfiguration.objects.create(
            title='default-2',
            site=external_site,
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration 2',
        )
        cls.issue_json = _get_jira_issue_response()
        cls.pangaea_issue_json = _get_pangaea_ticket_response()

    @classmethod
    def _create_test_data(cls, path):
        f = open(path, 'w')
        f.write('test123\n')
        f.close()
        f = open(path, 'rb')
        return {
            'file': f,
        }

    def _add_default_pangaea_responses(self):
        responses.add(
            responses.POST,
            self.default_site_config.pangaea_token_server.url,
            body=_get_pangaea_soap_response(),
            status=200)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(
                self.default_site_config.pangaea_jira_server.url),
            status=200,
        )


@skip('center-name feature was removed in GFBIO-2556')
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
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
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
        ).apply()
        # ret_val = result.get()
        self.assertEqual('RETRY', submission.taskprogressreport_set.filter(
            task_name='tasks.transfer_data_to_ena_task').first().status)

    # TODO: add test where nonsense content is returned like '' or {}
    @responses.activate
    def test_process_ena_response_task_successful(self):
        responses.add(responses.PUT,
                      'https://www.example.com/rest/api/2/issue/FAKE_KEY',
                      body='', status=200)
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


class TestGFBioHelpDeskTasks(TestTasks):

    @classmethod
    def _add_success_responses(cls):
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(
                cls.default_site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            '{0}{1}'.format(cls.default_site_config.helpdesk_server.url,
                            JIRA_ISSUE_URL),
            json=cls.issue_json,
            status=200)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/SAND-1661'.format(
                cls.default_site_config.helpdesk_server.url),
            json=cls.issue_json
        )

    @classmethod
    def _add_client_fail_responses(cls):
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(
                cls.default_site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            '{0}{1}'.format(cls.default_site_config.helpdesk_server.url,
                            JIRA_ISSUE_URL),
            json={},
            status=400)

    @classmethod
    def _add_server_fail_responses(cls):
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(
                cls.default_site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            '{0}{1}'.format(cls.default_site_config.helpdesk_server.url,
                            JIRA_ISSUE_URL),
            json={},
            status=500)

    @classmethod
    def _add_comment_reponses(cls):
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
        )
        return '{0}{1}/{2}/{3}'.format(
            site_config.helpdesk_server.url,
            JIRA_ISSUE_URL,
            'FAKE_KEY',
            JIRA_COMMENT_SUB_URL,
        )

    @classmethod
    def _add_put_issue_responses(cls, put_status_code=204):
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(
                cls.default_site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/SAND-1661'.format(
                cls.default_site_config.helpdesk_server.url),
            json=cls.issue_json
        )
        url = '{0}/rest/api/2/issue/16814'.format(
            cls.default_site_config.helpdesk_server.url)
        responses.add(responses.PUT, url, body='', status=put_status_code)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/16814'.format(
                cls.default_site_config.helpdesk_server.url),
            status=200,
            json=cls.issue_json,
        )

    # TODO: may these have to be moved to other test class (Taskprogressreport ...)
    #   or removed ... Now for testing behaviour on GFBIO-2589
    @responses.activate
    def test_tpr_task_success(self):
        self._add_success_responses()
        submission = Submission.objects.last()
        self.assertEqual(0, len(TaskProgressReport.objects.all()))
        result = create_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual(1, len(TaskProgressReport.objects.all()))

    @responses.activate
    def test_tpr_task_client_fail(self):
        self._add_client_fail_responses()
        submission = Submission.objects.last()
        self.assertEqual(0, len(TaskProgressReport.objects.all()))
        result = create_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertTrue(result.successful())

    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    @responses.activate
    def test_tpr_task_server_fail(self):
        self._add_server_fail_responses()
        submission = Submission.objects.last()
        self.assertEqual(0, len(TaskProgressReport.objects.all()))
        result = create_submission_issue_task.apply(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertFalse(result.successful())

    @responses.activate
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    def test_tpr_add_pangaea_link_server_error(self):
        submission = Submission.objects.first()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(
                self.default_site_config.helpdesk_server.url),
            status=200,
        )
        url = '{0}{1}/{2}/{3}'.format(
            self.default_site_config.helpdesk_server.url,
            JIRA_ISSUE_URL,
            'FAKE_KEY',
            JIRA_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, status=500,
                      json={'bla': 'blubb'})
        result = add_pangaealink_to_submission_issue_task.apply(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        tpr = TaskProgressReport.objects.first()
        self.assertEqual('RETRY', tpr.status)
        self.assertEqual('tasks.add_pangaealink_to_submission_issue_task',
                         tpr.task_name)
        self.assertEqual(TaskProgressReport.CANCELLED, tpr.task_return_value)

    @responses.activate
    def test_tpr_add_pangaea_link_client_error(self):
        submission = Submission.objects.first()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(
                self.default_site_config.helpdesk_server.url),
            status=200,
        )
        url = '{0}{1}/{2}/{3}'.format(
            self.default_site_config.helpdesk_server.url,
            JIRA_ISSUE_URL,
            'FAKE_KEY',
            JIRA_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, status=400, json={'bla': 'blubb'})
        result = add_pangaealink_to_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        tpr = TaskProgressReport.objects.first()
        print(tpr.__dict__)
        self.assertEqual('tasks.add_pangaealink_to_submission_issue_task',
                         tpr.task_name)
        self.assertEqual(TaskProgressReport.CANCELLED, tpr.task_return_value)
        self.assertTrue(result.successful())

    @responses.activate
    # @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
    #                    CELERY_TASK_EAGER_PROPAGATES=False)
    def test_tpr_task_success_failing_kwargs(self):
        self._add_success_responses()
        submission = Submission.objects.last()
        self.assertEqual(0, len(TaskProgressReport.objects.all()))

        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(
                self.default_site_config.helpdesk_server.url),
            status=200,
        )
        url = '{0}{1}/{2}/{3}'.format(
            self.default_site_config.helpdesk_server.url,
            JIRA_ISSUE_URL,
            'FAKE_KEY',
            JIRA_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, status=400, json={'bla': 'blubb'})
        result = add_pangaealink_to_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk + 22,
            }
        )
        # self.assertTrue(result.successful())
        self.assertEqual(1, len(TaskProgressReport.objects.all()))

    # TODO: compare todo above ------------------------------------------------

    @responses.activate
    def test_create_submission_issue_task_success(self):
        submission = Submission.objects.last()
        # TODO: replace bay self.default_site_config
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            JIRA_ISSUE_URL),
            json=self.issue_json,
            status=200)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/SAND-1661'.format(
                site_config.helpdesk_server.url),
            json=self.issue_json
        )

        self.assertEqual(0, len(submission.additionalreference_set.all()))
        result = create_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual(1, len(submission.additionalreference_set.all()))

    @responses.activate
    def test_create_submission_issue_task_for_unknown_reporter(self):
        submission = Submission.objects.last()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            JIRA_ISSUE_URL),
            body='{"errorMessages":[],"errors":{"reporter":"The reporter specified is not a user."}}',
            status=400)
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            JIRA_ISSUE_URL),
            json=self.issue_json,
            status=200)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/SAND-1661'.format(
                site_config.helpdesk_server.url),
            json=self.issue_json
        )
        result = create_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.successful())
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(1, len(tprs))
        self.assertEqual(1, len(submission.additionalreference_set.all()))

    @responses.activate
    def test_create_submission_issue_task_unicode_text(self):
        submission = Submission.objects.last()
        site_config = SiteConfiguration.objects.first()
        self.assertEqual(0, len(submission.additionalreference_set.all()))
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            JIRA_ISSUE_URL
                            ),
            json=self.issue_json,
            status=200)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/SAND-1661'.format(
                site_config.helpdesk_server.url),
            json=self.issue_json
        )
        result = create_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual(1, len(submission.additionalreference_set.all()))

    @responses.activate
    def test_add_accession_to_submission_issue_task_success(self):
        site_config = SiteConfiguration.objects.first()
        url = '{0}{1}/{2}/{3}'.format(
            site_config.helpdesk_server.url,
            JIRA_ISSUE_URL,
            'FAKE_KEY',
            JIRA_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json={'bla': 'blubb'}, status=200)
        submission = Submission.objects.first()
        result = add_accession_to_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
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
            JIRA_ISSUE_URL,
            'FAKE_KEY',
            JIRA_ATTACHMENT_SUB_URL,
        )
        responses.add(responses.POST,
                      url,
                      json=_get_jira_attach_response(),
                      status=200)
        result = attach_to_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())
        self.assertFalse(result.get())

    @responses.activate
    def test_attach_to_helpdesk_ticket_task_with_submission_upload(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()

        # self._add_default_pangaea_responses()

        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
        )

        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/FAKE_KEY'.format(
                site_config.helpdesk_server.url),
            json=self.issue_json,
        )

        #  https://www.example.com/rest/api/2/issue/SAND-1661/attachments

        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)

        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          JIRA_ISSUE_URL,
                          'SAND-1661',
                          JIRA_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        data['attach_to_ticket'] = True
        token = Token.objects.create(user=submission.site)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        # POST will already trigger attach_to_submission_issue_task
        # via PrimaryDataFile save method
        client.post(url, data, format='multipart')

        # attach_to_submission_issue_task was already triggered by POST above
        # via SubmissionUpload save method
        result = attach_to_submission_issue_task.apply_async(
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
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/FAKE_KEY'.format(
                site_config.helpdesk_server.url),
            json=_get_jira_issue_response()
            # json={}
        )
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.helpdesk_server.url,
                          JIRA_ISSUE_URL,
                          'SAND-1661',
                          JIRA_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = self._create_test_data('/tmp/test_primary_data_file')
        data['attach_to_ticket'] = True
        token = Token.objects.create(user=submission.site)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        # POST will already trigger attach_to_submission_issue_task
        # via PrimaryDataFile save method
        client.post(url, data, format='multipart')
        # TODO: everything above is only preparation to setup SubmissionUpload
        #   properly
        submission_upload = SubmissionUpload.objects.first()
        url = '{0}{1}/{2}'.format(
            site_config.helpdesk_server.url,
            JIRA_ATTACHMENT_URL,
            submission_upload.attachment_id)
        responses.add(responses.DELETE, url, body=b'', status=204)
        result = delete_submission_issue_attachment_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'attachment_id': SubmissionUpload.objects.first().attachment_id,
            }
        )
        self.assertTrue(result.successful())
        self.assertTrue(result.get())

    # TODO: take this mock concept for testing retry, and add more tests for
    #  other tasks with retry policy(s)
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    @patch(
        'gfbio_submissions.brokerage.utils.task_utils.send_task_fail_mail')
    def test_attach_primarydatafile_without_ticket(self, mock):
        submission = Submission.objects.last()
        # omiting submission_upload_id, defaults this parameter to None
        attach_to_submission_issue_task.apply(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(mock.called)

    @responses.activate
    def test_add_pangaealink_to_submission_issue_task_success(self):
        submission = Submission.objects.first()
        url = self._add_comment_reponses()
        responses.add(responses.POST, url,
                      json={'bla': 'blubb'},
                      status=200)

        result = add_pangaealink_to_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.successful())

    @responses.activate
    def test_add_pangaealink_to_helpdesk_ticket_task_client_error(self):
        submission = Submission.objects.first()
        url = self._add_comment_reponses()
        responses.add(responses.POST, url, status=400, json={'bla': 'blubb'})
        result = add_pangaealink_to_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())

    # FIXME: what about retries ? are they executed ?
    @responses.activate
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    def test_add_pangaealink_to_helpdesk_ticket_task_server_error(self):
        submission = Submission.objects.first()
        url = self._add_comment_reponses()
        responses.add(responses.POST, url, status=500, json={'bla': 'blubb'})
        result = add_pangaealink_to_submission_issue_task.apply(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertFalse(result.successful())

    @responses.activate
    def test_add_posted_comment_to_issue_task_success(self):
        submission = Submission.objects.first()
        url = self._add_comment_reponses()
        responses.add(responses.POST, url,
                      json={'bla': 'blubb'},
                      status=200)
        result = add_posted_comment_to_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
                'comment': 'a comment'
            }
        )
        self.assertTrue(result.successful())
        self.assertTrue(result.get())

    @responses.activate
    def test_add_posted_comment_to_issue_task_client_error(self):
        submission = Submission.objects.first()
        url = self._add_comment_reponses()
        responses.add(responses.POST, url, status=400, json={'bla': 'blubb'})
        result = add_posted_comment_to_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'comment': 'a comment'
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())

    # FIXME: what about retries ? are they executed ?
    @responses.activate
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    def add_posted_comment_to_issue_task_server_error(self):
        submission = Submission.objects.first()
        url = self._add_comment_reponses()
        responses.add(responses.POST, url, status=500, json={'bla': 'blubb'})
        result = add_posted_comment_to_issue_task.apply(
            kwargs={
                'submission_id': submission.pk,
                'comment': 'a comment'
            }
        )
        self.assertFalse(result.successful())
        # self.assertEqual(TaskProgressReport.CANCELLED, result.get())

    @responses.activate
    def test_create_submission_issue_task_client_error(self):
        submission = Submission.objects.last()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            JIRA_ISSUE_URL),
            json={},
            status=400)
        result = create_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())

    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    @responses.activate
    def test_create_submission_issue_task_server_error(self):
        submission = Submission.objects.last()
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.helpdesk_server.url,
                            JIRA_ISSUE_URL),
            json={},
            status=500)
        result = create_submission_issue_task.apply(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertFalse(result.successful())

    # FIXME: what about retries ? are they executed ?
    @responses.activate
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    def add_posted_comment_to_issue_task_server_error(self):
        submission = Submission.objects.first()
        url = self._add_comment_reponses()
        responses.add(responses.POST, url, status=500,
                      json={'bla': 'blubb'})
        result = add_posted_comment_to_issue_task.apply(
            kwargs={
                'submission_id': submission.pk,
                'comment': 'a comment'
            }
        )
        self.assertFalse(result.successful())

    @responses.activate
    def test_update_submission_issue_task_success(self):
        submission = Submission.objects.last()
        self._add_success_responses()
        self._add_put_issue_responses()
        create_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        result = update_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        self.assertTrue(result.get())
        self.assertEqual(1, len(submission.taskprogressreport_set.filter(
            task_name='tasks.update_submission_issue_task')))

    @responses.activate
    def test_update_submission_issue_task_client_error(self):
        submission = Submission.objects.last()
        self._add_success_responses()
        self._add_put_issue_responses(put_status_code=405)
        create_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        result = update_submission_issue_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        print(result.get())
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        tpr = submission.taskprogressreport_set.filter(
            task_name='tasks.update_submission_issue_task')
        self.assertEqual(1, len(tpr))
        self.assertEqual(TaskProgressReport.CANCELLED,
                         tpr.first().task_return_value)

    @responses.activate
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    def test_update_submission_issue_task_server_error(self):
        submission = Submission.objects.last()
        self._add_success_responses()
        self._add_put_issue_responses(put_status_code=502)
        create_submission_issue_task.apply(
            kwargs={
                'submission_id': submission.id,
            }
        )
        result = update_submission_issue_task.apply(
            kwargs={
                'submission_id': submission.id,
            }
        )
        tpr = submission.taskprogressreport_set.filter(
            task_name='tasks.update_submission_issue_task')
        self.assertEqual(1, len(tpr))
        self.assertEqual(TaskProgressReport.CANCELLED,
                         tpr.first().task_return_value)
        self.assertEqual('502', tpr.first().task_exception)


class TestGetHelpDeskUserTask(TestTasks):

    @responses.activate
    def test_hosting_site_get_gfbio_helpdesk_username_task_success(self):
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format(
            '0815', 'khors@me.de', quote('Kevin Horstmeier')
        )
        responses.add(responses.GET, url, body=b'0815', status=200)
        user = User.objects.first()
        submission = Submission.objects.first()
        submission.submitting_user = '{}'.format(user.pk)
        submission.save()
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        res = result.get()
        expected_result = {
            'jira_user_name': '0815',
            'email': 'khors@me.de',
            'full_name': 'Kevin Horstmeier'
        }
        self.assertEqual(expected_result, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        expected_value = "{'jira_user_name': '0815', " \
                         "'email': 'khors@me.de', " \
                         "'full_name': 'Kevin Horstmeier'}"
        self.assertEqual(expected_value,
                         TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    def test_external_site_get_gfbio_helpdesk_username_task_success(self):
        url = JIRA_USERNAME_URL_TEMPLATE.format(
            'external_site', 'brokeragent@gfbio.org'
        )
        responses.add(responses.GET, url, body=b'external_site', status=200)
        submission = Submission.objects.last()
        submission.submitting_user = 'user_id_from_external_site'
        submission.save()
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        res = result.get()
        expected_result = {
            'jira_user_name': submission.site.username,
            'email': JIRA_FALLBACK_EMAIL,
            'full_name': ''
        }
        self.assertEqual(expected_result, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        expected_value = "{'jira_user_name': '" + submission.site.username + \
                         "', 'email': '" + JIRA_FALLBACK_EMAIL + \
                         "', 'full_name': ''}"
        self.assertEqual(expected_value,
                         TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    def test_get_gfbio_helpdesk_username_task_empty_submitting_user(self):
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format(
            '0815', 'khors@me.de', quote('Kevin Horstmeier')
        )
        responses.add(responses.GET, url, body=b'0815', status=200)
        submission = Submission.objects.first()
        self.assertEqual('', submission.submitting_user)
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        res = result.get()
        self.assertEqual({'jira_user_name': JIRA_FALLBACK_USERNAME}, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertEqual("{'jira_user_name': '" + JIRA_FALLBACK_USERNAME + "'}",
                         TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    def test_hosting_site_get_gfbio_helpdesk_username_task_invalid_submitting_user(
            self):
        url = JIRA_USERNAME_URL_TEMPLATE.format(
            'brokeragent', 'brokeragent@gfbio.org',
        )
        responses.add(responses.GET, url, body=b'brokeragent', status=200)

        submission = Submission.objects.first()
        submission.submitting_user = '666'
        submission.save()
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        res = result.get()
        self.assertEqual({'jira_user_name': JIRA_FALLBACK_USERNAME}, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertEqual("{'jira_user_name': '" + JIRA_FALLBACK_USERNAME + "'}",
                         TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    def test_hosting_site_get_gfbio_helpdesk_username_task_success_no_fullname(
            self):
        url = JIRA_USERNAME_URL_TEMPLATE.format(
            '0815', 'khors@me.de'
        )
        responses.add(responses.GET, url, body=b'0815', status=200)
        user = User.objects.first()
        user.goesternid = '0815'
        user.name = ''
        user.save()
        submission = Submission.objects.first()
        submission.submitting_user = '{}'.format(user.pk)
        submission.save()
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        res = result.get()
        self.assertEqual({'jira_user_name': '0815'}, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertEqual("{'jira_user_name': '0815'}",
                         TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    def test_hosting_site_get_gfbio_helpdesk_username_task_success_no_goesternid(
            self):
        user = User.objects.first()
        url = JIRA_USERNAME_URL_TEMPLATE.format(
            user.username, 'khors@me.de'
        )
        responses.add(responses.GET, url, body='{0}'.format(user.username),
                      status=200)

        user.goesternid = None
        user.name = ''
        user.save()
        submission = Submission.objects.first()
        submission.submitting_user = '{}'.format(user.pk)
        submission.save()
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        res = result.get()
        self.assertEqual({'jira_user_name': user.username}, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertEqual("{'jira_user_name': '" + user.username + "'}",
                         TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    def test_hosting_site_get_gfbio_helpdesk_username_task_client_error(self):
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format(
            '0815', 'khors@me.de', quote('Kevin Horstmeier')
        )
        responses.add(responses.GET, url, status=403)
        user = User.objects.first()
        submission = Submission.objects.first()
        submission.submitting_user = '{}'.format(user.pk)
        submission.save()
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        res = result.get()
        self.assertEqual({'jira_user_name': JIRA_FALLBACK_USERNAME}, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertEqual("{'jira_user_name': '" + JIRA_FALLBACK_USERNAME + "'}",
                         TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    def test_external_site_get_gfbio_helpdesk_username_task_client_error(self):
        url = JIRA_USERNAME_URL_TEMPLATE.format(
            'external_site', 'brokeragent@gfbio.org'
        )
        responses.add(responses.GET, url, status=403)
        submission = Submission.objects.last()
        submission.submitting_user = 'user_id_from_external_site'
        submission.save()
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                'submission_id': submission.id,
            }
        )
        res = result.get()
        print('res', res)
        expected_result = {
            'jira_user_name': JIRA_FALLBACK_USERNAME,
            'email': JIRA_FALLBACK_EMAIL,
            'full_name': ''
        }
        self.assertEqual(expected_result, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        expected_value = "{'jira_user_name': '" + JIRA_FALLBACK_USERNAME + \
                         "', 'email': '" + JIRA_FALLBACK_EMAIL + \
                         "', 'full_name': ''}"
        self.assertEqual(expected_value,
                         TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    def test_hosting_site_get_gfbio_helpdesk_username_task_server_error(self):
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format(
            '0815', 'khors@me.de', quote('Kevin Horstmeier')
        )
        responses.add(responses.GET, url, body=b'', status=500)
        user = User.objects.first()
        submission = Submission.objects.first()
        submission.submitting_user = '{}'.format(user.pk)
        submission.save()
        get_gfbio_helpdesk_username_task.apply(
            kwargs={
                'submission_id': submission.id,
            }
        )
        for t in TaskProgressReport.objects.all():
            print(t.task_name, ' ', t.status, ' ', t.task_return_value, ' ',
                  t.task_kwargs,
                  ' ', t.task_args)
        tpr = TaskProgressReport.objects.first()
        self.assertEqual('RETRY', tpr.status)
        self.assertEqual("{'name': '" + JIRA_FALLBACK_USERNAME + "'}",
                         tpr.task_return_value)

    @responses.activate
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    def test_external_site_get_gfbio_helpdesk_username_task_server_error(self):
        url = JIRA_USERNAME_URL_TEMPLATE.format(
            'external_site', 'brokeragent@gfbio.org'
        )
        responses.add(responses.GET, url, body=b'', status=500)
        submission = Submission.objects.last()
        submission.submitting_user = 'user_id_from_external_site'
        submission.save()
        get_gfbio_helpdesk_username_task.apply(
            kwargs={
                'submission_id': submission.id,
            }
        )
        for t in TaskProgressReport.objects.all():
            print(t.task_name, ' ', t.status, ' ', t.task_return_value, ' ',
                  t.task_kwargs,
                  ' ', t.task_args)
        tpr = TaskProgressReport.objects.first()
        self.assertEqual('RETRY', tpr.status)
        self.assertEqual("{'name': '" + JIRA_FALLBACK_USERNAME + "'}",
                         tpr.task_return_value)


class TestPangaeaTasks(TestTasks):

    @responses.activate
    def test_create_pangaea_issue_task_success(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.pangaea_jira_server.url,
                            JIRA_ISSUE_URL),
            json=self.pangaea_issue_json,
            status=200)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/PDI-12428'.format(
                site_config.helpdesk_server.url),
            json=self.pangaea_issue_json
        )

        result = create_pangaea_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        res = result.get()
        self.assertTrue(result.successful())
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(3, len(additional_references))
        ref = additional_references.last()
        self.assertEqual('PDI-12428', ref.reference_key)

        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # print(request_logs.first().__dict__)
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}/rest/api/2/issue/'.format(site_config.pangaea_jira_server.url),
        #     request_logs.first().url)

    @responses.activate
    def test_create_pangaea_issue_task_client_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        len_before = len(submission.additionalreference_set.all())
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.pangaea_jira_server.url,
                            JIRA_ISSUE_URL),
            json={},
            status=400)
        result = create_pangaea_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk
            }
        )
        self.assertTrue(result.successful())
        self.assertIsNone(result.get())
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(len_before, len(additional_references))
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
        #                  request_logs.first().url)

    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    @responses.activate
    def test_create_pangaea_issue_task_server_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        len_before = len(submission.additionalreference_set.all())
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.pangaea_jira_server.url,
                            JIRA_ISSUE_URL),
            json={},
            status=500)

        result = create_pangaea_issue_task.apply(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertFalse(result.successful())
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(len_before, len(additional_references))

        # TODO: add test/assertion for retries ...
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(3, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
        #                  request_logs.first().url)

    @responses.activate
    def test_attach_to_pangaea_issue_task_success(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/PDI-12428'.format(
                site_config.helpdesk_server.url),
            json=self.pangaea_issue_json
        )
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.pangaea_jira_server.url,
                          JIRA_ISSUE_URL,
                          'PDI-12428',
                          JIRA_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_pangaea_attach_response(),
                      status=200)
        #     status=200)
        result = attach_to_pangaea_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'issue_key': 'PDI-12428'
                }
            }
        )
        res = result.get()
        self.assertTrue(result.successful())
        self.assertDictEqual(
            {'issue_key': 'PDI-12428'}, res)
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
        #                                 'PANGAEA_FAKE_KEY'),
        #     request_logs.first().url)

    @responses.activate
    def test_attach_to_pangaea_issue_task_client_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/PDI-12428'.format(
                site_config.helpdesk_server.url),
            json=self.pangaea_issue_json
        )
        responses.add(
            responses.POST,
            '{0}/rest/api/2/issue/PDI-12428/attachments'.format(
                site_config.helpdesk_server.url),
            json={'mocked_400': True},
            status=400)
        result = attach_to_pangaea_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'issue_key': 'PDI-12428'
                }
            }
        )
        self.assertTrue(result.successful())
        res = result.get()
        self.assertDictEqual(
            {
                'issue_key': 'PDI-12428'}, res)
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
        #                                 'PANGAEA_FAKE_KEY'),
        #     request_logs.first().url)

    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    @responses.activate
    def test_attach_to_pangaea_issue_task_server_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        self._add_default_pangaea_responses()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/PDI-12428'.format(
                site_config.helpdesk_server.url),
            json=self.pangaea_issue_json
        )
        responses.add(
            responses.POST,
            '{0}/rest/api/2/issue/PDI-12428/attachments'.format(
                site_config.helpdesk_server.url),
            json={'mocked_500': True},
            status=500)
        # responses.add(
        #     responses.POST,
        #     '{0}{1}/attachments'.format(PANGAEA_ISSUE_BASE_URL,
        #                                 'PANGAEA_FAKE_KEY'),
        #     json={},
        #     status=500)
        result = attach_to_pangaea_issue_task.apply(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'issue_key': 'PDI-12428'
                }
            }
        )
        self.assertFalse(result.successful())
        res = result.get()
        self.assertIsNone(res)
        # self.assertDictEqual(
        #     {
        #         'issue_key': 'PDI-12428'}, res)

    @responses.activate
    def test_add_accession_to_pangaea_issue_task_success(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
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
            '{0}/{1}/comment'.format(site_config.pangaea_jira_server,
                                     'PANGAEA_FAKE_KEY'),
            json=_get_pangaea_comment_response(),
            status=200)
        result = add_accession_to_pangaea_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                },
            }
        )
        self.assertTrue(result.successful())
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL, 'PANGAEA_FAKE_KEY'),
        #     request_logs.first().url)

    @responses.activate
    def test_add_accession_to_pangaea_issue_task_client_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
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
            '{0}/{1}/comment'.format(site_config.pangaea_jira_server.url,
                                     'PANGAEA_FAKE_KEY'),
            status=400)
        result = add_accession_to_pangaea_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                },
            }
        )
        # expects results from previous chain element
        self.assertTrue(result.successful())
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(1, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
        #                             'PANGAEA_FAKE_KEY'),
        #     request_logs.first().url)

    @responses.activate
    def test_add_accession_to_pangaea_issue_task_server_error(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
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
            '{0}/{1}/comment'.format(site_config.pangaea_jira_server.url,
                                     'PANGAEA_FAKE_KEY'),
            status=500)
        result = add_accession_to_pangaea_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                },
            }
        )
        self.assertTrue(result.successful())
        # request_logs = RequestLog.objects.all()
        # self.assertEqual(3, len(request_logs))
        # self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        # self.assertEqual(
        #     '{0}{1}/comment'.format(PANGAEA_ISSUE_BASE_URL,
        #                             'PANGAEA_FAKE_KEY'),
        #     request_logs.first().url)

    @responses.activate
    def test_check_for_pangaea_doi_task_success(self):
        site_config = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            site_config.pangaea_token_server.url,
            body=_get_pangaea_soap_response(),
            status=200
        )
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.pangaea_jira_server.url),
            status=200,
        )
        responses.add(
            responses.GET,
            'https://www.example.com/rest/api/2/issue/{0}'.format(
                'PANGAEA_FAKE_KEY'),
            json=_get_pangaea_ticket_response(),
            status=200
        )
        responses.add(
            responses.POST,
            '{0}{1}/{2}/{3}'.format(
                site_config.helpdesk_server.url,
                JIRA_ISSUE_URL,
                'FAKE_KEY',
                JIRA_COMMENT_SUB_URL),
            json={'bla': 'blubb'},
            status=200)

        result = check_for_pangaea_doi_task.apply_async(
            kwargs={
                'resource_credential_id': site_config.pangaea_token_server.pk
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
    def test_reporter_for_issue_chain(self):
        user = User.objects.first()
        submission = Submission.objects.first()
        submission.submitting_user = '{}'.format(user.pk)
        submission.save()
        site_config = SiteConfiguration.objects.first()

        # get_user_email_task responses ----------------------------------------
        data = json.dumps({
            'userid': 23
        })
        # url = '{0}/api/jsonws/' \
        #       'GFBioProject-portlet.userextension/get-user-by-id/' \
        #       'request-json/{1}'.format(site_config.gfbio_server.url,
        #                                 data)
        # responses.add(responses.POST, url, status=200,
        #               json={'firstname': 'Marc', 'middlename': '',
        #                     'emailaddress': 'maweber@mpi-bremen.de',
        #                     'fullname': 'Marc Weber',
        #                     'screenname': 'maweber', 'userid': 16250,
        #                     'lastname': 'Weber'})

        # get_gfbio_helpdesk_username_task responses ---------------------------
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format(
            '0815', 'khors@me.de', quote('Kevin Horstmeier')
        )
        responses.add(responses.GET, url, body=b'0815', status=200)

        # create_submission_issue_task resonses --------------------------------
        issue_json = _get_jira_issue_response()
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
            body=''
        )
        responses.add(
            responses.POST,
            '{0}{1}'.format(
                site_config.helpdesk_server.url,
                JIRA_ISSUE_URL
            ),
            status=201,
            json=issue_json,
        )
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/SAND-1661'.format(
                site_config.helpdesk_server.url),
            status=200,
            json=issue_json,
        )
        # ----------------------------------------------------------------------

        chain = get_gfbio_helpdesk_username_task.s(
            submission_id=submission.id).set(
            countdown=SUBMISSION_DELAY) \
                | create_submission_issue_task.s(
            submission_id=submission.id).set(
            countdown=SUBMISSION_DELAY)
        chain()
        expected_tasks = [
            'tasks.create_submission_issue_task',
            'tasks.get_gfbio_helpdesk_username_task',
        ]
        task_reports = submission.taskprogressreport_set.all()
        self.assertEqual(2, len(task_reports))
        for t in task_reports:
            self.assertIn(t.task_name, expected_tasks)
            self.assertEqual('SUCCESS', t.status)

    @responses.activate
    def test_pangaea_chain(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()

        self._add_default_pangaea_responses()
        responses.add(
            responses.POST,
            '{0}{1}'.format(site_config.pangaea_jira_server.url,
                            JIRA_ISSUE_URL),
            json=self.pangaea_issue_json,
            status=200)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/issue/PDI-12428'.format(
                site_config.helpdesk_server.url),
            json=self.pangaea_issue_json
        )

        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          site_config.pangaea_jira_server.url,
                          JIRA_ISSUE_URL,
                          'PDI-12428',
                          JIRA_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_pangaea_attach_response(),
                      status=200)

        result = chain(
            create_pangaea_issue_task.s(
                submission_id=submission.pk,
            ),
            attach_to_pangaea_issue_task.s(
                submission_id=submission.pk,
            )

        )()
        self.assertTrue(result.successful())

    @responses.activate
    def test_initiate_submission_chain_success(self):
        user = User.objects.first()
        submission = Submission.objects.first()
        submission.submitting_user = '{}'.format(user.pk)
        submission.save()
        site_config = SiteConfiguration.objects.first()

        len_auditable_data = len(AuditableTextData.objects.all())

        data = json.dumps({
            'userid': 23
        })
        # url = '{0}/api/jsonws/' \
        #       'GFBioProject-portlet.userextension/get-user-by-id/' \
        #       'request-json/{1}'.format(site_config.gfbio_server.url,
        #                                 data)
        #
        # responses.add(responses.POST, url, status=200,
        #               json={'firstname': 'Marc', 'middlename': '',
        #                     'emailaddress': 'maweber@mpi-bremen.de',
        #                     'fullname': 'Marc Weber',
        #                     'screenname': 'maweber', 'userid': 16250,
        #                     'lastname': 'Weber'})
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format('0815',
                                                         'khors@me.de',
                                                         'Kevin Horstmeier')
        responses.add(responses.GET, url, body=b'deleteMe', status=200)
        responses.add(
            responses.GET,
            '{0}/rest/api/2/field'.format(site_config.helpdesk_server.url),
            status=200,
        )
        responses.add(responses.POST,
                      '{0}{1}'.format(site_config.helpdesk_server.url,
                                      JIRA_ISSUE_URL
                                      ),
                      json={'bla': 'blubb'},
                      status=200)

        responses.add(
            responses.POST,
            '{0}{1}/{2}/{3}'.format(
                site_config.helpdesk_server.url,
                JIRA_ISSUE_URL,
                'FAKE_KEY',
                JIRA_COMMENT_SUB_URL,
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
        site_config = SiteConfiguration.objects.first()
        submission.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB20411',
            outgoing_request_id=uuid.uuid4()
        )
        responses.add(
            responses.POST,
            '{0}/{1}/comment'.format(site_config.pangaea_jira_server.url,
                                     'PANGAEA_FAKE_KEY'),
            status=500)
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(0, len(tprs))
        add_accession_to_pangaea_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                },
                # 'comment_body': 'ACC 12345'
            }
        )

        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(1, len(tprs))
        reports = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        report = reports.last()

        reps = TaskProgressReport.objects.all()
        for r in reps:
            print(r.task_name, ' ', r.status, ' ', r.task_return_value, ' ',
                  r.task_exception, ' ', r.task_exception_info)
        # self.assertEqual('RETRY', report.status)
        # self.assertEqual('500', report.task_exception)
        self.assertEqual('SUCCESS', report.status)

    def test_task_report_creation(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(TaskProgressReport.objects.all()))

        self._run_task(submission_id=submission.pk)
        task_reports = TaskProgressReport.objects.all()

        self.assertEqual(1, len(task_reports))
        report = TaskProgressReport.objects.first()
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

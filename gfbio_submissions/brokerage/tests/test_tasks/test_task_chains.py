# -*- coding: utf-8 -*-

import json
from urllib.parse import quote

import responses
from celery import chain

from gfbio_submissions.brokerage.configuration.settings import \
    JIRA_ISSUE_URL, JIRA_COMMENT_SUB_URL, JIRA_ATTACHMENT_SUB_URL, \
    JIRA_USERNAME_URL_FULLNAME_TEMPLATE, SUBMISSION_DELAY
from gfbio_submissions.brokerage.models import Submission, \
    AuditableTextData, TaskProgressReport
from gfbio_submissions.brokerage.tasks import \
    create_submission_issue_task, \
    create_pangaea_issue_task, attach_to_pangaea_issue_task, \
    trigger_submission_transfer, \
    get_gfbio_helpdesk_username_task, trigger_submission_transfer_for_updates
from gfbio_submissions.brokerage.tests.utils import \
    _get_pangaea_attach_response, \
    _get_jira_issue_response
from gfbio_submissions.generic.models import SiteConfiguration
from gfbio_submissions.users.models import User
from .test_tasks_base import TestTasks


class TestTaskChains(TestTasks):

    @responses.activate
    def test_reporter_for_issue_chain(self):
        # user = User.objects.first()
        submission = Submission.objects.first()
        # submission.submitting_user = '{}'.format(user.pk)
        # submission.save()
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

    def test_trigger_submission_transfer_no_errors_from_previous_task(self):
        submission = Submission.objects.first()
        prev_task_result = {
            'molecular_data_available': True,
            'messages': [],
            'molecular_data_check_performed': True,
        }
        result = trigger_submission_transfer.apply(
            kwargs={
                'previous_task_result': prev_task_result,
                'submission_id': submission.pk,
            }
        )
        self.assertNotEqual(TaskProgressReport.CANCELLED, result.get())

    def test_trigger_submission_transfer_errors_from_previous_task(self):
        submission = Submission.objects.first()
        prev_task_result = {
            'molecular_data_available': True,
            'messages': ['invalid no. of meta_data_files, 8'],
            'molecular_data_check_performed': True,
        }
        result = trigger_submission_transfer.apply(
            kwargs={
                'previous_task_result': prev_task_result,
                'submission_id': submission.pk,
            }
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())

    def test_trigger_submission_transfer_for_updates_no_errors_from_previous_task(self):
        submission = Submission.objects.first()
        prev_task_result = {
            'molecular_data_available': True,
            'messages': [],
            'molecular_data_check_performed': True,
        }
        result = trigger_submission_transfer_for_updates.apply(
            kwargs={
                'previous_task_result': prev_task_result,
                'broker_submission_id': '{}'.format(submission.broker_submission_id),
            }
        )
        self.assertNotEqual(TaskProgressReport.CANCELLED, result.get())

    def test_trigger_submission_transfer_for_updates_errors_from_previous_task(self):
        submission = Submission.objects.first()
        prev_task_result = {
            'molecular_data_available': True,
            'messages': ['invalid no. of meta_data_files, 8'],
            'molecular_data_check_performed': True,
        }
        result = trigger_submission_transfer_for_updates.apply(
            kwargs={
                'previous_task_result': prev_task_result,
                'broker_submission_id': submission.pk,
            }
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())

    @responses.activate
    def test_initiate_submission_chain_success(self):
        # user = User.objects.first()
        submission = Submission.objects.first()
        # submission.submitting_user = '{}'.format(user.pk)
        # submission.save()
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

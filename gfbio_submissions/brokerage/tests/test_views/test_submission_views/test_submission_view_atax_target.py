# -*- coding: utf-8 -*-
import json
from uuid import UUID
import datetime

import responses

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.generic.models import RequestLog
from .test_submission_view_base import \
    TestSubmissionView
from gfbio_submissions.brokerage.configuration.settings import ATAX
from gfbio_submissions.brokerage.models import Submission, TaskProgressReport

class TestSubmissionViewAtaxTarget(TestSubmissionView):

    @responses.activate
    def test_valid_min_atax_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ATAX',
             'release': False,
             'data': {
                 'requirements': {
                     'title': 'The alpha_tax Title',
                     'description': 'The alpha_tax Description'}}},
            format='json'
        )
        content = json.loads(response.content.decode('utf-8-sig'))

        expected = {
            'broker_submission_id': content['broker_submission_id'],
            'issue': '',
            'user': 'horst',
            'target': 'ATAX',
            'status': 'OPEN',
            'release': False,
            'data': {
                'requirements': {
                    'title': 'The alpha_tax Title',
                    'description': 'The alpha_tax Description'
                }
            },
            'embargo': None,
            'download_url': ''
        }
        self.assertEqual(201, response.status_code)

        expected['broker_submission_id'] = content['broker_submission_id']
        self.assertDictEqual(expected, content)
        self.assertEqual(1, len(Submission.objects.all()))

        # 1 incoming post, 1 get helpdesk user, 1 create issue
        self.assertEqual(3, len(RequestLog.objects.all()))

        submission = Submission.objects.last()
        self.assertEqual(UUID(content['broker_submission_id']),
                         submission.broker_submission_id)
        self.assertIsNone(submission.embargo)
        self.assertFalse(submission.release)
        self.assertEqual(Submission.OPEN, submission.status)
        # self.assertEqual(0, len(submission.submitting_user))
        self.assertEqual('ATAX', submission.target)

        request_logs = RequestLog.objects.filter(type=RequestLog.INCOMING)
        self.assertEqual(1, len(request_logs))

    @responses.activate
    def test_no_release_unknown_target(self):
        self._add_create_ticket_response()
        min_response = self.api_client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ATAX1',
                'release': False,
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            }))
        self.assertEqual(400, min_response.status_code)

    @responses.activate
    def test_valid_min_atax_post_and_update(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()

        self.assertEqual(0, len(Submission.objects.all()))
        self.assertEqual(0, len(RequestLog.objects.all()))

        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ATAX',
             'release': False,
             'data': {
                 'requirements': {
                     'title': 'The original alpha_tax Title',
                     'description': 'The original alpha_tax Description'}}},
            format='json'
        )
        content = json.loads(response.content.decode('utf-8-sig'))

        expected = {
            'broker_submission_id': content['broker_submission_id'],
            'issue': '',
            'user': 'horst',
            'target': 'ATAX',
            'status': 'OPEN',
            'release': False,
            'data': {
                'requirements': {
                    'title': 'The original alpha_tax Title',
                    'description': 'The original alpha_tax Description'
                }
            },
            'embargo': None,
            'download_url': ''
        }
        self.assertEqual(201, response.status_code)

        expected['broker_submission_id'] = content['broker_submission_id']
        self.assertDictEqual(expected, content)

        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()

        embargo_date = datetime.date.today() + datetime.timedelta(days=365)
        # goes into update:
        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {
                'target': 'ATAX',
                'release': False,
                'data': {
                    'requirements': {
                        'title': 'The updated alpha_tax Title',
                        'description': 'The updated alpha_tax Description'
                    }
                },
            'embargo': "{}".format(embargo_date),
            },
            format='json'
        )
        self.assertEqual(200, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(ATAX, submission.target)

        content = json.loads(response.content.decode('utf-8-sig'))

        self.assertNotIn('validation', submission.data.keys())

        expected_update = {
            'broker_submission_id': content['broker_submission_id'],
            'issue': '',
            'user': 'horst',
            'target': 'ATAX',
            'status': 'OPEN',
            'release': False,
            'data': {
                'requirements': {
                    'title': 'The updated alpha_tax Title',
                    'description': 'The updated alpha_tax Description'
                }
            },
            'embargo': "{}".format(embargo_date),
            'download_url': ''
        }

        expected_update['broker_submission_id'] = content['broker_submission_id']
        self.assertDictEqual(expected_update, content)

        expected_task_names = [
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.create_submission_issue_task',
            'tasks.jira_initial_comment_task',
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer',
            'tasks.check_issue_existing_for_submission_task',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.update_submission_issue_task',
            'tasks.update_ena_embargo_task',
            'tasks.notify_user_embargo_changed_task',
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer_for_updates'
        ]

        all_task_reports = list(
            TaskProgressReport.objects.values_list(
                'task_name', flat=True).order_by('created')
        )
        self.assertListEqual(expected_task_names, all_task_reports)

        self.assertEqual(ATAX, submission.target)
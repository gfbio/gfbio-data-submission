# -*- coding: utf-8 -*-

import json
from uuid import uuid4

import responses

from gfbio_submissions.brokerage.models import Submission, AdditionalReference
from gfbio_submissions.users.models import User
from .test_submission_view_base import TestSubmissionView


# FIXME: duplicate of below ?
class TestSubmissionViewGetDetailRequests(TestSubmissionView):

    @responses.activate
    def _prepare_submissions_for_various_users(self):
        self._add_gfbio_helpdesk_user_service_response(
            user_name='regular_user_2', email='re2@gu.la')
        self._add_create_ticket_response()
        regular_user = User.objects.get(username='regular_user')
        self._post_submission_with_submitting_user(regular_user.id)
        self._post_submission_with_submitting_user(regular_user.id)
        regular_user_2 = User.objects.get(username='regular_user_2')
        self._post_submission_with_submitting_user(regular_user_2.id)
        self._post_submission()

    @responses.activate
    def test_get_submission(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        response = self.api_client.get(
            '/api/submissions/{0}/'.format(submission.broker_submission_id))
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertTrue(isinstance(content, dict))
        self.assertEqual('horst', content['user'])

    @responses.activate
    def test_get_submission_containing_accession_no(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        submission.brokerobject_set.create(
            type='study',
            user=User.objects.first(),
        )
        submission.brokerobject_set.filter(
            type='study'
        ).first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJE0815'
        )
        response = self.api_client.get(
            '/api/submissions/{0}/'.format(submission.broker_submission_id))
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(content['accession_id'][0]['pid'], 'PRJE0815')
        self.assertEqual(200, response.status_code)
        self.assertTrue(isinstance(content, dict))
        self.assertEqual('horst', content['user'])

    @responses.activate
    def test_get_submission_with_helpdesk_issue(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()

        AdditionalReference.objects.create(
            submission=submission,
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            primary=True,
            reference_key='SAND-0815',
        )

        response = self.api_client.get(
            '/api/submissions/{0}/'.format(submission.broker_submission_id))
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertIn('issue', content)
        self.assertEqual('SAND-0815', content.get('issue', 'NO_ISSUE'))

    @responses.activate
    def test_no_submission_for_id(self):
        self._add_create_ticket_response()
        self._post_submission()
        response = self.api_client.get(
            '/api/submissions/{0}/'.format(uuid4()))
        self.assertEqual(404, response.status_code)

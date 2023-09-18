# -*- coding: utf-8 -*-

import responses

from gfbio_submissions.brokerage.models.submission import Submission
# from gfbio_submissions.brokerage.models import Submission
from .test_submission_view_base import TestSubmissionView


class TestSubmissionViewSimple(TestSubmissionView):

    @responses.activate
    def test_delete_submission(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        response = self.api_client.delete(
            '/api/submissions/{0}/'.format(submission.broker_submission_id))
        self.assertEqual(204, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        self.assertEqual(Submission.CANCELLED, submission.status)

    @responses.activate
    def test_patch_submission(self):
        self._add_create_ticket_response()
        self._post_submission()
        response = self.api_client.patch(
            '/api/submissions/{0}/'.format(Submission.objects.first().id),
            {'target': 'ENA_PANGAEA'},
            format='json'
        )
        self.assertEqual(405, response.status_code)

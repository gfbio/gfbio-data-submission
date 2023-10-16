# -*- coding: utf-8 -*-

import responses

from .test_submission_view_base import TestSubmissionView
from ....models.submission import Submission


class TestSubmissionViewDeleteRequests(TestSubmissionView):
    @responses.activate
    def test_delete_submission_db(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        self.assertEqual(1, len(Submission.objects.all()))
        self.api_client.delete("/api/submissions/{0}/".format(submission.broker_submission_id))
        self.assertEqual(1, len(Submission.objects.all()))

    @responses.activate
    def test_delete_submission_response(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        response = self.api_client.delete("/api/submissions/{0}/".format(submission.broker_submission_id))
        self.assertEqual(204, response.status_code)
        self.assertEqual(0, len(response.content))

    @responses.activate
    def test_delete_submission_status(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        self.assertEqual(Submission.OPEN, submission.status)
        self.api_client.delete("/api/submissions/{0}/".format(submission.broker_submission_id))
        submission = Submission.objects.first()
        self.assertEqual(Submission.CANCELLED, submission.status)

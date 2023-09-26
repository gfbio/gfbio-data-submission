# -*- coding: utf-8 -*-

import json
from uuid import UUID

import responses

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.generic.models.request_log import RequestLog

from .test_submission_view_base import TestSubmissionView


class TestSubmissionViewMinimumPosts(TestSubmissionView):
    def test_empty_min_post(self):
        response = self.api_client.post("/api/submissions/", {}, format="json")
        self.assertEqual(400, response.status_code)
        self.assertEqual(0, len(Submission.objects.all()))

    def test_empty_min_post_errors(self):
        response = self.api_client.post("/api/submissions/", {}, format="json")
        keys = json.loads(response.content.decode("utf-8")).keys()
        self.assertIn("target", keys)
        self.assertIn("data", keys)

    def test_invalid_min_post(self):
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post("/api/submissions/", {"target": "ENA", "data": {}}, format="json")
        self.assertEqual(400, response.status_code)
        keys = json.loads(response.content.decode("utf-8")).keys()
        self.assertIn("optional_validation", keys)
        self.assertIn("data", keys)
        self.assertEqual(0, len(Submission.objects.all()))

    @responses.activate
    def test_post_on_submission_detail_view(self):
        self._add_create_ticket_response()
        self._post_submission()

        submission = Submission.objects.first()
        response = self.api_client.post(
            "/api/submissions/{}/".format(submission.pk),
            {
                "target": "ENA",
                "data": {
                    "requirements": {
                        "title": "A Title 0815",
                        "description": "A Description 2",
                    }
                },
            },
            format="json",
        )
        self.assertEqual(405, response.status_code)

    def test_schema_error_min_post(self):
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post(
            "/api/submissions/",
            {"target": "ENA", "data": {"requirements": {}}},
            format="json",
        )
        content = json.loads(response.content.decode("utf-8"))
        self.assertEqual(400, response.status_code)
        self.assertIn("data", content.keys())
        self.assertListEqual(
            [
                "requirements : 'title' is a required property",
                "requirements : 'description' is a required property",
            ],
            content["data"],
        )
        self.assertEqual(0, len(Submission.objects.all()))

    @responses.activate
    def test_valid_min_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        response = self.api_client.post(
            "/api/submissions/",
            {
                "target": "ENA",
                "data": {"requirements": {"title": "A Title", "description": "A Description"}},
            },
            format="json",
        )
        content = json.loads(response.content.decode("utf-8"))
        expected = {
            "broker_submission_id": content["broker_submission_id"],
            "issue": "",
            "data": {
                "optional_validation": [
                    # "requirements : 'study_type' is a required property",
                    "requirements : 'samples' is a required property",
                    "requirements : 'experiments' is a required property",
                ],
                "requirements": {"description": "A Description", "title": "A Title"},
            },
            "embargo": None,
            "download_url": "",
            "release": False,
            "user": "horst",
            "status": "OPEN",
            "target": "ENA",
        }
        self.assertEqual(201, response.status_code)
        self.assertDictEqual(expected, content)
        self.assertEqual(1, len(Submission.objects.all()))
        self.assertEqual(3, len(RequestLog.objects.all()))
        submission = Submission.objects.last()

        self.assertEqual(UUID(content["broker_submission_id"]), submission.broker_submission_id)
        self.assertIsNone(submission.embargo)
        self.assertFalse(submission.release)
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual("ENA", submission.target)
        request_logs = RequestLog.objects.filter(type=RequestLog.INCOMING)
        self.assertEqual(1, len(request_logs))

    @responses.activate
    def test_valid_explicit_min_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        response = self._post_submission()
        content = json.loads(response.content.decode("utf-8"))
        expected = {
            "broker_submission_id": content["broker_submission_id"],
            "issue": "",
            "data": {
                "optional_validation": [
                    # u"requirements : 'study_type' is a required property",
                    "requirements : 'samples' is a required property",
                    "requirements : 'experiments' is a required property",
                ],
                "requirements": {"description": "A Description", "title": "A Title"},
            },
            "embargo": None,
            "download_url": "",
            "release": False,
            "user": "horst",
            "status": "OPEN",
            "target": "ENA",
        }
        self.assertEqual(201, response.status_code)
        self.assertDictEqual(expected, content)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.last()
        self.assertEqual(UUID(expected["broker_submission_id"]), submission.broker_submission_id)

    # @responses.activate
    def test_min_post_without_target(self):
        # self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post(
            "/api/submissions/",
            {
                "release": False,
                "target": "nonsense",
                "data": {"requirements": {"title": "A Title", "description": "A Description"}},
            },
            format="json",
        )
        self.assertEqual(400, response.status_code)
        self.assertIn(b"target", response.content)
        self.assertEqual(0, len(Submission.objects.all()))

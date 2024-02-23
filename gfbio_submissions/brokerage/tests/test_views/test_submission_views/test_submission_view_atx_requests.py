# -*- coding: utf-8 -*-
import json
from uuid import UUID

import responses

from gfbio_submissions.generic.models.request_log import RequestLog
from .test_submission_view_base import TestSubmissionView
from ....models.submission import Submission


class TestSubmissionViewAtaxTarget(TestSubmissionView):
    @responses.activate
    def test_valid_min_atx_target_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.api_client.post(
            "/api/submissions/",
            {
                "target": "ATAX",
                "release": False,
                "data": {
                    "requirements": {
                        "title": "The Title",
                        "description": "The Description",
                    }
                },
            },
            format="json",
        )
        content = json.loads(response.content.decode("utf-8"))

        expected = {
            "broker_submission_id": content["broker_submission_id"],
            "issue": "",
            "user": "horst",
            "target": "ATAX",
            "status": "OPEN",
            "release": False,
            "data": {
                "requirements": {
                    "title": "The Title",
                    "description": "The Description",
                }
            },
            "embargo": None,
            "download_url": "",
        }
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        self.assertDictEqual(expected, content)

        # 1 incoming post, 1 get helpdesk user, 1 create issue
        self.assertEqual(3, len(RequestLog.objects.all()))
        request_logs = RequestLog.objects.filter(type=RequestLog.INCOMING)
        self.assertEqual(1, len(request_logs))

        submission = Submission.objects.last()
        self.assertEqual(UUID(content["broker_submission_id"]), submission.broker_submission_id)
        self.assertIsNone(submission.embargo)
        self.assertFalse(submission.release)
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual("ATAX", submission.target)

    @responses.activate
    def test_valid_max_atx_target_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.api_client.post(
            "/api/submissions/",
            {
                "target": "ATAX",
                "release": True,
                "data": {
                    "requirements": {
                        "title": "The Title",
                        "description": "The Description",
                    }
                },
            },
            format="json",
        )
        content = json.loads(response.content)
        self.assertEqual(201, response.status_code)
        submission = Submission.objects.last()
        self.assertEqual(UUID(content["broker_submission_id"]), submission.broker_submission_id)
        self.assertEqual(Submission.SUBMITTED, submission.status)
        self.assertEqual("ATAX", submission.target)

    @responses.activate
    def test_valid_atx_target_post_extra_data(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.api_client.post(
            "/api/submissions/",
            {
                "target": "ATAX",
                "release": True,
                "data": {
                    "requirements": {
                        "title": "The Title",
                        "description": "The Description",
                        "extra": "this is not capture by json schema"
                    }
                },
            },
            format="json",
        )
        content = json.loads(response.content)
        self.assertEqual(201, response.status_code)
        submission = Submission.objects.last()
        self.assertEqual(UUID(content["broker_submission_id"]), submission.broker_submission_id)
        self.assertIn("extra", submission.data["requirements"].keys())

    @responses.activate
    def test_put_atx_target(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission(target="ATAX", release=False)
        submission = Submission.objects.first()
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {
                "target": "ATAX",
                "release": False,
                "data": {
                    "requirements": {
                        "title": "A Title Update",
                        "description": "A Description Update",
                    }
                },
            },
            format="json",
        )
        content = json.loads(response.content)
        self.assertEqual(200, response.status_code)
        self.assertIn("Update", content["data"]["requirements"]["title"])
        self.assertIn("Update", content["data"]["requirements"]["description"])
        self.assertEqual(1, len(Submission.objects.all()))

    @responses.activate
    def test_put_extra_data_atx_target(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission(target="ATAX", release=False)
        submission = Submission.objects.first()
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {
                "target": "ATAX",
                "release": False,
                "data": {
                    "requirements": {
                        "title": "A Title Update",
                        "description": "A Description Update",
                        "extra": "this is not capture by json schema"
                    }
                },
            },
            format="json",
        )
        submission = Submission.objects.first()
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        self.assertIn("extra", submission.data["requirements"].keys())

    @responses.activate
    def test_put_atx_target_status_submitted(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission(target="ATAX", release=True)
        submission = Submission.objects.first()
        self.assertEqual(Submission.SUBMITTED, submission.status)

        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {
                "target": "ATAX",
                "release": True,
                "data": {
                    "requirements": {
                        "title": "A Title Update",
                        "description": "A Description Update",
                    }
                },
            },
            format="json",
        )
        # FIXME clarify statuses, since 06.06.2019 edit on SUBMITTED Submission allowed (why ?)
        self.assertEqual(200, response.status_code)

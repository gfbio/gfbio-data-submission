# -*- coding: utf-8 -*-

import datetime
import json
from pprint import pprint
from unittest import skip

import responses

from gfbio_submissions.brokerage.tests.utils import _get_ena_release_xml_response, _get_submission_request_data
from gfbio_submissions.generic.models.request_log import RequestLog
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from .test_submission_view_base import TestSubmissionView
from ....configuration.settings import JIRA_ISSUE_URL, GENERIC
from ....models.broker_object import BrokerObject
from ....models.persistent_identifier import PersistentIdentifier
from ....models.submission import Submission
from ....models.task_progress_report import TaskProgressReport


class TestSubmissionViewPutRequests(TestSubmissionView):
    @responses.activate
    def test_put_submission(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
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
        content = json.loads(response.content.decode("utf-8"))
        self.assertEqual(200, response.status_code)
        self.assertTrue(isinstance(content, dict))
        self.assertIn("0815", content["data"]["requirements"]["title"])
        self.assertEqual(1, len(Submission.objects.all()))

    @skip("refactor for future update ticket tests")
    @responses.activate
    def test_put_submission_with_ticket_update(self):
        self._add_create_ticket_response()
        self._post_submission()
        ticket_key = "FAKE-101"
        site_config = SiteConfiguration.objects.first()
        url = "{0}{1}/{2}".format(site_config.helpdesk_server.url, JIRA_ISSUE_URL, ticket_key)
        responses.add(responses.PUT, url, body="", status=204)
        submission = Submission.objects.first()

        primary_ref = submission.additionalreference_set.first()

        self.assertTrue(primary_ref.primary)
        primary_ref.reference_key = ticket_key
        primary_ref.save()
        submission.embargo = datetime.date.today() + datetime.timedelta(days=365)
        submission.save()
        update_tasks = TaskProgressReport.objects.filter(task_name="tasks.update_helpdesk_ticket_task")
        self.assertEqual(1, len(update_tasks))

    @responses.activate
    def test_putpost_submission(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        response = self.api_client.post(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
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
        self.assertEqual(
            '{"detail":"Method \\"POST\\" not allowed."}',
            response.content.decode("utf-8"),
        )

    @responses.activate
    def test_put_submission_min_validation(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
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
        content = json.loads(response.content.decode("utf-8"))
        submission = Submission.objects.first()
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(200, response.status_code)
        self.assertIn("optional_validation", content["data"].keys())
        self.assertIn("optional_validation", submission.data)

        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {"target": "ENA", "data": {"requirements": {}}},
            format="json",
        )
        content = json.loads(response.content.decode("utf-8"))
        submission = Submission.objects.first()
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(400, response.status_code)
        self.assertIn("optional_validation", content.keys())

    @responses.activate
    def test_put_submission_generic_target(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        submission.target = GENERIC
        submission.save()

        # first update
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {
                "target": "GENERIC",
                "data": {
                    "requirements": {
                        "title": "A Title 0815",
                        "description": "A Description",
                        "foo": "bar"
                    }
                },
            },
            format="json",
        )
        content = json.loads(response.content.decode("utf-8"))
        submission = Submission.objects.first()

        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(200, response.status_code)

        self.assertNotIn("optional_validation", content["data"].keys())
        self.assertNotIn("optional_validation", submission.data)
        self.assertIn("foo", content.get("data", {}).get("requirements", {}).keys())
        self.assertIn("foo", submission.data.get("requirements", {}).keys())
        self.assertEqual("A Title 0815", submission.data.get("requirements", {}).get("title"))

        # second update
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {"target": "GENERIC", "data": {"requirements": {
                "title": "A Title 0815 update",
                "description": "A Description 2",

            }}},
            format="json",
        )
        content = json.loads(response.content.decode("utf-8"))
        self.assertEqual(200, response.status_code)

        submission.refresh_from_db()
        self.assertEqual(Submission.OPEN, submission.status)

        self.assertNotIn("optional_validation", content["data"].keys())
        self.assertNotIn("optional_validation", submission.data)
        self.assertIn("foo", content.get("data", {}).get("requirements", {}).keys())
        self.assertIn("foo", submission.data.get("requirements", {}).keys())
        self.assertEqual("A Title 0815 update", submission.data.get("requirements", {}).get("title"))

    @responses.activate
    def test_put_submission_valid_max_validation(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {"target": "ENA", "release": True, "data": _get_submission_request_data()},
            format="json",
        )
        content = json.loads(response.content.decode("utf-8"))
        submission = Submission.objects.last()
        self.assertEqual(200, response.status_code)
        self.assertFalse("optional_validation" in content["data"].keys())
        self.assertFalse("optional_validation" in submission.data)

        submission = Submission.objects.last()
        self.assertEqual(Submission.SUBMITTED, content.get("status", "NOPE"))
        self.assertEqual(Submission.SUBMITTED, submission.status)

    @responses.activate
    def test_put_submission_invalid_max_validation(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        data = _get_submission_request_data()
        data["requirements"].pop("samples")
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {"target": "ENA", "release": True, "data": data},
            format="json",
        )
        self.assertEqual(400, response.status_code)
        self.assertIn("'samples' is a required property", response.content.decode("utf-8"))
        self.assertFalse("optional_validation" in response.content.decode("utf-8"))
        submission = Submission.objects.first()
        self.assertEqual(Submission.OPEN, submission.status)

    @responses.activate
    def test_put_submission_max_validation_without_release(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {"target": "ENA", "release": False, "data": _get_submission_request_data()},
            format="json",
        )
        content = json.loads(response.content.decode("utf-8"))
        submission = Submission.objects.first()
        self.assertEqual(200, response.status_code)
        self.assertFalse("optional_validation" in content["data"].keys())
        self.assertFalse("optional_validation" in submission.data)
        submission = Submission.objects.first()
        self.assertEqual(Submission.OPEN, content.get("status", "NOPE"))
        self.assertEqual(Submission.OPEN, submission.status)

    @responses.activate
    def test_put_on_submitted_submission(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        submission.release = True
        submission.status = Submission.SUBMITTED
        submission.save()
        self.assertEqual(Submission.SUBMITTED, submission.status)
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {"target": "ENA", "release": False, "data": _get_submission_request_data()},
            format="json",
        )
        # TODO: 06.06.2019 allow edit of submissions with status SUBMITTED ...
        self.assertEqual(200, response.status_code)
        # self.assertTrue(400, response.status_code)
        # content = response.content.decode('utf-8')
        # self.assertIn('"status":"SUBMITTED"', content)
        # self.assertIn(
        #     '"broker_submission_id":"{0}"'.format(
        #         submission.broker_submission_id),
        #     content)
        # self.assertIn(
        #     '"error":"no modifications allowed with current status"',
        #     content)

    @responses.activate
    def test_put_on_cancelled_submission(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        submission.status = Submission.CANCELLED
        submission.save()
        self.assertEqual(Submission.CANCELLED, submission.status)

        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {"target": "ENA", "release": False, "data": _get_submission_request_data()},
            format="json",
        )
        self.assertEqual(400, response.status_code)
        content = response.content.decode("utf-8")
        self.assertIn('"status":"CANCELLED"', content)
        self.assertIn(
            '"broker_submission_id":"{0}"'.format(submission.broker_submission_id),
            content,
        )
        self.assertIn('"error":"no modifications allowed with current status"', content)

    @responses.activate
    def test_put_on_error_submission(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        submission.status = Submission.ERROR
        submission.save()
        self.assertEqual(Submission.ERROR, submission.status)
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {"target": "ENA", "release": False, "data": _get_submission_request_data()},
            format="json",
        )
        self.assertEqual(400, response.status_code)
        content = response.content.decode("utf-8")
        self.assertIn('"status":"ERROR"', content)
        self.assertIn(
            '"broker_submission_id":"{0}"'.format(submission.broker_submission_id),
            content,
        )
        self.assertIn('"error":"no modifications allowed with current status"', content)

    @responses.activate
    def test_put_on_closed_submission(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        submission.status = Submission.CLOSED
        submission.save()
        self.assertEqual(Submission.CLOSED, submission.status)
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {"target": "ENA", "release": False, "data": _get_submission_request_data()},
            format="json",
        )
        self.assertEqual(400, response.status_code)
        content = response.content.decode("utf-8")
        self.assertIn('"status":"CLOSED"', content)
        self.assertIn('"error":"no modifications allowed with current status"', content)
        self.assertIn(
            '"broker_submission_id":"{0}"'.format(submission.broker_submission_id),
            content,
        )

    # FIXME: test is broken, also refactoring to multiple tests would be good.
    @skip("Test is broken.")
    @responses.activate
    def test_put_submission_update_embargo_ena_trigger(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()

        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_release_xml_response(),
        )

        broker_object = BrokerObject.objects.create(
            type="study",
            user=submission.user,
            data={
                "center_name": "GFBIO",
                "study_abstract": "abstract",
                "study_title": "title",
                "study_alias": "alias",
            },
        )
        broker_object.submissions.add(submission)

        PersistentIdentifier.objects.create(
            archive="ENA",
            pid_type="PRJ",
            broker_object=broker_object,
            pid="PRJEB0815",
            outgoing_request_id="da76ebec-7cde-4f11-a7bd-35ef8ebe5b85",
        )

        RequestLog.objects.all().delete()
        embargo_date = datetime.date.today() + datetime.timedelta(days=365)
        self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {
                "target": "ENA",
                "embargo": "{}".format(embargo_date),
                "data": {
                    "requirements": {
                        "title": "A Title 0815",
                        "description": "A Description 2",
                    }
                },
            },
            format="json",
        )

        # FIXME: this keeps failing.
        # request_log = RequestLog.objects.get(url=conf.ena_server.url)
        # self.assertEqual(200, request_log.response_status)
        # self.assertTrue('accession "PRJEB0815"' in request_log.response_content)

        # UPDATE EMBARGO ON CLOSED SUBMISSION
        RequestLog.objects.all().delete()
        self.assertEqual(0, len(RequestLog.objects.all()))

        submission.status = Submission.CLOSED
        submission.save()

        self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {
                "target": "ENA",
                "embargo": "{}".format(embargo_date),
                "data": {
                    "requirements": {
                        "title": "A Title 0815",
                        "description": "A Description 2",
                    }
                },
            },
            format="json",
        )

        request_log = RequestLog.objects.get(url=conf.ena_server.url)
        new_submission = Submission.objects.first()
        self.assertEqual(datetime.date(2020, 10, 15), new_submission.embargo)
        self.assertEqual(200, request_log.response_status)
        self.assertTrue('accession "PRJEB0815"' in request_log.response_content)

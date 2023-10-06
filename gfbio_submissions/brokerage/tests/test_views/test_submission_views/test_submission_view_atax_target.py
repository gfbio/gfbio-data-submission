# -*- coding: utf-8 -*-
import datetime
import json
from uuid import UUID

import responses

from gfbio_submissions.generic.models import RequestLog
from .test_submission_view_base import TestSubmissionView
from ....configuration.settings import ATAX
from ....models.submission import Submission
from ....models.task_progress_report import TaskProgressReport


class TestSubmissionViewAtaxTarget(TestSubmissionView):
    @responses.activate
    def test_valid_min_atax_post(self):
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
                        "title": "The alpha_tax Title",
                        "description": "The alpha_tax Description",
                    }
                },
            },
            format="json",
        )
        content = json.loads(response.content.decode("utf-8-sig"))

        expected = {
            "broker_submission_id": content["broker_submission_id"],
            "issue": "",
            "user": "horst",
            "target": "ATAX",
            "status": "OPEN",
            "release": False,
            "data": {
                "requirements": {
                    "title": "The alpha_tax Title",
                    "description": "The alpha_tax Description",
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
        self.assertEqual(
            UUID(content["broker_submission_id"]), submission.broker_submission_id
        )
        self.assertIsNone(submission.embargo)
        self.assertFalse(submission.release)
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual("ATAX", submission.target)

        # TODO: remove, there is a dedicated test for this further down below
        # self.assertEqual(
        #     1,
        #     len(TaskProgressReport.objects.filter(task_name="tasks.get_gfbio_helpdesk_username_task"))
        # )
        # self.assertEqual(
        #     1,
        #     len(TaskProgressReport.objects.filter(task_name="tasks.create_submission_issue_task"))
        # )
        # issue = AdditionalReference.objects.filter(submission=submission)
        # print('issue_ref ', issue)
        # self.assertEqual(
        #     1,
        #     len(TaskProgressReport.objects.filter(task_name="tasks.jira_initial_comment_task"))
        # )
        # self.assertEqual(
        #     1,
        #     len(TaskProgressReport.objects.filter(task_name="tasks.check_issue_existing_for_submission_task"))
        # )

    # @responses.activate
    def test_min_post_unknown_target(self):
        # self._add_create_ticket_response()
        min_response = self.api_client.post(
            "/api/submissions/",
            content_type="application/json",
            data=json.dumps(
                {
                    "target": "NONSENSE",
                    "release": False,
                    "data": {
                        "requirements": {
                            "title": "A Title",
                            "description": "A Description",
                        }
                    },
                }
            ),
        )
        self.assertEqual(400, min_response.status_code)

    @responses.activate
    def test_valid_min_atax_post_and_update(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()

        self.assertEqual(0, len(Submission.objects.all()))
        self.assertEqual(0, len(RequestLog.objects.all()))

        response = self.api_client.post(
            "/api/submissions/",
            {
                "target": "ATAX",
                "release": False,
                "data": {
                    "requirements": {
                        "title": "The original alpha_tax Title",
                        "description": "The original alpha_tax Description",
                    }
                },
            },
            format="json",
        )
        content = json.loads(response.content.decode("utf-8-sig"))

        expected = {
            "broker_submission_id": content["broker_submission_id"],
            "issue": "",
            "user": "horst",
            "target": "ATAX",
            "status": "OPEN",
            "release": False,
            "data": {
                "requirements": {
                    "title": "The original alpha_tax Title",
                    "description": "The original alpha_tax Description",
                }
            },
            "embargo": None,
            "download_url": "",
        }
        self.assertEqual(201, response.status_code)

        expected["broker_submission_id"] = content["broker_submission_id"]
        self.assertDictEqual(expected, content)

        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()

        embargo_date = datetime.date.today() + datetime.timedelta(days=365)
        # goes into update:
        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {
                "target": "ATAX",
                "release": False,
                "data": {
                    "requirements": {
                        "title": "The updated alpha_tax Title",
                        "description": "The updated alpha_tax Description",
                    }
                },
                "embargo": "{}".format(embargo_date),
            },
            format="json",
        )
        self.assertEqual(200, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(ATAX, submission.target)

        content = json.loads(response.content.decode("utf-8-sig"))

        self.assertNotIn("validation", submission.data.keys())

        expected_update = {
            "broker_submission_id": content.get("broker_submission_id", "ERROR"),
            "issue": "",
            "user": "horst",
            "target": "ATAX",
            "status": "OPEN",
            "release": False,
            "data": {
                "requirements": {
                    "title": "The updated alpha_tax Title",
                    "description": "The updated alpha_tax Description",
                }
            },
            "embargo": "{}".format(embargo_date),
            "download_url": "",
        }

        self.assertDictEqual(expected_update, content)

        # TODO: remove, there is a dedicated test for this further down below
        # self.assertEqual(2, len(TaskProgressReport.objects.filter(task_name="tasks.get_gfbio_helpdesk_username_task")))
        # self.assertEqual(1, len(TaskProgressReport.objects.filter(task_name="tasks.create_submission_issue_task")))
        # self.assertEqual(1, len(TaskProgressReport.objects.filter(task_name="tasks.jira_initial_comment_task")))
        # self.assertEqual(1, len(TaskProgressReport.objects.filter(
        #     task_name="tasks.check_issue_existing_for_submission_task")))
        # self.assertEqual(1, len(TaskProgressReport.objects.filter(task_name="tasks.update_submission_issue_task")))
        # self.assertEqual(1, len(TaskProgressReport.objects.filter(task_name="tasks.update_ena_embargo_task")))
        # self.assertEqual(1, len(TaskProgressReport.objects.filter(task_name="tasks.notify_user_embargo_changed_task")))

    # TODO: makes very little sense. explain or remove
    # @responses.activate
    # def test_atax_post_created_and_correct_target(self):
    #     self._add_create_ticket_response()
    #
    #     subm_number = len(Submission.objects.all())
    #
    #     response = self.api_client.post(
    #         '/api/submissions/',
    #         {'target': 'ATAX',
    #          'release': False,
    #          'data': {
    #              'requirements': {
    #                  'title': 'The original alpha_tax Title',
    #                  'description': 'The original alpha_tax Description'}}},
    #         format='json'
    #     )
    #
    #     subm_number1 = len(Submission.objects.all())
    #
    #     self.assertEqual(subm_number1, subm_number + 1)
    #     self.assertEqual(Submission.objects.last().target, ATAX)

    @responses.activate
    def test_task_chain_for_atax_without_release(self):
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
                        "title": "The alpha_tax Title",
                        "description": "The alpha_tax Description",
                    }
                },
            },
            format="json",
        )

        expected_task_names = [
            "tasks.get_gfbio_helpdesk_username_task",
            "tasks.create_submission_issue_task",
            "tasks.jira_initial_comment_task",
            "tasks.check_for_molecular_content_in_submission_task",
            "tasks.trigger_submission_transfer",
            "tasks.check_issue_existing_for_submission_task",
        ]

        all_task_reports = list(
            TaskProgressReport.objects.values_list("task_name", flat=True).order_by(
                "created"
            )
        )
        self.assertListEqual(expected_task_names, all_task_reports)

    @responses.activate
    def test_task_chain_for_atax_with_release(self):
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
                        "title": "The alpha_tax Title",
                        "description": "The alpha_tax Description - no release",
                    }
                },
            },
            format="json",
        )

        self.assertEqual(201, response.status_code)

        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()

        response = self.api_client.put(
            "/api/submissions/{0}/".format(submission.broker_submission_id),
            {
                "target": "ATAX",
                "release": True,
                "data": {
                    "requirements": {
                        "title": "The updated alpha_tax Title",
                        "description": "The updated alpha_tax Description - with release",
                    }
                },
            },
            format="json",
        )
        self.assertEqual(200, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual("ATAX", submission.target)

        expected_task_names = [
            "tasks.get_gfbio_helpdesk_username_task",
            "tasks.create_submission_issue_task",
            "tasks.jira_initial_comment_task",
            "tasks.check_for_molecular_content_in_submission_task",
            "tasks.trigger_submission_transfer",
            "tasks.check_issue_existing_for_submission_task",
            "tasks.get_gfbio_helpdesk_username_task",
            "tasks.update_submission_issue_task",
            "tasks.check_for_molecular_content_in_submission_task",
            "tasks.trigger_submission_transfer_for_updates",
            "tasks.check_on_hold_status_task",
        ]

        all_task_reports = list(
            TaskProgressReport.objects.values_list("task_name", flat=True).order_by(
                "created"
            )
        )
        self.assertListEqual(expected_task_names, all_task_reports)

    @responses.activate
    def test_task_chain_for_atax_with_initial_release(self):
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
                        "title": "The alpha_tax Title",
                        "description": "The alpha_tax Description",
                    }
                },
            },
            format="json",
        )

        expected_task_names = [
            "tasks.get_gfbio_helpdesk_username_task",
            "tasks.create_submission_issue_task",
            "tasks.jira_initial_comment_task",
            "tasks.check_for_molecular_content_in_submission_task",
            "tasks.trigger_submission_transfer",
            "tasks.check_on_hold_status_task",
            "tasks.check_issue_existing_for_submission_task",
        ]

        all_task_reports = list(
            TaskProgressReport.objects.values_list("task_name", flat=True).order_by(
                "created"
            )
        )
        self.assertListEqual(expected_task_names, all_task_reports)

    # FIXME: this is not the place for jira related task tests. this will need the proper mocked responses to work
    # @responses.activate
    # def test_initial_comment_atax_post_no_release(self):
    #     self._add_create_ticket_response()
    #     self.assertEqual(0, len(Submission.objects.all()))
    #     self.assertEqual(0, len(RequestLog.objects.all()))
    #     response = self.api_client.post(
    #         '/api/submissions/',
    #         {'target': 'ATAX',
    #          'release': False,
    #          'data': {
    #              'requirements': {
    #                  'title': 'The alpha_tax Title',
    #                  'description': 'The alpha_tax Description'}}},
    #         format='json'
    #     )
    #
    #     self.assertEqual(1, len(TaskProgressReport.objects.filter(task_name="tasks.jira_initial_comment_task")))
    #
    #     self.assertEqual(201, response.status_code)
    #     submission = Submission.objects.first()
    #     self.assertEqual('ATAX', submission.target)
    #
    #     reference = AdditionalReference.objects.create(
    #         submission=submission,
    #         type=AdditionalReference.GFBIO_HELPDESK_TICKET,
    #         reference_key='PDI-0815',
    #         primary=True
    #     )
    #     reference.save()
    #
    #     self.assertTrue(reference.primary)
    #     self.assertTrue(isinstance(reference, AdditionalReference))
    #
    #     result = jira_initial_comment_task.apply_async(
    #         kwargs={
    #             'submission_id': Submission.objects.first().pk,
    #         },
    #         countdown=SUBMISSION_DELAY,
    #     ).get()

# -*- coding: utf-8 -*-
from urllib.parse import quote

import responses
from django.test import override_settings

from gfbio_submissions.brokerage.tests.test_tasks.test_tasks_base import TestTasks
from gfbio_submissions.users.models import User

from ...configuration.settings import (
    JIRA_FALLBACK_USERNAME,
    JIRA_USERNAME_URL_FULLNAME_TEMPLATE,
    JIRA_USERNAME_URL_TEMPLATE,
)
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport
from ...tasks.jira_tasks.get_gfbio_helpdesk_username import get_gfbio_helpdesk_username_task


class TestGetHelpDeskUserTask(TestTasks):
    def test_get_gfbio_helpdesk_username_task_no_user(self):
        submission = Submission.objects.last()
        submission.user = None
        submission.save()
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                "submission_id": submission.id,
            }
        )
        res = result.get()
        # no user means no site_config
        self.assertEqual(TaskProgressReport.CANCELLED, res)

    @responses.activate
    def test_get_gfbio_helpdesk_username_task_success(self):
        submission = Submission.objects.last()
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format(
            submission.user.externaluserid_set.first().external_id,
            submission.user.email,
            submission.user.name,
        )
        responses.add(responses.GET, url, body=b"0815", status=200)

        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                "submission_id": submission.id,
            }
        )
        res = result.get()
        expected_result = {
            "jira_user_name": submission.user.externaluserid_set.first().external_id,
            "email": submission.user.email,
            "full_name": submission.user.name,
        }
        self.assertEqual(expected_result, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        expected_value = (
            "{'jira_user_name': '"
            + submission.user.externaluserid_set.first().external_id
            + "', 'email': '"
            + submission.user.email
            + "', 'full_name': '"
            + submission.user.name
            + "'}"
        )
        self.assertEqual(expected_value, TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    def test_get_gfbio_helpdesk_username_task_success_no_fullname(self):
        submission = Submission.objects.last()
        url = JIRA_USERNAME_URL_TEMPLATE.format(
            submission.user.externaluserid_set.first().external_id,
            submission.user.email,
        )
        responses.add(responses.GET, url, body=b"0815", status=200)
        submission.user.name = ""
        submission.user.save()
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                "submission_id": submission.id,
            }
        )
        res = result.get()
        expected_result = {
            "jira_user_name": submission.user.externaluserid_set.first().external_id,
            "email": submission.user.email,
            "full_name": "",
        }
        self.assertEqual(expected_result, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        expected_value = (
            "{'jira_user_name': '" + submission.user.externaluserid_set.first().external_id + "', "
            "'email': '" + submission.user.email + "', 'full_name': ''}"
        )
        self.assertEqual(expected_value, TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    def test_get_gfbio_helpdesk_username_task_success_no_external_id(self):
        user = User.objects.first()
        url = JIRA_USERNAME_URL_TEMPLATE.format(user.username, user.email)
        responses.add(responses.GET, url, body="{0}".format(user.username), status=200)

        # user.external_user_id = None
        user.externaluserid_set.all().delete()
        user.name = ""
        user.save()
        submission = Submission.objects.first()
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                "submission_id": submission.id,
            }
        )
        res = result.get()
        expected_result = {
            "jira_user_name": user.username,
            "email": user.email,
            "full_name": "",
        }
        self.assertEqual(expected_result, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        expected_value = "{'jira_user_name': '" + user.username + "', 'email': '" + user.email + "', 'full_name': ''}"
        self.assertEqual(expected_value, TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    def test_get_gfbio_helpdesk_username_task_client_error(self):
        submission = Submission.objects.first()
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format(
            submission.user.externaluserid_set.first().external_id,
            submission.user.email,
            quote(submission.user.name),
        )
        responses.add(responses.GET, url, status=403)
        result = get_gfbio_helpdesk_username_task.apply_async(
            kwargs={
                "submission_id": submission.id,
            }
        )
        res = result.get()

        expected_result = {
            "jira_user_name": JIRA_FALLBACK_USERNAME,
            "email": "khors@me.de",
            "full_name": "Kevin Horstmeier",
        }
        self.assertEqual(expected_result, res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        expected_value = (
            "{'jira_user_name': '" + JIRA_FALLBACK_USERNAME + "', 'email': 'khors@me.de', "
            "'full_name': 'Kevin Horstmeier'}"
        )
        self.assertEqual(expected_value, TaskProgressReport.objects.first().task_return_value)

    @responses.activate
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False, CELERY_TASK_EAGER_PROPAGATES=False)
    def test_get_gfbio_helpdesk_username_task_server_error(self):
        submission = Submission.objects.first()
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format(
            submission.user.externaluserid_set.first().external_id,
            submission.user.email,
            quote(submission.user.name),
        )
        responses.add(responses.GET, url, body=b"", status=500)
        get_gfbio_helpdesk_username_task.apply(
            kwargs={
                "submission_id": submission.id,
            }
        )
        tpr = TaskProgressReport.objects.first()
        self.assertEqual("SUCCESS", tpr.status)
        expected_value = (
            "{'jira_user_name': '" + JIRA_FALLBACK_USERNAME + "', 'email': 'khors@me.de', "
            "'full_name': 'Kevin Horstmeier'}"
        )
        self.assertEqual(expected_value, tpr.task_return_value)

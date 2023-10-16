# -*- coding: utf-8 -*-
from unittest.mock import patch

import responses
from django.test import override_settings

from gfbio_submissions.brokerage.configuration.settings import (
    JIRA_ISSUE_URL,
    JIRA_ATTACHMENT_SUB_URL,
    JIRA_ATTACHMENT_URL,
)
from gfbio_submissions.generic.models import SiteConfiguration
from gfbio_submissions.users.models import User
from .test_helpdesk_tasks_base import TestHelpDeskTasksBase
from ..test_utils.test_csv_parsing import TestCSVParsing
from ..utils import _get_jira_attach_response
from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload
from ...models.task_progress_report import TaskProgressReport
from ...tasks.jira_tasks.attach_to_submission_issue import attach_to_submission_issue_task
from ...tasks.jira_tasks.delete_submission_issue_attachment import \
    delete_submission_issue_attachment_task


class TestAttachToIssueTasks(TestHelpDeskTasksBase):
    @classmethod
    def _add_submission_upload(cls):
        upload = TestCSVParsing.create_csv_submission_upload(
            Submission.objects.first(), User.objects.first(), "csv_files/SO45_mod.csv"
        )
        upload.attach_to_ticket = True
        upload.save(ignore_attach_to_ticket=True)

    @classmethod
    def _prepare_responses(cls):
        cls._add_submission_upload()
        site_config = SiteConfiguration.objects.first()

        responses.add(
            responses.GET,
            "{0}/rest/api/2/field".format(site_config.helpdesk_server.url),
            status=200,
        )

        responses.add(
            responses.GET,
            "{0}/rest/api/2/issue/FAKE_KEY".format(site_config.helpdesk_server.url),
            json=cls.issue_json,
        )

        responses.add(
            responses.POST,
            "{0}{1}/{2}/{3}".format(
                site_config.helpdesk_server.url,
                JIRA_ISSUE_URL,
                "SAND-1661",
                JIRA_ATTACHMENT_SUB_URL,
            ),
            json=_get_jira_attach_response(),
            status=200,
        )

    @responses.activate
    def test_attach_to_issue_task_no_submission_upload(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        url = "{0}{1}/{2}/{3}".format(
            site_config.helpdesk_server.url,
            JIRA_ISSUE_URL,
            "FAKE_KEY",
            JIRA_ATTACHMENT_SUB_URL,
        )
        responses.add(responses.POST, url, json=_get_jira_attach_response(), status=200)
        result = attach_to_submission_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
            }
        )
        self.assertTrue(result.successful())
        self.assertFalse(result.get())

    @responses.activate
    def test_attach_to_issue_task(self):
        self._prepare_responses()
        submission = Submission.objects.first()

        result = attach_to_submission_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "submission_upload_id": SubmissionUpload.objects.first().pk,
            }
        )

        self.assertTrue(result.successful())
        self.assertTrue(result.get())
        submission_upload = SubmissionUpload.objects.first()
        self.assertEqual(10814, submission_upload.attachment_id)

    @responses.activate
    def test_attach_multiple_files_with_same_name(self):
        # this method does a create, then a mod plus save -> 1 new 1 update
        self._prepare_responses()
        self._add_submission_upload()
        self._add_submission_upload()

        submission = Submission.objects.first()

        all_uploads = SubmissionUpload.objects.all()
        self.assertEqual(3, len(all_uploads))

        for i in range(0, len(all_uploads)):
            self.assertEqual(
                "3bc38ceb0c2dd4571737fb5e6ed22a62", all_uploads[i].md5_checksum
            )
            result = attach_to_submission_issue_task.apply_async(
                kwargs={
                    "submission_id": submission.pk,
                    "submission_upload_id": all_uploads[i].pk,
                }
            )
            self.assertTrue(result.get())

        # Expected outcome is that despite having the same name 3 uploads are
        # created and each is attached to ticket
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(3, len(task_reports))
        for s in task_reports:
            self.assertTrue(s.task_return_value)

    @responses.activate
    def test_delete_attachment_task(self):
        self._prepare_responses()
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()

        submission_upload = SubmissionUpload.objects.first()
        url = "{0}{1}/{2}".format(
            site_config.helpdesk_server.url,
            JIRA_ATTACHMENT_URL,
            submission_upload.attachment_id,
        )
        responses.add(responses.DELETE, url, body=b"", status=204)
        result = delete_submission_issue_attachment_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "attachment_id": SubmissionUpload.objects.first().attachment_id,
            }
        )
        self.assertTrue(result.successful())
        self.assertTrue(result.get())

    @responses.activate
    def test_attach_to_issue_task_progress_reports(self):
        submission = Submission.objects.first()
        attach_to_submission_issue_task.apply_async(
            kwargs={
                "submission_id": 123456,
                # no submission_upload_id ...
            }
        )
        attach_to_submission_issue_task.apply_async(
            kwargs={
                # no args at all
            }
        )
        attach_to_submission_issue_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
                "submission_upload_id": 99999,
            }
        )
        attach_to_submission_issue_task.apply_async(
            kwargs={
                # no submission_id
                "submission_upload_id": 99999,
            }
        )
        task_progress_reports = TaskProgressReport.objects.all()
        self.assertEqual(4, len(task_progress_reports))
        for t in task_progress_reports:
            self.assertEqual("tasks.attach_to_submission_issue_task", t.task_name)

    # TODO: take this mock concept for testing retry, and add more tests for
    #  other tasks with retry policy(s)
    @override_settings(
        CELERY_TASK_ALWAYS_EAGER=False, CELERY_TASK_EAGER_PROPAGATES=False
    )
    @patch("gfbio_submissions.brokerage.utils.task_utils.send_task_fail_mail")
    def test_attach_submission_upload_without_ticket(self, mock):
        submission = Submission.objects.last()
        # omiting submission_upload_id, defaults this parameter to None
        attach_to_submission_issue_task.apply(
            kwargs={
                "submission_id": submission.pk,
            }
        )
        self.assertTrue(mock.called)

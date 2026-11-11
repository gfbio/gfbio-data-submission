from unittest.mock import patch

import arrow
from auditlog.models import LogEntry as AuditLogEntry
from django.contrib.admin.models import CHANGE, LogEntry
from django.contrib.auth.models import Group, Permission
from django.db import connection
from django.test import SimpleTestCase, TestCase
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient, APITestCase

from config.celery_app import app as celery_app
from gfbio_submissions.brokerage.configuration.settings import GFBIO_HELPDESK_TICKET
from gfbio_submissions.brokerage.models.additional_reference import AdditionalReference
from gfbio_submissions.brokerage.models.broker_object import BrokerObject
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.models.submission_data_diff import SubmissionDataDiff
from gfbio_submissions.brokerage.submission_data_diff import diff_submission_data, display_diff_path, format_diff_value
from gfbio_submissions.users.models import User


def _submission(user, status=Submission.OPEN):
    return Submission.objects.create(
        user=user,
        status=status,
        target="ENA",
        release=False,
        data={},
    )


def _updates(submission):
    return AuditLogEntry.objects.filter(
        object_pk=str(submission.pk),
        action=AuditLogEntry.Action.UPDATE,
    )


class TestSubmissionAudit(TestCase):
    def setUp(self):
        self.staff = User.objects.create_user(username="audit-staff", password="secret")
        self.staff.is_staff = True
        self.staff.is_superuser = True
        self.staff.save()

    def test_status_change_outside_request_has_no_actor_or_action(self):
        submission = _submission(self.staff)
        submission.status = Submission.SUBMITTED
        submission.save()

        entry = _updates(submission).get()
        self.assertIsNone(entry.actor)
        self.assertIsNone(entry.additional_data)
        self.assertIn("status", entry.changes_dict)

    def test_data_only_change_is_marked_without_the_payload(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "secret title"}}
        submission.save()

        entry = _updates(submission).get()
        self.assertEqual(["changed", "changed"], entry.changes_dict["data"])
        self.assertNotIn("secret title", entry.changes)
        self.assertIsNone(entry.serialized_data)
        self.assertIsNone(entry.additional_data)

    def test_data_and_status_share_one_audit_row(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "secret title"}}
        submission.status = Submission.SUBMITTED
        submission.save()

        entry = _updates(submission).get()
        self.assertIn("status", entry.changes_dict)
        self.assertEqual(["changed", "changed"], entry.changes_dict["data"])
        self.assertNotIn("secret title", entry.changes)
        self.assertEqual(1, SubmissionDataDiff.objects.filter(log_entry=entry).count())

    def test_update_fields_without_data_does_not_mark_data(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "secret title"}}
        submission.status = Submission.SUBMITTED
        submission.save(update_fields=["status"])

        entry = _updates(submission).get()
        self.assertIn("status", entry.changes_dict)
        self.assertNotIn("data", entry.changes_dict)
        self.assertFalse(SubmissionDataDiff.objects.filter(log_entry__object_pk=str(submission.pk)).exists())
        submission.refresh_from_db()
        self.assertEqual({}, submission.data)

    def test_data_only_change_keeps_the_channel(self):
        from auditlog.context import set_actor

        from gfbio_submissions.brokerage.audit_context import submission_audit_context

        submission = _submission(self.staff)
        with submission_audit_context("Save", "frontend"):
            with set_actor(self.staff):
                submission.data = {"requirements": {"title": "secret title"}}
                submission.save()

        entry = _updates(submission).get()
        self.assertEqual(self.staff.pk, entry.actor_id)
        self.assertEqual("frontend", entry.additional_data["channel"])
        self.assertEqual("Save", entry.additional_data["action"])
        self.assertEqual(["changed", "changed"], entry.changes_dict["data"])
        self.assertNotIn("secret title", entry.changes)

    @patch("gfbio_submissions.brokerage.admin.jira_cancel_issue")
    def test_admin_cancel_logs_action_and_channel(self, _jira_cancel):
        submission = _submission(self.staff)
        self.client.force_login(self.staff)
        response = self.client.post(
            reverse("admin:brokerage_submission_changelist"),
            {
                "action": "cancel_selected_submissions",
                "index": "0",
                "select_across": "0",
                "_selected_action": [str(submission.pk)],
            },
        )
        self.assertEqual(302, response.status_code)
        submission.refresh_from_db()
        self.assertEqual(Submission.CANCELLED, submission.status)
        self.assertFalse(LogEntry.objects.filter(change_message__startswith="Admin action:").exists())

        entry = _updates(submission).get()
        self.assertEqual(self.staff.pk, entry.actor_id)
        self.assertEqual("admin", entry.additional_data["channel"])
        self.assertEqual("Admin Action: Cancel selected submissions", entry.additional_data["action"])

    @patch("gfbio_submissions.brokerage.admin.jira_cancel_issue")
    def test_select_across_logs_every_matching_submission(self, _jira_cancel):
        first = _submission(self.staff)
        second = _submission(self.staff)
        self.client.force_login(self.staff)
        response = self.client.post(
            reverse("admin:brokerage_submission_changelist"),
            {
                "action": "cancel_selected_submissions",
                "index": "0",
                "select_across": "1",
                "_selected_action": [str(first.pk)],
            },
        )
        self.assertEqual(302, response.status_code)
        self.assertFalse(LogEntry.objects.filter(change_message__startswith="Admin action:").exists())
        for submission in (first, second):
            entry = _updates(submission).get()
            self.assertEqual("admin", entry.additional_data["channel"])
            self.assertEqual("Admin Action: Cancel selected submissions", entry.additional_data["action"])

    def test_download_action_is_not_logged(self):
        submission = _submission(self.staff)
        self.client.force_login(self.staff)
        response = self.client.post(
            reverse("admin:brokerage_submission_changelist"),
            {
                "action": "download_auditable_text_data",
                "index": "0",
                "select_across": "0",
                "_selected_action": [str(submission.pk)],
            },
        )
        self.assertEqual(200, response.status_code)
        self.assertFalse(
            LogEntry.objects.filter(change_message__startswith="Admin action:").exists()
        )

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.validate_against_ena.validate_against_ena_task.apply_async"
    )
    def test_nagoya_skip_is_not_logged_for_that_submission(self, apply_async):
        agreed = Submission.objects.create(
            user=self.staff,
            status=Submission.OPEN,
            target="ENA",
            release=False,
            data={"requirements": {"agree-to-nagoya-protocol": "yes"}},
        )
        declined = Submission.objects.create(
            user=self.staff,
            status=Submission.OPEN,
            target="ENA",
            release=False,
            data={"requirements": {"agree-to-nagoya-protocol": "no"}},
        )
        self.client.force_login(self.staff)
        response = self.client.post(
            reverse("admin:brokerage_submission_changelist"),
            {
                "action": "validate_against_ena",
                "index": "0",
                "select_across": "0",
                "_selected_action": [str(agreed.pk), str(declined.pk)],
            },
        )
        self.assertEqual(302, response.status_code)
        self.assertEqual(1, apply_async.call_count)
        self.assertEqual(agreed.pk, apply_async.call_args.kwargs["kwargs"]["submission_id"])
        self.assertFalse(LogEntry.objects.filter(change_message__startswith="Admin action:").exists())
        entry = _updates(agreed).get()
        self.assertEqual(self.staff.pk, entry.actor_id)
        self.assertEqual("admin", entry.additional_data["channel"])
        self.assertEqual("Admin Action: Validate against ENA production server", entry.additional_data["action"])
        self.assertEqual({}, entry.changes_dict)
        self.assertFalse(_updates(declined).exists())

    @patch("gfbio_submissions.brokerage.admin.jira_cancel_issue")
    def test_negative_action_index_uses_the_last_posted_action(self, _jira_cancel):
        submission = _submission(self.staff)
        self.client.force_login(self.staff)
        response = self.client.post(
            reverse("admin:brokerage_submission_changelist"),
            {
                "action": ["validate_against_ena", "cancel_selected_submissions"],
                "index": "-1",
                "select_across": "0",
                "_selected_action": [str(submission.pk)],
            },
        )
        self.assertEqual(302, response.status_code)
        submission.refresh_from_db()
        self.assertEqual(Submission.CANCELLED, submission.status)
        self.assertFalse(LogEntry.objects.filter(change_message__startswith="Admin action:").exists())
        entry = _updates(submission).get()
        self.assertEqual("Admin Action: Cancel selected submissions", entry.additional_data["action"])
        self.assertEqual("admin", entry.additional_data["channel"])

    def test_audit_view_requires_model_permission_and_shows_diff(self):
        submission = _submission(self.staff)
        submission.status = Submission.SUBMITTED
        submission.save()
        url = reverse("admin:brokerage_submission_audit", args=[submission.pk])

        staff = User.objects.create_user(username="audit-plain-staff", password="secret")
        staff.is_staff = True
        staff.save()
        self.client.force_login(staff)
        self.assertEqual(403, self.client.get(url).status_code)

        view_perm = Permission.objects.get(codename="view_submission")
        staff.user_permissions.add(view_perm)
        staff = User.objects.get(pk=staff.pk)
        self.client.force_login(staff)
        response = self.client.get(url)
        self.assertEqual(200, response.status_code)
        self.assertContains(response, "SUBMITTED")

    def test_audit_view_shows_data_changed_without_the_payload(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "secret title"}}
        submission.save()
        self.client.force_login(self.staff)
        response = self.client.get(reverse("admin:brokerage_submission_audit", args=[submission.pk]))
        self.assertEqual(200, response.status_code)
        self.assertContains(response, "data: changed")
        self.assertNotContains(response, "secret title")

    def test_admin_change_form_records_admin_channel(self):
        from django.contrib.admin.sites import AdminSite

        from gfbio_submissions.brokerage.admin import SubmissionAdmin

        submission = _submission(self.staff)
        submission.release = True
        from auditlog.context import set_actor

        with set_actor(self.staff):
            SubmissionAdmin(Submission, AdminSite()).save_model(None, submission, None, True)

        entry = _updates(submission).get()
        self.assertEqual(self.staff.pk, entry.actor_id)
        self.assertEqual("admin", entry.additional_data["channel"])
        self.assertEqual("Save", entry.additional_data["action"])
        self.assertIn("release", entry.changes_dict)

    def test_submission_change_form_lists_cloud_uploads_then_audit_then_history(self):
        submission = _submission(self.staff)
        self.client.force_login(self.staff)
        response = self.client.get(reverse("admin:brokerage_submission_change", args=[submission.pk]))
        self.assertEqual(200, response.status_code)
        content = response.content.decode()
        cloud_uploads = reverse(
            "admin:submission_submission_submission_cloud_upload_view",
            args=[submission.pk],
        )
        audit = reverse("admin:brokerage_submission_audit", args=[submission.pk])
        history = reverse("admin:brokerage_submission_history", args=[submission.pk])
        self.assertLess(content.index(cloud_uploads), content.index(audit))
        self.assertLess(content.index(audit), content.index(history))

    def test_nested_path_is_stored_outside_the_audit_row_and_overview(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "old title"}}
        submission.save()
        submission.data = {"requirements": {"title": "secret title"}}
        submission.save()

        entry = _updates(submission).order_by("-pk").first()
        diff = SubmissionDataDiff.objects.get(log_entry=entry).diff
        self.assertEqual(
            [{"path": ["requirements", "title"], "old": "old title", "new": "secret title"}],
            diff["changed"],
        )
        self.assertNotIn("secret title", entry.changes)
        self.assertIsNone(entry.serialized_data)
        self.assertIsNone(entry.additional_data)

        self.client.force_login(self.staff)
        response = self.client.get(reverse("admin:brokerage_submission_audit", args=[submission.pk]))
        self.assertContains(response, "data: changed")
        self.assertNotContains(response, "secret title")

    def test_added_and_removed_dicts_are_not_exploded(self):
        submission = _submission(self.staff)
        submission.data = {"kept": 1, "removed_key": {"inner": "leaf"}}
        submission.save()
        submission.data = {"kept": 1, "added_key": {"inner": "new"}}
        submission.save()

        diff = SubmissionDataDiff.objects.get(log_entry=_updates(submission).order_by("-pk").first()).diff
        self.assertEqual([{"path": ["added_key"], "value": {"inner": "new"}}], diff["added"])
        self.assertEqual([{"path": ["removed_key"], "value": {"inner": "leaf"}}], diff["removed"])
        self.assertEqual([], diff["changed"])

    def test_changed_list_is_one_entry_and_order_matters(self):
        submission = _submission(self.staff)
        submission.data = {"samples": ["a", "b"]}
        submission.save()
        submission.data = {"samples": ["b", "a"]}
        submission.save()

        diff = SubmissionDataDiff.objects.get(log_entry=_updates(submission).order_by("-pk").first()).diff
        self.assertEqual([{"path": ["samples"], "old": ["a", "b"], "new": ["b", "a"]}], diff["changed"])
        self.assertEqual([], diff["added"])
        self.assertEqual([], diff["removed"])

    def test_dict_versus_list_is_one_changed_path(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "T"}}
        submission.save()
        submission.data = {"requirements": ["T"]}
        submission.save()

        diff = SubmissionDataDiff.objects.get(log_entry=_updates(submission).order_by("-pk").first()).diff
        self.assertEqual(
            [{"path": ["requirements"], "old": {"title": "T"}, "new": ["T"]}],
            diff["changed"],
        )

    def test_update_fields_data_writes_marker_and_diff(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "secret title"}}
        submission.save(update_fields=["data"])

        entry = _updates(submission).get()
        self.assertEqual(["changed", "changed"], entry.changes_dict["data"])
        self.assertEqual(
            [{"path": ["requirements"], "value": {"title": "secret title"}}],
            SubmissionDataDiff.objects.get(log_entry=entry).diff["added"],
        )
        self.assertNotIn("secret title", entry.changes)

    def test_create_with_data_writes_no_diff(self):
        submission = Submission.objects.create(
            user=self.staff,
            status=Submission.OPEN,
            target="ENA",
            release=False,
            data={"requirements": {"title": "secret title"}},
        )
        self.assertFalse(SubmissionDataDiff.objects.filter(log_entry__object_pk=str(submission.pk)).exists())

    def test_overview_links_view_diff_only_when_a_diff_row_exists(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "first title"}}
        submission.save()
        first_entry = _updates(submission).get()
        SubmissionDataDiff.objects.filter(log_entry=first_entry).delete()
        submission.data = {"requirements": {"title": "second title"}}
        submission.save()

        self.client.force_login(self.staff)
        url = reverse("admin:brokerage_submission_audit", args=[submission.pk])
        with CaptureQueriesContext(connection) as captured:
            response = self.client.get(url)
        self.assertEqual(200, response.status_code)
        content = response.content.decode()
        self.assertEqual(2, content.count("data: changed"))
        self.assertEqual(1, content.count("View diff"))
        self.assertNotIn("first title", content)
        self.assertNotIn("second title", content)

        diff_queries = [query["sql"] for query in captured.captured_queries if "submissiondatadiff" in query["sql"]]
        self.assertEqual(1, len(diff_queries))
        select_clause = diff_queries[0].split(" FROM ", 1)[0]
        self.assertIn("log_entry_id", select_clause)
        self.assertNotIn('"diff"', select_clause)

        self.assertEqual(
            404,
            self.client.get(
                reverse("admin:brokerage_submission_data_diff", args=[submission.pk, first_entry.pk])
            ).status_code,
        )

    def test_diff_page_shows_added_removed_and_changed_values(self):
        submission = Submission.objects.create(
            user=self.staff,
            status=Submission.OPEN,
            target="ENA",
            release=False,
            data={
                "removed_block": {"inner": "removed-value"},
                "samples": ["first", "second"],
                "requirements": {"title": "old title"},
            },
        )
        submission.data = {
            "added_block": {"inner": "added-value"},
            "samples": ["second", "first"],
            "requirements": {"title": "new title"},
        }
        submission.save()
        entry = _updates(submission).get()

        self.client.force_login(self.staff)
        response = self.client.get(reverse("admin:brokerage_submission_data_diff", args=[submission.pk, entry.pk]))
        self.assertEqual(200, response.status_code)
        self.assertContains(response, "<h2>Added</h2>", html=False)
        self.assertContains(response, "<h2>Removed</h2>", html=False)
        self.assertContains(response, "<h2>Changed</h2>", html=False)
        self.assertContains(response, "added-value")
        self.assertContains(response, "removed-value")
        self.assertContains(response, "old title")
        self.assertContains(response, "new title")
        self.assertContains(response, "<h3>samples</h3>", html=False)
        self.assertContains(response, "<h3>requirements.title</h3>", html=False)
        self.assertContains(response, "<p>Old</p>", html=False)
        self.assertContains(response, "<p>New</p>", html=False)
        self.assertNotContains(response, "added_block.inner")
        self.assertNotContains(response, "removed_block.inner")
        self.assertContains(response, reverse("admin:brokerage_submission_audit", args=[submission.pk]))
        self.assertContains(response, "Data changes")
        content = response.content.decode()
        self.assertLess(content.index("first"), content.index("second"))
        self.assertLess(content.index("second"), content.rindex("first"))

    def test_diff_page_renders_scalar_values_as_json(self):
        submission = _submission(self.staff)
        submission.data = {"count": 0, "count_text": "0", "empty": None, "flag": False, "note": "false"}
        submission.save()
        entry = _updates(submission).get()

        self.client.force_login(self.staff)
        response = self.client.get(reverse("admin:brokerage_submission_data_diff", args=[submission.pk, entry.pk]))
        self.assertEqual(200, response.status_code)
        self.assertContains(response, "<pre>null</pre>", html=False)
        self.assertContains(response, "<pre>false</pre>", html=False)
        self.assertContains(response, "<pre>&quot;false&quot;</pre>", html=False)
        self.assertContains(response, "<pre>0</pre>", html=False)
        self.assertContains(response, "<pre>&quot;0&quot;</pre>", html=False)
        self.assertContains(response, "<h2>Added</h2>", html=False)
        self.assertNotContains(response, "<h2>Removed</h2>")
        self.assertNotContains(response, "<h2>Changed</h2>")

    def test_diff_view_requires_permission_and_rejects_a_foreign_log_entry(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "secret title"}}
        submission.save()
        entry = _updates(submission).get()
        url = reverse("admin:brokerage_submission_data_diff", args=[submission.pk, entry.pk])

        staff = User.objects.create_user(username="diff-plain-staff", password="secret")
        staff.is_staff = True
        staff.save()
        self.client.force_login(staff)
        self.assertEqual(403, self.client.get(url).status_code)

        other = _submission(self.staff)
        other.data = {"requirements": {"title": "other title"}}
        other.save()
        other_entry = _updates(other).get()
        self.client.force_login(self.staff)
        foreign = reverse("admin:brokerage_submission_data_diff", args=[submission.pk, other_entry.pk])
        self.assertEqual(404, self.client.get(foreign).status_code)
        self.assertEqual(
            404,
            self.client.get(
                reverse("admin:brokerage_submission_data_diff", args=[submission.pk, 999999999])
            ).status_code,
        )

        status_only = _submission(self.staff)
        status_only.status = Submission.SUBMITTED
        status_only.save()
        status_entry = _updates(status_only).get()
        missing_diff = reverse("admin:brokerage_submission_data_diff", args=[status_only.pk, status_entry.pk])
        self.assertEqual(404, self.client.get(missing_diff).status_code)

    def test_empty_diff_writes_only_the_marker(self):
        submission = _submission(self.staff)
        empty = {"added": [], "removed": [], "changed": []}
        with patch(
            "gfbio_submissions.brokerage.submission_data_audit.diff_submission_data",
            return_value=empty,
        ):
            submission.data = {"requirements": {"title": "secret title"}}
            submission.save()

        entry = _updates(submission).get()
        self.assertEqual(["changed", "changed"], entry.changes_dict["data"])
        self.assertFalse(SubmissionDataDiff.objects.filter(log_entry=entry).exists())

    def test_diff_store_failure_keeps_the_marker_and_the_save(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "secret title"}}
        with self.assertLogs("gfbio_submissions.brokerage.submission_data_audit", level="ERROR") as logs:
            with patch(
                "gfbio_submissions.brokerage.submission_data_audit.SubmissionDataDiff.objects.get_or_create",
                side_effect=RuntimeError("db down"),
            ):
                submission.save()

        submission.refresh_from_db()
        self.assertEqual({"requirements": {"title": "secret title"}}, submission.data)
        entry = _updates(submission).get()
        self.assertEqual(["changed", "changed"], entry.changes_dict["data"])
        self.assertFalse(SubmissionDataDiff.objects.filter(log_entry=entry).exists())
        self.assertTrue(any("Failed to store submission data diff" in message for message in logs.output))


class TestSubmissionDataDiffFunction(SimpleTestCase):
    def test_dotted_key_stays_one_segment(self):
        diff = diff_submission_data({"a.b": 1}, {"a.b": 2})
        self.assertEqual([{"path": ["a.b"], "old": 1, "new": 2}], diff["changed"])
        self.assertEqual("a.b", display_diff_path(["a.b"]))
        self.assertEqual("requirements.title", display_diff_path(["requirements", "title"]))
        self.assertEqual("data", display_diff_path([]))

    def test_root_that_is_not_a_dict_is_one_changed_entry(self):
        diff = diff_submission_data(["a"], {"a": 1})
        self.assertEqual([{"path": [], "old": ["a"], "new": {"a": 1}}], diff["changed"])
        self.assertEqual([], diff["added"])
        self.assertEqual([], diff["removed"])

    def test_equal_dicts_ignore_key_order(self):
        diff = diff_submission_data({"b": 1, "a": {"z": 1, "y": 2}}, {"a": {"y": 2, "z": 1}, "b": 1})
        self.assertEqual({"added": [], "removed": [], "changed": []}, diff)

    def test_entries_are_sorted_by_path(self):
        diff = diff_submission_data({}, {"b": 1, "a": 2})
        self.assertEqual([["a"], ["b"]], [item["path"] for item in diff["added"]])

    def test_scalar_formatting_keeps_json_types_distinct(self):
        self.assertEqual("null", format_diff_value(None))
        self.assertEqual("false", format_diff_value(False))
        self.assertEqual('"false"', format_diff_value("false"))
        self.assertEqual("0", format_diff_value(0))
        self.assertEqual('"0"', format_diff_value("0"))


class _QuietCelerySignature:
    def set(self, *args, **kwargs):
        return self

    def __or__(self, other):
        return self

    def __call__(self, *args, **kwargs):
        return None

    def apply_async(self, *args, **kwargs):
        return None


def _quiet_celery_signature(*args, **kwargs):
    return _QuietCelerySignature()


@patch(
    "gfbio_submissions.brokerage.tasks.submission_tasks."
    "check_for_molecular_content_in_submission.check_for_molecular_content_in_submission_task.s",
    _quiet_celery_signature,
)
@patch(
    "gfbio_submissions.brokerage.tasks.process_tasks."
    "trigger_submission_process_for_updates.trigger_submission_process_for_updates_task.s",
    _quiet_celery_signature,
)
@patch(
    "gfbio_submissions.brokerage.tasks.jira_tasks.update_submission_issue.update_submission_issue_task.s",
    _quiet_celery_signature,
)
class TestFrontendSaveChannel(APITestCase):
    def test_profile_put_records_frontend_channel(self):
        owner = User.objects.create_user(username="profile-owner", password="secret")
        owner.is_user = True
        owner.save()
        token = Token.objects.create(user=owner)
        submission = _submission(owner)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = client.put(
            reverse("brokerage:submissions_detail", kwargs={"broker_submission_id": submission.broker_submission_id}),
            {
                "target": "GENERIC",
                "data": {"requirements": {"title": "A title", "description": "A description"}},
            },
            format="json",
        )
        self.assertEqual(200, response.status_code, response.content)
        entry = _updates(submission).get()
        self.assertEqual(owner.pk, entry.actor_id)
        self.assertEqual("frontend", entry.additional_data["channel"])
        self.assertEqual("Save", entry.additional_data["action"])
        self.assertIn("target", entry.changes_dict)
        self.assertEqual(["changed", "changed"], entry.changes_dict["data"])
        self.assertNotIn("A title", entry.changes)


class TestCuratorAndTokenAudit(APITestCase):
    def setUp(self):
        self.curator = User.objects.create_user(username="audit-curator", password="secret")
        self.curator.user_permissions.add(
            Permission.objects.get(codename="curate_submissions")
        )
        self.token = Token.objects.create(user=self.curator)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    @patch("gfbio_submissions.brokerage.admin.jira_cancel_issue")
    def test_curator_action_uses_short_description_and_token_user(self, _jira_cancel):
        submission = _submission(self.curator)
        url = reverse(
            "brokerage:curator_submissions_actions",
            kwargs={"broker_submission_id": str(submission.broker_submission_id)},
        )
        response = self.client.post(url, {"action": "cancel_selected_submissions"}, format="json")
        self.assertEqual(200, response.status_code)
        self.assertFalse(LogEntry.objects.filter(change_message__startswith="Curator action:").exists())

        entry = _updates(submission).get()
        self.assertEqual(self.curator.pk, entry.actor_id)
        self.assertEqual("curator", entry.additional_data["channel"])
        self.assertEqual("Cancel selected submissions", entry.additional_data["action"])

    def test_curator_state_change_names_the_action(self):
        submission = _submission(self.curator)
        url = reverse(
            "brokerage:curator_submissions_set_state",
            kwargs={"broker_submission_id": str(submission.broker_submission_id)},
        )
        response = self.client.post(url, {"state": Submission.CANCELLED}, format="json")
        self.assertEqual(200, response.status_code)
        self.assertFalse(LogEntry.objects.filter(change_message__startswith="Curator action:").exists())
        entry = _updates(submission).get()
        self.assertEqual(self.curator.pk, entry.actor_id)
        self.assertEqual("curator", entry.additional_data["channel"])
        self.assertEqual("Set state to CANCELLED", entry.additional_data["action"])

    def test_curator_state_unchanged_writes_no_audit_row(self):
        submission = _submission(self.curator, status=Submission.OPEN)
        url = reverse(
            "brokerage:curator_submissions_set_state",
            kwargs={"broker_submission_id": str(submission.broker_submission_id)},
        )
        response = self.client.post(url, {"state": Submission.OPEN}, format="json")
        self.assertEqual(200, response.status_code)
        self.assertFalse(_updates(submission).exists())

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.validate_against_ena.validate_against_ena_task.apply_async"
    )
    def test_curator_skip_does_not_write_a_history_line(self, apply_async):
        submission = _submission(self.curator)
        submission.data = {"requirements": {"agree-to-nagoya-protocol": "no"}}
        submission.save()
        url = reverse(
            "brokerage:curator_submissions_actions",
            kwargs={"broker_submission_id": str(submission.broker_submission_id)},
        )
        response = self.client.post(url, {"action": "validate_against_ena"}, format="json")
        self.assertEqual(200, response.status_code)
        apply_async.assert_not_called()
        self.assertFalse(LogEntry.objects.filter(change_message__startswith="Curator action:").exists())
        self.assertFalse(_updates(submission).exclude(additional_data=None).exists())


class TestJiraWebhookAudit(APITestCase):
    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.update_ena_embargo.update_ena_embargo_task.apply_async"
    )
    def test_embargo_update_records_jira_channel_and_user(self, _embargo_task):
        owner = User.objects.create_user(
            username="jira-owner",
            email="owner@example.com",
            password="secret",
        )
        owner.is_user = True
        owner.save()
        submission = Submission.objects.create(
            user=owner,
            status=Submission.OPEN,
            target="GENERIC",
            release=False,
            data={},
        )
        jira_curator = User.objects.create_user(
            username="jira-curator",
            email="curator@jira.example",
            password="secret",
        )
        jira_curator.is_user = True
        jira_curator.save()
        Group.objects.get_or_create(name="Curators")[0].user_set.add(jira_curator)
        AdditionalReference.objects.create(
            submission=submission,
            type=GFBIO_HELPDESK_TICKET,
            primary=True,
            reference_key="SAND-007",
        )
        url = f"{reverse('brokerage:submissions_jira_update')}?user_id=curator@jira.example"
        payload = {
            "user": {"emailAddress": "curator@jira.example"},
            "issue": {
                "key": "SAND-007",
                "fields": {
                    "customfield_10200": arrow.now().shift(years=1).for_json(),
                    "customfield_10303": str(submission.broker_submission_id),
                    "reporter": {"name": "jira-owner", "emailAddress": "owner@example.com"},
                },
            },
            "changelog": {"items": [{"fieldId": "customfield_10200"}]},
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(201, response.status_code, response.content)

        entry = _updates(submission).get()
        self.assertIsNone(entry.actor)
        self.assertEqual("jira", entry.additional_data["channel"])
        self.assertEqual("Jira webhook", entry.additional_data["action"])
        self.assertEqual("curator@jira.example", entry.additional_data["jira_user"])
        self.assertIn("embargo", entry.changes_dict)

    @patch(
        "gfbio_submissions.brokerage.tasks.process_tasks.update_ena_embargo.update_ena_embargo_task.apply_async"
    )
    def test_missing_email_falls_back_to_query_user_id(self, _embargo_task):
        owner = User.objects.create_user(username="jira-owner-2", email="owner2@example.com", password="secret")
        owner.is_user = True
        owner.save()
        submission = Submission.objects.create(
            user=owner,
            status=Submission.OPEN,
            target="GENERIC",
            release=False,
            data={},
        )
        jira_curator = User.objects.create_user(
            username="jira-curator-2",
            email="fallback@jira.example",
            password="secret",
        )
        Group.objects.get_or_create(name="Curators")[0].user_set.add(jira_curator)
        AdditionalReference.objects.create(
            submission=submission,
            type=GFBIO_HELPDESK_TICKET,
            primary=True,
            reference_key="SAND-008",
        )
        url = f"{reverse('brokerage:submissions_jira_update')}?user_id=fallback@jira.example"
        payload = {
            "user": {},
            "issue": {
                "key": "SAND-008",
                "fields": {
                    "customfield_10200": arrow.now().shift(years=1).for_json(),
                    "customfield_10303": str(submission.broker_submission_id),
                    "reporter": {"name": "jira-owner-2", "emailAddress": "owner2@example.com"},
                },
            },
            "changelog": {"items": [{"fieldId": "customfield_10200"}]},
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(201, response.status_code, response.content)
        entry = _updates(submission).get()
        self.assertIsNone(entry.actor)
        self.assertEqual("fallback@jira.example", entry.additional_data["jira_user"])
        self.assertFalse(LogEntry.objects.filter(object_id=str(submission.pk)).exists())


def _cloud_upload(user):
    submission = _submission(user)
    return SubmissionCloudUpload.objects.create(
        submission=submission,
        user=user,
        attach_to_ticket=False,
        meta_data=False,
        file_upload=None,
    )


def _cloud_upload_updates(upload):
    return AuditLogEntry.objects.get_for_object(upload).filter(action=AuditLogEntry.Action.UPDATE)


class TestSubmissionCloudUploadAudit(TestCase):
    def setUp(self):
        self.staff = User.objects.create_user(username="cloud-audit-staff", password="secret")
        self.staff.is_staff = True
        self.staff.is_superuser = True
        self.staff.save()

    def test_status_change_outside_request_has_no_actor_or_payload(self):
        upload = _cloud_upload(self.staff)
        upload.status = SubmissionCloudUpload.STATUS_UPLOADED
        upload.save()

        entry = _cloud_upload_updates(upload).get()
        self.assertIsNone(entry.actor)
        self.assertIsNone(entry.additional_data)
        self.assertIn("status", entry.changes_dict)
        self.assertIsNone(entry.serialized_data)
        self.assertNotIn("file_upload", entry.changes_dict)
        self.assertNotIn("modified_recently", entry.changes_dict)

    def test_admin_action_that_saves_status_is_a_single_prefixed_audit_row(self):
        from gfbio_submissions.brokerage.admin import SubmissionCloudUploadAdmin

        def mark_uploaded(modeladmin, request, queryset):
            for upload in queryset:
                upload.status = SubmissionCloudUpload.STATUS_UPLOADED
                upload.save()

        mark_uploaded.short_description = "Mark selected cloud uploads uploaded"
        upload = _cloud_upload(self.staff)
        original_actions = SubmissionCloudUploadAdmin.actions
        SubmissionCloudUploadAdmin.actions = [mark_uploaded]
        try:
            self.client.force_login(self.staff)
            response = self.client.post(
                reverse("admin:brokerage_submissioncloudupload_changelist"),
                {
                    "action": "mark_uploaded",
                    "index": "0",
                    "select_across": "0",
                    "_selected_action": [str(upload.pk)],
                },
            )
        finally:
            SubmissionCloudUploadAdmin.actions = original_actions

        self.assertEqual(302, response.status_code)
        upload.refresh_from_db()
        self.assertEqual(SubmissionCloudUpload.STATUS_UPLOADED, upload.status)
        updates = _cloud_upload_updates(upload)
        self.assertEqual(1, updates.count())
        entry = updates.get()
        self.assertIn("status", entry.changes_dict)
        self.assertEqual("admin", entry.additional_data["channel"])
        self.assertEqual("Admin Action: Mark selected cloud uploads uploaded", entry.additional_data["action"])
        self.assertFalse(
            LogEntry.objects.filter(
                object_id=str(upload.pk),
                change_message__startswith="Admin action:",
            ).exists()
        )

    def test_admin_action_without_audited_field_change_writes_empty_prefixed_row(self):
        from gfbio_submissions.brokerage.admin import SubmissionCloudUploadAdmin

        def note_uploads(modeladmin, request, queryset):
            return None

        note_uploads.short_description = "Note selected cloud uploads"
        upload = _cloud_upload(self.staff)
        original_actions = SubmissionCloudUploadAdmin.actions
        SubmissionCloudUploadAdmin.actions = [note_uploads]
        try:
            self.client.force_login(self.staff)
            response = self.client.post(
                reverse("admin:brokerage_submissioncloudupload_changelist"),
                {
                    "action": "note_uploads",
                    "index": "0",
                    "select_across": "0",
                    "_selected_action": [str(upload.pk)],
                },
            )
        finally:
            SubmissionCloudUploadAdmin.actions = original_actions

        self.assertEqual(302, response.status_code)
        empty_rows = AuditLogEntry.objects.get_for_object(upload).filter(changes="{}")
        self.assertEqual(1, empty_rows.count())
        entry = empty_rows.get()
        self.assertEqual({}, entry.changes_dict)
        self.assertEqual(AuditLogEntry.Action.UPDATE, entry.action)
        self.assertEqual("admin", entry.additional_data["channel"])
        self.assertEqual("Admin Action: Note selected cloud uploads", entry.additional_data["action"])

    def test_audit_view_requires_permission_and_shows_status_label(self):
        upload = _cloud_upload(self.staff)
        upload.status = SubmissionCloudUpload.STATUS_UPLOADED
        upload.save()
        url = reverse("admin:brokerage_submissioncloudupload_audit", args=[upload.pk])

        staff = User.objects.create_user(username="cloud-audit-plain", password="secret")
        staff.is_staff = True
        staff.save()
        self.client.force_login(staff)
        self.assertEqual(403, self.client.get(url).status_code)

        view_perm = Permission.objects.get(codename="view_submissioncloudupload")
        staff.user_permissions.add(view_perm)
        staff = User.objects.get(pk=staff.pk)
        self.client.force_login(staff)
        response = self.client.get(url)
        self.assertEqual(200, response.status_code)
        self.assertContains(response, "In our bucket")

    def test_admin_change_form_records_admin_channel(self):
        from auditlog.context import set_actor
        from django.contrib.admin.sites import AdminSite

        from gfbio_submissions.brokerage.admin import SubmissionCloudUploadAdmin

        upload = _cloud_upload(self.staff)
        upload.attach_to_ticket = True
        with set_actor(self.staff):
            SubmissionCloudUploadAdmin(SubmissionCloudUpload, AdminSite()).save_model(None, upload, None, True)

        entry = _cloud_upload_updates(upload).get()
        self.assertEqual(self.staff.pk, entry.actor_id)
        self.assertEqual("admin", entry.additional_data["channel"])
        self.assertEqual("Save", entry.additional_data["action"])
        self.assertIn("attach_to_ticket", entry.changes_dict)

    def test_status_note_is_attached_to_the_status_diff(self):
        upload = _cloud_upload(self.staff)
        upload.status = SubmissionCloudUpload.STATUS_UPLOADED
        upload.save()
        upload.log_change(
            [{"changed": {"fields": [f"status changed to {upload.status} due to timeout"]}}],
            self.staff.pk,
        )

        entry = _cloud_upload_updates(upload).get()
        self.assertIn("status", entry.changes_dict)
        self.assertEqual(f"status changed to {upload.status} due to timeout", entry.additional_data["detail"])
        self.assertEqual(self.staff.pk, entry.actor_id)

    def test_status_note_keeps_an_existing_actor(self):
        from auditlog.context import set_actor

        other = User.objects.create_user(username="cloud-note-actor", password="secret")
        upload = _cloud_upload(self.staff)
        upload.status = SubmissionCloudUpload.STATUS_UPLOADED
        with set_actor(other):
            upload.save()
        upload.log_change(
            [{"changed": {"fields": ["status changed to uploaded"]}}],
            self.staff.pk,
        )

        entry = _cloud_upload_updates(upload).get()
        self.assertEqual(other.pk, entry.actor_id)

    def test_history_url_shows_django_log_not_the_audit_note(self):
        from django.contrib.contenttypes.models import ContentType

        upload = _cloud_upload(self.staff)
        upload.log_change("status kept at new")
        LogEntry.objects.log_action(
            user_id=self.staff.pk,
            content_type_id=ContentType.objects.get_for_model(SubmissionCloudUpload).pk,
            object_id=upload.pk,
            object_repr=str(upload),
            action_flag=CHANGE,
            change_message=[{"changed": {"fields": ["Status"]}}],
        )
        self.client.force_login(self.staff)
        response = self.client.get(reverse("admin:brokerage_submissioncloudupload_history", args=[upload.pk]))
        self.assertEqual(200, response.status_code)
        self.assertContains(response, "Changed Status.")
        self.assertNotContains(response, "status kept at new")
        audit = self.client.get(reverse("admin:brokerage_submissioncloudupload_audit", args=[upload.pk]))
        self.assertContains(audit, "status kept at new")

    def test_change_form_shows_audit_and_history_buttons(self):
        upload = _cloud_upload(self.staff)
        self.client.force_login(self.staff)
        response = self.client.get(reverse("admin:brokerage_submissioncloudupload_change", args=[upload.pk]))
        self.assertEqual(200, response.status_code)
        self.assertContains(response, reverse("admin:brokerage_submissioncloudupload_audit", args=[upload.pk]))
        self.assertContains(response, reverse("admin:brokerage_submissioncloudupload_history", args=[upload.pk]))

    def test_audit_page_has_no_data_diff_link(self):
        upload = _cloud_upload(self.staff)
        upload.status = SubmissionCloudUpload.STATUS_UPLOADED
        upload.save()
        self.client.force_login(self.staff)
        response = self.client.get(reverse("admin:brokerage_submissioncloudupload_audit", args=[upload.pk]))
        self.assertEqual(200, response.status_code)
        self.assertContains(response, "In our bucket")
        self.assertNotContains(response, "View diff")

    def test_status_kept_note_is_its_own_audit_row(self):
        upload = _cloud_upload(self.staff)
        upload.log_change("status kept at new")

        entry = _cloud_upload_updates(upload).get()
        self.assertEqual({}, entry.changes_dict)
        self.assertEqual("status kept at new", entry.additional_data["detail"])

    def test_empty_audit_page_uses_a_generic_message(self):
        upload = _cloud_upload(self.staff)
        AuditLogEntry.objects.get_for_object(upload).delete()
        self.client.force_login(self.staff)
        response = self.client.get(reverse("admin:brokerage_submissioncloudupload_audit", args=[upload.pk]))
        self.assertEqual(200, response.status_code)
        self.assertContains(response, "This object has no audit entries.")
        self.assertNotContains(response, "This submission has no audit entries.")

    def test_other_model_admin_action_keeps_a_single_history_prefix(self):
        from django.contrib.contenttypes.models import ContentType

        from gfbio_submissions.brokerage.admin import BrokerObjectAdmin

        def touch_broker_objects(modeladmin, request, queryset):
            return None

        touch_broker_objects.short_description = "Touch broker objects"
        broker_object = BrokerObject.objects.create(type="study", user=self.staff)
        had_own_actions = "actions" in BrokerObjectAdmin.__dict__
        previous_actions = BrokerObjectAdmin.__dict__.get("actions")
        BrokerObjectAdmin.actions = [touch_broker_objects]
        try:
            self.client.force_login(self.staff)
            response = self.client.post(
                reverse("admin:brokerage_brokerobject_changelist"),
                {
                    "action": "touch_broker_objects",
                    "index": "0",
                    "select_across": "0",
                    "_selected_action": [str(broker_object.pk)],
                },
            )
        finally:
            if had_own_actions:
                BrokerObjectAdmin.actions = previous_actions
            else:
                del BrokerObjectAdmin.actions

        self.assertEqual(302, response.status_code)
        content_type = ContentType.objects.get_for_model(BrokerObject)
        messages = list(
            LogEntry.objects.filter(content_type=content_type, object_id=str(broker_object.pk)).values_list(
                "change_message", flat=True
            )
        )
        self.assertEqual(["Admin action: Touch broker objects"], messages)


# Registered here so production autodiscover stays unchanged. Invoked with
# delay/apply_async/apply so Celery sends task_prerun and task_postrun.
@celery_app.task(name="tasks.audit_test_save_status_task")
def audit_test_save_status_task(submission_id, status):
    submission = Submission.objects.get(pk=submission_id)
    submission.status = status
    submission.save()


@celery_app.task(name="tasks.audit_test_inner_save_status_task")
def audit_test_inner_save_status_task(submission_id, status):
    submission = Submission.objects.get(pk=submission_id)
    submission.status = status
    submission.save()


@celery_app.task(name="tasks.audit_test_outer_save_status_task")
def audit_test_outer_save_status_task(submission_id, inner_status, outer_status):
    audit_test_inner_save_status_task.delay(submission_id, inner_status)
    submission = Submission.objects.get(pk=submission_id)
    submission.status = outer_status
    submission.save()


@celery_app.task(name="tasks.audit_test_failing_save_status_task")
def audit_test_failing_save_status_task(submission_id, status):
    submission = Submission.objects.get(pk=submission_id)
    submission.status = status
    submission.save()
    raise RuntimeError("audit test task failed")


def _update_for(submission, channel, action):
    matches = [
        entry
        for entry in _updates(submission)
        if (entry.additional_data or {}).get("channel") == channel
        and (entry.additional_data or {}).get("action") == action
    ]
    if len(matches) != 1:
        raise AssertionError(
            "expected one UPDATE with channel={0!r} action={1!r}, found {2}".format(
                channel, action, [(entry.additional_data, entry.changes) for entry in _updates(submission)]
            )
        )
    return matches[0]


class TestCeleryAuditChannel(TestCase):
    def setUp(self):
        self.staff = User.objects.create_user(username="celery-audit-staff", password="secret")

    def test_task_save_is_celery_channel_with_task_name_and_no_actor(self):
        submission = _submission(self.staff)
        audit_test_save_status_task.delay(submission.pk, Submission.SUBMITTED)

        self.assertEqual(1, _updates(submission).count())
        entry = _update_for(submission, "celery", audit_test_save_status_task.name)
        self.assertEqual(audit_test_save_status_task.name, entry.additional_data["action"])
        self.assertIn("status", entry.changes_dict)
        self.assertIsNone(entry.actor)

    def test_task_save_restores_outer_frontend_context(self):
        from gfbio_submissions.brokerage.audit_context import (
            current_submission_audit_context,
            submission_audit_context,
        )

        submission = _submission(self.staff)
        with submission_audit_context("Save", "frontend"):
            audit_test_save_status_task.apply_async(args=[submission.pk, Submission.SUBMITTED])
            self.assertEqual({"action": "Save", "channel": "frontend"}, current_submission_audit_context())
            submission.refresh_from_db()
            submission.status = Submission.CLOSED
            submission.save()

        self.assertEqual(2, _updates(submission).count())
        celery_entry = _update_for(submission, "celery", audit_test_save_status_task.name)
        frontend_entry = _update_for(submission, "frontend", "Save")
        self.assertIn("status", celery_entry.changes_dict)
        self.assertIn("status", frontend_entry.changes_dict)
        self.assertEqual("Save", frontend_entry.additional_data["action"])

    def test_nested_tasks_stack_and_a_failure_restores_the_outer_context(self):
        from gfbio_submissions.brokerage.audit_context import (
            current_submission_audit_context,
            submission_audit_context,
        )

        submission = _submission(self.staff)
        with submission_audit_context("Save", "frontend"):
            audit_test_outer_save_status_task.apply(
                args=[submission.pk, Submission.SUBMITTED, Submission.CLOSED],
            )
            self.assertEqual({"action": "Save", "channel": "frontend"}, current_submission_audit_context())
            submission.refresh_from_db()
            submission.status = Submission.ERROR
            submission.save()

        self.assertEqual(3, _updates(submission).count())
        inner_entry = _update_for(submission, "celery", audit_test_inner_save_status_task.name)
        outer_entry = _update_for(submission, "celery", audit_test_outer_save_status_task.name)
        frontend_entry = _update_for(submission, "frontend", "Save")
        self.assertIn("status", inner_entry.changes_dict)
        self.assertIn("status", outer_entry.changes_dict)
        self.assertEqual(Submission.SUBMITTED, inner_entry.changes_dict["status"][1])
        self.assertEqual(Submission.CLOSED, outer_entry.changes_dict["status"][1])
        self.assertEqual("Save", frontend_entry.additional_data["action"])
        self.assertIn("status", frontend_entry.changes_dict)

    def test_failed_task_restores_the_outer_context(self):
        from gfbio_submissions.brokerage.audit_context import (
            current_submission_audit_context,
            submission_audit_context,
        )

        failed = _submission(self.staff, status=Submission.OPEN)
        with submission_audit_context("Save", "frontend"):
            with self.assertRaises(RuntimeError):
                audit_test_failing_save_status_task.delay(failed.pk, Submission.SUBMITTED)
            self.assertEqual({"action": "Save", "channel": "frontend"}, current_submission_audit_context())
            failed.refresh_from_db()
            failed.status = Submission.CLOSED
            failed.save()

        self.assertEqual(2, _updates(failed).count())
        failed_task_entry = _update_for(failed, "celery", audit_test_failing_save_status_task.name)
        restored_entry = _update_for(failed, "frontend", "Save")
        self.assertIn("status", failed_task_entry.changes_dict)
        self.assertIsNone(failed_task_entry.actor)
        self.assertEqual("frontend", restored_entry.additional_data["channel"])
        self.assertEqual("Save", restored_entry.additional_data["action"])
        self.assertIn("status", restored_entry.changes_dict)

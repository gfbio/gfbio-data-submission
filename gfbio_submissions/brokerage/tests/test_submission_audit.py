from unittest.mock import patch

import arrow
from auditlog.models import LogEntry as AuditLogEntry
from django.contrib.admin.models import LogEntry
from django.contrib.auth.models import Group, Permission
from django.test import TestCase
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from gfbio_submissions.brokerage.configuration.settings import GFBIO_HELPDESK_TICKET
from gfbio_submissions.brokerage.models.additional_reference import AdditionalReference
from gfbio_submissions.brokerage.models.submission import Submission
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

    def test_data_only_change_is_not_audited(self):
        submission = _submission(self.staff)
        submission.data = {"requirements": {"title": "changed"}}
        submission.save()

        self.assertFalse(_updates(submission).exists())

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

        history = LogEntry.objects.get(object_id=str(submission.pk))
        self.assertEqual(self.staff.pk, history.user_id)
        self.assertEqual("Admin action: Cancel selected submissions", history.change_message)

        entry = _updates(submission).get()
        self.assertEqual(self.staff.pk, entry.actor_id)
        self.assertEqual("admin", entry.additional_data["channel"])
        self.assertEqual("Cancel selected submissions", entry.additional_data["action"])

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
        logged_ids = set(
            LogEntry.objects.filter(
                object_id__in=[str(first.pk), str(second.pk)],
                change_message__startswith="Admin action:",
            ).values_list("object_id", flat=True)
        )
        self.assertEqual({str(first.pk), str(second.pk)}, logged_ids)

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
        logged_ids = set(
            LogEntry.objects.filter(change_message__startswith="Admin action:").values_list("object_id", flat=True)
        )
        self.assertEqual({str(agreed.pk)}, logged_ids)

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
        history = LogEntry.objects.get(object_id=str(submission.pk))
        self.assertEqual("Admin action: Cancel selected submissions", history.change_message)

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

        history = LogEntry.objects.get(object_id=str(submission.pk))
        self.assertEqual(self.curator.pk, history.user_id)
        self.assertEqual("Curator action: Cancel selected submissions", history.change_message)

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

        history = LogEntry.objects.get(object_id=str(submission.pk))
        self.assertEqual("Curator action: Set state to CANCELLED", history.change_message)
        entry = _updates(submission).get()
        self.assertEqual(self.curator.pk, entry.actor_id)
        self.assertEqual("curator", entry.additional_data["channel"])
        self.assertEqual("Set state to CANCELLED", entry.additional_data["action"])

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

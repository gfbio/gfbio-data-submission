# -*- coding: utf-8 -*-

from unittest.mock import patch

from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import GFBIO_HELPDESK_TICKET, SUBMISSION_DELAY
from gfbio_submissions.brokerage.tasks.submission_tasks.check_for_molecular_content_in_submission import (
    check_for_molecular_content_in_submission_task,
)
from gfbio_submissions.brokerage.tests.utils import _create_submission_via_serializer
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User

CHECKER_PATH = (
    "gfbio_submissions.brokerage.tasks.submission_tasks."
    "check_for_molecular_content_in_submission.MolecularContentChecker"
)
APPLY_ASYNC_PATH = (
    "gfbio_submissions.brokerage.tasks.jira_tasks.update_submission_issue." "update_submission_issue_task.apply_async"
)
CHECKER_RESULT = (True, ["kept-message"], True, ["kept-info"])
EXPECTED_RETURN = {
    "molecular_data_available": True,
    "messages": ["kept-message"],
    "molecular_data_check_performed": True,
    "infos": ["kept-info"],
}
ENA_DATA_CENTER = "ENA – European Nucleotide Archive"
GENERIC_DATA_CENTER = "GFBio Data Centers - our curators will suggest the appropriate one(s)"


def _checker_setting_data_center(data_center):
    class _FakeChecker:
        def __init__(self, submission, file_opener):
            self.submission = submission

        def run_check(self):
            self.submission.data.setdefault("requirements", {})["data_center"] = data_center
            return CHECKER_RESULT

    return _FakeChecker


class TestCheckForMolecularContentSchedulesHelpdeskUpdate(TestCase):
    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        site_config = SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            ena_server=resource_cred,
            ena_report_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
            contact="kevin@horstmeier.de",
        )
        user = User.objects.create_user(username="horst", email="horst@horst.de", password="password")
        user.site_configuration = site_config
        user.save()

    def _submission(self, data_center, with_primary_ticket=True):
        submission = _create_submission_via_serializer(create_broker_objects=False)
        # Reassign JSONField so the nested data_center change is persisted.
        data = submission.data
        requirements = data.get("requirements", {})
        requirements["data_center"] = data_center
        data["requirements"] = requirements
        submission.data = data
        submission.save(update_fields=["data"])
        if with_primary_ticket:
            submission.additionalreference_set.create(
                type=GFBIO_HELPDESK_TICKET, reference_key="FAKE_KEY", primary=True
            )
        return submission

    def _run(self, submission, new_data_center):
        with patch(CHECKER_PATH, _checker_setting_data_center(new_data_center)), patch(
            APPLY_ASYNC_PATH
        ) as apply_async:
            result = check_for_molecular_content_in_submission_task.apply(
                kwargs={"submission_id": submission.pk}
            ).get()
        return result, apply_async

    def test_schedules_update_only_on_transition_to_ena_with_primary_ticket(self):
        submission = self._submission(GENERIC_DATA_CENTER, with_primary_ticket=True)

        result, apply_async = self._run(submission, ENA_DATA_CENTER)

        self.assertEqual(EXPECTED_RETURN, result)
        apply_async.assert_called_once_with(
            kwargs={"submission_id": submission.pk},
            countdown=SUBMISSION_DELAY,
        )

    def test_schedules_update_when_non_string_data_center_becomes_ena(self):
        submission = self._submission(None, with_primary_ticket=True)

        result, apply_async = self._run(submission, ENA_DATA_CENTER)

        self.assertEqual(EXPECTED_RETURN, result)
        apply_async.assert_called_once_with(
            kwargs={"submission_id": submission.pk},
            countdown=SUBMISSION_DELAY,
        )

    def test_does_not_schedule_when_data_center_was_already_ena(self):
        submission = self._submission(ENA_DATA_CENTER, with_primary_ticket=True)

        result, apply_async = self._run(submission, ENA_DATA_CENTER)

        self.assertEqual(EXPECTED_RETURN, result)
        apply_async.assert_not_called()

    def test_does_not_schedule_without_primary_ticket(self):
        submission = self._submission(GENERIC_DATA_CENTER, with_primary_ticket=False)

        result, apply_async = self._run(submission, ENA_DATA_CENTER)

        self.assertEqual(EXPECTED_RETURN, result)
        apply_async.assert_not_called()

    def test_non_string_data_center_after_check_does_not_raise(self):
        submission = self._submission(GENERIC_DATA_CENTER, with_primary_ticket=True)

        result, apply_async = self._run(submission, None)

        self.assertEqual(EXPECTED_RETURN, result)
        apply_async.assert_not_called()

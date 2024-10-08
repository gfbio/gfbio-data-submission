# -*- coding: utf-8 -*-
import logging
import os
from typing import List
from uuid import UUID

import arrow
from django.core.mail import mail_admins
from django.db.models import Q
from rest_framework import serializers

from gfbio_submissions.brokerage.configuration.settings import ENA, ENA_PANGAEA, GENERIC, GFBIO_HELPDESK_TICKET
from gfbio_submissions.brokerage.models.additional_reference import AdditionalReference
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.utils.schema_validation import validate_data
from gfbio_submissions.users.models import User

logger = logging.getLogger(__name__)


class JiraHookRequestSerializer(serializers.Serializer):
    user = serializers.JSONField()
    issue = serializers.JSONField()
    changelog = serializers.JSONField(required=False)
    broker_submission_id = serializers.CharField(read_only=True, required=False)
    issue_key = serializers.CharField(read_only=True, required=False)

    class Meta:
        fields = [
            "issue",
        ]

    def send_mail_to_admins(
        self,
        reason: str,
        message: str,
        add_submission_id: bool = True,
        add_issue_key: bool = True,
    ):
        submission_msg = f"Submission ID: {self.broker_submission_id}" if add_submission_id else ""
        issue_msg = f"Issue Key: {self.issue_key}" if add_issue_key else ""
        msg = "\n".join(filter(None, [message, submission_msg, issue_msg]))
        mail_admins(subject=reason, message=msg)

    def _data_get(self, data: dict, keys: List[str]):
        resp = data
        try:
            for key in keys:
                resp = resp[key]
        except Exception as e:
            logger.error(
                msg="serializers.py | JiraHookRequestSerializer | " "unable to get {1} | {0}".format(e, " ".join(keys))
            )

            self.send_mail_to_admins(
                reason="Submission update via Jira hook failed",
                message="serializers.py | JiraHookRequestSerializer | "
                "unable to get {1} | {0}".format(e, " ".join(keys)),
            )

        if isinstance(resp, str):
            return resp.strip()

        return resp

    def save(self):
        try:
            embargo_date = arrow.get(self._data_get(self.validated_data, ["issue", "fields", "customfield_10200"]))
        except arrow.parser.ParserError as e:
            logger.error(
                msg="serializers.py | JiraHookRequestSerializer | " "unable to parse embargo date | {0}".format(e)
            )
            self.send_mail_to_admins(
                reason="Submission update via Jira hook failed",
                message="serializers.py | JiraHookRequestSerializer | " "unable to parse embargo date | {0}".format(e),
            )

        submission_id = self._data_get(self.validated_data, ["issue", "fields", "customfield_10303"])
        try:
            submission = Submission.objects.get(broker_submission_id=UUID(submission_id))
        except Submission.DoesNotExist as e:
            logger.error(
                msg="serializers.py | JiraHookRequestSerializer | " "unable to get submission | {0}".format(e)
            )
            self.send_mail_to_admins(
                reason="Submission update via Jira hook failed",
                message="serializers.py | JiraHookRequestSerializer | " "unable to get submission | {0}".format(e),
            )

        submission.embargo = embargo_date.date()
        submission.save()

        updating_user = self._data_get(self.validated_data, ["user", "emailAddress"])

        logger.info(msg="serializers.py | JiraHookRequestSerializer | " "updating user | {0}".format(updating_user))
        # update ena
        from gfbio_submissions.brokerage.tasks.process_tasks.update_ena_embargo import update_ena_embargo_task

        update_ena_embargo_task.apply_async(
            kwargs={
                "submission_id": submission.pk,
            }
        )

        try:
            reporter_dict = self.validated_data.get("issue", {}).get("fields", {}).get("reporter", {})
            if len(reporter_dict):
                self.update_submission_user()
        except Exception as e:
            logger.error(
                msg="serializers.py | JiraHookRequestSerializer | " "unable to parse reporter | {0}".format(e)
            )
            self.send_mail_to_admins(
                reason="Submission update via Jira hook failed",
                message="serializers.py | JiraHookRequestSerializer | " "unable to parse reporter | {0}".format(e),
            )

    def update_submission_user(self):
        new_reporter = {
            "jira_user_name": "",
            "email": "",
        }

        reporter_name = self._data_get(self.validated_data, ["issue", "fields", "reporter", "name"])
        if reporter_name:
            new_reporter["jira_user_name"] = reporter_name

        reporter_email = self._data_get(self.validated_data, ["issue", "fields", "reporter", "emailAddress"])
        if reporter_email:
            new_reporter["email"] = reporter_email

        submission_id = self._data_get(self.validated_data, ["issue", "fields", "customfield_10303"])

        try:
            submission = Submission.objects.get(broker_submission_id=UUID(submission_id))
        except Submission.DoesNotExist as e:
            logger.error(
                msg="serializers.py | JiraHookRequestSerializer | " "unable to get submission | {0}".format(e)
            )
            self.send_mail_to_admins(
                reason="Submission update via Jira hook failed",
                message="serializers.py | JiraHookRequestSerializer | " "unable to get submission | {0}".format(e),
            )

        # three possibilities:

        # first: is reporter the same as reporter or user from current submission via email?
        # second: search across all Submission users, is reporter included via email?
        # third: if neither, add as new user, take name and email

        # first:
        submission = Submission.objects.get(broker_submission_id=UUID(submission_id))

        submission_current_user = submission.user
        email_current = submission_current_user.email
        if str(email_current) == str(new_reporter["email"]).strip():
            return

        # on the second:
        found_users = User.objects.filter(is_user=True, email=new_reporter["email"])
        if found_users.count() > 0:
            # change link to submission:
            submission.user = found_users.first()
            submission.user_id = found_users.first().id
            submission.save()
            return

        # on the third, new user with shadow account:
        bio_user = User.objects.create_user(username=new_reporter["jira_user_name"], email=new_reporter["email"])
        submission.user = bio_user
        submission.user_id = bio_user.id
        submission.save()

    # TODO: !IMPORTANT! Please add a check procedure in the generic parsing of the JSON,
    #  that if the user that caused the action was the brokeragent,
    #  any further processing is skipped.

    def get_broker_submission_id_field_value(self):
        return self._data_get(self.initial_data, ["issue", "fields", "customfield_10303"])

    def get_embargo_date_field_value(self):
        return self._data_get(self.initial_data, ["issue", "fields", "customfield_10200"])

    def schema_validation(self, data):
        path = os.path.join(
            os.getcwd(),
            "gfbio_submissions/brokerage/schemas/jira_update_hook_schema.json",
        )
        valid, errors = validate_data(data=data, schema_file=path, use_draft04_validator=True)
        if not valid:
            self.send_mail_to_admins(
                reason="Submission update via jira hook failed",
                message="Data provided by Jira hook is not valid.\n"
                "{0}".format({"issue": [e.message for e in errors]}),
                add_submission_id=False,
                add_issue_key=False,
            )
            raise serializers.ValidationError({"issue": [e.message for e in errors]})

        self.broker_submission_id = self.get_broker_submission_id_field_value()
        self.issue_key = self._data_get(self.initial_data, ["issue", "key"])

    @staticmethod
    def embargo_date_format_validation(self, jira_embargo_date):
        try:
            embargo_date = arrow.get(jira_embargo_date)
        except arrow.parser.ParserError as e:
            self.send_mail_to_admins(
                reason="Submission update via Jira hook failed",
                message="serializers.py | JiraHookRequestSerializer | " "customfield_10200\n" "{0}".format(e),
            )
            raise serializers.ValidationError({"issue": ["'customfield_10200': {0}".format(e)]})
        return embargo_date

    def embargo_data_future_check(self, embargo_date, delta):
        # future, 1 year = 365 days, *2 = 730
        if delta.days > 730:
            self.send_mail_to_admins(
                reason="WARNING: submission embargo date in the distant future",
                message="WARNING: JIRA hook requested an Embargo Date in the distant future",
            )
            raise serializers.ValidationError(
                {
                    "issue": [
                        "'customfield_10200': embargo date too far in the future: {0}".format(embargo_date.for_json())
                    ]
                }
            )

    def embargo_date_past_check(self, embargo_date, delta):
        # past, 1 day granularity
        if delta.days <= 0:
            self.send_mail_to_admins(
                reason="WARNING: submission embargo date in the past",
                message="WARNING: JIRA hook requested an Embargo Date in the past",
            )
            raise serializers.ValidationError(
                {"issue": ["'customfield_10200': embargo date in the past: {0}".format(embargo_date.for_json())]}
            )

    def embargo_date_validation(self, submission_embargo):
        # TODO: constant for customfield key !
        jira_embargo_date = self.get_embargo_date_field_value()
        embargo_date = self.embargo_date_format_validation(self, jira_embargo_date)

        today = arrow.get(arrow.now().format("YYYY-MM-DD"))
        delta = embargo_date - today
        self.embargo_date_past_check(embargo_date, delta)
        self.embargo_data_future_check(embargo_date, delta)

    def submission_existing_check(self):
        # TODO: constant for customfield key !
        submission_id = self.get_broker_submission_id_field_value()
        submission = None
        try:
            # TODO: this here is hint to evtl. move this serializer to brokerag app
            submission = Submission.objects.get(broker_submission_id=UUID(submission_id))
        except Submission.DoesNotExist as e:
            self.send_mail_to_admins(
                reason="Submission update via Jira hook failed",
                message="serializers.py | JiraHookRequestSerializer | "
                "unable to get submission for customfield_10303 | {0}".format(e),
            )
            raise serializers.ValidationError({"issue": ["'customfield_10303': {0} {1}".format(e, submission_id)]})
        return submission

    def submission_relation_check(self, submission):
        if submission:
            # TODO: this here is hint to evtl. move this serializer to brokerag app
            references = submission.additionalreference_set.filter(
                type=GFBIO_HELPDESK_TICKET,
                primary=True,
                reference_key=self.issue_key,
            )
            if len(references) == 0:
                self.send_mail_to_admins(
                    reason="WARNING: submission embargo date, issue not found",
                    message="WARNING: JIRA hook requested an Embargo Date update,"
                    " but issue could not be found for the submission",
                )
                raise serializers.ValidationError(
                    {
                        "issue": [
                            "'key': no related issue with key: {0} found for submission {1}".format(
                                self.issue_key, self.broker_submission_id
                            )
                        ]
                    }
                )

    def brokeragent_validation(self):
        updating_user = self._data_get(self.initial_data, ["user", "emailAddress"])

        logger.info(msg="serializers.py | brokeragent_validation | user {0}".format(updating_user))
        # check for brokeragent user
        if updating_user == "brokeragent@gfbio.org":
            raise serializers.ValidationError({"issue": ["'user': user is brokeragent"]})

    def reporter_email_validation(self):
        repo_mail = self._data_get(self.initial_data, ["issue", "fields", "reporter", "emailAddress"])

        # check for empty reporter mail:
        if not len(repo_mail):
            logger.info(msg="serializers.py | reporter_email_validation | reporter's Jira emailAddress is empty!")
            self.send_mail_to_admins(
                reason="WARNING: no submission user change, reporter's Jira emailAddress is empty!",
                message="WARNING: JIRA hook requested an user update, but reporter's Jira emailAddress is empty!",
            )
            raise serializers.ValidationError({"issue": ["'reporter': reporter's Jira emailAddress is empty!"]})

    def curator_validation(self):
        updating_user = self._data_get(self.initial_data, ["user", "emailAddress"])

        logger.info(msg="serializers.py | curator_validation | updating user {0}".format(updating_user))
        # get curators
        curators = User.objects.filter(groups__name="Curators")
        if len(curators) == 0:
            logger.info(msg="serializers.py | curator_validation | no curators found")
            self.send_mail_to_admins(
                reason="WARNING: submission embargo date, user not a curator",
                message="WARNING: JIRA hook requested an Embargo Date update"
                " but user is not a curator, no curators found",
            )
            raise serializers.ValidationError({"issue": ["'user': user is not in curators group, no curators found"]})

        curators_emails = [curator.email for curator in curators]
        if updating_user not in curators_emails:
            logger.info(msg="serializers.py | curator_validation | user {0} is not a crurator".format(updating_user))
            self.send_mail_to_admins(
                reason="WARNING: submission embargo date, user not curator",
                message="WARNING: JIRA hook requested an Embargo Date update,"
                " but user {0} is not a curator".format(updating_user),
            )
            raise serializers.ValidationError({"issue": ["'user': user is not in curators group"]})

    def submission_type_constraints_check(self, submission, key):
        if submission and submission.target == GENERIC:
            return True
        # molecular submission
        elif submission.target == ENA or submission.target == ENA_PANGAEA:
            # check if user is a curator
            self.curator_validation()
            # TODO: this here is hint to evtl. move this serializer to brokerage app
            studies = submission.brokerobject_set.filter(type="study")

            # go through all studies, although there should be only one ...
            # if any of the relate study broker_objects has a primary ena pid
            # with status private, the overall update of the submission will
            # be allowed if status is undefined or other than private,
            # update is rejected
            change_allowed = False
            status = None
            has_primary_accession = False
            for s in studies:
                primary_accession = s.persistentidentifier_set.filter(archive="ENA", pid_type="PRJ").first()

                if not has_primary_accession and primary_accession is not None:
                    has_primary_accession = True
                else:
                    logger.warning(
                        msg="serializers.py | submission_type_constraints_check | "
                        "no primary accession for submission {0}".format(submission.broker_submission_id)
                    )
                    self.send_mail_to_admins(
                        reason="WARNING: submission missing primary accession",
                        message=(
                            "WARNING: JIRA hook requested update of Embargo Date for submission without a primary "
                            "accession (i.e. BioProject ID). Submission target {0}"
                        ).format(submission.target),
                    )
                    raise serializers.ValidationError(
                        {
                            "issue": [
                                (
                                    "'key': issue {0}. submission without a primary accession, submission {1} with "
                                    "target {2}"
                                ).format(
                                    key,
                                    submission.broker_submission_id,
                                    submission.target,
                                )
                            ]
                        }
                    )
                if not status:
                    status = primary_accession.status

                allowed = s.persistentidentifier_set.filter(archive="ENA", pid_type="PRJ").filter(
                    Q(status="PRIVATE") | Q(status="SUPPRESSED")
                )
                if allowed:
                    change_allowed = True
                    break
            if not change_allowed:
                logger.warning(
                    msg="serializers.py | submission_type_constraints_check | "
                    "not PRIVATE or SUPPRESSED submission {0} status {1}".format(
                        submission.broker_submission_id, status
                    )
                )
                self.send_mail_to_admins(
                    reason="WARNING: submission status is not PRIVATE or SUPPRESSED",
                    message="WARNING: JIRA hook requested update of Embargo Date"
                    " for submission which is not PRIVATE or SUPPRESSED"
                    " (status is: {0} )".format(status),
                )
                raise serializers.ValidationError(
                    {
                        "issue": [
                            (
                                "'key': issue {0}. status prevents update of submission {1} with target {2} and "
                                "status:{3}"
                            ).format(
                                key,
                                submission.broker_submission_id,
                                submission.target,
                                status,
                            )
                        ]
                    }
                )
            return change_allowed

    def validate(self, data):
        self.schema_validation(data)
        submission = self.submission_existing_check()
        key = self.submission_relation_check(submission)
        self.brokeragent_validation()
        self.reporter_email_validation()
        self.embargo_date_validation(submission.embargo)
        self.submission_type_constraints_check(submission, key)
        return data

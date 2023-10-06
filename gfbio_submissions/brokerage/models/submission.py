# -*- coding: utf-8 -*-
import uuid

from django.db import models
from django.db.models import Q
from model_utils.models import TimeStampedModel

from config.settings.base import AUTH_USER_MODEL
from gfbio_submissions.brokerage.configuration.settings import (
    ENA,
    ENA_PANGAEA,
    GENERIC,
    ATAX,
)

# from gfbio_submissions.brokerage.managers import SubmissionManager
from gfbio_submissions.generic.fields import JsonDictField

# from .additional_reference import AdditionalReference
# from .additional_reference import AdditionalReference
from .center_name import CenterName
from ..configuration.settings import PANGAEA_JIRA_TICKET, GFBIO_HELPDESK_TICKET
from ..managers.submission_manager import SubmissionManager


class Submission(TimeStampedModel):
    OPEN = "OPEN"
    SUBMITTED = "SUBMITTED"
    CANCELLED = "CANCELLED"
    ERROR = "ERROR"
    CLOSED = "CLOSED"

    STATUSES = [
        (OPEN, OPEN),
        (SUBMITTED, SUBMITTED),
        (CANCELLED, CANCELLED),
        (ERROR, ERROR),
        (CLOSED, CLOSED),
    ]

    TARGETS = (
        (ENA, ENA),
        (ENA_PANGAEA, ENA_PANGAEA),
        (GENERIC, GENERIC),
        (ATAX, ATAX),
    )

    broker_submission_id = models.UUIDField(primary_key=False, default=uuid.uuid4)

    # TODO: remove after refactoring user-site-relations are done
    # TODO: be careful with existing submissions using this field.
    #  maybe check if user field is used by submission, then first remove user
    #  then rename site to user in 2 migration steps
    # site = models.ForeignKey(
    #     AUTH_USER_MODEL,
    #     null=True,
    #     blank=True,
    #     related_name='site_submissions',
    #     on_delete=models.SET_NULL)
    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="user_submissions",
        on_delete=models.SET_NULL,
    )

    target = models.CharField(max_length=16, choices=TARGETS)

    # TODO: investigate where this field is used
    # TODO: adapt to new situation of local users (sso, social, django user)
    #  and external (site only)  BE CAREFUL ! LEGACY DATA !
    # submitting_user = models.CharField(max_length=72, default='', blank=True,
    #                                    null=True,
    #                                    help_text=
    #                                    'Identifier of submitting user. May '
    #                                    'vary for different sites, e.g. user-id'
    #                                    ' from database, uniquq login-name, '
    #                                    'etc..')
    # TODO: remove in Submission ownership refactoring. BE CAREFUL ! LEGACY DATA !
    # submitting_user_common_information = models.TextField(
    #     default='',
    #     blank=True,
    #     null=True,
    #     help_text='General information regarding the submitting user in '
    #               'free-text form, e.g. full name and/or email-address, ORCID,'
    #               ' etc.. . Will be used to fill Helpdesk/Jira fields that ask'
    #               ' for this kind of verbose information'
    # )
    status = models.CharField(choices=STATUSES, max_length=10, default=OPEN)
    release = models.BooleanField(default=False)
    approval_notification_sent = models.BooleanField(default=False)

    # TODO: this might be to specific for a general submission model ?
    # TODO: discuss general submission model with subclasses like molecular or similar
    download_url = models.URLField(default="", blank=True)
    center_name = models.ForeignKey(
        CenterName,
        null=True,
        on_delete=models.SET_NULL,
        help_text="NOTE: When changing the center_name you will have to "
        "manually create new XML to get XML containing the "
        "updated center_name. Do so by trigger the "
        '"Re-Create XML (ENA)" admin action.',
    )

    data = JsonDictField(default=dict)
    # default to today + 1 year
    # FIXME: setting default dynamically causes new migrations. without migrations default is last date plus 1 year
    embargo = models.DateField(null=True, blank=True)

    objects = SubmissionManager()

    # get first PRJ object
    def get_primary_accession(self):
        try:
            broker_objects = self.brokerobject_set.filter(type="study")
            for obj in broker_objects:
                for pid in obj.persistentidentifier_set.filter(pid_type="PRJ"):
                    # return first object, in theory should be only one
                    return pid
            return None
        except IndexError:
            return None

    # for frontend
    def get_accession_id(self):
        try:
            broker_objects = self.brokerobject_set.filter(type="study")
            data = []
            for broker_object in broker_objects:
                for (
                    persistentidentifier_object
                ) in broker_object.persistentidentifier_set.filter(pid_type="PRJ"):
                    data.append(
                        {
                            "pid": persistentidentifier_object.pid,
                            "status": persistentidentifier_object.status,
                        }
                    )
            return data
        except IndexError:
            return []

    # TODO: refactor/move: too specific (molecular submission)
    def get_json_with_aliases(self, alias_postfix):
        new_study_alias, study = self.set_study_alias(alias_postfix)
        sample_aliases, samples = self.set_sample_aliases(alias_postfix)
        experiment_aliases, experiments = self.set_experiment_aliases(
            alias_postfix, new_study_alias, sample_aliases
        )
        runs = self.set_run_aliases(alias_postfix, experiment_aliases)

        return (
            study.data,
            [s.data for s in samples],
            [s.data for s in experiments],
            [s.data for s in runs],
        )

    # TODO: refactor/move: too specific (molecular submission)
    def set_run_aliases(self, alias_postfix, experiment_aliases):
        runs = self.brokerobject_set.filter(type="run")
        for r in runs:
            if "experiment_ref" in r.data.keys():
                r.data["experiment_ref"] = experiment_aliases.get(
                    r.data["experiment_ref"], "no_sample_descriptor"
                )
                r.data["run_alias"] = "{0}:{1}".format(r.id, alias_postfix)
        return runs

    # TODO: refactor/move: too specific (molecular submission)
    # FIXME: access to first() in many-to-many relation may cause semantic errors
    def set_study_alias(self, alias_postfix):
        study = self.brokerobject_set.filter(type="study").first()
        new_study_alias = "{0}:{1}".format(study.id, alias_postfix)
        study.data["study_alias"] = new_study_alias
        return new_study_alias, study

    # TODO: refactor/move: too specific (molecular submission)
    def set_experiment_aliases(self, alias_postfix, new_study_alias, sample_aliases):
        experiments = self.brokerobject_set.filter(type="experiment")
        experiment_aliases = {
            e.data.get("experiment_alias", "no_experiment_alias"): "{0}:{1}".format(
                e.id, alias_postfix
            )
            for e in experiments
        }
        for e in experiments:
            if "experiment_alias" in e.data.keys():
                e.data["experiment_alias"] = experiment_aliases.get(
                    e.data["experiment_alias"], "no_experiment_alias"
                )
                e.data["study_ref"] = new_study_alias
                e.data["design"]["sample_descriptor"] = sample_aliases.get(
                    e.data["design"]["sample_descriptor"], "no_sample_descriptor"
                )

        return experiment_aliases, experiments

    # TODO: refactor/move: too specific (molecular submission)
    def set_sample_aliases(self, alias_postfix):
        samples = self.brokerobject_set.filter(type="sample")
        sample_aliases = {
            s.data.get("sample_alias", "no_sample_alias"): "{0}:{1}".format(
                s.id, alias_postfix
            )
            for s in samples
        }
        for s in samples:
            if "sample_alias" in s.data.keys():
                s.data["sample_alias"] = sample_aliases.get(
                    s.data["sample_alias"], "no_sample_alias"
                )

        return sample_aliases, samples

    # TODO: refactor/move: too specific (molecular submission)
    def get_study_json(self):
        return self.brokerobject_set.filter(type="study").first().data

    # TODO: refactor/move: too specific (molecular submission)
    def get_sample_json(self):
        return {
            "samples": [s.data for s in self.brokerobject_set.filter(type="sample")]
        }

    # TODO: refactor/move: too specific (molecular submission)
    def get_experiment_json(self):
        return {
            "experiments": [
                s.data for s in self.brokerobject_set.filter(type="experiment")
            ]
        }

    # TODO: refactor/move: too specific (molecular submission)
    def get_run_json(self):
        return {"runs": [s.data for s in self.brokerobject_set.filter(type="run")]}

    # TODO: check if filter for primary makes sense. will deliver only on per submission
    def get_primary_pangaea_references(self):
        return self.additionalreference_set.filter(
            Q(type=PANGAEA_JIRA_TICKET) & Q(primary=True)
        )

    def get_primary_reference(self, reference_type):
        issues = self.additionalreference_set.filter(
            Q(type=reference_type) & Q(primary=True)
        )
        if len(issues):
            return issues.first()
        else:
            return None

    def get_primary_helpdesk_reference(self):
        return self.get_primary_reference(GFBIO_HELPDESK_TICKET)

    def get_primary_pangaea_reference(self):
        return self.get_primary_reference(PANGAEA_JIRA_TICKET)

    def __str__(self):
        return "{}_{}".format(self.pk, self.broker_submission_id)

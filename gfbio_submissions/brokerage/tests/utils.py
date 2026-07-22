# -*- coding: utf-8 -*-
import json
import os
import textwrap
import xml.etree.ElementTree as ET

from gfbio_submissions.brokerage.models.broker_object import BrokerObject
from gfbio_submissions.brokerage.models.center_name import CenterName
from gfbio_submissions.brokerage.serializers.submission_serializer import SubmissionSerializer
from gfbio_submissions.users.models import User


def _get_test_data_dir_path():
    return "{0}{1}gfbio_submissions{1}brokerage{1}tests{1}test_data".format(
        os.getcwd(),
        os.sep,
    )


def _get_ena_data(simple=False):
    if simple:
        with open(os.path.join(_get_test_data_dir_path(), "ena_data.json"), "r") as data_file:
            return json.load(data_file)

    with open(os.path.join(_get_test_data_dir_path(), "ena_data_runs.json"), "r") as data_file:
        return json.load(data_file)


def _get_ena_data_without_runs():
    with open(os.path.join(_get_test_data_dir_path(), "ena_data_no_runs.json"), "r") as data_file:
        return json.load(data_file)


def _get_parsed_ena_response():
    with open(os.path.join(_get_test_data_dir_path(), "ena_response.json"), "r") as data_file:
        return json.load(data_file)


def _get_ena_xml_response():
    with open(os.path.join(_get_test_data_dir_path(), "ena_response.xml"), "r") as data_file:
        return textwrap.dedent(data_file.read())


def _get_ena_register_study_response(study_bo_pk=1):
    tree = ET.parse(os.path.join(_get_test_data_dir_path(), "ena_register_study_response.xml"))
    root = tree.getroot()
    study = root.find("STUDY")
    alias = study.get("alias")
    study.set("alias", "{}{}".format(study_bo_pk, alias[1:]))
    return ET.tostring(root, encoding="utf8", method="xml")


def _get_ena_release_xml_response():
    with open(os.path.join(_get_test_data_dir_path(), "ena_release_response.xml"), "r") as data_file:
        return textwrap.dedent(data_file.read())


def _get_ena_error_xml_response():
    with open(os.path.join(_get_test_data_dir_path(), "ena_error_response.xml"), "r") as data_file:
        return textwrap.dedent(data_file.read())


def _get_pangaea_soap_body():
    with open(os.path.join(_get_test_data_dir_path(), "pangaea_soap_body.xml"), "r") as data_file:
        return textwrap.dedent(data_file.read())


def _get_pangaea_soap_response():
    with open(os.path.join(_get_test_data_dir_path(), "pangaea_soap_response.xml"), "r") as data_file:
        return textwrap.dedent(data_file.read().replace("\n", ""))


def _get_submission_request_data():
    with open(os.path.join(_get_test_data_dir_path(), "submission_request_data.json"), "r") as data_file:
        return json.load(data_file)


def _get_submission_post_response():
    with open(os.path.join(_get_test_data_dir_path(), "submission_post_response.json"), "r") as data_file:
        return json.load(data_file)


def _get_jira_response():
    with open(os.path.join(_get_test_data_dir_path(), "jira_response.json"), "r") as data_file:
        return json.load(data_file)


def _get_jira_issue_response():
    with open(os.path.join(_get_test_data_dir_path(), "jira_issue_response.json"), "r") as data_file:
        return json.load(data_file)


def _get_jira_attach_response():
    with open(os.path.join(_get_test_data_dir_path(), "jira_attach_response.json"), "r") as data_file:
        return json.load(data_file)


def _get_pangaea_attach_response():
    with open(os.path.join(_get_test_data_dir_path(), "pangaea_attach_response.json"), "r") as data_file:
        return json.load(data_file)


def _get_pangaea_comment_response():
    with open(os.path.join(_get_test_data_dir_path(), "pangaea_comment_response.json"), "r") as data_file:
        return json.load(data_file)


def _get_request_comment_response():
    with open(os.path.join(_get_test_data_dir_path(), "get_comment_response.json"), "r") as data_file:
        return json.load(data_file)


def _get_pangaea_ticket_response():
    with open(os.path.join(_get_test_data_dir_path(), "pangaea_ticket_response.json"), "r") as data_file:
        return json.load(data_file)


def _get_jira_hook_request_data(no_changelog=False):
    file_name = "jira_hook_request_data_no_changelog.json" if no_changelog else "jira_hook_request_data.json"
    with open(os.path.join(_get_test_data_dir_path(), file_name), "r") as data_file:
        return data_file.read()


def _get_taxonomic_min_data():
    with open(os.path.join(_get_test_data_dir_path(), "taxonomic_min_data.json"), "r") as data_file:
        return json.load(data_file)


def _create_submission_via_serializer(runs=False, username=None, create_broker_objects=True, atax=False):
    if atax:
        serializer = SubmissionSerializer(
            data={
                "target": "ATAX",
                "release": True,
                "data": _get_taxonomic_min_data(),
            }
        )
    else:
        serializer = SubmissionSerializer(
            data={
                "target": "ENA",
                "release": True,
                "data": _get_ena_data() if runs else _get_ena_data_without_runs(),
            }
        )
    serializer.is_valid()
    user = User.objects.get(username=username) if username else User.objects.first()
    submission = serializer.save(user=user)
    # DASS-3574: production submissions are created without a center_name (the
    # curator assigns the CenterName FK later via admin). Since T3 makes the
    # Enalizer hard-fail on a missing centre, attach a curated default here so
    # the many task/integration tests that build ENA XML from a helper-created
    # submission keep exercising the happy path. Tests that specifically assert
    # the rejection set center_name=None explicitly.
    if not atax:
        center_name, _ = CenterName.objects.get_or_create(center_name="CustomCenter")
        submission.center_name = center_name
        submission.save()
    if create_broker_objects:
        BrokerObject.objects.add_submission_data(submission)
    return submission


class _attach_curated_center_on_create:
    """Context manager / pytest-fixture body that attaches a curated CenterName
    to every freshly-created ENA submission for the duration of a test.

    DASS-3574: a production submission is created without a center_name (the
    curator sets the CenterName FK later via admin). The full HTTP-POST
    integration tests create the submission *inside* the request and process the
    ENA chain eagerly in the same call, so there is no test-code seam to attach a
    centre between creation and the (now hard-failing) Enalizer. Connecting a
    ``post_save`` receiver only for these specific test classes attaches a
    curated default at creation time, before the eager chain runs, without
    touching production code and without affecting the resolver/rejection tests
    (which create centre-less submissions directly via ``Submission.objects``
    and set ``center_name=None`` explicitly — ``created`` is False on those
    re-saves, so this receiver never re-adds a centre to them).
    """

    def __init__(self, center_name="CustomCenter"):
        self._center_name_value = center_name
        self._uid = "dass3574_attach_curated_center_{0}".format(id(self))

    def _receiver(self, sender, instance, **kwargs):
        from gfbio_submissions.brokerage.configuration.settings import ENA

        # Fire whenever an ENA submission still lacks a centre — this also covers
        # GENERIC submissions that are re-targeted to ENA by a later update. The
        # ``center_name_id is not None`` guard makes the receiver idempotent and
        # terminates the recursive ``instance.save()`` below.
        if instance.center_name_id is not None or instance.target != ENA:
            return
        center_name, _ = CenterName.objects.get_or_create(center_name=self._center_name_value)
        instance.center_name = center_name
        instance.save()

    def __enter__(self):
        from django.db.models.signals import post_save

        from gfbio_submissions.brokerage.models.submission import Submission

        post_save.connect(self._receiver, sender=Submission, dispatch_uid=self._uid)
        return self

    def __exit__(self, *exc):
        from django.db.models.signals import post_save

        from gfbio_submissions.brokerage.models.submission import Submission

        post_save.disconnect(sender=Submission, dispatch_uid=self._uid)
        return False

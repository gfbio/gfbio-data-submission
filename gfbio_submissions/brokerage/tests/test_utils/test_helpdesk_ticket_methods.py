# -*- coding: utf-8 -*-

import copy
import json
import os
import random
import string
from unittest import skip

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.tests.utils import _create_submission_via_serializer, _get_test_data_dir_path
from gfbio_submissions.brokerage.utils.gfbio import get_gfbio_helpdesk_username, gfbio_prepare_create_helpdesk_payload
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User
from ...configuration.settings import (
    GFBIO_HELPDESK_TICKET,
    JIRA_FALLBACK_USERNAME,
    JIRA_USERNAME_URL_FULLNAME_TEMPLATE,
    JIRA_USERNAME_URL_TEMPLATE,
)
from ...models.submission_upload import SubmissionUpload
from ...serializers.submission_serializer import SubmissionSerializer


class TestHelpDeskTicketMethods(TestCase):
    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        site_conf = SiteConfiguration.objects.create(
            title="default",
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
            contact="kevin@horstmeier.de",
        )
        user = User.objects.create_user(username="horst", email="horst@horst.de", password="password")
        permissions = Permission.objects.filter(content_type__app_label="brokerage", codename__endswith="upload")
        user.user_permissions.add(*permissions)
        user.site_configuration = site_conf
        user.save()
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Token " + token.key)
        cls.api_client = client

        submission = _create_submission_via_serializer()
        submission.additionalreference_set.create(type=GFBIO_HELPDESK_TICKET, reference_key="FAKE_KEY", primary=True)

    @classmethod
    def _create_test_data(cls, path, delete=True):
        if delete:
            cls._delete_test_data()
        f = open(path, "w")
        f.write("test123\n")
        f.close()
        f = open(path, "rb")
        return {
            "file": f,
        }

    @staticmethod
    def _delete_test_data():
        SubmissionUpload.objects.all().delete()

    def _load_generic_data(self):
        with open(os.path.join(_get_test_data_dir_path(), "generic_data.json"), "r") as data_file:
            return json.load(data_file)

    def _save_submission(self, data):
        serializer = SubmissionSerializer(data={"target": "GENERIC", "release": True, "data": data})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        return serializer.save(user=User.objects.first())

    def _dsub_site_config(self):
        # Unsaved in-memory copy so the stored site configuration stays SAND.
        site_config = SiteConfiguration.objects.first()
        site_config.jira_project_key = SiteConfiguration.DSUB
        return site_config

    def test_prepare_helpdesk_payload(self):
        with open(os.path.join(_get_test_data_dir_path(), "generic_data.json"), "r") as data_file:
            data = json.load(data_file)
        serializer = SubmissionSerializer(data={"target": "GENERIC", "release": True, "data": data})
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(site_config=site_config, submission=submission)
        self.assertNotIn("assignee", payload.keys())
        self.assertEqual("sand/molecular-data", payload["customfield_10010"])
        # self.assertEqual('MIxS',
        #                  payload['customfield_10229'][0]['value'])

        data["requirements"].pop("data_center")
        serializer = SubmissionSerializer(data={"target": "GENERIC", "release": True, "data": data})
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(site_config=site_config, submission=submission)
        self.assertNotIn("assignee", payload.keys())
        self.assertEqual("sand/generic-data", payload["customfield_10010"])

        # self.assertEqual('other',
        #                  payload['customfield_10229'][0]['value'])

        data["requirements"]["data_center"] = "GFBio Data Centers - our curators will suggest the appropriate one(s)"
        serializer = SubmissionSerializer(data={"target": "GENERIC", "release": True, "data": data})
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(site_config=site_config, submission=submission)
        self.assertNotIn("assignee", payload.keys())

    def test_prepare_helpdesk_payload_long_title_and_summary(self):
        with open(os.path.join(_get_test_data_dir_path(), "generic_data.json"), "r") as data_file:
            data = json.load(data_file)
        chars = string.ascii_letters + string.digits + ' '
        data["requirements"]["title"] = ''.join(random.choices(chars, k=300))
        data["requirements"]["description"] = ''.join(random.choices(chars, k=33000))

        serializer = SubmissionSerializer(data={"target": "GENERIC", "release": True, "data": data})
        is_valid = serializer.is_valid()
        self.assertTrue(is_valid)
        submission = serializer.save(user=User.objects.first())

        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(site_config=site_config, submission=submission)

        self.assertIn("description", payload.keys())
        self.assertLess(len(payload["description"]), 31000)
        self.assertIn("summary", payload.keys())
        self.assertLess(len(payload["summary"]), 255)
        self.assertIn("customfield_10201", payload.keys())
        self.assertLess(len(payload["customfield_10201"]), 255)
        self.assertIn("customfield_10208", payload.keys())
        self.assertLess(len(payload["customfield_10208"]), 255)

    def test_lib_datacenter_assignee(self):
        with open(os.path.join(_get_test_data_dir_path(), "generic_data.json"), "r") as data_file:
            data = json.load(data_file)
            data["requirements"]["data_center"] = "LIB – Leibniz Institute for the Analysis of Biodiversity Change"

        serializer = SubmissionSerializer(data={"target": "GENERIC", "release": True, "data": data})
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(site_config=site_config, submission=submission)
        self.assertNotIn("assignee", payload.keys())

    def test_dsub_create_request_type(self):
        dsub_config = self._dsub_site_config()
        ena_data = self._load_generic_data()
        ena_submission = self._save_submission(ena_data)
        ena_create = gfbio_prepare_create_helpdesk_payload(site_config=dsub_config, submission=ena_submission)
        self.assertEqual("dsub/molecular", ena_create["customfield_10010"])
        self.assertIn("reporter", ena_create)

        other_data = copy.deepcopy(ena_data)
        other_data["requirements"]["data_center"] = (
            "GFBio Data Centers - our curators will suggest the appropriate one(s)"
        )
        other_create = gfbio_prepare_create_helpdesk_payload(
            site_config=dsub_config, submission=self._save_submission(other_data)
        )
        self.assertEqual("dsub/general-data-submission", other_create["customfield_10010"])

        missing_data = copy.deepcopy(ena_data)
        missing_data["requirements"].pop("data_center")
        missing_create = gfbio_prepare_create_helpdesk_payload(
            site_config=dsub_config, submission=self._save_submission(missing_data)
        )
        self.assertEqual("dsub/general-data-submission", missing_create["customfield_10010"])

    def test_dsub_update_request_type(self):
        dsub_config = self._dsub_site_config()
        ena_data = self._load_generic_data()
        ena_update = gfbio_prepare_create_helpdesk_payload(
            site_config=dsub_config,
            submission=self._save_submission(ena_data),
            prepare_for_update=True,
        )
        self.assertEqual("dsub/molecular", ena_update["customfield_10010"])
        self.assertNotIn("reporter", ena_update)

        other_data = copy.deepcopy(ena_data)
        other_data["requirements"]["data_center"] = (
            "GFBio Data Centers - our curators will suggest the appropriate one(s)"
        )
        other_update = gfbio_prepare_create_helpdesk_payload(
            site_config=dsub_config,
            submission=self._save_submission(other_data),
            prepare_for_update=True,
        )
        self.assertNotIn("customfield_10010", other_update)

    def test_sand_update_request_type_molecular(self):
        sand_config = SiteConfiguration.objects.first()
        self.assertEqual(SiteConfiguration.SAND, sand_config.jira_project_key)
        payload = gfbio_prepare_create_helpdesk_payload(
            site_config=sand_config,
            submission=self._save_submission(self._load_generic_data()),
            prepare_for_update=True,
        )
        self.assertEqual("sand/molecular-data", payload["customfield_10010"])

    def test_request_type_non_string_data_center(self):
        dsub_config = self._dsub_site_config()
        submission = self._save_submission(self._load_generic_data())
        submission.data["requirements"]["data_center"] = None
        none_create = gfbio_prepare_create_helpdesk_payload(site_config=dsub_config, submission=submission)
        self.assertEqual("dsub/general-data-submission", none_create["customfield_10010"])
        none_update = gfbio_prepare_create_helpdesk_payload(
            site_config=dsub_config,
            submission=submission,
            prepare_for_update=True,
        )
        self.assertNotIn("customfield_10010", none_update)

    def test_prepare_helpdesk_payload_update_omits_reporter(self):
        with open(os.path.join(_get_test_data_dir_path(), "generic_data.json"), "r") as data_file:
            data = json.load(data_file)
        serializer = SubmissionSerializer(data={"target": "GENERIC", "release": True, "data": data})
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        site_config = SiteConfiguration.objects.first()

        update_payload = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission,
            reporter=None,
            prepare_for_update=True,
        )
        self.assertNotIn("reporter", update_payload)
        self.assertIn("summary", update_payload)

        create_payload = gfbio_prepare_create_helpdesk_payload(
            site_config=site_config,
            submission=submission,
            reporter=None,
            prepare_for_update=False,
        )
        self.assertIn("reporter", create_payload)
        self.assertEqual(JIRA_FALLBACK_USERNAME, create_payload["reporter"]["name"])

    @skip("metadata_schema is no longer used. compare GFBIO-2742")
    def test_prepare_helpdesk_payload_metadataschema_is_none(self):
        with open(os.path.join(_get_test_data_dir_path(), "generic_data.json"), "r") as data_file:
            data = json.load(data_file)
        data["requirements"].pop("data_center")
        data["requirements"]["metadata_schema"] = "None"

        serializer = SubmissionSerializer(data={"target": "GENERIC", "release": True, "data": data})
        serializer.is_valid()
        submission = serializer.save(user=User.objects.first())
        site_config = SiteConfiguration.objects.first()
        payload = gfbio_prepare_create_helpdesk_payload(site_config=site_config, submission=submission)
        self.assertEqual("other", payload["customfield_10229"][0]["value"])

    @responses.activate
    def test_get_gfbio_helpdesk_username(self):
        url = JIRA_USERNAME_URL_TEMPLATE.format(
            "deleteMe",
            "delete@me.de",
        )
        responses.add(responses.GET, url, body=b"deleteMe", status=200)
        response = get_gfbio_helpdesk_username(
            "deleteMe",
            "delete@me.de",
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(b"deleteMe", response.content)

    @responses.activate
    def test_get_gfbio_helpdesk_username_with_fullname(self):
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format("deleteMe", "delete@me.de", "Delete me if you want")
        responses.add(responses.GET, url, body=b"deleteMe", status=200)
        response = get_gfbio_helpdesk_username("deleteMe", "delete@me.de", "Delete me if you want")
        self.assertEqual(200, response.status_code)
        self.assertEqual(b"deleteMe", response.content)

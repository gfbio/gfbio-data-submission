# -*- coding: utf-8 -*-
import csv
import io
from unittest import skip

from django.test import TestCase

from gfbio_submissions.brokerage.utils import csv
from gfbio_submissions.brokerage.utils.ena import download_submitted_run_files_to_string_io
from gfbio_submissions.generic.models.ResourceCredential import ResourceCredential
from gfbio_submissions.generic.models.SiteConfiguration import SiteConfiguration


class TestDownloadEnaReport(TestCase):
    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )
        SiteConfiguration.objects.create(
            title="default",
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
            contact="kevin@horstmeier.de",
        )

    # TODO: remove later, since real credentials are needed
    # TODO: mock ftp request -> https://stackoverflow.com/questions/35654355/mocking-ftp-in-unit-test
    @skip("real request to ena ftp unit mock is in place")
    def test_ftp_access(self):
        rc = ResourceCredential.objects.create(
            title="ena_ftp",
            url="webin.ebi.ac.uk",
            authentication_string="",
            username="Webin-40945",
            password="",
            comment="",
        )
        site_conf = SiteConfiguration.objects.first()
        site_conf.ena_ftp = rc
        site_conf.save()

        decompressed_file = io.StringIO()
        report = download_submitted_run_files_to_string_io(
            site_config=site_conf,
            decompressed_io=decompressed_file,
        )
        self.assertTrue(len(report) > 0)
        decompressed_file.seek(0)
        reader = csv.DictReader(decompressed_file, delimiter=str("\t"))
        row = reader.next()
        self.assertTrue("STUDY_ID" in row.keys())
        decompressed_file.close()

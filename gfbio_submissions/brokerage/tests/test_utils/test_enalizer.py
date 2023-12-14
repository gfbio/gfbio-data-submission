# -*- coding: utf-8 -*-
from datetime import datetime
from uuid import uuid4

import responses
from django.test import TestCase
from django.utils.encoding import smart_str

from gfbio_submissions.brokerage.tests.test_models.test_submission import SubmissionTest
from gfbio_submissions.brokerage.tests.utils import (
    _get_ena_xml_response,
    _get_ena_release_xml_response,
)
from gfbio_submissions.brokerage.utils.csv import find_correct_platform_and_model
from gfbio_submissions.brokerage.utils.ena import (
    Enalizer,
    prepare_ena_data,
    send_submission_to_ena,
    release_study_on_ena,
)
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.request_log import RequestLog

from gfbio_submissions.users.models import User
from ...configuration.settings import DEFAULT_ENA_CENTER_NAME
from ...models.broker_object import BrokerObject
from ...models.center_name import CenterName
from ...models.submission import Submission


class TestEnalizer(TestCase):
    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )

        site_config = SiteConfiguration.objects.create(
            title="Default",
            ena_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
        )
        user = User.objects.create(username="user1")
        user.site_configuration = site_config
        user.save()
        SubmissionTest._create_submission_via_serializer()
        SubmissionTest._create_submission_via_serializer(runs=True)

    def tearDown(self):
        Submission.objects.all().delete()

    def test_with_files_in_experiments(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission=submission, alias_postfix="test")
        self.assertTrue(enalizer.study_alias.endswith(":test"))
        self.assertEqual(enalizer.study_alias, enalizer.experiment[0]["study_ref"])
        self.assertEqual(1, len(enalizer.run))

    def test_with_additional_files_in_experiments(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission=submission, alias_postfix="test-runs")
        self.assertTrue(enalizer.study_alias.endswith(":test-runs"))
        self.assertEqual(enalizer.study_alias, enalizer.experiment[0]["study_ref"])
        self.assertEqual(6, len(enalizer.run))

    def test_center_name(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission=submission, alias_postfix="test")
        self.assertEqual(DEFAULT_ENA_CENTER_NAME, enalizer.center_name)
        center_name, created = CenterName.objects.get_or_create(center_name="CustomCenter")
        submission.center_name = center_name
        submission.save()
        enalizer_2 = Enalizer(submission=submission, alias_postfix="test")
        self.assertEqual("CustomCenter", enalizer_2.center_name)

    def test_study_xml(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, "test-enalizer-study")
        data = enalizer.prepare_submission_data()
        k, study_xml = data.get("STUDY")
        self.assertEqual("study.xml", k)
        self.assertIn("<STUDY_SET>", study_xml)
        self.assertIn("<STUDY", study_xml)
        self.assertIn("<DESCRIPTOR>", study_xml)

        # 02.03.2020: study_type was removed in Oct/Nov 2019 !
        self.assertIn("<STUDY_TYPE", study_xml)
        self.assertIn('<STUDY_TYPE existing_study_type="Other" />', study_xml)

        self.assertIn("<STUDY_TITLE>", study_xml)
        self.assertIn("<STUDY_ABSTRACT>", study_xml)
        study_xml_standalone = enalizer.create_study_xml()
        self.assertEqual(study_xml, smart_str(study_xml_standalone))

    def test_study_xml_center_name(self):
        submission = Submission.objects.first()
        center_name, created = CenterName.objects.get_or_create(center_name="CustomCenter")
        submission.center_name = center_name
        submission.save()
        ena = Enalizer(submission, "test-enalizer-study")
        data = ena.prepare_submission_data()
        k, study_xml = data.get("STUDY")
        self.assertEqual("study.xml", k)
        self.assertIn('center_name="CustomCenter"', study_xml)
        study_xml_standalone = ena.create_study_xml()
        self.assertEqual(study_xml, smart_str(study_xml_standalone))

    def test_sample_xml(self):
        self.maxDiff = None
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, "test-enalizer-sample")
        data = enalizer.prepare_submission_data()

        k, sample_xml = data.get("SAMPLE")
        self.assertEqual("sample.xml", k)
        submission_samples = submission.brokerobject_set.filter(type="sample")
        # check lower case conversion
        self.assertIn("mimarks-survey", sample_xml)
        # FIXME: order of samples seem to be random
        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" center_name="{1}" broker_name="GFBIO">'
            "<TITLE>sample title</TITLE>"
            "<SAMPLE_NAME>"
            "<TAXON_ID>530564</TAXON_ID>"
            "</SAMPLE_NAME>"
            "<DESCRIPTION />".format(submission_samples[0].pk, DEFAULT_ENA_CENTER_NAME),
            sample_xml,
        )
        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" center_name="{1}" broker_name="GFBIO">'
            "<TITLE>sample title 2</TITLE>"
            "<SAMPLE_NAME>"
            "<TAXON_ID>530564</TAXON_ID>"
            "</SAMPLE_NAME>"
            "<DESCRIPTION />".format(submission_samples[1].pk, DEFAULT_ENA_CENTER_NAME),
            sample_xml,
        )

    def test_sample_xml_center_name(self):
        submission = Submission.objects.first()
        center_name, created = CenterName.objects.get_or_create(center_name="CustomCenter")
        submission.center_name = center_name
        submission.save()
        enalizer = Enalizer(submission, "test-enalizer-sample")
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get("SAMPLE")
        self.assertEqual("sample.xml", k)
        self.assertIn('center_name="CustomCenter"', sample_xml)

    def test_sample_xml_checklist_mapping(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, "test-enalizer-sample")
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get("SAMPLE")
        self.assertIn(
            "<SAMPLE_ATTRIBUTE>" "<TAG>ENA-CHECKLIST</TAG>" "<VALUE>ERC000024</VALUE>" "</SAMPLE_ATTRIBUTE>",
            sample_xml,
        )
        self.assertIn(
            "<SAMPLE_ATTRIBUTE>" "<TAG>ENA-CHECKLIST</TAG>" "<VALUE>ERC000023</VALUE>" "</SAMPLE_ATTRIBUTE>",
            sample_xml,
        )

    def test_additional_renamed_checklist_attribute(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, "test-enalizer-sample")
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get("SAMPLE")
        self.assertIn("<TAG>water environmental package</TAG>", sample_xml)
        self.assertIn("<TAG>wastewater sludge environmental package</TAG>", sample_xml)

    def test_sample_xml_checklist_mapping_no_package(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, "test-enalizer-sample")
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get("SAMPLE")
        self.assertNotIn("<TAG>ENA-CHECKLIST</TAG>", sample_xml)

    def test_additional_no_renamed_checklist_attribute(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, "test-enalizer-sample")
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get("SAMPLE")
        self.assertNotIn("<TAG>water environmental package</TAG>", sample_xml)
        self.assertNotIn("<TAG>wastewater sludge environmental package</TAG>", sample_xml)

    def test_sample_xml_checklist_mapping_wrong_package(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, "test-enalizer-sample")
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get("SAMPLE")
        self.assertNotIn("<TAG>ENA-CHECKLIST</TAG>", sample_xml)

    def test_add_insdc_attribute(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, "test-enalizer-sample")
        data = enalizer.prepare_submission_data()
        k, sample_xml = data.get("SAMPLE")
        self.assertEqual(
            2,
            sample_xml.count("<SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE>"),
        )

    def test_experiment_xml(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, "test-enalizer-sample")

        self.assertFalse(enalizer.experiments_contain_files)
        data = enalizer.prepare_submission_data()
        k, experiment_xml = data.get("EXPERIMENT")
        self.assertEqual("experiment.xml", k)
        submission_experiments = submission.brokerobject_set.filter(type="experiment")
        submission_study = submission.brokerobject_set.filter(type="study").first()
        for i in range(5):
            self.assertIn(
                '<EXPERIMENT alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="{1}">'
                '<STUDY_REF refname="{2}:test-enalizer-sample" />'
                "".format(
                    submission_experiments[i].pk,
                    DEFAULT_ENA_CENTER_NAME,
                    submission_study.pk,
                ),
                experiment_xml,
            )

        self.assertTrue(enalizer.experiments_contain_files)

    def test_experiment_xml_targeted_loci(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, "test-enalizer-sample")
        self.assertFalse(enalizer.experiments_contain_files)
        data = enalizer.prepare_submission_data()
        k, experiment_xml = data.get("EXPERIMENT")
        self.assertEqual("experiment.xml", k)
        k, sample_xml = data.get("SAMPLE")
        self.assertEqual("sample.xml", k)
        # tests, if structure is (not) in container:
        self.assertIn(
            '<TARGETED_LOCI><LOCUS locus_name="16S rRNA" /></TARGETED_LOCI></LIBRARY_DESCRIPTOR>',
            experiment_xml,
        )
        self.assertNotIn(
            "<SAMPLE_ATTRIBUTE><TAG>target gene</TAG><VALUE>16S rRNA</VALUE></SAMPLE_ATTRIBUTE>",
            sample_xml,
        )
        self.assertIn(
            '<TARGETED_LOCI><LOCUS locus_name="28S rRNA" /></TARGETED_LOCI></LIBRARY_DESCRIPTOR>',
            experiment_xml,
        )
        self.assertNotIn(
            "<SAMPLE_ATTRIBUTE><TAG>target gene</TAG><VALUE>28S</VALUE></SAMPLE_ATTRIBUTE>",
            sample_xml,
        )
        self.assertIn(
            '<TARGETED_LOCI><LOCUS locus_name="ITS1-5.8S-ITS2" /></TARGETED_LOCI></LIBRARY_DESCRIPTOR>',
            experiment_xml,
        )
        self.assertNotIn(
            "<SAMPLE_ATTRIBUTE><TAG>target gene</TAG><VALUE>iTS1-5.8S-ITs2</VALUE></SAMPLE_ATTRIBUTE>",
            sample_xml,
        )
        self.assertIn(
            '<TARGETED_LOCI><LOCUS locus_name="other" description="18S rRNA for fish" /></TARGETED_LOCI></LIBRARY_DESCRIPTOR>',
            experiment_xml,
        )
        self.assertNotIn(
            "<SAMPLE_ATTRIBUTE><TAG>TARGet gene</TAG><VALUE>18S rRNA for fish</VALUE></SAMPLE_ATTRIBUTE>",
            sample_xml,
        )

    def test_experiment_xml_center_name(self):
        submission = Submission.objects.last()
        center_name, created = CenterName.objects.get_or_create(center_name="CustomCenter")
        submission.center_name = center_name
        submission.save()
        enalizer = Enalizer(submission, "test-enalizer-sample")
        self.assertFalse(enalizer.experiments_contain_files)
        data = enalizer.prepare_submission_data()
        k, experiment_xml = data.get("EXPERIMENT")
        self.assertEqual("experiment.xml", k)
        self.assertIn('center_name="CustomCenter"', experiment_xml)
        self.assertTrue(enalizer.experiments_contain_files)

    def test_add_experiment_platform_as_sample_attribute(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, "test-enalizer-experiment")
        data = enalizer.prepare_submission_data()
        k, experiment_xml = data.get("EXPERIMENT")
        k, sample_xml = data.get("SAMPLE")
        self.assertIn(
            "<PLATFORM>"
            "<CAPILLARY><INSTRUMENT_MODEL>AB 3730xL Genetic Analyzer</INSTRUMENT_MODEL></CAPILLARY>"
            "</PLATFORM>",
            experiment_xml,
        )

        self.assertIn(
            "<SAMPLE_ATTRIBUTE>"
            "<TAG>sequencing method</TAG>"
            "<VALUE>AB 3730xL Genetic Analyzer</VALUE>"
            "</SAMPLE_ATTRIBUTE>",
            sample_xml,
        )

    def test_find_correct_platform_and_model(self):
        self.assertEqual(
            "illumina NextSeq 500",
            find_correct_platform_and_model("Illumina Nextseq 500"),
        )
        self.assertEqual("illumina unspecified", find_correct_platform_and_model("Illumina"))
        self.assertEqual("illumina Illumina MiSeq", find_correct_platform_and_model("Illumina MiSeq"))
        self.assertEqual("oxford_nanopore MinION", find_correct_platform_and_model("MinION"))
        self.assertEqual("pacbio_smrt Sequel", find_correct_platform_and_model("Sequel"))
        self.assertEqual("pacbio_smrt Sequel", find_correct_platform_and_model("pacbio Sequel"))
        self.assertEqual("pacbio_smrt unspecified", find_correct_platform_and_model("PacBio"))
        self.assertEqual(
            "oxford_nanopore unspecified",
            find_correct_platform_and_model("Oxford Nanopore"),
        )

    def test_add_experiment_platform_without_initial_sample_attributes(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, "test-enalizer-experiment")
        data = enalizer.prepare_submission_data()
        k, experiment_xml = data.get("EXPERIMENT")
        k, sample_xml = data.get("SAMPLE")
        self.assertIn(
            "<PLATFORM><ILLUMINA><INSTRUMENT_MODEL>Illumina HiSeq 1000</INSTRUMENT_MODEL></ILLUMINA></PLATFORM>",
            experiment_xml,
        )
        self.assertIn(
            "<SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE>",
            sample_xml,
        )

    def test_run_xml_with_files_in_experiment(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, "test-enalizer-experiment")
        self.assertFalse(enalizer.experiments_contain_files)
        enalizer.prepare_submission_data()
        self.assertTrue(enalizer.experiments_contain_files)

    def test_run_xml_with_additional_files_in_experiment(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission, "test-enalizer-experiment")
        self.assertFalse(enalizer.experiments_contain_files)
        enalizer.prepare_submission_data()
        self.assertTrue(enalizer.experiments_contain_files)

    def test_number_of_run_files_paired_layout(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, "test-enalizer-experiment")
        xml_data = enalizer.prepare_submission_data()
        self.assertEqual(
            "paired",
            submission.data.get("requirements", {})
            .get("experiments", [{}])[0]
            .get("design", {})
            .get("library_descriptor", {})
            .get("library_layout", {})
            .get("layout_type", "xxx"),
        )
        file_name, xml = xml_data.get("RUN")
        self.assertEqual(2, xml.count("<FILE filename"))

    def test_number_of_run_files_single_layout(self):
        submission = Submission.objects.first()
        submission.data.get("requirements", {})["experiments"] = [
            {
                "design": {
                    "design_description": "",
                    "library_descriptor": {
                        "library_layout": {
                            "layout_type": "single",
                        },
                        "library_selection": "PCR",
                        "library_source": "METAGENOMIC",
                        "library_strategy": "AMPLICON",
                    },
                    "sample_descriptor": "sample2",
                },
                "experiment_alias": "experiment1",
                "files": {
                    "forward_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                    "forward_read_file_name": "File3.forward.fastq.gz",
                },
                "platform": "AB 3730xL Genetic Analyzer",
                # 'site_object_id': 'user1_4'
            }
        ]
        submission.save()
        submission.brokerobject_set.all().delete()
        BrokerObject.objects.add_submission_data(submission)
        enalizer = Enalizer(submission, "test-enalizer-experiment")
        xml_data = enalizer.prepare_submission_data()
        self.assertEqual(
            "single",
            submission.data.get("requirements", {})
            .get("experiments", [{}])[0]
            .get("design", {})
            .get("library_descriptor", {})
            .get("library_layout", {})
            .get("layout_type", "xxx"),
        )
        file_name, xml = xml_data.get("RUN")
        self.assertEqual(1, xml.count("<FILE filename"))

    def test_submission_data_content(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, "test-enalizer-experiment")
        ena_submission_data = enalizer.prepare_submission_data(broker_submission_id=submission.broker_submission_id)
        self.assertListEqual(
            sorted(["RUN", "SAMPLE", "STUDY", "EXPERIMENT"]),
            sorted(list(ena_submission_data.keys())),
        )
        self.assertNotIn("SUBMISSION", ena_submission_data.keys())

    def test_submission_alias(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, "test-enalizer-experiment")
        test_id = uuid4()
        submission_xml = enalizer.prepare_submission_xml_for_sending(action="ADD", outgoing_request_id=test_id)
        k, v = submission_xml
        self.assertEqual("submission.xml", k)
        self.assertIn('alias="{0}"'.format(test_id), v)

    # integration test. Enalizer is instantiated in tested methods
    @responses.activate
    def test_send_submission_to_ena(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response(),
        )
        ena_submission_data = prepare_ena_data(submission=submission)
        response, req_log_request_id = send_submission_to_ena(
            submission=submission,
            archive_access=conf.ena_server,
            ena_submission_data=ena_submission_data,
        )
        self.assertEqual(
            req_log_request_id,
            RequestLog.objects.get(request_id=req_log_request_id).request_id,
        )
        self.assertEqual(200, response.status_code)

    @responses.activate
    def test_send_submission_to_ena_without_run_or_experiment(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response(),
        )

        ena_submission_data = prepare_ena_data(submission=submission)
        ena_submission_data.pop("EXPERIMENT")
        ena_submission_data.pop("RUN")
        response, req_log_request_id = send_submission_to_ena(
            submission=submission,
            archive_access=conf.ena_server,
            ena_submission_data=ena_submission_data,
        )
        self.assertEqual(
            req_log_request_id,
            RequestLog.objects.get(request_id=req_log_request_id).request_id,
        )
        self.assertEqual(200, response.status_code)

    def test_prepare_ena_data_add(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission=submission, alias_postfix=submission.broker_submission_id)
        file_name, xml = enalizer.prepare_submission_xml_for_sending(action="ADD")
        self.assertIn("<ADD", xml)

    def test_prepare_ena_data_validate(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission=submission, alias_postfix=submission.broker_submission_id)
        file_name, xml = enalizer.prepare_submission_xml_for_sending()
        self.assertIn("<VALIDATE", xml)

    def test_prepare_ena_data_embargo(self):
        submission = Submission.objects.first()
        submission.embargo = datetime(2020, 1, 10).date()
        submission.save()
        enalizer = Enalizer(submission=submission, alias_postfix=submission.broker_submission_id)
        file_name, xml = enalizer.prepare_submission_xml_for_sending()
        self.assertIn("2020-01-10", xml)

    @responses.activate
    def test_release_study_on_ena(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()

        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_release_xml_response(),
        )
        study = submission.brokerobject_set.filter(type="study").first()
        study.persistentidentifier_set.create(
            archive="ENA", pid_type="PRJ", pid="PRJEB0815", outgoing_request_id=uuid4()
        )
        self.assertEqual(0, len(RequestLog.objects.all()))

        release_study_on_ena(submission)

        self.assertEqual(1, len(RequestLog.objects.all()))
        request_log = RequestLog.objects.first()
        self.assertEqual(200, request_log.response_status)
        self.assertTrue('accession "PRJEB0815" is set to public' in request_log.response_content)

    def test_release_study_on_ena_no_accession_no(self):
        submission = Submission.objects.first()
        # conf = SiteConfiguration.objects.first()
        self.assertEqual(0, len(RequestLog.objects.all()))
        release_study_on_ena(submission)
        self.assertEqual(0, len(RequestLog.objects.all()))

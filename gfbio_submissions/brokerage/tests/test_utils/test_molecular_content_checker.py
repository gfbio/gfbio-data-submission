# -*- coding: utf-8 -*-
import os

from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ENA, GENERIC, GFBIO_HELPDESK_TICKET
from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path

from gfbio_submissions.brokerage.utils.ena import prepare_ena_data
from gfbio_submissions.brokerage.utils.molecular_content_checker import MolecularContentChecker
from gfbio_submissions.brokerage.utils.submission_file_opener import create_submission_file_opener
from gfbio_submissions.users.models import User
from ...models.broker_object import BrokerObject
from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload
from ...serializers.submission_serializer import SubmissionSerializer


def check_for_molecular_content(submission):
    file_opener = create_submission_file_opener(submission)
    checker = MolecularContentChecker(submission, file_opener)
    return checker.run_check()


class TestCSVParsing(TestCase):
    @classmethod
    def create_csv_submission_upload(cls, submission, user, file_sub_path="csv_files/molecular_metadata.csv"):
        with open(os.path.join(_get_test_data_dir_path(), file_sub_path), "rb") as data_file:
            return SubmissionUpload.objects.create(
                submission=submission,
                user=user,
                meta_data=True,
                file=SimpleUploadedFile(file_sub_path, data_file.read()),
            )

    @classmethod
    def _strip(cls, d):
        aliases = ["sample_alias", "experiment_alias", "sample_descriptor"]
        for k, v in d.items():
            if isinstance(v, list):
                for e in v:
                    cls._strip(e)
            elif isinstance(v, dict):
                cls._strip(v)
            else:
                if k in aliases:
                    d[k] = ""
        return d

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(username="horst", email="horst@horst.de", password="password")
        permissions = Permission.objects.filter(content_type__app_label="brokerage", codename__endswith="upload")
        user.user_permissions.add(*permissions)
        serializer = SubmissionSerializer(
            data={
                "target": "GENERIC",
                "release": True,
                "data": {
                    "requirements": {
                        "title": "Mol content test",
                        "description": "Reduced data for testing",
                        "data_center": "ENA – European Nucleotide Archive",
                    }
                },
            }
        )
        serializer.is_valid()
        cls.submission = serializer.save(user=user)
        cls.submission.additionalreference_set.create(type=GFBIO_HELPDESK_TICKET, reference_key="FAKE_KEY", primary=True)
        cls.create_csv_submission_upload(cls.submission, user)
        file_opener = create_submission_file_opener(cls.submission)
        cls.submissionupload_checker = MolecularContentChecker(cls.submission, file_opener)


    @classmethod
    def tearDownClass(cls):
        super(TestCSVParsing, cls).tearDownClass()
        # [
        #     shutil.rmtree(path="{0}{1}{2}".format(MEDIA_ROOT, os.sep, o), ignore_errors=False)
        #     for o in os.listdir(MEDIA_ROOT)
        # ]











    def test_parse_xml_with_empty_mixs_values(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/SO45_missing_mixs_values.csv")

        is_mol_content, errors, check_performed, infos = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)

        BrokerObject.objects.add_submission_data(submission)
        ena_submission_data = prepare_ena_data(submission=submission)
        fname, sxml = ena_submission_data["SAMPLE"]
        # Mixs parameter with unit mapping
        self.assertNotIn("geographic location (depth)", sxml)
        # Mixs parameter without unitmapping
        self.assertNotIn("geographic location (country and/or sea)", sxml)

        _, sxml = ena_submission_data["EXPERIMENT"]

    def test_parse_to_xml_real_world_single_layout(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/SO45_mod.csv")

        is_mol_content, errors, check_performed, infos = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)

        BrokerObject.objects.add_submission_data(submission)
        ena_submission_data = prepare_ena_data(submission=submission)

        file_name, file_content = ena_submission_data["RUN"]
        self.assertEqual(
            4,
            file_content.count('filename="{0}'.format(submission.broker_submission_id)),
        )

        file_name, file_content = ena_submission_data["EXPERIMENT"]
        self.assertEqual(4, file_content.count("<LIBRARY_LAYOUT><SINGLE /></LIBRARY_LAYOUT>"))
        self.assertNotIn("<LIBRARY_LAYOUT><PAIRED", file_content)

    def test_check_for_mol_content_case_sensitivity(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/SO45_mixed_cases.csv")
        is_mol_content, errors, check_performed, infos = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)
        self.assertListEqual([], errors)

    def test_check_for_molecular_content_comma_sep(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()
        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/dsub-269_template.csv")

        is_mol_content, errors, check_performed, infos = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)
        BrokerObject.objects.add_submission_data(submission)
        self.assertEqual(25, len(BrokerObject.objects.filter(type="experiment")))
        self.assertEqual(
            len(BrokerObject.objects.filter(type="experiment")),
            len(BrokerObject.objects.filter(type="run")),
        )

    def test_check_for_molecular_content(self):
        submission = Submission.objects.first()
        self.assertEqual(GENERIC, submission.target)
        self.assertIn("data_center", submission.data["requirements"].keys())
        self.assertEqual(
            "ENA – European Nucleotide Archive",
            submission.data["requirements"]["data_center"],
        )
        self.assertNotIn("samples", submission.data["requirements"].keys())
        self.assertNotIn("experiments", submission.data["requirements"].keys())

        is_mol_content, errors, check_performed, infos = check_for_molecular_content(submission)

        self.assertTrue(is_mol_content)
        self.assertListEqual([], errors)
        submission = Submission.objects.first()
        self.assertIn("samples", submission.data["requirements"].keys())
        self.assertIn("experiments", submission.data["requirements"].keys())
        self.assertEqual(ENA, submission.target)

    def test_check_content_on_submission_with_molecular_data(self):
        submission = Submission.objects.first()
        is_mol_content, errors, check_performed, infos = check_for_molecular_content(submission)
        submission = Submission.objects.first()
        self.assertTrue(is_mol_content)
        self.assertTrue(check_performed)
        self.assertIn("samples", submission.data["requirements"].keys())
        self.assertIn("experiments", submission.data["requirements"].keys())

        previous_length = len(submission.data.get("requirements", {}).get("experiments", []))
        is_mol_content, errors, check_performed, infos = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)
        self.assertTrue(check_performed)
        submission = Submission.objects.first()
        current_length = len(submission.data.get("requirements", {}).get("experiments", []))

        self.assertEqual(previous_length, current_length)

    def test_same_sample_title(self):
        # if multiple rows contain the same sample_title, it is expected that
        # no additional sample is added, just an experiment with reference
        # to the already existing sample (one-sample to many-experiments)
        with open(
            os.path.join(
                _get_test_data_dir_path(),
                "csv_files/mol_5_items_semi_double_quoting.csv",
            ),
            "r", encoding='utf-8-sig'
        ):
            submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/Data_submission_SAGs.csv")
        is_mol_content, errors, check_performed, infos = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)
        samples = submission.data.get("requirements", {}).get("samples", [])
        self.assertEqual(1, len(samples))
        experiments = submission.data.get("requirements", {}).get("experiments", [])
        self.assertEqual(7, len(experiments))







    def test_check_minimum_header_cols(self):
        submission = Submission.objects.first()
        self.assertEqual(1, len(submission.submissionupload_set.filter(file__endswith=".csv")))
        self.assertTrue(
            self.submissionupload_checker.check_minimum_header_cols(submission.submissionupload_set.filter(file__endswith=".csv").first())
        )

    def test_check_minimum_header_cols_fail(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        SimpleUploadedFile("test_submission_upload.tsv", b"these\tare\tthe\tfile\tcontents")
        SubmissionUpload.objects.create(
            submission=submission,
            user=submission.user,
            meta_data=True,
            file=SimpleUploadedFile("test_submission_upload.csv", b"sample_title;NO_DESCR;the;file;contents"),
        )
        self.assertEqual(1, len(submission.submissionupload_set.filter(file__endswith=".csv")))
        self.assertFalse(
            self.submissionupload_checker.check_minimum_header_cols(submission.submissionupload_set.filter(file__endswith=".csv").first())
        )

    def test_check_metadata_rule(self):
        self.submissionupload_checker.submission = Submission.objects.first()
        self.assertTrue(self.submissionupload_checker.check_metadata_rule())

    def test_check_metadata_rule_multiple_csvs(self):
        submission = Submission.objects.first()
        SubmissionUpload.objects.create(
            submission=submission,
            user=submission.user,
            meta_data=True,
            file=SimpleUploadedFile("test_submission_upload.csv", b"sample_title;NO_DESCR;the;file;contents"),
        )
        self.assertEqual(2, len(submission.submissionupload_set.filter(file__endswith=".csv")))
        self.assertFalse(self.submissionupload_checker.check_metadata_rule())

    def test_check_csv_file_rule(self):
        self.submissionupload_checker.submission = Submission.objects.first()
        self.assertTrue(self.submissionupload_checker.check_csv_file_rule())

    def test_check_csv_file_rule_multiple_csvs(self):
        submission = Submission.objects.first()
        upload = submission.submissionupload_set.first()
        upload.meta_data = False
        upload.save()
        SubmissionUpload.objects.create(
            submission=submission,
            user=submission.user,
            meta_data=False,
            file=SimpleUploadedFile("test_submission_upload.csv", b"sample_title;NO_DESCR;the;file;contents"),
        )
        self.submissionupload_checker.submission = submission
        self.assertEqual(2, len(submission.submissionupload_set.filter(file__endswith=".csv")))
        self.assertTrue(self.submissionupload_checker.check_csv_file_rule())

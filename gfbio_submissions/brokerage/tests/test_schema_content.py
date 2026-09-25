# -*- coding: utf-8 -*-
import json
import os

from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ENA
from gfbio_submissions.brokerage.utils.schema_validation import validate_data_full, validate_ena_relations


class JSONSchemaContentTest(TestCase):
    @classmethod
    def _get_static_schema_dir_path(cls):
        return "{0}{1}gfbio_submissions{1}static{1}schemas".format(
            os.getcwd(),
            os.sep,
        )

    @classmethod
    def _get_brokerage_schema_dir_path(cls):
        return "{0}{1}gfbio_submissions{1}brokerage{1}schemas".format(
            os.getcwd(),
            os.sep,
        )

    def test_file_names_matching(self):
        static_path = self._get_static_schema_dir_path()
        app_path = self._get_brokerage_schema_dir_path()
        self.assertListEqual(os.listdir(static_path), os.listdir(app_path))

    def test_file_content_matching(self):
        static_path = self._get_static_schema_dir_path()
        app_path = self._get_brokerage_schema_dir_path()
        for f in os.listdir(static_path):
            static_f_path = "{0}{1}{2}".format(static_path, os.sep, f)
            app_f_path = "{0}{1}{2}".format(app_path, os.sep, f)
            self.assertTrue(os.path.exists(app_f_path))
            self.assertTrue(os.path.exists(static_f_path))
            # exclude XSD schemas:
            xml_file_name1 = os.path.basename(app_f_path)
            xml_file_ext1 = (os.path.splitext(xml_file_name1))[1]
            xml_file_name2 = os.path.basename(static_f_path)
            xml_file_ext2 = (os.path.splitext(xml_file_name2))[1]
            if xml_file_ext1 == ".XSD" or xml_file_ext2 == ".XSD":
                continue
            with open(static_f_path, "r") as schema_a:
                with open(app_f_path, "r") as schema_b:
                    schema_a_dict = json.load(schema_a)
                    schema_b_dict = json.load(schema_b)
                    if "id" in schema_a_dict.keys():
                        schema_a_dict.pop("id")
                    if "id" in schema_b_dict.keys():
                        schema_b_dict.pop("id")
                    self.assertDictEqual(schema_a_dict, schema_b_dict)


def _accession_only_requirements(sample_accession="SAMEA115886020"):
    return {
        "requirements": {
            "title": "Accession only",
            "description": "Links to an existing ENA sample",
            "samples": [],
            "experiments": [
                {
                    "experiment_alias": "experiment1",
                    "platform": "AB 3730xL Genetic Analyzer",
                    "design": {
                        "sample_accession": sample_accession,
                        "library_descriptor": {
                            "library_strategy": "AMPLICON",
                            "library_source": "METAGENOMIC",
                            "library_selection": "PCR",
                            "library_layout": {"layout_type": "single"},
                        },
                    },
                    "files": {"forward_read_file_name": "read.fastq.gz"},
                }
            ],
        }
    }


class EnaSampleAccessionSchemaTest(TestCase):
    schema_dirs = (
        JSONSchemaContentTest._get_brokerage_schema_dir_path(),
        JSONSchemaContentTest._get_static_schema_dir_path(),
    )

    def _validate_in_both_schema_copies(self, data):
        return [
            validate_data_full(
                data=data,
                target=ENA,
                schema_location=os.path.join(schema_dir, "ena_requirements.json"),
            )
            for schema_dir in self.schema_dirs
        ]

    def test_empty_samples_and_sample_accession_are_valid_in_both_schema_copies(self):
        data = _accession_only_requirements()
        for valid, errors in self._validate_in_both_schema_copies(data):
            self.assertTrue(valid, errors)
        self.assertEqual([], validate_ena_relations(data))

    def test_descriptor_and_accession_together_are_invalid(self):
        data = _accession_only_requirements()
        data["requirements"]["samples"] = [{"sample_alias": "sample1", "sample_title": "Sample", "taxon_id": 1234}]
        data["requirements"]["experiments"][0]["design"]["sample_descriptor"] = "sample1"
        errors = validate_ena_relations(data)
        self.assertTrue(any("cannot both be set" in error.message for error in errors))

    def test_neither_descriptor_nor_accession_is_invalid(self):
        data = _accession_only_requirements()
        data["requirements"]["experiments"][0]["design"].pop("sample_accession")
        errors = validate_ena_relations(data)
        self.assertEqual(1, len(errors))
        self.assertIn("must reference either a sample_descriptor or a sample_accession", errors[0].message)

    def test_sample_accession_pattern_accepts_ena_and_biosample_formats(self):
        for accession in ("ERS123456", "SAMEA115886020"):
            for valid, errors in self._validate_in_both_schema_copies(_accession_only_requirements(accession)):
                self.assertTrue(valid, f"{accession}: {errors}")

    def test_sample_accession_pattern_rejects_malformed_and_lower_case_values(self):
        for accession in ("ERS12345", "SAMEA", "ers123456", "samea115886020", "XERS123456", "ERS123456X"):
            for valid, errors in self._validate_in_both_schema_copies(_accession_only_requirements(accession)):
                self.assertFalse(valid, accession)
                self.assertTrue(any("sample_accession" in str(error) for error in errors), errors)

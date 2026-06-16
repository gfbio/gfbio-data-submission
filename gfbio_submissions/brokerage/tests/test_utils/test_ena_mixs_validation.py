# -*- coding: utf-8 -*-
import io

from django.test import TestCase

from gfbio_submissions.brokerage.utils.ena_mixs_validation import validate_mixs_metadata_fields

VALID_HEADER = (
    "investigation type;environmental package;collection date;"
    "geographic location (latitude);geographic location (longitude);"
    "geographic location (country and/or sea);broad-scale environmental context;"
    "environmental medium;local environmental context;depth;elevation;"
    "geographic location (region and locality);project name"
)

VALID_WATER_ROW = (
    "metagenome;water;2020-01-01;52.5;13.4;Germany;ENVO:00000873;"
    "ENVO:00002011;ENVO:00000233;12.5;;Berlin;My Project"
)


class TestEnaMixsValidation(TestCase):
    def _validate(self, content):
        return validate_mixs_metadata_fields(io.StringIO(content))

    def test_valid_water_row_has_no_findings(self):
        csv_content = f"{VALID_HEADER}\n{VALID_WATER_ROW}\n"
        self.assertEqual([], self._validate(csv_content))

    def test_missing_required_header_column(self):
        header = VALID_HEADER.replace("depth;", "")
        csv_content = f"{header}\n{VALID_WATER_ROW}\n"
        findings = self._validate(csv_content)
        self.assertTrue(any(f["column_name"] == "depth" and f["row"] == 1 for f in findings))

    def test_missing_depth_on_sediment_row(self):
        row = VALID_WATER_ROW.replace("water", "sediment", 1).replace("12.5", "", 1)
        csv_content = f"{VALID_HEADER}\n{row}\n"
        findings = self._validate(csv_content)
        depth_findings = [f for f in findings if f["column_name"] == "depth"]
        self.assertTrue(depth_findings)
        self.assertTrue(any("MIxS rule 1" in f["message"] for f in depth_findings))

    def test_depth_with_mm_unit_fails_format_rule(self):
        row = VALID_WATER_ROW.replace("12.5", "500mm")
        csv_content = f"{VALID_HEADER}\n{row}\n"
        findings = self._validate(csv_content)
        self.assertTrue(
            any(
                f["column_name"] == "depth" and "MIxS rule 1" in f["message"]
                for f in findings
            )
        )

    def test_invalid_latitude_is_reported(self):
        row = VALID_WATER_ROW.replace("52.5", "not-a-coordinate")
        csv_content = f"{VALID_HEADER}\n{row}\n"
        findings = self._validate(csv_content)
        self.assertTrue(
            any(
                f["column_name"] == "geographic location (latitude)" and "MIxS rule 4" in f["message"]
                for f in findings
            )
        )

    def test_legacy_depth_header_emits_warning(self):
        header = VALID_HEADER.replace("depth;", "geographic location (depth);")
        csv_content = f"{header}\n{VALID_WATER_ROW}\n"
        findings = self._validate(csv_content)
        self.assertTrue(
            any(
                f["status"] == "WARNING"
                and f["column_name"] == "geographic location (depth)"
                and "Use 'depth'" in f["message"]
                for f in findings
            )
        )

    def test_gsc_environmental_package_synonym_emits_warning(self):
        row = VALID_WATER_ROW.replace("water", "host-associated")
        csv_content = f"{VALID_HEADER}\n{row}\n"
        findings = self._validate(csv_content)
        warnings = [f for f in findings if f["status"] == "WARNING"]
        self.assertTrue(any("host associated" in f["message"] for f in warnings))

    def test_unknown_environmental_package_emits_warning(self):
        row = VALID_WATER_ROW.replace("water", "outer space")
        csv_content = f"{VALID_HEADER}\n{row}\n"
        findings = self._validate(csv_content)
        self.assertTrue(
            any(
                f["status"] == "WARNING" and f["column_name"] == "environmental package"
                for f in findings
            )
        )

    def test_missing_project_name_on_supported_package_row(self):
        row = VALID_WATER_ROW.rsplit(";", 1)[0] + ";"
        csv_content = f"{VALID_HEADER}\n{row}\n"
        findings = self._validate(csv_content)
        self.assertTrue(
            any(
                f["column_name"] == "project name" and "MIxS rule 10" in f["message"]
                for f in findings
            )
        )

    def test_missing_depth_on_sediment_row_does_not_duplicate_package_extra_warning(self):
        row = VALID_WATER_ROW.replace("water", "sediment", 1).replace("12.5", "", 1)
        csv_content = f"{VALID_HEADER}\n{row}\n"
        findings = self._validate(csv_content)
        depth_findings = [f for f in findings if f["column_name"] == "depth"]
        self.assertEqual(1, len(depth_findings))
        self.assertIn("MIxS rule 1", depth_findings[0]["message"])

    def test_built_environment_missing_extra_mandatory_field_warns(self):
        header = f"{VALID_HEADER};indoor space"
        row = (
            f"{VALID_WATER_ROW.replace('water', 'built environment', 1)};"
        )
        csv_content = f"{header}\n{row}\n"
        findings = self._validate(csv_content)
        self.assertTrue(
            any(
                f["status"] == "WARNING"
                and f["column_name"] == "indoor space"
                and "built environment" in f["message"]
                and "empty" in f["message"]
                for f in findings
            )
        )

    def test_built_environment_missing_extra_mandatory_column_warns(self):
        row = VALID_WATER_ROW.replace("water", "built environment", 1)
        csv_content = f"{VALID_HEADER}\n{row}\n"
        findings = self._validate(csv_content)
        self.assertTrue(
            any(
                f["status"] == "WARNING"
                and f["column_name"] == "indoor space"
                and "built environment" in f["message"]
                and "missing" in f["message"]
                for f in findings
            )
        )

    def test_water_row_does_not_warn_about_built_environment_fields(self):
        csv_content = f"{VALID_HEADER}\n{VALID_WATER_ROW}\n"
        findings = self._validate(csv_content)
        self.assertFalse(any(f["column_name"] == "indoor space" for f in findings))

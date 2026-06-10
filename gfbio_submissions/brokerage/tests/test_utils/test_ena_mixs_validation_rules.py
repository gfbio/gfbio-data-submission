# -*- coding: utf-8 -*-
import re

from django.test import SimpleTestCase

from gfbio_submissions.brokerage.configuration.settings import CHECKLIST_ACCESSION_MAPPING
from gfbio_submissions.brokerage.utils.ena_mixs_validation_rules import (
    ALL_MIXS_ENVIRONMENTAL_PACKAGES,
    MIXS_COMMON_MANDATORY_FIELDS,
    MIXS_ENVIRONMENTAL_PACKAGE_ACCESSIONS,
    MIXS_FORMAT_RULES,
    MIXS_HEADER_MANDATORY_FIELDS,
    MIXS_MANDATORY_FIELDS_BY_PACKAGE,
    MIXS_PACKAGE_MANDATORY_FIELDS,
    MIXS_PRESENCE_RULES,
    MIXS_ROW_ALWAYS_MANDATORY_FIELDS,
    MIXS_GSC_ENVIRONMENTAL_PACKAGE_SYNONYMS,
    MIXS_HOST_ASSOCIATED_CHECKLIST_KEY,
    MIXS_HUMAN_ASSOCIATED_CHECKLIST_KEY,
    MIXS_MICROBIAL_MAT_BIOLFILM_CHECKLIST_KEY,
    MIXS_PLANT_ASSOCIATED_CHECKLIST_KEY,
    MIXS_DEPTH_COLUMN_NAMES,
    MIXS_VALIDATION_RULES,
    environmental_package_matches,
    format_rule_value_matches,
    get_checklist_accession,
    get_gsc_synonyms_for_package,
    is_supported_environmental_package,
    get_format_rule,
    get_mandatory_fields_for_package,
    get_presence_rule,
    get_validation_rule,
    resolve_environmental_package,
)


class TestEnaMixsValidationRules(SimpleTestCase):
    def test_all_format_rule_patterns_compile(self):
        for rule in MIXS_FORMAT_RULES:
            with self.subTest(field_name=rule["field_name"]):
                re.compile(rule["pattern"])

    def test_header_mandatory_fields_are_lowercase(self):
        for field_name in MIXS_HEADER_MANDATORY_FIELDS:
            self.assertEqual(field_name, field_name.lower())

    def test_get_format_rule_returns_defined_rules(self):
        self.assertIsNotNone(get_format_rule("depth"))
        self.assertIsNotNone(get_format_rule("elevation"))
        self.assertIsNotNone(get_format_rule("geographic location (latitude)"))
        self.assertIsNotNone(get_format_rule("collection date"))

    def test_environmental_package_matching_is_case_insensitive(self):
        self.assertTrue(environmental_package_matches("Sediment", ["sediment"]))
        self.assertTrue(environmental_package_matches(" water ", ["water"]))
        self.assertFalse(environmental_package_matches("soil", ["sediment"]))

    def test_depth_pattern_accepts_numeric_and_missing_terms(self):
        depth_rule = get_format_rule("depth")
        self.assertTrue(format_rule_value_matches(depth_rule, "12.5"))
        self.assertTrue(format_rule_value_matches(depth_rule, "not applicable"))
        self.assertFalse(format_rule_value_matches(depth_rule, "12.5 m"))
        self.assertFalse(format_rule_value_matches(depth_rule, "500mm"))
        self.assertFalse(format_rule_value_matches(depth_rule, "500m"))

    def test_latitude_pattern_accepts_decimal_degrees(self):
        pattern = re.compile(get_format_rule("geographic location (latitude)")["pattern"])
        self.assertIsNotNone(pattern.match("32.4567"))
        self.assertIsNotNone(pattern.match("-12"))
        self.assertIsNotNone(pattern.match("not collected"))

    def test_checklist_accession_mapping(self):
        self.assertEqual("ERC000024", get_checklist_accession("water"))
        self.assertEqual("ERC000019", get_checklist_accession("microbial mat biolfilm"))
        self.assertEqual("ERC000019", get_checklist_accession("microbial mat/biofilm"))
        self.assertEqual("ERC000019", get_checklist_accession("microbial mat biofilm"))
        self.assertEqual("ERC000013", get_checklist_accession("host-associated"))
        self.assertEqual("ERC000014", get_checklist_accession("human-associated"))
        self.assertEqual("ERC000020", get_checklist_accession("plant-associated"))

    def test_gsc_synonyms_map_to_ena_checklist_keys(self):
        expected_accessions = {
            MIXS_MICROBIAL_MAT_BIOLFILM_CHECKLIST_KEY: "ERC000019",
            MIXS_HOST_ASSOCIATED_CHECKLIST_KEY: "ERC000013",
            MIXS_HUMAN_ASSOCIATED_CHECKLIST_KEY: "ERC000014",
            MIXS_PLANT_ASSOCIATED_CHECKLIST_KEY: "ERC000020",
        }
        for checklist_key, accession in expected_accessions.items():
            with self.subTest(checklist_key=checklist_key):
                self.assertIn(checklist_key, CHECKLIST_ACCESSION_MAPPING)
                self.assertEqual(
                    get_gsc_synonyms_for_package(checklist_key),
                    MIXS_GSC_ENVIRONMENTAL_PACKAGE_SYNONYMS[checklist_key],
                )
                for synonym in get_gsc_synonyms_for_package(checklist_key):
                    self.assertTrue(is_supported_environmental_package(synonym))
                    self.assertEqual(checklist_key, resolve_environmental_package(synonym))
                    self.assertEqual(accession, get_checklist_accession(synonym))

    def test_common_mandatory_fields_match_all_packages(self):
        for package, fields in MIXS_MANDATORY_FIELDS_BY_PACKAGE.items():
            with self.subTest(package=package):
                for field_name in MIXS_COMMON_MANDATORY_FIELDS:
                    self.assertIn(field_name, fields)

    def test_package_specific_fields_are_inverted_index(self):
        for field_name, packages in MIXS_PACKAGE_MANDATORY_FIELDS.items():
            with self.subTest(field_name=field_name):
                self.assertNotIn(field_name, MIXS_COMMON_MANDATORY_FIELDS)
                for package in packages:
                    self.assertIn(field_name, MIXS_MANDATORY_FIELDS_BY_PACKAGE[package])

    def test_sediment_requires_depth_and_elevation(self):
        mandatory_fields = get_mandatory_fields_for_package("sediment")
        self.assertIn("depth", mandatory_fields)
        self.assertIn("elevation", mandatory_fields)

    def test_air_requires_altitude_not_depth(self):
        mandatory_fields = get_mandatory_fields_for_package("air")
        self.assertIn("altitude", mandatory_fields)
        self.assertNotIn("depth", mandatory_fields)

    def test_unknown_package_resolves_to_empty(self):
        self.assertEqual("", resolve_environmental_package("unknown package"))
        self.assertEqual([], get_mandatory_fields_for_package("unknown package"))

    def test_every_known_package_has_checklist_accession(self):
        self.assertEqual(
            set(MIXS_ENVIRONMENTAL_PACKAGE_ACCESSIONS.keys()),
            set(MIXS_MANDATORY_FIELDS_BY_PACKAGE.keys()),
        )

    def test_package_accessions_are_derived_from_checklist_mapping(self):
        self.assertEqual(
            set(CHECKLIST_ACCESSION_MAPPING.items()),
            set(MIXS_ENVIRONMENTAL_PACKAGE_ACCESSIONS.items()),
        )
        self.assertEqual("ERC000024", MIXS_ENVIRONMENTAL_PACKAGE_ACCESSIONS["water"])
        self.assertEqual("ERC000019", MIXS_ENVIRONMENTAL_PACKAGE_ACCESSIONS["microbial mat biolfilm"])

    def test_validation_rules_cover_rules_one_to_ten(self):
        self.assertEqual(list(range(1, 11)), [rule["rule_number"] for rule in MIXS_VALIDATION_RULES])

    def test_depth_column_names_include_legacy_header(self):
        self.assertIn("depth", MIXS_DEPTH_COLUMN_NAMES)
        self.assertIn("geographic location (depth)", MIXS_DEPTH_COLUMN_NAMES)

    def test_presence_rules_six_to_eight_and_ten(self):
        for rule_number in (6, 7, 8, 10):
            rule = get_validation_rule(rule_number)
            self.assertEqual("presence", rule["rule_type"])
            self.assertEqual(ALL_MIXS_ENVIRONMENTAL_PACKAGES, rule["environmental_packages"])

    def test_collection_date_rule_applies_to_all_packages(self):
        rule = get_validation_rule(9)
        self.assertEqual("collection date", rule["field_name"])
        self.assertEqual(ALL_MIXS_ENVIRONMENTAL_PACKAGES, rule["environmental_packages"])

    def test_collection_date_pattern_accepts_iso8601_values(self):
        pattern = re.compile(get_format_rule("collection date")["pattern"])
        self.assertIsNotNone(pattern.match("2016-01-18"))
        self.assertIsNotNone(pattern.match("2016-01-18/2016-01-31"))
        self.assertIsNotNone(pattern.match("not provided"))

    def test_elevation_rule_two_packages_and_pattern(self):
        rule = get_validation_rule(2)
        self.assertEqual("elevation", rule["field_name"])
        self.assertEqual("format", rule["rule_type"])
        self.assertEqual(
            {"microbial mat biolfilm", "sediment", "soil"},
            set(rule["environmental_packages"]),
        )
        pattern = re.compile(rule["pattern"])
        self.assertIsNotNone(pattern.match("120.5"))
        self.assertIsNotNone(pattern.match("-12"))
        self.assertIsNotNone(pattern.match("not applicable"))

    def test_presence_rule_lookup(self):
        self.assertIsNotNone(get_presence_rule("project name"))
        self.assertIsNone(get_presence_rule("depth"))

    def test_gfbio_template_region_field_stays_mandatory(self):
        self.assertIn("geographic location (region and locality)", MIXS_HEADER_MANDATORY_FIELDS)
        self.assertIn("geographic location (region and locality)", MIXS_ROW_ALWAYS_MANDATORY_FIELDS)

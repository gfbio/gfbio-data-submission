# -*- coding: utf-8 -*-
import io

from django.test import TestCase

from gfbio_submissions.brokerage.utils.ena_mandatory_fields import validate_ena_mandatory_fields


VALID_HEADER = (
    "sample_title;taxon_id;sample_description;sequencing_platform;library_strategy;"
    "library_source;library_selection;library_layout;nominal_length;forward_read_file_name;"
    "forward_read_file_checksum;reverse_read_file_name;reverse_read_file_checksum;checksum_method"
)


class TestEnaMandatoryFieldsValidation(TestCase):
    def _validate(self, content):
        return validate_ena_mandatory_fields(io.StringIO(content))

    def test_valid_single_end_row_has_no_errors(self):
        csv_content = (
            f"{VALID_HEADER}\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read1.fastq.gz;abc123;;;MD5\n"
        )
        self.assertEqual([], self._validate(csv_content))

    def test_valid_paired_end_row_has_no_errors(self):
        csv_content = (
            f"{VALID_HEADER}\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;paired;400;"
            "read1.fastq.gz;abc123;read2.fastq.gz;def456;MD5\n"
        )
        self.assertEqual([], self._validate(csv_content))

    def test_missing_required_header_column(self):
        header = VALID_HEADER.replace("taxon_id;", "")
        csv_content = f"{header}\nSample 1;;desc;Illumina;AMPLICON;METAGENOMIC;PCR;single;;read1.fastq.gz;abc123;;;MD5\n"
        findings = self._validate(csv_content)
        self.assertTrue(any(f["column_name"] == "taxon_id" and f["row"] == 1 for f in findings))

    def test_missing_required_value_in_row(self):
        csv_content = (
            f"{VALID_HEADER}\n"
            "Sample 1;;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read1.fastq.gz;abc123;;;MD5\n"
        )
        findings = self._validate(csv_content)
        self.assertTrue(any(f["column_name"] == "taxon_id" and f["row"] == 2 for f in findings))

    def test_paired_layout_requires_reverse_read_fields(self):
        csv_content = (
            f"{VALID_HEADER}\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;paired;400;"
            "read1.fastq.gz;abc123;;;MD5\n"
        )
        findings = self._validate(csv_content)
        missing_fields = {finding["column_name"] for finding in findings}
        self.assertIn("reverse_read_file_name", missing_fields)
        self.assertIn("reverse_read_file_checksum", missing_fields)

    def test_single_layout_rejects_paired_only_fields(self):
        csv_content = (
            f"{VALID_HEADER}\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;400;"
            "read1.fastq.gz;abc123;read2.fastq.gz;def456;MD5\n"
        )
        findings = self._validate(csv_content)
        forbidden_fields = {finding["column_name"] for finding in findings}
        self.assertIn("nominal_length", forbidden_fields)
        self.assertIn("reverse_read_file_name", forbidden_fields)
        self.assertIn("reverse_read_file_checksum", forbidden_fields)

    def test_duplicate_sample_titles_are_reported(self):
        csv_content = (
            f"{VALID_HEADER}\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read1.fastq.gz;abc123;;;MD5\n"
            "Sample 1;5678;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read2.fastq.gz;def456;;;MD5\n"
        )
        findings = self._validate(csv_content)
        duplicate_findings = [f for f in findings if f["column_name"] == "sample_title"]
        self.assertEqual(1, len(duplicate_findings))
        self.assertIn("rows 2, 3", duplicate_findings[0]["message"])

    def test_paired_layout_requires_paired_header_columns(self):
        header = VALID_HEADER.replace("reverse_read_file_checksum;", "")
        csv_content = (
            f"{header}\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;paired;400;"
            "read1.fastq.gz;abc123;read2.fastq.gz;;MD5\n"
        )
        findings = self._validate(csv_content)
        self.assertTrue(
            any(
                finding["column_name"] == "reverse_read_file_checksum"
                and finding["row"] == 1
                for finding in findings
            )
        )

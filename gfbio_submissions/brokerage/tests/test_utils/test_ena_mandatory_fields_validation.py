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
        self.assertIn("(lines: 2, 3)", duplicate_findings[0]["message"])
        self.assertIn("INFO", duplicate_findings[0]["status"])

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

    def test_accession_row_allows_empty_sample_cells_but_normal_row_does_not(self):
        header = VALID_HEADER + ";sample_accession"
        csv_content = (
            f"{header}\n"
            ";;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read1.fastq.gz;abc123;;;MD5;SAMEA115886020\n"
            ";;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read2.fastq.gz;def456;;;MD5;\n"
        )
        findings = self._validate(csv_content)
        empty_sample_errors = [
            finding
            for finding in findings
            if finding["column_name"] in {"sample_title", "taxon_id"} and finding["status"] == "ERROR"
        ]
        self.assertEqual(
            [3], [finding["row"] for finding in empty_sample_errors if finding["column_name"] == "sample_title"]
        )
        self.assertTrue(
            any(finding["row"] == 3 and finding["column_name"] == "taxon_id" for finding in empty_sample_errors)
        )
        self.assertFalse(any(finding["row"] == 2 for finding in empty_sample_errors))

    def test_accession_only_file_does_not_require_sample_columns(self):
        header = (
            "sample_accession;sequencing_platform;library_strategy;library_source;library_selection;"
            "library_layout;forward_read_file_name;forward_read_file_checksum;checksum_method"
        )
        csv_content = (
            f"{header}\nSAMEA115886020;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;read1.fastq.gz;abc123;MD5\n"
        )
        findings = self._validate(csv_content)
        self.assertFalse(any(finding["column_name"] in {"sample_title", "taxon_id"} for finding in findings))

    def test_accession_only_file_still_requires_experiment_fields(self):
        header = (
            "sample_accession;sequencing_platform;library_strategy;library_source;library_selection;"
            "library_layout;forward_read_file_name;checksum_method"
        )
        csv_content = (
            f"{header}\nSAMEA115886020;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;read1.fastq.gz;MD5\n"
        )
        findings = self._validate(csv_content)
        self.assertTrue(
            any(finding["column_name"] == "forward_read_file_checksum" and finding["row"] == 1 for finding in findings)
        )

    def test_invalid_accession_is_an_error_even_with_sample_title(self):
        header = VALID_HEADER + ";sample_accession"
        csv_content = (
            f"{header}\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read1.fastq.gz;abc123;;;MD5;NOT_AN_ACCESSION\n"
        )
        findings = self._validate(csv_content)
        self.assertTrue(
            any(finding["finding_type"] == "Invalid Sample Accession" and finding["row"] == 2 for finding in findings)
        )

    def test_blacklist_accession_follows_new_sample_path(self):
        header = VALID_HEADER + ";sample_accession"
        csv_content = (
            f"{header}\n"
            ";1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read1.fastq.gz;abc123;;;MD5;NA\n"
        )
        findings = self._validate(csv_content)
        self.assertTrue(any(finding["column_name"] == "sample_title" and finding["row"] == 2 for finding in findings))
        self.assertFalse(any(finding["finding_type"] == "Invalid Sample Accession" for finding in findings))

    def test_same_title_with_two_accessions_is_an_error_without_info(self):
        header = VALID_HEADER + ";sample_accession"
        csv_content = (
            f"{header}\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read1.fastq.gz;abc123;;;MD5;ERS123456\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read2.fastq.gz;def456;;;MD5;DRS123456\n"
        )
        findings = self._validate(csv_content)
        self.assertTrue(any("different sample accessions" in finding["message"] for finding in findings))
        self.assertFalse(
            any(finding["status"] == "INFO" and finding["column_name"] == "sample_title" for finding in findings)
        )

    def test_title_mixed_with_and_without_accession_is_an_error(self):
        header = VALID_HEADER + ";sample_accession"
        csv_content = (
            f"{header}\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read1.fastq.gz;abc123;;;MD5;\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read2.fastq.gz;def456;;;MD5;ERS123456\n"
        )
        findings = self._validate(csv_content)
        self.assertTrue(any("with and without a sample accession" in finding["message"] for finding in findings))
        self.assertFalse(any(finding["status"] == "INFO" for finding in findings))

    def test_same_accession_with_different_titles_is_an_error(self):
        header = VALID_HEADER + ";sample_accession"
        csv_content = (
            f"{header}\n"
            "Sample A;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read1.fastq.gz;abc123;;;MD5;ERS123456\n"
            "Sample a;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read2.fastq.gz;def456;;;MD5;ERS123456\n"
        )
        findings = self._validate(csv_content)
        self.assertTrue(any("different sample titles" in finding["message"] for finding in findings))

    def test_repeated_title_with_one_accession_reports_no_new_sample(self):
        header = VALID_HEADER + ";sample_accession"
        csv_content = (
            f"{header}\n"
            "Sample 1;1234;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read1.fastq.gz;abc123;;;MD5;ERS123456\n"
            "Sample 1;;desc;Illumina HiSeq 2000;AMPLICON;METAGENOMIC;PCR;single;;"
            "read2.fastq.gz;def456;;;MD5;ERS123456\n"
        )
        findings = self._validate(csv_content)
        info = [finding for finding in findings if finding["status"] == "INFO"]
        self.assertEqual(1, len(info))
        self.assertIn("No new sample will be created.", info[0]["message"])
        self.assertNotIn("Only one sample", info[0]["message"])

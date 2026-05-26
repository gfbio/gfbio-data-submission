# -*- coding: utf-8 -*-
import csv
from collections import defaultdict

from django.utils.encoding import smart_str

ALWAYS_MANDATORY_FIELDS = [
    "sample_title",
    "taxon_id",
    "sequencing_platform",
    "library_strategy",
    "library_source",
    "library_selection",
    "library_layout",
    "forward_read_file_name",
    "forward_read_file_checksum",
    "checksum_method",
]

PAIRED_MANDATORY_FIELDS = [
    "nominal_length",
    "reverse_read_file_name",
    "reverse_read_file_checksum",
]

SINGLE_FORBIDDEN_FIELDS = PAIRED_MANDATORY_FIELDS

FIELD_HELP_TEXT = {
    "sample_title": (
        "A unique label for your samples, preferably one you can use to map to any other data "
        "(e.g. environmental measurements, experimental conditions)."
    ),
    "taxon_id": (
        "The numeric taxon ID according to NCBI Taxonomy, e.g. from "
        "https://www.ncbi.nlm.nih.gov/datasets/taxonomy/tree/."
    ),
    "sequencing_platform": (
        'The full name of the sequencing machine, e.g. "Illumina HiSeq 2000". '
        "See ENA platform and instrument documentation."
    ),
    "library_strategy": (
        "e.g. 'AMPLICON' for community analysis with marker genes like 16S rRNA."
    ),
    "library_source": (
        'e.g. "METAGENOMIC" or "METATRANSCRIPTOMIC" for community based analyses.'
    ),
    "library_selection": (
        'e.g. for amplicon studies, use "PCR".'
    ),
    "library_layout": (
        'Whether the sequence reads are single-end or paired-end (allowed values: "single" or "paired").'
    ),
    "nominal_length": (
        "Expected insert size. Mandatory for paired-end sequencing (library_layout = paired)."
    ),
    "forward_read_file_name": (
        "The complete filename for the forward read as uploaded through the interface."
    ),
    "forward_read_file_checksum": (
        "Checksum of the forward read file (e.g. MD5) to verify file integrity after transfer."
    ),
    "reverse_read_file_name": (
        "Mandatory when library_layout is paired: filename of the reverse read."
    ),
    "reverse_read_file_checksum": (
        "Mandatory when library_layout is paired: checksum of the reverse read file."
    ),
    "checksum_method": (
        'Method used to calculate read file checksums (allowed value: "MD5").'
    ),
}


def _is_missing_value(value):
    if value is None:
        return True
    return str(value).strip() == ""


def _has_value(value):
    return not _is_missing_value(value)


def _normalize_layout(value):
    if value is None:
        return ""
    return str(value).strip().lower()


def _column_index(fieldnames, field_name):
    try:
        return fieldnames.index(field_name) + 1
    except ValueError:
        return None


def validate_ena_mandatory_fields(csv_file):
    """
    Validate mandatory ENA metadata columns and row values.

    Returns a list of finding dicts with keys:
    status, row, column, column_name, message, help_text
    """
    findings = []
    header_line = csv_file.readline()
    if not header_line or not header_line.strip():
        findings.append(
            {
                "status": "ERROR",
                "row": 1,
                "column": None,
                "column_name": None,
                "message": "Metadata file is empty or has no header row.",
                "help_text": "Provide a CSV file with a header row based on the molecular submission template.",
            }
        )
        return findings

    dialect = csv.Sniffer().sniff(smart_str(header_line))
    csv_file.seek(0)
    delimiter = dialect.delimiter if dialect.delimiter in [",", ";", "\t"] else ";"
    csv_reader = csv.DictReader(
        csv_file,
        delimiter=delimiter,
        quotechar='"',
        skipinitialspace=True,
    )

    if not csv_reader.fieldnames:
        findings.append(
            {
                "status": "ERROR",
                "row": 1,
                "column": None,
                "column_name": None,
                "message": "Metadata file has no parseable header row.",
                "help_text": "Provide a CSV file with a header row based on the molecular submission template.",
            }
        )
        return findings

    fieldnames = [field.strip().lower() for field in csv_reader.fieldnames]
    for index, field in enumerate(csv_reader.fieldnames):
        csv_reader.fieldnames[index] = field.strip().lower()

    present_fields = set(fieldnames)
    for field_name in ALWAYS_MANDATORY_FIELDS:
        if field_name not in present_fields:
            findings.append(
                {
                    "status": "ERROR",
                    "row": 1,
                    "column": None,
                    "column_name": field_name,
                    "message": f"Required column '{field_name}' is missing from the metadata file header.",
                    "help_text": FIELD_HELP_TEXT.get(field_name, ""),
                }
            )

    rows = list(csv_reader)
    has_paired_rows = any(_normalize_layout(row.get("library_layout")) == "paired" for row in rows)
    if has_paired_rows:
        for field_name in PAIRED_MANDATORY_FIELDS:
            if field_name not in present_fields:
                findings.append(
                    {
                        "status": "ERROR",
                        "row": 1,
                        "column": None,
                        "column_name": field_name,
                        "message": (
                            f"Required column '{field_name}' is missing from the metadata file header "
                            "for paired-end library_layout."
                        ),
                        "help_text": FIELD_HELP_TEXT.get(field_name, ""),
                    }
                )

    sample_title_rows = defaultdict(list)
    data_row_number = 1
    for row in rows:
        data_row_number += 1
        row_number = data_row_number

        layout = _normalize_layout(row.get("library_layout"))
        if layout and layout not in {"single", "paired"}:
            findings.append(
                {
                    "status": "ERROR",
                    "row": row_number,
                    "column": _column_index(fieldnames, "library_layout"),
                    "column_name": "library_layout",
                    "message": (
                        f"Invalid library_layout value '{row.get('library_layout')}' in row {row_number}. "
                        'Allowed values are "single" or "paired".'
                    ),
                    "help_text": FIELD_HELP_TEXT["library_layout"],
                }
            )

        for field_name in ALWAYS_MANDATORY_FIELDS:
            if field_name not in present_fields:
                continue
            if _is_missing_value(row.get(field_name)):
                findings.append(
                    {
                        "status": "ERROR",
                        "row": row_number,
                        "column": _column_index(fieldnames, field_name),
                        "column_name": field_name,
                        "message": f"Required field '{field_name}' is empty in row {row_number}.",
                        "help_text": FIELD_HELP_TEXT.get(field_name, ""),
                    }
                )

        sample_title = row.get("sample_title")
        if _has_value(sample_title):
            sample_title_rows[str(sample_title).strip()].append(row_number)

        if layout == "paired":
            for field_name in PAIRED_MANDATORY_FIELDS:
                if field_name not in present_fields:
                    continue
                if _is_missing_value(row.get(field_name)):
                    findings.append(
                        {
                            "status": "ERROR",
                            "row": row_number,
                            "column": _column_index(fieldnames, field_name),
                            "column_name": field_name,
                            "message": (
                                f"Required field '{field_name}' is empty in row {row_number} "
                                "for paired-end library_layout."
                            ),
                            "help_text": FIELD_HELP_TEXT.get(field_name, ""),
                        }
                    )
        elif layout == "single":
            for field_name in SINGLE_FORBIDDEN_FIELDS:
                if field_name not in present_fields:
                    continue
                if _has_value(row.get(field_name)):
                    findings.append(
                        {
                            "status": "ERROR",
                            "row": row_number,
                            "column": _column_index(fieldnames, field_name),
                            "column_name": field_name,
                            "message": (
                                f"Field '{field_name}' must be empty in row {row_number} "
                                "when library_layout is single."
                            ),
                            "help_text": FIELD_HELP_TEXT.get(field_name, ""),
                        }
                    )

    for title, row_numbers in sample_title_rows.items():
        if len(row_numbers) > 1:
            row_list = ", ".join(str(row_number) for row_number in row_numbers)
            findings.append(
                {
                    "status": "ERROR",
                    "row": row_numbers[0],
                    "column": _column_index(fieldnames, "sample_title"),
                    "column_name": "sample_title",
                    "message": (
                        f"Duplicate sample_title '{title}' in rows {row_list}. "
                        "sample_title must be unique across all rows."
                    ),
                    "help_text": FIELD_HELP_TEXT["sample_title"],
                }
            )

    return findings

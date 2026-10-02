# -*- coding: utf-8 -*-
import re
from collections import defaultdict

from gfbio_submissions.brokerage.utils.csv_format import open_csv_reader
from gfbio_submissions.brokerage.utils.ena_experiment_definitions_utils import get_library_column_validation_rules_from_ena_experiment_definitions


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
    "sample_accession": (
        "Existing ENA sample accession (ERS, DRS, or SRS plus at least 6 digits) "
        "or BioSample accession (SAME, SAMD, or SAMN, optional extra letter, then digits). "
        "When set, this row links to that sample and no new sample is created."
    ),
}

# Sample-level columns. Still required unless every data row has a valid sample_accession.
SAMPLE_LEVEL_COLUMNS = ("sample_title", "taxon_id")

# Case-insensitive form of attribute_value_blacklist in csv.py.
_SAMPLE_ACCESSION_BLACKLIST = {"na", "n/a"}
_SAMPLE_ACCESSION_RE = re.compile(r"(E|D|S)RS[0-9]{6,}")
_BIOSAMPLE_ACCESSION_RE = re.compile(r"SAM(E|D|N)[A-Z]?[0-9]+")


def sample_accession_value(value):
    """Return the upper-cased accession when the cell counts as set, else None.

    A cell counts as set only after strip, when it is non-empty and not a blacklist token.
    Format is not checked here.
    """
    if value is None:
        return None
    text = str(value).strip()
    if not text or text.lower() in _SAMPLE_ACCESSION_BLACKLIST:
        return None
    return text.upper()


def is_valid_sample_accession(value):
    accession = sample_accession_value(value)
    if accession is None:
        return False
    return (
        _SAMPLE_ACCESSION_RE.fullmatch(accession) is not None
        or _BIOSAMPLE_ACCESSION_RE.fullmatch(accession) is not None
    )


def row_has_valid_sample_accession(row):
    if not row:
        return False
    return is_valid_sample_accession(row.get("sample_accession"))


def row_has_sample_title_or_set_accession(row):
    """Return whether parse_molecular_csv keeps this row.

    A row is kept when it has a sample_title or a set sample_accession.
    Titles are stripped. Accession cells count as set only via sample_accession_value
    (non-empty after strip, and not a blacklist token).
    """
    if not row:
        return False
    title = row.get("sample_title") or ""
    if not isinstance(title, str):
        title = str(title)
    return bool(title.strip()) or sample_accession_value(row.get("sample_accession")) is not None


def every_data_row_has_valid_sample_accession(rows):
    """True when every non-blank row has a valid sample accession.

    Blank rows stay excluded. A non-blank row without a valid accession keeps
    sample-level columns mandatory, even when other rows have an accession.
    """
    data_rows = [row for row in rows if not row_is_blank(row)]
    return bool(data_rows) and all(row_has_valid_sample_accession(row) for row in data_rows)


def row_is_blank(row):
    """True when the row has no cell text. Trailing Excel lines look like this."""
    if not row:
        return True
    return all(value is None or str(value).strip() == "" for value in row.values())


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
                "finding_type": "Header-Error",
                "message": "Metadata file is empty or has no header row.",
                "help_text": "Provide a CSV file with a header row based on the molecular submission template.",
            }
        )
        return findings

    csv_file.seek(0)
    csv_reader, _csv_format = open_csv_reader(
        csv_file,
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
                "finding_type": "Header-Error",
                "message": "Metadata file has no parseable header row.",
                "help_text": "Provide a CSV file with a header row based on the molecular submission template.",
            }
        )
        return findings

    fieldnames = [field.strip().lower() for field in csv_reader.fieldnames]
    for index, field in enumerate(csv_reader.fieldnames):
        csv_reader.fieldnames[index] = field.strip().lower()

    present_fields = set(fieldnames)
    rows = list(csv_reader)
    existing_samples_only = every_data_row_has_valid_sample_accession(rows)
    mandatory_columns = [
        field_name
        for field_name in ALWAYS_MANDATORY_FIELDS
        if not (existing_samples_only and field_name in SAMPLE_LEVEL_COLUMNS)
    ]
    for field_name in mandatory_columns:
        if field_name not in present_fields:
            findings.append(
                {
                    "status": "ERROR",
                    "row": 1,
                    "column": None,
                    "column_name": field_name,
                    "finding_type": "Missing Required Column",
                    "message": f"Required column '{field_name}' is missing from the metadata file header.",
                    "help_text": FIELD_HELP_TEXT.get(field_name, ""),
                }
            )

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
                        "finding_type": "Missing Required Column",
                        "message": (
                            f"Required column '{field_name}' is missing from the metadata file header "
                            "for paired-end library_layout."
                        ),
                        "help_text": FIELD_HELP_TEXT.get(field_name, ""),
                    }
                )

    validation_rules = get_library_column_validation_rules_from_ena_experiment_definitions()

    sample_title_rows = defaultdict(list)
    data_row_number = 1
    for row in rows:
        data_row_number += 1
        row_number = data_row_number
        if row_is_blank(row):
            continue
        uses_existing_sample = row_has_valid_sample_accession(row)
        accession = sample_accession_value(row.get("sample_accession"))
        if "sample_accession" in present_fields and accession and not uses_existing_sample:
            findings.append(
                {
                    "status": "ERROR",
                    "row": row_number,
                    "column": _column_index(fieldnames, "sample_accession"),
                    "column_name": "sample_accession",
                    "finding_type": "Invalid Sample Accession",
                    "message": (
                        f"Invalid sample_accession '{accession}'. "
                        "Expected an ENA sample accession ((E|D|S)RS followed by at least 6 digits) "
                        "or a BioSample accession (SAM(E|D|N), optional letter, then digits)."
                    ),
                    "help_text": FIELD_HELP_TEXT["sample_accession"],
                }
            )

        layout = _normalize_layout(row.get("library_layout"))
        if layout and layout not in {"single", "paired"}:
            findings.append(
                {
                    "status": "ERROR",
                    "row": row_number,
                    "column": _column_index(fieldnames, "library_layout"),
                    "column_name": "library_layout",
                    "finding_type": "Invalid Library Layout",
                    "message": (
                        f"Invalid library_layout value '{row.get('library_layout')}'. "
                        'Allowed values are "single" or "paired".'
                    ),
                    "help_text": FIELD_HELP_TEXT["library_layout"],
                }
            )

        for field_name in ALWAYS_MANDATORY_FIELDS:
            if field_name not in present_fields:
                continue
            if uses_existing_sample and field_name in SAMPLE_LEVEL_COLUMNS:
                continue
            if _is_missing_value(row.get(field_name)):
                findings.append(
                    {
                        "status": "ERROR",
                        "row": row_number,
                        "column": _column_index(fieldnames, field_name),
                        "column_name": field_name,
                        "finding_type": "Missing Required Field Value",
                        "message": f"Required field '{field_name}' is empty.",
                        "help_text": FIELD_HELP_TEXT.get(field_name, ""),
                    }
                )

        for field_name, rule in validation_rules.items():
            if field_name not in present_fields:
                continue
            if _has_value(row.get(field_name)):
                if rule["rule"] == "in_enum" and row.get(field_name) not in rule["enum"]:
                    findings.append(
                        {
                            "status": "ERROR",
                            "row": row_number,
                            "column": _column_index(fieldnames, field_name),
                            "column_name": field_name,
                            "finding_type": "Invalid Field Value",
                            "message": f"Invalid value for field '{field_name}': {row.get(field_name)}.",
                            "help_text": "Please provide a valid value from the allowed options: " + ", ".join(rule["enum"]),
                        }
                    )

        sample_title = row.get("sample_title")
        if _has_value(sample_title):
            sample_title_rows[str(sample_title).strip()].append((row_number, accession))

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
                            "finding_type": "Missing Paired-End Field Value",
                            "message": (
                                f"Required field '{field_name}' is empty "
                                "for paired-end library_layout."
                            ),
                            "help_text": FIELD_HELP_TEXT.get(field_name, ""),
                        }
                    )
        elif layout == "single":
            for field_name in PAIRED_MANDATORY_FIELDS:
                if field_name not in present_fields:
                    continue
                if _has_value(row.get(field_name)):
                    findings.append(
                        {
                            "status": "ERROR",
                            "row": row_number,
                            "column": _column_index(fieldnames, field_name),
                            "column_name": field_name,
                            "finding_type": "Unexpected Paired-End Field Value",
                            "message": (
                                f"Field '{field_name}' must be empty when library_layout is single."
                            ),
                            "help_text": FIELD_HELP_TEXT.get(field_name, ""),
                        }
                    )

    accession_title_rows = defaultdict(list)
    for title, entries in sample_title_rows.items():
        for row_number, accession in entries:
            if accession:
                accession_title_rows[accession].append((row_number, title))

    titles_with_consistency_error = set()
    for title, entries in sample_title_rows.items():
        row_numbers = [row_number for row_number, _accession in entries]
        set_accessions = {accession for _row_number, accession in entries if accession}
        has_row_without_accession = any(accession is None for _row_number, accession in entries)
        row_list = ", ".join(str(row_number) for row_number in row_numbers)
        if len(set_accessions) > 1:
            titles_with_consistency_error.add(title)
            findings.append(
                {
                    "status": "ERROR",
                    "row": row_numbers[0],
                    "column": _column_index(fieldnames, "sample_title"),
                    "column_name": "sample_title",
                    "finding_type": "Inconsistent Sample Accession",
                    "message": (
                        f"The sample_title '{title}' is used with different sample accessions (lines: {row_list})."
                    ),
                    "help_text": "Use one sample accession for every row that shares this sample_title.",
                }
            )
        if set_accessions and has_row_without_accession:
            titles_with_consistency_error.add(title)
            findings.append(
                {
                    "status": "ERROR",
                    "row": row_numbers[0],
                    "column": _column_index(fieldnames, "sample_title"),
                    "column_name": "sample_title",
                    "finding_type": "Inconsistent Sample Accession",
                    "message": (
                        f"The sample_title '{title}' is used both with and without a sample accession "
                        f"(lines: {row_list})."
                    ),
                    "help_text": (
                        "Either link every row of this sample_title to the same existing accession, "
                        "or leave the accession empty so a new sample is created."
                    ),
                }
            )

    for accession, entries in accession_title_rows.items():
        nonempty_titles = []
        for _row_number, title in entries:
            if title not in nonempty_titles:
                nonempty_titles.append(title)
        if len(nonempty_titles) <= 1:
            continue
        titles_with_consistency_error.update(nonempty_titles)
        row_numbers = [row_number for row_number, _title in entries]
        row_list = ", ".join(str(row_number) for row_number in row_numbers)
        title_list = ", ".join(f"'{title}'" for title in nonempty_titles)
        findings.append(
            {
                "status": "ERROR",
                "row": row_numbers[0],
                "column": _column_index(fieldnames, "sample_accession"),
                "column_name": "sample_accession",
                "finding_type": "Inconsistent Sample Accession",
                "message": (
                    f"Sample accession '{accession}' is used with different sample titles "
                    f"(lines: {row_list}): {title_list}."
                ),
                "help_text": (
                    "Rows that share a sample accession must use the same sample_title, or leave the title empty."
                ),
            }
        )

    for title, entries in sample_title_rows.items():
        if len(entries) <= 1 or title in titles_with_consistency_error:
            continue
        row_numbers = [row_number for row_number, _accession in entries]
        set_accessions = {accession for _row_number, accession in entries if accession}
        has_row_without_accession = any(accession is None for _row_number, accession in entries)
        row_list = ", ".join(str(row_number) for row_number in row_numbers)
        if not set_accessions:
            findings.append(
                {
                    "status": "INFO",
                    "row": row_numbers[0],
                    "column": _column_index(fieldnames, "sample_title"),
                    "column_name": "sample_title",
                    "finding_type": "Duplicate Sample Title",
                    "message": (
                        f"The sample_title '{title}' was used more than once (lines: {row_list}). "
                        "Only one sample with the metadata from the first (topmost) occurrence in the metadata file will be created. "
                        "The sequence data from all subsequent occurrences will be linked to the same sample."
                    ),
                    "help_text": (
                        "Please ensure that you actually want to group these samples or choose unique sample titles to prevent the clustering."
                    ),
                }
            )
        elif len(set_accessions) == 1 and not has_row_without_accession:
            accession = next(iter(set_accessions))
            findings.append(
                {
                    "status": "INFO",
                    "row": row_numbers[0],
                    "column": _column_index(fieldnames, "sample_title"),
                    "column_name": "sample_title",
                    "finding_type": "Existing Sample Accession",
                    "message": (
                        f"The sample_title '{title}' was used more than once (lines: {row_list}) "
                        f"with sample accession '{accession}'. No new sample will be created."
                    ),
                    "help_text": "Rows that share this accession are linked to the existing ENA sample.",
                }
            )

    return findings

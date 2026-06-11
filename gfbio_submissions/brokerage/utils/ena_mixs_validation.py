# -*- coding: utf-8 -*-
from __future__ import annotations

from gfbio_submissions.brokerage.utils.csv_format import open_csv_reader
from gfbio_submissions.brokerage.utils.ena_mixs_column_mapping import ENA_HEADER_MAPPING
from gfbio_submissions.brokerage.utils.ena_mixs_validation_rules import (
    MIXS_ENVIRONMENTAL_PACKAGE_ALIASES,
    MIXS_ENVIRONMENTAL_PACKAGE_HEADER_FIELDS,
    MIXS_FIELD_HELP_TEXT,
    MIXS_HEADER_MANDATORY_FIELDS,
    MIXS_PRESENCE_RULES,
    MIXS_ROW_ALWAYS_MANDATORY_FIELDS,
    MIXS_ROW_ENVIRONMENTAL_PACKAGE_MANDATORY_FIELDS,
    MIXS_VALIDATION_RULES,
    MixsPresenceRule,
    MixsValidationRule,
    environmental_package_matches,
    format_rule_value_matches,
    get_format_rule,
    get_validation_rule,
    is_supported_environmental_package,
    resolve_environmental_package,
)

# All MIxS validation findings are warnings until the rules are enforced as errors.
MIXS_FINDING_STATUS = "WARNING"


def _is_missing_value(value) -> bool:
    if value is None:
        return True
    return str(value).strip() == ""


def _column_index(fieldnames: list[str], column_name: str) -> int | None:
    try:
        return fieldnames.index(column_name) + 1
    except ValueError:
        return None


def _legacy_csv_column_names_for_field(field_name: str) -> list[str]:
    return [
        legacy_name
        for legacy_name, canonical_name in ENA_HEADER_MAPPING.items()
        if canonical_name == field_name
    ]


def _header_has_field(field_name: str, present_fields: set[str]) -> bool:
    if field_name in present_fields:
        return True
    return any(legacy_name in present_fields for legacy_name in _legacy_csv_column_names_for_field(field_name))


def _resolve_column_name(field_name: str, present_fields: set[str]) -> str | None:
    if field_name in present_fields:
        return field_name
    for legacy_name in _legacy_csv_column_names_for_field(field_name):
        if legacy_name in present_fields:
            return legacy_name
    return None


def _rule_applies_to_row(rule: MixsValidationRule, row_package: str | None) -> bool:
    packages = rule["environmental_packages"]
    if packages is None:
        return True
    if not resolve_environmental_package(row_package):
        return False
    return environmental_package_matches(row_package, packages)


def _format_rule_is_mandatory(rule: MixsValidationRule, row_package: str | None) -> bool:
    return _rule_applies_to_row(rule, row_package)


def _finding(
    *,
    message: str,
    help_text: str,
    row: int | None = None,
    column: int | None = None,
    column_name: str | None = None,
) -> dict:
    return {
        "status": MIXS_FINDING_STATUS,
        "row": row,
        "column": column,
        "column_name": column_name,
        "message": message,
        "help_text": help_text,
    }


def _validate_header(present_fields: set[str], fieldnames: list[str]) -> list[dict]:
    findings: list[dict] = []
    for field_name in MIXS_HEADER_MANDATORY_FIELDS:
        if not _header_has_field(field_name, present_fields):
            findings.append(
                _finding(
                    row=1,
                    column_name=field_name,
                    message=f"Required column '{field_name}' is missing from the metadata file header.",
                    help_text=_field_help_text(field_name),
                )
            )
    for field_name in MIXS_ENVIRONMENTAL_PACKAGE_HEADER_FIELDS:
        if not _header_has_field(field_name, present_fields):
            findings.append(
                _finding(
                    row=1,
                    column_name=field_name,
                    message=f"Required column '{field_name}' is missing from the metadata file header.",
                    help_text=_field_help_text(field_name),
                )
            )
    return findings


def _validate_legacy_column_headers(present_fields: set[str], fieldnames: list[str]) -> list[dict]:
    findings: list[dict] = []
    for legacy_name, canonical_name in ENA_HEADER_MAPPING.items():
        if legacy_name not in present_fields:
            continue
        findings.append(
            _finding(
                row=1,
                column=_column_index(fieldnames, legacy_name),
                column_name=legacy_name,
                message=(
                    f"Column '{legacy_name}' is a legacy template header. "
                    f"Use '{canonical_name}' in the metadata file."
                ),
                help_text=_field_help_text(canonical_name),
            )
        )
    return findings


def _field_help_text(field_name: str) -> str:
    rule = get_format_rule(field_name) or next(
        (presence_rule for presence_rule in MIXS_PRESENCE_RULES if presence_rule["field_name"] == field_name),
        None,
    )
    if rule:
        return rule["help_text"]
    return MIXS_FIELD_HELP_TEXT.get(field_name, "")


def _validate_environmental_package(
    row_package_raw: str,
    row_number: int,
    fieldnames: list[str],
) -> list[dict]:
    findings: list[dict] = []
    column_name = _resolve_column_name("environmental package", set(fieldnames)) or "environmental package"
    column = _column_index(fieldnames, column_name)
    normalized_raw = str(row_package_raw).strip().lower()

    if normalized_raw in MIXS_ENVIRONMENTAL_PACKAGE_ALIASES:
        canonical_package = MIXS_ENVIRONMENTAL_PACKAGE_ALIASES[normalized_raw]
        findings.append(
            _finding(
                row=row_number,
                column=column,
                column_name=column_name,
                message=(
                    f"Environmental package '{row_package_raw.strip()}' is a valid GSC MIxS name. "
                    f"For ENA submission, use '{canonical_package}'."
                ),
                help_text=_field_help_text("environmental package"),
            )
        )
    elif normalized_raw and not is_supported_environmental_package(row_package_raw):
        findings.append(
            _finding(
                row=row_number,
                column=column,
                column_name=column_name,
                message=(
                    f"Unknown environmental package '{row_package_raw.strip()}' in row {row_number}."
                ),
                help_text=_field_help_text("environmental package"),
            )
        )
    return findings


def _validate_presence_field(
    field_name: str,
    row,
    row_number: int,
    present_fields: set[str],
    fieldnames: list[str],
    *,
    rule_number: int | None = None,
) -> dict | None:
    column_name = _resolve_column_name(field_name, present_fields)
    if column_name is None:
        return None
    if not _is_missing_value(row.get(column_name)):
        return None
    prefix = f"MIxS rule {rule_number}: " if rule_number else ""
    return _finding(
        row=row_number,
        column=_column_index(fieldnames, column_name),
        column_name=column_name,
        message=f"{prefix}Required field '{field_name}' is empty in row {row_number}.",
        help_text=_field_help_text(field_name),
    )


def _validate_format_rule(
    rule: MixsValidationRule,
    row,
    row_number: int,
    present_fields: set[str],
    fieldnames: list[str],
    row_package: str | None,
) -> list[dict]:
    findings: list[dict] = []
    if not _rule_applies_to_row(rule, row_package):
        return findings

    field_name = rule["field_name"]
    column_name = _resolve_column_name(field_name, present_fields)
    if column_name is None:
        return findings

    value = row.get(column_name)
    format_rule = get_format_rule(field_name)
    if format_rule is None:
        return findings

    if _is_missing_value(value):
        if _format_rule_is_mandatory(rule, row_package):
            findings.append(
                _finding(
                    row=row_number,
                    column=_column_index(fieldnames, column_name),
                    column_name=column_name,
                    message=(
                        f"MIxS rule {rule['rule_number']}: Required field '{field_name}' is empty "
                        f"in row {row_number}."
                    ),
                    help_text=format_rule["help_text"],
                )
            )
        return findings

    if not format_rule_value_matches(format_rule, value):
        findings.append(
            _finding(
                row=row_number,
                column=_column_index(fieldnames, column_name),
                column_name=column_name,
                message=(
                    f"MIxS rule {rule['rule_number']}: Invalid value '{str(value).strip()}' "
                    f"for '{field_name}' in row {row_number}."
                ),
                help_text=format_rule["help_text"],
            )
        )
    return findings


def _validate_presence_rule(
    rule: MixsPresenceRule,
    rule_number: int,
    row,
    row_number: int,
    present_fields: set[str],
    fieldnames: list[str],
    row_package: str | None,
) -> dict | None:
    validation_rule = get_validation_rule(rule_number)
    if validation_rule is None or not _rule_applies_to_row(validation_rule, row_package):
        return None
    return _validate_presence_field(
        rule["field_name"],
        row,
        row_number,
        present_fields,
        fieldnames,
        rule_number=rule_number,
    )


def validate_mixs_metadata_fields(csv_file):
    """
    Validate MIxS metadata columns and row values against ena_mixs_validation_rules.

    Returns a list of finding dicts with keys:
    status, row, column, column_name, message, help_text
    """
    findings: list[dict] = []
    header_line = csv_file.readline()
    if not header_line or not header_line.strip():
        return [
            _finding(
                row=1,
                message="Metadata file is empty or has no header row.",
                help_text="Provide a CSV file with a header row based on the molecular submission template.",
            )
        ]

    csv_file.seek(0)
    csv_reader, _csv_format = open_csv_reader(
        csv_file,
        quotechar='"',
        skipinitialspace=True,
    )

    if not csv_reader.fieldnames:
        return [
            _finding(
                row=1,
                message="Metadata file has no parseable header row.",
                help_text="Provide a CSV file with a header row based on the molecular submission template.",
            )
        ]

    fieldnames = [field.strip().lower() for field in csv_reader.fieldnames]
    for index, field in enumerate(csv_reader.fieldnames):
        csv_reader.fieldnames[index] = field.strip().lower()

    present_fields = set(fieldnames)
    findings.extend(_validate_header(present_fields, fieldnames))
    findings.extend(_validate_legacy_column_headers(present_fields, fieldnames))

    rule_field_names = {rule["field_name"] for rule in MIXS_VALIDATION_RULES}

    data_row_number = 1
    for row in csv_reader:
        data_row_number += 1
        row_number = data_row_number
        row_package = row.get("environmental package")

        for field_name in MIXS_ROW_ALWAYS_MANDATORY_FIELDS:
            if field_name in rule_field_names:
                continue
            finding = _validate_presence_field(
                field_name,
                row,
                row_number,
                present_fields,
                fieldnames,
            )
            if finding:
                findings.append(finding)

        if not _is_missing_value(row_package):
            findings.extend(_validate_environmental_package(row_package, row_number, fieldnames))

        if resolve_environmental_package(row_package):
            for field_name in MIXS_ROW_ENVIRONMENTAL_PACKAGE_MANDATORY_FIELDS:
                if field_name in rule_field_names:
                    continue
                finding = _validate_presence_field(
                    field_name,
                    row,
                    row_number,
                    present_fields,
                    fieldnames,
                )
                if finding:
                    findings.append(finding)

        for rule in MIXS_VALIDATION_RULES:
            if rule["rule_type"] == "format":
                findings.extend(
                    _validate_format_rule(rule, row, row_number, present_fields, fieldnames, row_package)
                )
            elif rule["rule_type"] == "presence":
                presence_rule = next(
                    presence_rule
                    for presence_rule in MIXS_PRESENCE_RULES
                    if presence_rule["field_name"] == rule["field_name"]
                )
                finding = _validate_presence_rule(
                    presence_rule,
                    rule["rule_number"],
                    row,
                    row_number,
                    present_fields,
                    fieldnames,
                    row_package,
                )
                if finding:
                    findings.append(finding)

    return findings

# -*- coding: utf-8 -*-
"""
Rule definitions for MIxS metadata validation.

Column presence and value requirements are derived from the molecular submission
template:
https://gitlab-pe.gwdg.de/gfbio/molecular-submission-templates/-/blob/master/Template-Description.md

Format validation patterns are taken from ENA checklist field definitions at
https://www.ebi.ac.uk/ena/browser/checklists

Validation logic (CSV parsing, finding generation) is implemented separately;
this module only defines the rules to apply.
"""
from __future__ import annotations

import re
from typing import Literal, TypedDict

from gfbio_submissions.brokerage.configuration.settings import CHECKLIST_ACCESSION_MAPPING


class MixsPresenceRule(TypedDict):
    field_name: str
    environmental_packages: list[str] | None
    description: str
    help_text: str


class MixsFormatRule(TypedDict):
    field_name: str
    pattern: str
    environmental_packages: list[str] | None
    unit: str | None
    description: str
    help_text: str


class MixsValidationRule(TypedDict):
    rule_number: int
    field_name: str
    rule_type: Literal["presence", "format"]
    pattern: str | None
    environmental_packages: list[str] | None
    unit: str | None
    description: str
    help_text: str


# Shared suffix for INSDC missing-value reporting terms (ENA / EBI checklists).
INSDC_MISSING_VALUE_PATTERN = (
    r"(^not applicable$)|(^not collected$)|(^not provided$)|(^restricted access$)|"
    r"(^missing: control sample$)|(^missing: sample group$)|(^missing: synthetic construct$)|"
    r"(^missing: lab stock$)|(^missing: third party data$)|"
    r"(^missing: data agreement established pre-2023$)|(^missing: endangered species$)|"
    r"(^missing: human-identifiable$)|(^missing$)"
)

EBI_UNSIGNED_NUMERIC_PATTERN = (
    r"((0|((0\.)|([1-9][0-9]*\.?))[0-9]*)([Ee][+-]?[0-9]+)?)"
)
EBI_SIGNED_NUMERIC_PATTERN = (
    r"([+-]?(0|((0\.)|([1-9][0-9]*\.?))[0-9]*)([Ee][+-]?[0-9]+)?)"
)
EBI_DECIMAL_DEGREES_PATTERN = r"(^[+-]?[0-9]+.?[0-9]{0,8}$)"
EBI_ISO8601_COLLECTION_DATE_PATTERN = (
    r"(^[12][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01])"
    r"(T[0-9]{2}:[0-9]{2}(:[0-9]{2})?Z?([+-][0-9]{1,2})?)?)?)?"
    r"(/[0-9]{4}(-[0-9]{2}(-[0-9]{2}(T[0-9]{2}:[0-9]{2}(:[0-9]{2})?Z?([+-][0-9]{1,2})?)?)?)?)?$)"
    f"|{INSDC_MISSING_VALUE_PATTERN}"
)


def _ebi_numeric_pattern(*, signed: bool = False) -> str:
    numeric_pattern = EBI_SIGNED_NUMERIC_PATTERN if signed else EBI_UNSIGNED_NUMERIC_PATTERN
    return f"{numeric_pattern}|({INSDC_MISSING_VALUE_PATTERN})"


def _ebi_decimal_degrees_pattern() -> str:
    return f"{EBI_DECIMAL_DEGREES_PATTERN}|{INSDC_MISSING_VALUE_PATTERN}"


# CSV column names that carry the depth field (legacy + current template).
MIXS_DEPTH_COLUMN_NAMES = (
    "depth",
    "geographic location (depth)",
)


# ---------------------------------------------------------------------------
# GFBIO template presence (header + row values)
# ---------------------------------------------------------------------------

# GFBIO template mandatory fields are kept mandatory even when ENA marks them optional
# (e.g. geographic location (region and locality)).
_MIXS_GEO_ENVO_AND_DATE_FIELDS = [
    "collection date",
    "geographic location (latitude)",
    "geographic location (longitude)",
    "geographic location (country and/or sea)",
    "broad-scale environmental context",
    "environmental medium",
    "local environmental context",
]

MIXS_HEADER_MANDATORY_FIELDS = [
    "investigation type",
    "environmental package",
    *_MIXS_GEO_ENVO_AND_DATE_FIELDS,
    "depth",
    "elevation",
    "geographic location (region and locality)",
]

MIXS_ENVIRONMENTAL_PACKAGE_HEADER_FIELDS = ["project name"]

MIXS_ROW_ALWAYS_MANDATORY_FIELDS = [
    "investigation type",
    "environmental package",
    *_MIXS_GEO_ENVO_AND_DATE_FIELDS,
    "geographic location (region and locality)",
]

MIXS_ROW_ENVIRONMENTAL_PACKAGE_MANDATORY_FIELDS = ["project name"]


# ---------------------------------------------------------------------------
# Environmental packages (CHECKLIST_ACCESSION_MAPPING + GSC synonyms)
# ---------------------------------------------------------------------------

MIXS_MICROBIAL_MAT_BIOLFILM_CHECKLIST_KEY = "microbial mat biolfilm"
MIXS_HOST_ASSOCIATED_CHECKLIST_KEY = "host associated"
MIXS_HUMAN_ASSOCIATED_CHECKLIST_KEY = "human associated"
MIXS_PLANT_ASSOCIATED_CHECKLIST_KEY = "plant associated"

# GSC MIxS extension names: https://genomicsstandardsconsortium.github.io/mixs/
MIXS_GSC_ENVIRONMENTAL_PACKAGE_SYNONYMS: dict[str, list[str]] = {
    MIXS_MICROBIAL_MAT_BIOLFILM_CHECKLIST_KEY: [
        "microbial mat biofilm",
        "microbial mat/biofilm",
    ],
    MIXS_HOST_ASSOCIATED_CHECKLIST_KEY: [
        "host-associated",
    ],
    MIXS_HUMAN_ASSOCIATED_CHECKLIST_KEY: [
        "human-associated",
    ],
    MIXS_PLANT_ASSOCIATED_CHECKLIST_KEY: [
        "plant-associated",
    ],
}


def _build_environmental_package_aliases() -> dict[str, str]:
    aliases: dict[str, str] = {}
    for checklist_key, synonyms in MIXS_GSC_ENVIRONMENTAL_PACKAGE_SYNONYMS.items():
        normalized_checklist_key = checklist_key.strip().lower()
        for synonym in synonyms:
            aliases[synonym.strip().lower()] = normalized_checklist_key
    return aliases


MIXS_ENVIRONMENTAL_PACKAGE_ALIASES = _build_environmental_package_aliases()

MIXS_ENVIRONMENTAL_PACKAGE_ACCESSIONS = {
    str(package_name).strip().lower(): accession
    for package_name, accession in CHECKLIST_ACCESSION_MAPPING.items()
}

ALL_MIXS_ENVIRONMENTAL_PACKAGES = list(MIXS_ENVIRONMENTAL_PACKAGE_ACCESSIONS.keys())


# ---------------------------------------------------------------------------
# Per-package mandatory fields (ENA checklist XML)
# ---------------------------------------------------------------------------

MIXS_COMMON_MANDATORY_FIELDS = [
    "project name",
    "collection date",
    "geographic location (latitude)",
    "geographic location (longitude)",
    "broad-scale environmental context",
    "local environmental context",
    "environmental medium",
    "geographic location (country and/or sea)",
]

# Package-specific mandatory fields on top of MIXS_COMMON_MANDATORY_FIELDS.
MIXS_PACKAGE_EXTRA_MANDATORY_FIELDS: dict[str, list[str]] = {
    "air": ["altitude"],
    "microbial mat biolfilm": ["elevation", "depth"],
    "sediment": ["elevation", "depth"],
    "soil": ["elevation", "depth"],
    "water": ["depth"],
    "built environment": [
        "indoor space",
        "filter type",
        "heating and cooling system type",
        "light type",
        "building setting",
        "building occupancy type",
        "space typical state",
        "typical occupant density",
        "occupancy at sampling",
        "occupant density at sampling",
        "ventilation type",
        "relative air humidity",
        "absolute air humidity",
    ],
}


def _build_mandatory_fields_by_package() -> dict[str, list[str]]:
    mandatory_fields_by_package: dict[str, list[str]] = {}
    for package in ALL_MIXS_ENVIRONMENTAL_PACKAGES:
        extra_fields = MIXS_PACKAGE_EXTRA_MANDATORY_FIELDS.get(package, [])
        mandatory_fields_by_package[package] = MIXS_COMMON_MANDATORY_FIELDS + extra_fields
    return mandatory_fields_by_package


def _build_package_mandatory_field_index(
    mandatory_fields_by_package: dict[str, list[str]],
) -> dict[str, list[str]]:
    package_mandatory_fields: dict[str, list[str]] = {}
    for package, field_names in mandatory_fields_by_package.items():
        for field_name in field_names:
            if field_name in MIXS_COMMON_MANDATORY_FIELDS:
                continue
            package_mandatory_fields.setdefault(field_name, []).append(package)
    return {
        field_name: sorted(packages)
        for field_name, packages in package_mandatory_fields.items()
    }


MIXS_MANDATORY_FIELDS_BY_PACKAGE = _build_mandatory_fields_by_package()
MIXS_PACKAGE_MANDATORY_FIELDS = _build_package_mandatory_field_index(
    MIXS_MANDATORY_FIELDS_BY_PACKAGE
)


MIXS_FIELD_HELP_TEXT = {
    "investigation type": (
        "Type of material sequenced. Allowed values include eukaryote, bacteria_archaea, "
        "plasmid, virus, organelle, metagenome, mimarks-survey, mimarks-specimen. "
        "For amplicon studies use 'mimarks-survey'."
    ),
    "environmental package": (
        "MIxS environmental package name, e.g. 'water', 'sediment', or 'soil'. "
        "ENA checklist keys use spaces (e.g. 'host associated'); GSC hyphenated forms "
        "such as 'host-associated', 'human-associated', 'plant-associated', "
        "'microbial mat biofilm', and 'microbial mat/biofilm' are also accepted. "
        "See https://genomicsstandardsconsortium.github.io/mixs/."
    ),
    "collection date": (
        "Time of sampling in ISO 8601 format, e.g. '2016-01-18' or "
        "'2016-01-18/2016-01-31' for an interval."
    ),
    "geographic location (latitude)": (
        "Latitude in decimal degrees (WGS84), e.g. '32.4567'. "
        "Maximum of 8 digits after the decimal point."
    ),
    "geographic location (longitude)": (
        "Longitude in decimal degrees (WGS84), e.g. '111.0034'. "
        "Maximum of 8 digits after the decimal point."
    ),
    "depth": (
        "Depth in meters (do not include the unit). Mandatory for the environmental "
        "packages water, soil, sediment, and microbial mat biolfilm. "
        "Millimeters (mm) are not accepted; provide the value in meters only."
    ),
    "elevation": (
        "Elevation in meters, e.g. for samples taken atop a mountain. "
        "Mandatory for the soil, sediment, and microbial mat biolfilm environmental packages."
    ),
    "altitude": (
        "Altitude in meters. Mandatory for the air environmental package."
    ),
    "geographic location (country and/or sea)": (
        "Country or sea where the sample was taken. Value must be from the "
        "INSDC country list: https://www.ncbi.nlm.nih.gov/genbank/collab/country/."
    ),
    "broad-scale environmental context": (
        "Major environmental system the sample came from, preferably as an EnvO term, "
        "e.g. 'forest biome [ENVO:01000174]'."
    ),
    "environmental medium": (
        "Environmental material immediately surrounding the sample, preferably as an "
        "EnvO term, e.g. 'sea water [ENVO:00002149]'."
    ),
    "local environmental context": (
        "Entities in the sample's local vicinity with significant causal influence, "
        "preferably as an EnvO term, e.g. 'microbial community [PCO:1000004]'."
    ),
    "project name": (
        "Short, concise project name. Mandatory for all MIxS environmental packages."
    ),
    "geographic location (region and locality)": (
        "Free-text description of the region and locality where the sample was taken."
    ),
}


# ---------------------------------------------------------------------------
# Validation rules (rules 1–10)
# ---------------------------------------------------------------------------

def _validation_rule(
    rule_number: int,
    field_name: str,
    rule_type: Literal["presence", "format"],
    *,
    pattern: str | None = None,
    environmental_packages: list[str] | None = None,
    unit: str | None = None,
    description: str,
) -> MixsValidationRule:
    return {
        "rule_number": rule_number,
        "field_name": field_name,
        "rule_type": rule_type,
        "pattern": pattern,
        "environmental_packages": environmental_packages,
        "unit": unit,
        "description": description,
        "help_text": MIXS_FIELD_HELP_TEXT[field_name],
    }


MIXS_VALIDATION_RULES: list[MixsValidationRule] = [
    _validation_rule(
        1, "depth", "format",
        pattern=_ebi_numeric_pattern(),
        environmental_packages=MIXS_PACKAGE_MANDATORY_FIELDS["depth"],
        unit="m",
        description=(
            "Depth is mandatory for the MIxS environmental packages water, soil, "
            "sediment, and microbial mat biolfilm."
        ),
    ),
    _validation_rule(
        2, "elevation", "format",
        pattern=_ebi_numeric_pattern(signed=True),
        environmental_packages=MIXS_PACKAGE_MANDATORY_FIELDS["elevation"],
        unit="m",
        description=(
            "Elevation is mandatory for the soil (ERC000022), sediment (ERC000021), "
            "and microbial mat biolfilm (ERC000019) environmental packages. "
            "The unit 'm' is added automatically during XML export to avoid "
            "manual curator modification."
        ),
    ),
    _validation_rule(
        3, "altitude", "format",
        pattern=_ebi_numeric_pattern(),
        environmental_packages=MIXS_PACKAGE_MANDATORY_FIELDS["altitude"],
        unit="m",
        description="Altitude is mandatory for the air environmental package.",
    ),
    _validation_rule(
        4, "geographic location (latitude)", "format",
        pattern=_ebi_decimal_degrees_pattern(),
        environmental_packages=None,
        unit="DD",
        description=(
            "Latitude is mandatory for MIxS submissions and must be given in "
            "decimal degrees (WGS84), e.g. '32.4567'."
        ),
    ),
    _validation_rule(
        5, "geographic location (longitude)", "format",
        pattern=_ebi_decimal_degrees_pattern(),
        environmental_packages=None,
        unit="DD",
        description=(
            "Longitude is mandatory for MIxS submissions and must be given in "
            "decimal degrees (WGS84), e.g. '111.0034'."
        ),
    ),
    _validation_rule(
        6, "environmental medium", "presence",
        environmental_packages=ALL_MIXS_ENVIRONMENTAL_PACKAGES,
        description=(
            "Environmental medium is mandatory for all MIxS environmental packages."
        ),
    ),
    _validation_rule(
        7, "local environmental context", "presence",
        environmental_packages=ALL_MIXS_ENVIRONMENTAL_PACKAGES,
        description=(
            "Local environmental context is mandatory for all MIxS environmental packages."
        ),
    ),
    _validation_rule(
        8, "broad-scale environmental context", "presence",
        environmental_packages=ALL_MIXS_ENVIRONMENTAL_PACKAGES,
        description=(
            "Broad-scale environmental context is mandatory for all MIxS environmental packages."
        ),
    ),
    _validation_rule(
        9, "collection date", "format",
        pattern=EBI_ISO8601_COLLECTION_DATE_PATTERN,
        environmental_packages=ALL_MIXS_ENVIRONMENTAL_PACKAGES,
        description=(
            "Collection date is mandatory for all MIxS environmental packages. "
            "When present, the value must be ISO 8601 (single date or interval), "
            "e.g. '2016-01-18' or '2016-01-18/2016-01-31'."
        ),
    ),
    _validation_rule(
        10, "project name", "presence",
        environmental_packages=ALL_MIXS_ENVIRONMENTAL_PACKAGES,
        description=(
            "Project name is mandatory for all MIxS environmental packages. "
            "Free-text format when present."
        ),
    ),
]


def _to_format_rule(rule: MixsValidationRule) -> MixsFormatRule:
    return {
        "field_name": rule["field_name"],
        "pattern": rule["pattern"],
        "environmental_packages": rule["environmental_packages"],
        "unit": rule["unit"],
        "description": rule["description"],
        "help_text": rule["help_text"],
    }


def _to_presence_rule(rule: MixsValidationRule) -> MixsPresenceRule:
    return {
        "field_name": rule["field_name"],
        "environmental_packages": rule["environmental_packages"],
        "description": rule["description"],
        "help_text": rule["help_text"],
    }


MIXS_FORMAT_RULES = [_to_format_rule(rule) for rule in MIXS_VALIDATION_RULES if rule["rule_type"] == "format"]
MIXS_PRESENCE_RULES = [_to_presence_rule(rule) for rule in MIXS_VALIDATION_RULES if rule["rule_type"] == "presence"]

_FORMAT_RULES_BY_FIELD = {rule["field_name"]: rule for rule in MIXS_FORMAT_RULES}
_PRESENCE_RULES_BY_FIELD = {rule["field_name"]: rule for rule in MIXS_PRESENCE_RULES}
_VALIDATION_RULES_BY_NUMBER = {rule["rule_number"]: rule for rule in MIXS_VALIDATION_RULES}


def normalize_environmental_package(value: str | None) -> str:
    """Normalize environmental package values for rule matching."""
    if value is None:
        return ""
    normalized = str(value).strip().lower()
    return MIXS_ENVIRONMENTAL_PACKAGE_ALIASES.get(normalized, normalized)


def resolve_environmental_package(value: str | None) -> str:
    """
    Return CHECKLIST_ACCESSION_MAPPING key for a submission value, or empty string.

    Accepts ENA checklist names and GSC MIxS synonym spellings defined in
    MIXS_GSC_ENVIRONMENTAL_PACKAGE_SYNONYMS.
    """
    normalized = normalize_environmental_package(value)
    if normalized in MIXS_ENVIRONMENTAL_PACKAGE_ACCESSIONS:
        return normalized
    return ""


def get_gsc_synonyms_for_package(checklist_key: str) -> list[str]:
    """Return accepted GSC MIxS synonym spellings for an ENA checklist key."""
    return list(
        MIXS_GSC_ENVIRONMENTAL_PACKAGE_SYNONYMS.get(
            normalize_environmental_package(checklist_key),
            [],
        )
    )


def is_supported_environmental_package(value: str | None) -> bool:
    """Return True when value matches a checklist key or an accepted GSC synonym."""
    return bool(resolve_environmental_package(value))


def get_checklist_accession(environmental_package: str | None) -> str | None:
    """Return ENA checklist accession for an environmental package value."""
    package = resolve_environmental_package(environmental_package)
    if not package:
        return None
    return MIXS_ENVIRONMENTAL_PACKAGE_ACCESSIONS.get(package)


def get_mandatory_fields_for_package(environmental_package: str | None) -> list[str]:
    """Return mandatory MIxS fields for a row's environmental package."""
    package = resolve_environmental_package(environmental_package)
    if not package:
        return []
    return list(MIXS_MANDATORY_FIELDS_BY_PACKAGE.get(package, []))


def environmental_package_matches(row_package: str | None, rule_packages: list[str]) -> bool:
    normalized_row_package = normalize_environmental_package(row_package)
    return normalized_row_package in {
        normalize_environmental_package(package) for package in rule_packages
    }


def get_format_rule(field_name: str) -> MixsFormatRule | None:
    return _FORMAT_RULES_BY_FIELD.get(field_name)


def get_presence_rule(field_name: str) -> MixsPresenceRule | None:
    return _PRESENCE_RULES_BY_FIELD.get(field_name)


def get_validation_rule(rule_number: int) -> MixsValidationRule | None:
    return _VALIDATION_RULES_BY_NUMBER.get(rule_number)


def compile_format_rule_pattern(rule: MixsFormatRule) -> re.Pattern[str]:
    return re.compile(rule["pattern"])


def format_rule_value_matches(rule: MixsFormatRule, value: str | None) -> bool:
    """Return True when the entire cell value matches a format rule pattern."""
    if value is None or not str(value).strip():
        return False
    return bool(compile_format_rule_pattern(rule).fullmatch(str(value).strip()))

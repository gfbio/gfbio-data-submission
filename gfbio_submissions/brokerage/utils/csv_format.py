# -*- coding: utf-8 -*-
"""Single source of truth for "how to read a CSV correctly".

Historically every call site re-derived this: sniff the encoding, sniff the
csv dialect, constrain the delimiter to a known set, and - on an unrecognised
dialect - silently fall back to ';'. That silent fallback hid genuinely broken
files. This module consolidates the concern behind one interface,
``detect_csv_format``, and surfaces an unrecognised dialect as an explicit
warning instead of guessing quietly.
"""
import csv
import logging

from django.utils.encoding import smart_str

from gfbio_submissions.brokerage.utils.encodings import sniff_encoding

logger = logging.getLogger(__name__)

# The delimiters our CSV templates actually use. csv.Sniffer happily reports a
# stray character (e.g. a decimal separator inside a number, or a colon in a
# free-text cell) as "the" delimiter; constraining to this set keeps detection
# honest for our domain.
KNOWN_DELIMITERS = [",", ";", "\t"]

# Used when the sniffed delimiter is not one we recognise. Kept for behavioural
# parity with the historic call sites, but now always accompanied by a warning.
DEFAULT_DELIMITER = ";"


class CsvFormat:
    """The detected format of a CSV file plus any warnings raised detecting it.

    Attributes:
        encoding: the detected text encoding (never None).
        delimiter: the field delimiter to use, constrained to KNOWN_DELIMITERS.
        dialect_recognised: True when the sniffed delimiter was a known one;
            False when we fell back to DEFAULT_DELIMITER.
        warnings: human-readable warnings (e.g. unrecognised dialect).
    """

    def __init__(self, encoding, delimiter, dialect_recognised, warnings=None):
        self.encoding = encoding
        self.delimiter = delimiter
        self.dialect_recognised = dialect_recognised
        self.warnings = warnings or []


def _detect_delimiter(sample):
    """Sniff a delimiter from ``sample``, constrained to KNOWN_DELIMITERS.

    Returns a ``(delimiter, recognised, warnings)`` tuple. ``recognised`` is
    False - with an explanatory warning - whenever the sniffed delimiter is not
    one we accept or sniffing fails, instead of silently defaulting to ';'.
    """
    try:
        sniffed = csv.Sniffer().sniff(smart_str(sample)).delimiter
    except csv.Error:
        return (
            DEFAULT_DELIMITER,
            False,
            [
                "Could not detect a CSV dialect; falling back to '{0}'.".format(DEFAULT_DELIMITER)
            ],
        )
    if sniffed in KNOWN_DELIMITERS:
        return sniffed, True, []
    return (
        DEFAULT_DELIMITER,
        False,
        [
            "Unrecognised CSV delimiter {0!r}; falling back to '{1}'.".format(sniffed, DEFAULT_DELIMITER)
        ],
    )


def detect_csv_format(path):
    """Detect the encoding and dialect needed to read the CSV at ``path``.

    Returns a :class:`CsvFormat`. Encoding is detected via the shared
    :func:`sniff_encoding`; the delimiter is sniffed from the first line and
    constrained to :data:`KNOWN_DELIMITERS`.
    """
    encoding = sniff_encoding(path)
    with open(path, "r", encoding=encoding) as csv_file:
        first_line = csv_file.readline()
    delimiter, recognised, warnings = _detect_delimiter(first_line)
    return CsvFormat(
        encoding=encoding,
        delimiter=delimiter,
        dialect_recognised=recognised,
        warnings=warnings,
    )


def open_csv_reader(csv_file, **reader_kwargs):
    """Build a ``csv.DictReader`` over an already-open ``csv_file``.

    The caller owns the file (and therefore its encoding); this consolidates
    the dialect-detection half: it sniffs the delimiter from the first line,
    constrains it to :data:`KNOWN_DELIMITERS`, rewinds the file and returns a
    configured reader together with the :class:`CsvFormat`. Any explicit
    ``delimiter`` in ``reader_kwargs`` overrides the sniffed one (and is then
    treated as recognised). Remaining ``reader_kwargs`` are passed straight to
    ``csv.DictReader`` so each call site can keep its own quoting/restkey
    configuration.
    """
    first_line = csv_file.readline()
    csv_file.seek(0)
    sniffed_delimiter, recognised, warnings = _detect_delimiter(first_line)
    delimiter = reader_kwargs.pop("delimiter", None)
    if delimiter is None:
        delimiter = sniffed_delimiter
    else:
        recognised = True
        warnings = []
    fmt = CsvFormat(
        encoding=getattr(csv_file, "encoding", None),
        delimiter=delimiter,
        dialect_recognised=recognised,
        warnings=warnings,
    )
    reader = csv.DictReader(csv_file, delimiter=delimiter, **reader_kwargs)
    return reader, fmt

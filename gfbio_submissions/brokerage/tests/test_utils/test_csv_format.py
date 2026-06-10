# -*- coding: utf-8 -*-
import os

from django.test import SimpleTestCase

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
from gfbio_submissions.brokerage.utils import csv_format


def _csv_path(name):
    return os.path.join(_get_test_data_dir_path(), "csv_files", name)


def _normalize_encoding_name(name):
    return name.replace("_", "").replace("-", "").lower()


class TestCsvFormatEncodingDetection(SimpleTestCase):
    def test_detects_windows1252_encoding(self):
        # Excel-on-Windows saves CSV as Windows-1252 without a BOM. The module
        # must detect it (not fall back to utf-8) so umlauts decode correctly.
        result = csv_format.detect_csv_format(_csv_path("GFBIO_submission_windows1252.csv"))
        self.assertNotIn(_normalize_encoding_name(result.encoding), {"utf8", "ascii"})


class TestCsvFormatDialectDetection(SimpleTestCase):
    def test_detects_comma_delimiter(self):
        result = csv_format.detect_csv_format(_csv_path("mol_5_items_comma_no_quoting_in_header.csv"))
        self.assertEqual(",", result.delimiter)
        self.assertTrue(result.dialect_recognised)

    def test_detects_semicolon_delimiter(self):
        result = csv_format.detect_csv_format(_csv_path("mol_5_items_semi_no_quoting.csv"))
        self.assertEqual(";", result.delimiter)
        self.assertTrue(result.dialect_recognised)

    def test_detects_tab_delimiter(self):
        result = csv_format.detect_csv_format(_csv_path("mol_5_items_tab.csv"))
        self.assertEqual("\t", result.delimiter)
        self.assertTrue(result.dialect_recognised)


class TestCsvFormatReader(SimpleTestCase):
    def test_open_csv_yields_reader_over_already_open_file(self):
        # The openers hand us an already-open file (encoding already decided).
        # open_csv_reader must sniff the dialect from it and return a DictReader
        # whose fieldnames reflect the real header, with the file rewound.
        path = _csv_path("mol_5_items_semi_no_quoting.csv")
        encoding = csv_format.sniff_encoding(path)
        with open(path, "r", encoding=encoding, newline="") as csv_file:
            reader, fmt = csv_format.open_csv_reader(csv_file)
            self.assertEqual(";", fmt.delimiter)
            rows = list(reader)
        self.assertIn("sample_title", reader.fieldnames)
        self.assertEqual(5, len([r for r in rows if r.get("sample_title")]))


class TestCsvFormatDecimalHandling(SimpleTestCase):
    def test_decimal_separator_is_not_mistaken_for_a_delimiter(self):
        # A single-column file whose values are European decimals (0,5) tempts
        # csv.Sniffer into reporting a stray character as the delimiter. The
        # module must not treat the decimal separator as structure: it accepts
        # only KNOWN_DELIMITERS and surfaces the mismatch instead of splitting
        # the data on a non-delimiter.
        result = csv_format.detect_csv_format(_csv_path("single_column_decimal_comma.csv"))
        self.assertIn(result.delimiter, csv_format.KNOWN_DELIMITERS)
        self.assertFalse(result.dialect_recognised)
        self.assertTrue(result.warnings)


class TestCsvFormatUnrecognisedDialect(SimpleTestCase):
    def test_unrecognised_delimiter_surfaces_warning_not_silent_default(self):
        # A pipe-delimited file is sniffed as '|', which is not a delimiter we
        # accept. The historic behaviour silently rewrote this to ';'; the new
        # contract is to flag it explicitly so callers can react.
        result = csv_format.detect_csv_format(_csv_path("unrecognised_pipe_delimited.csv"))
        self.assertFalse(result.dialect_recognised)
        self.assertTrue(result.warnings)
        self.assertEqual(csv_format.DEFAULT_DELIMITER, result.delimiter)

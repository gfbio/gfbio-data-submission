from django.test import TestCase

from gfbio_submissions.brokerage.utils.new_ena_atax_utils import (
    query_ena,
    query_ena_for_scientific_name,
    query_ena_for_taxid,
)


class TestEnaAtaxUtils(TestCase):
    # test querying ena for taxid with valid taxid
    def test_query_ena_for_taxid_valid_taxid(self):
        taxid = "59456"
        result = query_ena_for_taxid(taxid)

        self.assertIsNotNone(result)
        self.assertEqual(result["taxId"], taxid)
        self.assertEqual(result["submittable"], "true")

    # test querying ena for taxid with invalid taxid
    def test_query_ena_for_taxid_invalid_taxid(self):
        taxid = "123456789"
        result = query_ena_for_taxid(taxid)

        self.assertIsNone(result)

    # test querying ena for scientific name with valid scientific name
    def test_query_ena_for_scientific_name_valid_name(self):
        scientific_name = "Leptonycteris nivalis"
        result = query_ena_for_scientific_name(scientific_name)

        self.assertIsNotNone(result)
        self.assertEqual(result["scientificName"], scientific_name)
        self.assertEqual(result["submittable"], "true")

    # test querying ena for scientific name with invalid scientific name
    def test_query_ena_for_scientific_name_invalid_name(self):
        scientific_name = "Invalid scientific name"
        result = query_ena_for_scientific_name(scientific_name)

        self.assertIsNone(result)

    # test query ena function with submission target ena
    def test_query_ena_submission_target_ena(self):
        taxid = "59456"
        result = query_ena(taxid, "ena")

        self.assertIsNotNone(result)
        self.assertEqual(result["taxId"], taxid)
        self.assertEqual(result["submittable"], "true")

    # test query ena function with submission target atx
    def test_query_ena_submission_target_atax(self):
        scientific_name = "Leptonycteris nivalis"
        result = query_ena(scientific_name, "atax")

        self.assertIsNotNone(result)
        self.assertEqual(result["scientificName"], scientific_name)
        self.assertEqual(result["submittable"], "true")

    # test query ena function with invalid submission target
    def test_query_ena_invalid_submission_target(self):
        data = "59456"
        result = query_ena(data, "invalid")

        self.assertIsNone(result)

from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ATAX, ENA
from gfbio_submissions.brokerage.utils.ena_submittable_data_handlers import (
    SubmittableTaxIdHandler, SubmittableScientificNameHandler
)


class TestEnaAtaxUtils(TestCase):
    # test querying ena for taxid with valid taxid
    def test_query_ena_for_taxid_valid_taxid(self):
        taxid = "59456"
        result = SubmittableTaxIdHandler(None).query_ena(taxid)

        self.assertTrue(result)

    # test querying ena for taxid with invalid taxid
    def test_query_ena_for_taxid_invalid_taxid(self):
        taxid = "123456789"
        result = SubmittableTaxIdHandler(None).query_ena(taxid)

        self.assertFalse(result)

    # test querying ena for scientific name with valid scientific name
    def test_query_ena_for_scientific_name_valid_name(self):
        scientific_name = "Leptonycteris nivalis"
        result = SubmittableScientificNameHandler(None).query_ena(scientific_name)

        self.assertTrue(result)

    # test querying ena for scientific name with invalid scientific name
    def test_query_ena_for_scientific_name_invalid_name(self):
        scientific_name = "Invalid scientific name"
        result = SubmittableScientificNameHandler(None).query_ena(scientific_name)

        self.assertFalse(result)

    # test query ena function with submission target ena
    def test_query_ena_submission_target_ena(self):
        taxid = "59456"
        result = SubmittableTaxIdHandler(None).query_ena(taxid)

        self.assertTrue(result)

    # test query ena function with submission target atx
    def test_query_ena_submission_target_atax(self):
        scientific_name = "Leptonycteris nivalis"
        result = SubmittableScientificNameHandler(None).query_ena(scientific_name)

        self.assertTrue(result)


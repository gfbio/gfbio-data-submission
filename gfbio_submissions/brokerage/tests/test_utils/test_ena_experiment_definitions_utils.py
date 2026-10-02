
from django.test import TestCase

from gfbio_submissions.brokerage.utils.ena_experiment_definitions_utils import find_correct_platform_and_model

class TestEnaExperimentDefinitionsUtils(TestCase):
    def test_find_correct_platform_and_model(self):
        self.assertEqual(
            "illumina NextSeq 500",
            find_correct_platform_and_model("Illumina Nextseq 500"),
        )
        self.assertEqual("illumina unspecified", find_correct_platform_and_model("Illumina"))
        self.assertEqual("illumina Illumina MiSeq", find_correct_platform_and_model("Illumina MiSeq"))
        self.assertEqual("oxford_nanopore MinION", find_correct_platform_and_model("MinION"))
        self.assertEqual("pacbio_smrt Sequel", find_correct_platform_and_model("Sequel"))
        self.assertEqual("pacbio_smrt Sequel", find_correct_platform_and_model("pacbio Sequel"))
        self.assertEqual("pacbio_smrt unspecified", find_correct_platform_and_model("PacBio"))
        self.assertEqual(
            "oxford_nanopore unspecified",
            find_correct_platform_and_model("Oxford Nanopore"),
        )
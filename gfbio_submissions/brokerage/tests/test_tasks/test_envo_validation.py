import io

from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.envo_csv_validator import EnvoCsvValidator
from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.ontology_requester import OntologyRequester
from gfbio_submissions.brokerage.tests.test_tasks.test_tasks_base import TestTasks

from dt_upload.models import FileUploadRequest


FOREST_BIOME = {
    "prefLabel": "forest biome",
    "names": ["forest biome"],
    "id": "ENVO:01000174",
    "iri": "http://purl.obolibrary.org/obo/ENVO_01000174"
}

PLANT_MATTER = {
    "prefLabel": "plant matter",
    "names": ["plant matter"],
    "id": "ENVO:01001121",
    "iri": "http://purl.obolibrary.org/obo/ENVO_01001121"
}

ALGAL_MATERIAL = {
    "prefLabel": "algal material",
    "names": ["algal material"],
    "id": "ENVO:01001189",
    "iri": "http://purl.obolibrary.org/obo/ENVO_01001189"
}

MICROBIAL_COMMUNITY = {
    "prefLabel": "microbial community",
    "names": ["microbial community"],
    "id": "PCO:1000004",
    "iri": "http://purl.obolibrary.org/obo/PCO_1000004"
}

default_mock_mapping = {"forest biome": [FOREST_BIOME], "plant matter": [PLANT_MATTER], "microbial community": [MICROBIAL_COMMUNITY]}


HEADER = "sample_title;taxon_id;sample_description;broad-scale environmental context;environmental medium;local environmental context\n"


class MockRequester(OntologyRequester):
    def __init__(self, mapping):
        self.mapping = mapping

    def request_ontology_entries(self, name, ontology=None, root=None):
        if name in self.mapping:
            return self.mapping[name]
        raise Exception(f"Unexpected: {name}")


class MockRequesterExtended(MockRequester):
    def request_ontology_entries(self, name, ontology=None, root=None):
        key = f"{name}_{ontology}_{root}"
        if key in self.mapping:
            return self.mapping[key]
        raise Exception(f"Unexpected: {key}")
    

class TestEnvoValidation(TestTasks):
    def _create_task_report(self):
        submission = Submission.objects.first()
        # status must not be "COMPLETED": FileUploadRequest.save() then accesses
        # a related MultiPartUpload that this unit test does not create. The
        # status is irrelevant here because the file read is mocked.
        file_upload = FileUploadRequest.objects.create(
            original_filename="meta.csv",
            file_key="meta.csv-key",
            file_type="csv",
            status="PENDING",
            user=submission.user,
        )
        cloud_upload = SubmissionCloudUpload.objects.create(
            submission=submission,
            meta_data=True,
            file_upload=file_upload,
        )
        report = MetadataValidationReport.objects.create(
            submission=submission,
            upload_file=cloud_upload,
            file_md5_checksum="checksum",
        )
        return report.validationtaskreport_set.create(task_name="Test-Report")

    def _create_content(self, content):
        return io.StringIO(content)
    
    def _assert_single_error(self, task_report, expected_message, expected_row, expected_column, expected_column_name):
        self.assertEqual(1, task_report.validationfinding_set.count())
        self.assertEqual("ERROR", task_report.status)
        self.assertEqual(expected_message, task_report.validationfinding_set.all()[0].message)
        self.assertEqual(expected_column, task_report.validationfinding_set.all()[0].column)
        self.assertEqual(expected_row, task_report.validationfinding_set.all()[0].row)
        self.assertEqual(expected_column_name, task_report.validationfinding_set.all()[0].column_name)
        self.assertEqual("ERROR", task_report.validationfinding_set.all()[0].status)


    def test_envo_validation_successfull(self):
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];plant matter [ENVO:01001121];microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(default_mock_mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self.assertEqual("SUCCESS", task_report.status)
        self.assertEqual(0, task_report.validationfinding_set.count())


    def test_envo_validation_successfull_multi_value(self):
        mapping = {"forest biome": [FOREST_BIOME], "plant matter": [PLANT_MATTER], "algal material": [ALGAL_MATERIAL], "microbial community": [MICROBIAL_COMMUNITY]}
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];algal material[ENVO:01001189]|plant matter [ENVO:01001121];microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self.assertEqual("SUCCESS", task_report.status)
        self.assertEqual(0, task_report.validationfinding_set.count())


    def test_envo_validation_missing_col(self):
        task_report = self._create_task_report()
        content = self._create_content(HEADER.replace("environmental medium", "environment medium") + "The sample1;123;Belly Button;forest biome [ENVO:01000174];plant matter [ENVO:01001121];microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(default_mock_mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "Column 'environmental medium' is missing.", 1, None, "environmental medium")


    def test_envo_validation_missing_value(self):
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];;microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(default_mock_mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "Value for column 'environmental medium' is missing.", 2, 5, "environmental medium")


    def test_envo_validation_missing_value_multi_format(self):
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];||;microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(default_mock_mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "Value for column 'environmental medium' is missing.", 2, 5, "environmental medium")


    def test_envo_validation_unknown_value_env_medium(self):
        mapping = {"forest biome": [FOREST_BIOME], "coffee": [], "microbial community": [MICROBIAL_COMMUNITY]}
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];coffee;microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "Can't find matching term for 'coffee'. Please ensure the term is a decendant of enviromental material [ENVO:00010483].", 2, 5, "environmental medium")


    def test_envo_validation_unknown_value_broad_scale_ctx(self):
        mapping = {"coffee": [], "plant matter": [PLANT_MATTER], "microbial community": [MICROBIAL_COMMUNITY]}
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;coffee;plant matter [ENVO:01001121];microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "Can't find matching term for 'coffee'. Please ensure the term is a decendant of biome [ENVO:00000428].", 2, 4, "broad-scale environmental context")


    def test_envo_validation_unknown_value_local(self):
        mapping = {"forest biome": [FOREST_BIOME], "coffee": [], "plant matter": [PLANT_MATTER],}
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];plant matter [ENVO:01001121];coffee\n")
        mock_requester = MockRequester(mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "Can't find matching term for 'coffee'.", 2, 6, "local environmental context")


    def test_envo_validation_bad_format(self):
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];coffee(I think, but not sure);microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(default_mock_mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "'coffee(I think, but not sure)' seems to be in an invalid format or it contains invalid characters.", 2, 5, "environmental medium")


    def test_envo_validation_bad_id(self):
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];plant matter [ENVO:6];microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(default_mock_mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "The provided id 'ENVO:6' does not match the ENVO-id 'ENVO:01001121' we found for 'plant matter'.", 2, 5, "environmental medium")


    def test_envo_validation_multiple_but_unambiguous(self):
        mapping = {
            "forest biome": [FOREST_BIOME],
            "microbial community": [MICROBIAL_COMMUNITY], 
            "plant matter": [
                PLANT_MATTER,
                {
                    "prefLabel": "plant matter 2",
                    "names": ["plant matter 2"],
                    "id": "ENVO:01001123",
                    "iri": "http://purl.obolibrary.org/obo/ENVO_01001123"
                }
            ]
        }
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];plant matter [ENVO:01001121];microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self.assertEqual("SUCCESS", task_report.status)
        self.assertEqual(0, task_report.validationfinding_set.count())


    def test_envo_validation_multiple_but_ambiguous(self):
        mapping = {
            "forest biome": [FOREST_BIOME],
            "plant matter": [PLANT_MATTER],
            "ambigious term": [
                {
                    "prefLabel": "ambigious term",
                    "names": ["ambigious term"],
                    "id": "ENVO:1234",
                    "iri": "http://purl.obolibrary.org/obo/ENVO_1234"
                },
                {
                    "prefLabel": "ambigious term",
                    "names": ["ambigious term"],
                    "id": "pco:1234",
                    "iri": "http://purl.obolibrary.org/obo/pco_1234"
                }
            ]
        }
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];plant matter;ambigious term\n")
        mock_requester = MockRequester(mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "There are mulitple possible matches for 'ambigious term'. E.g. 'ambigious term [ENVO:1234]', 'ambigious term [pco:1234]'...", 2, 6, "local environmental context")


    def test_envo_validation_no_exact_match(self):
        mapping = {
            "forest biome": [FOREST_BIOME],
            "plant matte": [PLANT_MATTER],
            "microbial community": [MICROBIAL_COMMUNITY], 
        }
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];plant matte;microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "There is no exact match for 'plant matte', but mulitple possible matches, e.g. 'plant matter [ENVO:01001121]'...", 2, 5, "environmental medium")


    def test_envo_validation_ontology_missmatch(self):
        task_report = self._create_task_report()
        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [pco:01000174];plant matter [ENVO:01001121];microbial community [PCO:1000004]\n")
        mock_requester = MockRequester(default_mock_mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self._assert_single_error(task_report, "The id pco:01000174 of forest biome does not match the required Ontology ENVO.", 2, 4, "broad-scale environmental context")


    def test_envo_validation_not_in_hierachy_warning(self):
        task_report = self._create_task_report()

        mapping = {
            "forest biome_ENVO_http://purl.obolibrary.org/obo/ENVO_00000428": [FOREST_BIOME],
            "glaciation_ENVO_http://purl.obolibrary.org/obo/ENVO_00010483": [],
            "glaciation_ENVO_None": [
                {
                    "prefLabel": "glaciation",
                    "names": ["glaciation"],
                    "id": "ENVO:01001641",
                    "iri": "http://purl.obolibrary.org/obo/ENVO_01001641"
                }
            ],
            "microbial community_PCO_None": [MICROBIAL_COMMUNITY]
        }
        

        content = self._create_content(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];glaciation [ENVO:01001641];microbial community [PCO:1000004]\n")
        mock_requester = MockRequesterExtended(mapping)

        validator = EnvoCsvValidator(mock_requester, task_report)
        validator.validate(content)

        self.assertEqual(1, task_report.validationfinding_set.count())
        self.assertEqual("WARNING", task_report.status)
        self.assertEqual("'glaciation' is not a decendant of enviromental material [ENVO:00010483], which we dicourage.", task_report.validationfinding_set.all()[0].message)
        self.assertEqual(5, task_report.validationfinding_set.all()[0].column)
        self.assertEqual(2, task_report.validationfinding_set.all()[0].row)
        self.assertEqual("environmental medium", task_report.validationfinding_set.all()[0].column_name)
        self.assertEqual("WARNING", task_report.validationfinding_set.all()[0].status)

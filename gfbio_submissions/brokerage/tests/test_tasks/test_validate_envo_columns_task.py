# -*- coding: utf-8 -*-

import io
from unittest.mock import patch

from dt_upload.models import FileUploadRequest
from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.ontology_requester import OntologyRequester

from ...models.metadata_validation_report import MetadataValidationReport
from ...models.submission import Submission
from ...models.submission_cloud_upload import SubmissionCloudUpload
from ...tasks.metadata_tasks.validate_envo_columns_task import validate_envo_columns_task
from .test_tasks_base import TestTasks

HEADER = "sample_title;taxon_id;sample_description;broad-scale environmental context;environmental medium;local environmental context\n"

_OPENER_PATH = (
    "gfbio_submissions.brokerage.tasks.metadata_tasks."
    "validate_envo_columns_task.create_submission_file_opener"
)

_ONTOLOGY_REQUESTER = (
    "gfbio_submissions.brokerage.tasks.metadata_tasks."
    "validate_envo_columns_task.get_ontology_requester"
)

class _FakeOpener:
    def __init__(self, content):
        self._content = content

    def csv_reader(self, cloud_upload):
        return io.StringIO(self._content)


class MockRequester(OntologyRequester):
    def request_ontology_entries(self, name, ontology=None, root=None):
        if name == "forest biome":
            return [
                {
                    "prefLabel": "forest biome",
                    "names": ["forest biome"],
                    "id": "ENVO:01000174",
                    "iri": "http://purl.obolibrary.org/obo/ENVO_01000174"
                }
            ]
        elif name == "plant matter with typo":
            return []
        elif name == "plant matter":
            return [
                {
                    "prefLabel": "plant matter",
                    "names": ["plant matter"],
                    "id": "ENVO:01001121",
                    "iri": "http://purl.obolibrary.org/obo/ENVO_01001121"
                }
            ]
        elif name == "microbial community":
            return [
                {
                    "prefLabel": "microbial community",
                    "names": ["microbial community"],
                    "id": "PCO:1000004",
                    "iri": "http://purl.obolibrary.org/obo/PCO_1000004"
                }
            ]
        raise Exception(f"Unexpected: {name}")


class TestValidateEnvoColumnsTask(TestTasks):
    def _create_report(self):
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
        return MetadataValidationReport.objects.create(
            submission=submission,
            upload_file=cloud_upload,
            file_md5_checksum="checksum",
        )

    @staticmethod
    def _run(report):
        return validate_envo_columns_task.apply(
            kwargs={"report_id": report.id}
        ).get()

    @patch(_OPENER_PATH)
    @patch(_ONTOLOGY_REQUESTER)
    def test_envo_validation_successfull(self, mock_requester, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];plant matter [ENVO:01001121];microbial community [PCO:1000004]\n")
        mock_requester.return_value = MockRequester()

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("SUCCESS", task_report.status)
        self.assertEqual(0, task_report.validationfinding_set.count())


    @patch(_OPENER_PATH)
    @patch(_ONTOLOGY_REQUESTER)
    def test_envo_validation_with_error(self, mock_requester, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "The sample1;123;Belly Button;forest biome [ENVO:01000174];plant matter with typo [ENVO:01001121];microbial community [PCO:1000004]\n")
        mock_requester.return_value = MockRequester()

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual("ERROR", task_report.status)
        self.assertEqual(1, task_report.validationfinding_set.count())
        self.assertEqual("Can't find matching term for 'plant matter with typo'. Please ensure the term is a decendant of enviromental material [ENVO:00010483].", task_report.validationfinding_set.all()[0].message)

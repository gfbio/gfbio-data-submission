# -*- coding: utf-8 -*-

import io
from unittest.mock import patch

import celery
from requests import RequestException

from dt_upload.models import FileUploadRequest

from ...models.metadata_validation_report import MetadataValidationReport
from ...models.submission import Submission
from ...models.submission_cloud_upload import SubmissionCloudUpload
from ...tasks.metadata_tasks.check_ena_mandatory_fields_task import check_ena_mandatory_fields_task
from .test_tasks_base import TestTasks

HEADER = "sample_title;taxon_id;sample_description;sequencing_platform;library_strategy;library_source;library_selection;library_layout;nominal_length;forward_read_file_name;forward_read_file_checksum;reverse_read_file_name;reverse_read_file_checksum;checksum_method\n"

_OPENER_PATH = (
    "gfbio_submissions.brokerage.tasks.metadata_tasks."
    "check_ena_mandatory_fields_task.create_submission_file_opener"
)

class _FakeOpener:
    def __init__(self, content):
        self._content = content

    def csv_reader(self, cloud_upload):
        return io.StringIO(self._content)
    
    def is_csv(self, cloud_upload):
        return True

class TestValidateEnaColumnsTask(TestTasks):
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
        return check_ena_mandatory_fields_task.apply(
            kwargs={"report_id": report.id}
        ).get()

    @patch(_OPENER_PATH)
    def test_ena_check_successfull_max_columns(self, mock_opener):
        report = self._create_report()
        HEADER = "sample_title;taxon_id;sample_description;sequencing_platform;library_strategy;library_source;library_selection;library_layout;nominal_length;forward_read_file_name;forward_read_file_checksum;reverse_read_file_name;reverse_read_file_checksum;checksum_method;investigation type;environmental package;collection date;geographic location (latitude);geographic location (longitude);depth;geographic location (elevation);geographic location (country and/or sea);broad-scale environmental context;environmental medium;local environmental context;project name;geographic location (region and locality)\n"
        mock_opener.return_value = _FakeOpener(HEADER + "some_sample_321;3326;tree genetic sample;Illumina NovaSeq 6000;WGS;GENOMIC;Restriction Digest;PAIRED;12345;file2_F.fastq.gz;asdf;file2_R.fastq.gz;fdsa;MD5;eukaryote;plant associated;2022-07-24;68.052378;-133.496134;;;Canada;forest biome [ENVO:01000174];plant matter [ENVO:01001121];plant-associated environment [ENVO:01001001];GBS Picea North America;Northwest Territories\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual(0, task_report.validationfinding_set.count())
        self.assertEqual("SUCCESS", task_report.status)

    @patch(_OPENER_PATH)
    def test_ena_check_successfull(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "some_sample_321;3326;tree genetic sample;Illumina NovaSeq 6000;WGS;GENOMIC;Restriction Digest;PAIRED;12345;file2_F.fastq.gz;asdf;file2_R.fastq.gz;fdsa;MD5\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual(0, task_report.validationfinding_set.count())
        self.assertEqual("SUCCESS", task_report.status)

    @patch(_OPENER_PATH)
    def test_ena_check_wrong_library_source(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "some_sample_321;3326;tree genetic sample;Illumina NovaSeq 6000;WGS;GENOMICS;Restriction Digest;PAIRED;12345;file2_F.fastq.gz;asdf;file2_R.fastq.gz;fdsa;MD5;eukaryote;plant associated;2022-07-24;68.052378;-133.496134;;;Canada;forest biome [ENVO:01000174];plant matter [ENVO:01001121];plant-associated environment [ENVO:01001001];GBS Picea North America;Northwest Territories\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual(1, task_report.validationfinding_set.count())
        self.assertEqual("Invalid value for field 'library_source': GENOMICS.", task_report.validationfinding_set.all()[0].message)
        self.assertEqual("ERROR", task_report.validationfinding_set.all()[0].status)
        self.assertEqual("ERROR", task_report.status)

    @patch(_OPENER_PATH)
    def test_ena_check_missing_library_strategy(self, mock_opener):
        report = self._create_report()
        mock_opener.return_value = _FakeOpener(HEADER + "some_sample_321;3326;tree genetic sample;Illumina NovaSeq 6000;;GENOMIC;Restriction Digest;PAIRED;12345;file2_F.fastq.gz;asdf;file2_R.fastq.gz;fdsa;MD5;eukaryote;plant associated;2022-07-24;68.052378;-133.496134;;;Canada;forest biome [ENVO:01000174];plant matter [ENVO:01001121];plant-associated environment [ENVO:01001001];GBS Picea North America;Northwest Territories\n")

        self._run(report)

        task_report = report.validationtaskreport_set.get()
        self.assertEqual(1, task_report.validationfinding_set.count())
        self.assertEqual("Required field 'library_strategy' is empty.", task_report.validationfinding_set.all()[0].message)
        self.assertEqual("ERROR", task_report.validationfinding_set.all()[0].status)
        self.assertEqual("ERROR", task_report.status)


# -*- coding: utf-8 -*-

from unittest.mock import MagicMock, patch

from django.test import Client, TestCase
from django.urls import reverse
from dt_upload.models import FileUploadRequest, MultiPartUpload

from gfbio_submissions.brokerage.tests.utils import _create_submission_via_serializer
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.views.submission_cloud_upload_download_view import (
    _is_cloud_upload_downloadable,
    _non_downloadable_cloud_uploads,
    _pick_newest_cloud_upload_per_original_filename,
)


class TestSubmissionCloudUploadDownloadability(TestCase):
    def _create_cloud_upload(self, submission, filename, fur_status="COMPLETED", scu_status=SubmissionCloudUpload.STATUS_UPLOADED):
        file_upload = FileUploadRequest.objects.create(
            original_filename=filename,
            file_key=f"{filename}-key",
            file_type="application/octet-stream",
            user=submission.user,
        )
        MultiPartUpload.objects.create(file_upload_request=file_upload)
        file_upload.status = fur_status
        file_upload.save()
        return SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=file_upload,
            status=scu_status,
        )

    def test_is_cloud_upload_downloadable_uses_completed_file_upload(self):
        submission = _create_submission_via_serializer()

        completed = self._create_cloud_upload(submission, "completed.fastq.gz")
        self.assertTrue(_is_cloud_upload_downloadable(completed))

        pending = self._create_cloud_upload(
            submission,
            "pending.fastq.gz",
            fur_status="PENDING",
            scu_status=SubmissionCloudUpload.STATUS_NEW,
        )
        self.assertFalse(_is_cloud_upload_downloadable(pending))

        bad_checksum = self._create_cloud_upload(
            submission,
            "bad-checksum.fastq.gz",
            scu_status=SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM,
        )
        self.assertTrue(_is_cloud_upload_downloadable(bad_checksum))


class TestPickNewestCloudUploadPerOriginalFilename(TestCase):
    def _create_cloud_upload(self, submission, filename, file_key_suffix, fur_status="COMPLETED"):
        file_upload = FileUploadRequest.objects.create(
            original_filename=filename,
            file_key=f"{filename}-{file_key_suffix}",
            file_type="application/octet-stream",
            user=submission.user,
        )
        MultiPartUpload.objects.create(file_upload_request=file_upload)
        file_upload.status = fur_status
        file_upload.save()
        return SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=file_upload,
            status=SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM,
        )

    def _backdate_file_upload_modified(self, cloud_upload, year=2020):
        FileUploadRequest.objects.filter(pk=cloud_upload.file_upload_id).update(
            modified=cloud_upload.file_upload.modified.replace(year=year)
        )
        cloud_upload.file_upload.refresh_from_db()

    def test_keeps_newest_upload_for_duplicate_original_filename(self):
        submission = _create_submission_via_serializer()
        older = self._create_cloud_upload(submission, "sample.fastq.gz", "older")
        newer = self._create_cloud_upload(submission, "sample.fastq.gz", "newer")
        self._backdate_file_upload_modified(older)
        newer.refresh_from_db()
        older.refresh_from_db()

        deduped = _pick_newest_cloud_upload_per_original_filename([older, newer])

        self.assertEqual(1, len(deduped))
        self.assertEqual(newer.pk, deduped[0].pk)

    def test_admin_file_replace_makes_older_row_the_newest(self):
        submission = _create_submission_via_serializer()
        older = self._create_cloud_upload(submission, "sample.fastq.gz", "older")
        newer = self._create_cloud_upload(submission, "sample.fastq.gz", "newer")
        FileUploadRequest.objects.filter(pk=older.file_upload_id).update(
            modified=newer.file_upload.modified.replace(year=2099)
        )
        older.file_upload.refresh_from_db()
        newer.refresh_from_db()
        older.refresh_from_db()

        deduped = _pick_newest_cloud_upload_per_original_filename([older, newer])

        self.assertEqual(1, len(deduped))
        self.assertEqual(older.pk, deduped[0].pk)

    def test_older_incomplete_duplicate_does_not_block_newest_complete_file(self):
        submission = _create_submission_via_serializer()
        older = self._create_cloud_upload(
            submission,
            "sample.fastq.gz",
            "older",
            fur_status="PENDING",
        )
        older.status = SubmissionCloudUpload.STATUS_NEW
        older.save()
        newer = self._create_cloud_upload(submission, "sample.fastq.gz", "newer")
        self._backdate_file_upload_modified(older)
        newer.refresh_from_db()
        older.refresh_from_db()

        deduped = _pick_newest_cloud_upload_per_original_filename([older, newer])

        self.assertEqual(1, len(deduped))
        self.assertEqual(newer.pk, deduped[0].pk)
        self.assertEqual([], _non_downloadable_cloud_uploads(deduped))


class TestSubmissionCloudUploadDownloadView(TestCase):
    def setUp(self):
        self.client = Client()
        self.submission = _create_submission_via_serializer()

    def _create_cloud_upload(
        self,
        filename,
        fur_status="COMPLETED",
        scu_status=SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM,
        file_key_suffix=None,
    ):
        file_upload = FileUploadRequest.objects.create(
            original_filename=filename,
            file_key=f"{filename}-{file_key_suffix or filename}",
            file_type="application/octet-stream",
            user=self.submission.user,
        )
        MultiPartUpload.objects.create(file_upload_request=file_upload)
        file_upload.status = fur_status
        file_upload.save()
        return SubmissionCloudUpload.objects.create(
            submission=self.submission,
            attach_to_ticket=False,
            meta_data=False,
            file_upload=file_upload,
            status=scu_status,
        )

    @patch(
        "gfbio_submissions.brokerage.views.submission_cloud_upload_download_view.stream_file_upload",
        return_value=iter([b"file-content"]),
    )
    def test_single_file_download_allows_completed_file_upload(self, _mock_stream):
        cloud_upload = self._create_cloud_upload("uploaded.fastq.gz")
        url = reverse(
            "brokerage:submissions_cloud_file_download",
            kwargs={
                "broker_submission_id": self.submission.broker_submission_id,
                "file_id": cloud_upload.pk,
            },
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Disposition"], "attachment; filename=uploaded.fastq.gz")

    def test_single_file_download_rejects_incomplete_file_upload(self):
        cloud_upload = self._create_cloud_upload(
            "pending.fastq.gz",
            fur_status="PENDING",
            scu_status=SubmissionCloudUpload.STATUS_NEW,
        )
        url = reverse(
            "brokerage:submissions_cloud_file_download",
            kwargs={
                "broker_submission_id": self.submission.broker_submission_id,
                "file_id": cloud_upload.pk,
            },
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 409)
        self.assertIn("not completely uploaded", response.content.decode())

    def test_zip_download_rejects_when_any_active_file_is_not_completed(self):
        self._create_cloud_upload("uploaded.fastq.gz")
        self._create_cloud_upload(
            "pending.fastq.gz",
            fur_status="PENDING",
            scu_status=SubmissionCloudUpload.STATUS_NEW,
        )
        url = reverse(
            "brokerage:submissions_cloud_zip_download",
            kwargs={"broker_submission_id": self.submission.broker_submission_id},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 409)
        self.assertIn("pending.fastq.gz", response.content.decode())

    @patch("gfbio_submissions.brokerage.views.submission_cloud_upload_download_view.ZipStream")
    @patch("gfbio_submissions.brokerage.views.submission_cloud_upload_download_view.build_zip_file_entries")
    def test_zip_download_excludes_deleted_files(self, mock_build_zip_file_entries, mock_zipstream):
        self._create_cloud_upload("uploaded.fastq.gz")
        deleted = self._create_cloud_upload("deleted.fastq.gz")
        deleted.status = SubmissionCloudUpload.STATUS_DELETED
        deleted.save()

        zip_entries = [{"stream": iter([b"file-content"]), "name": "uploaded.fastq.gz"}]

        def stream_zip(zf_stream):
            yield from zf_stream

        mock_build_zip_file_entries.return_value = (zip_entries, stream_zip)

        mock_zip = MagicMock()
        mock_zip.stream.return_value = iter([b"zip-content"])
        mock_zipstream.return_value = mock_zip

        url = reverse(
            "brokerage:submissions_cloud_zip_download",
            kwargs={"broker_submission_id": self.submission.broker_submission_id},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        mock_build_zip_file_entries.assert_called_once()
        downloadable_files = mock_build_zip_file_entries.call_args[0][0]
        self.assertEqual(len(downloadable_files), 1)
        self.assertEqual(downloadable_files[0].file_upload.original_filename, "uploaded.fastq.gz")
        zip_files = mock_zipstream.call_args[0][0]
        self.assertEqual(len(zip_files), 1)
        self.assertEqual(zip_files[0]["name"], "uploaded.fastq.gz")

    @patch("gfbio_submissions.brokerage.views.submission_cloud_upload_download_view.ZipStream")
    @patch("gfbio_submissions.brokerage.views.submission_cloud_upload_download_view.build_zip_file_entries")
    def test_zip_download_uses_newest_file_for_duplicate_original_filename(self, mock_build_zip_file_entries, mock_zipstream):
        older = self._create_cloud_upload("sample.fastq.gz", file_key_suffix="older")
        newer = self._create_cloud_upload("sample.fastq.gz", file_key_suffix="newer")
        FileUploadRequest.objects.filter(pk=older.file_upload_id).update(
            modified=older.file_upload.modified.replace(year=2020)
        )
        older.file_upload.refresh_from_db()
        newer.refresh_from_db()

        zip_entries = [{"stream": iter([b"file-content"]), "name": "sample.fastq.gz"}]

        def stream_zip(zf_stream):
            yield from zf_stream

        mock_build_zip_file_entries.return_value = (zip_entries, stream_zip)

        mock_zip = MagicMock()
        mock_zip.stream.return_value = iter([b"zip-content"])
        mock_zipstream.return_value = mock_zip

        url = reverse(
            "brokerage:submissions_cloud_zip_download",
            kwargs={"broker_submission_id": self.submission.broker_submission_id},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        downloadable_files = mock_build_zip_file_entries.call_args[0][0]
        self.assertEqual(1, len(downloadable_files))
        self.assertEqual(newer.pk, downloadable_files[0].pk)

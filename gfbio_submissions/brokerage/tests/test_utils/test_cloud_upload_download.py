# -*- coding: utf-8 -*-

import queue
import threading
from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase, override_settings

from gfbio_submissions.brokerage.utils.cloud_upload_download import (
    ZipDownloadQueuePrefetcher,
    _STREAM_END,
    _produce_file_chunks,
    get_download_url,
    stream_file_upload,
)


class TestCloudUploadDownloadUtils(SimpleTestCase):
    @override_settings(
        DOWNLOAD_PREFETCH_QUEUE_CHUNKS=4,
        DOWNLOAD_FILE_CHUNK=1024,
        DOWNLOAD_CONNECT_TIMEOUT=30,
        DOWNLOAD_READ_TIMEOUT=600,
        DOWNLOAD_MAX_RETRIES=3,
        DOWNLOAD_RETRY_BACKOFF=0,
        DOWNLOAD_PARALLELISM=1,
    )
    @patch("gfbio_submissions.brokerage.utils.cloud_upload_download._build_retrying_session")
    @patch("gfbio_submissions.brokerage.utils.cloud_upload_download.get_download_url")
    def test_stream_file_upload_resolves_url_lazily(self, mock_get_url, mock_build_session):
        mock_get_url.return_value = "https://example.com/file"
        session = MagicMock()
        response = MagicMock()
        response.status_code = 200
        response.iter_content.return_value = [b"chunk"]
        response.__enter__.return_value = response
        response.__exit__.return_value = False
        session.get.return_value = response
        mock_build_session.return_value = session
        file_upload = MagicMock()
        file_upload.original_filename = "file.txt"

        chunks = list(stream_file_upload(file_upload))

        self.assertEqual(chunks, [b"chunk"])
        mock_get_url.assert_called_once_with(file_upload)

    @override_settings(
        DOWNLOAD_PREFETCH_QUEUE_CHUNKS=4,
        DOWNLOAD_FILE_CHUNK=1024,
        DOWNLOAD_CONNECT_TIMEOUT=30,
        DOWNLOAD_READ_TIMEOUT=600,
        DOWNLOAD_MAX_RETRIES=3,
        DOWNLOAD_RETRY_BACKOFF=0,
    )
    @patch("gfbio_submissions.brokerage.utils.cloud_upload_download._build_retrying_session")
    @patch("gfbio_submissions.brokerage.utils.cloud_upload_download.get_download_url")
    def test_produce_file_chunks_retries_with_fresh_url_before_body(self, mock_get_url, mock_build_session):
        mock_get_url.side_effect = [
            "https://example.com/expired",
            "https://example.com/fresh",
        ]
        session = MagicMock()

        expired_response = MagicMock()
        expired_response.status_code = 403
        expired_response.__enter__.return_value = expired_response
        expired_response.__exit__.return_value = False

        success_response = MagicMock()
        success_response.status_code = 200
        success_response.iter_content.return_value = [b"chunk"]
        success_response.__enter__.return_value = success_response
        success_response.__exit__.return_value = False

        session.get.side_effect = [expired_response, success_response]
        mock_build_session.return_value = session

        chunk_queue = queue.Queue(maxsize=4)
        cancelled = threading.Event()
        file_upload = MagicMock()

        _produce_file_chunks(
            chunk_queue,
            file_upload,
            member_name="file.txt",
            request_id="test",
            file_chunk=1024,
            connect_timeout=30,
            read_timeout=600,
            max_attempts=3,
            backoff=0,
            cancelled=cancelled,
        )

        first = chunk_queue.get(timeout=1)
        end = chunk_queue.get(timeout=1)
        self.assertEqual(first, b"chunk")
        self.assertEqual(end, _STREAM_END)
        self.assertEqual(mock_get_url.call_count, 2)

    @override_settings(
        DOWNLOAD_PARALLELISM=1,
        DOWNLOAD_PREFETCH_QUEUE_CHUNKS=4,
        DOWNLOAD_FILE_CHUNK=1024,
        DOWNLOAD_CONNECT_TIMEOUT=30,
        DOWNLOAD_READ_TIMEOUT=600,
        DOWNLOAD_MAX_RETRIES=3,
        DOWNLOAD_RETRY_BACKOFF=0,
    )
    @patch("gfbio_submissions.brokerage.utils.cloud_upload_download._produce_file_chunks")
    def test_zip_prefetcher_uses_queue_per_file(self, mock_produce):
        file_uploads = [MagicMock(), MagicMock()]

        def fake_produce(out, file_upload, **kwargs):
            out.put(b"data")
            out.put(_STREAM_END)

        mock_produce.side_effect = fake_produce

        prefetcher = ZipDownloadQueuePrefetcher(file_uploads)
        try:
            first = b"".join(prefetcher.iter_file_at(0))
            second = b"".join(prefetcher.iter_file_at(1))
        finally:
            prefetcher.close()

        self.assertEqual(first, b"data")
        self.assertEqual(second, b"data")
        self.assertEqual(mock_produce.call_count, 2)

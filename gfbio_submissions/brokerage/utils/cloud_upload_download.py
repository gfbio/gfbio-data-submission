# -*- coding: utf-8 -*-
import logging
import queue
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import requests
from django.conf import settings
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)

_STREAM_END = object()


class _StreamError:
    __slots__ = ("exc",)

    def __init__(self, exc):
        self.exc = exc


class _PrefetchCancelled(Exception):
    pass


def get_download_url(file_upload):
    return file_upload.uploaded_file.url


def _download_timeouts():
    return (
        float(settings.DOWNLOAD_CONNECT_TIMEOUT),
        float(settings.DOWNLOAD_READ_TIMEOUT),
    )


def _build_retrying_session():
    retry = Retry(
        total=settings.DOWNLOAD_MAX_RETRIES,
        read=settings.DOWNLOAD_MAX_RETRIES,
        connect=max(1, settings.DOWNLOAD_MAX_RETRIES - 1),
        backoff_factor=settings.DOWNLOAD_RETRY_BACKOFF,
        status_forcelist=tuple(settings.DOWNLOAD_RETRYABLE_HTTP_STATUS),
        allowed_methods=frozenset(["GET"]),
        raise_on_status=False,
    )
    session = requests.Session()
    adapter = HTTPAdapter(
        max_retries=retry,
        pool_connections=settings.DOWNLOAD_PARALLELISM,
        pool_maxsize=settings.DOWNLOAD_PARALLELISM,
    )
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def _queue_put(out, item, cancelled):
    while True:
        if cancelled.is_set():
            raise _PrefetchCancelled()
        try:
            out.put(item, timeout=0.5)
            return
        except queue.Full:
            continue


def _should_resign_on_http_status(status_code):
    return status_code in (401, 403)


def _produce_file_chunks(
    out,
    file_upload,
    *,
    member_name,
    request_id,
    file_chunk,
    connect_timeout,
    read_timeout,
    max_attempts,
    backoff,
    cancelled,
):
    """
    Sign and stream one file into a bounded queue.

    A fresh presigned URL is resolved before each attempt. Retries with a new
    signature happen only while no bytes have been queued yet.
    """
    session = _build_retrying_session()
    last_error = None
    try:
        for attempt in range(1, max_attempts + 1):
            if cancelled.is_set():
                return
            started_body = False
            try:
                url = get_download_url(file_upload)
                with session.get(
                    url,
                    stream=True,
                    timeout=(connect_timeout, read_timeout),
                ) as response:
                    if _should_resign_on_http_status(response.status_code):
                        raise requests.HTTPError(
                            f"{response.status_code} Client Error (auth/expired signature)",
                            response=response,
                        )
                    response.raise_for_status()
                    for chunk in response.iter_content(chunk_size=file_chunk):
                        if not chunk:
                            continue
                        started_body = True
                        _queue_put(out, chunk, cancelled)
                    _queue_put(out, _STREAM_END, cancelled)
                    return
            except _PrefetchCancelled:
                return
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "[DOWNLOAD RETRY] request_id=%s member=%s attempt=%s/%s started_body=%s error=%s",
                    request_id,
                    member_name,
                    attempt,
                    max_attempts,
                    started_body,
                    exc,
                )
                if started_body:
                    try:
                        _queue_put(out, _StreamError(exc), cancelled)
                    except _PrefetchCancelled:
                        pass
                    return
                if attempt < max_attempts:
                    time.sleep(backoff * (2 ** (attempt - 1)))
                    continue
                try:
                    _queue_put(out, _StreamError(exc), cancelled)
                except _PrefetchCancelled:
                    pass
                return
    finally:
        session.close()

    if last_error is not None and not cancelled.is_set():
        try:
            _queue_put(out, _StreamError(last_error), cancelled)
        except _PrefetchCancelled:
            pass


def _iter_queue_chunks(chunk_queue):
    while True:
        item = chunk_queue.get()
        if item is _STREAM_END:
            return
        if isinstance(item, _StreamError):
            raise item.exc
        yield item


def _download_kwargs(member_name, request_id):
    return {
        "member_name": member_name,
        "request_id": request_id,
        "file_chunk": settings.DOWNLOAD_FILE_CHUNK,
        "connect_timeout": _download_timeouts()[0],
        "read_timeout": _download_timeouts()[1],
        "max_attempts": max(1, settings.DOWNLOAD_MAX_RETRIES),
        "backoff": float(settings.DOWNLOAD_RETRY_BACKOFF),
    }


def stream_file_upload(file_upload, request_id=None):
    chunk_queue = queue.Queue(maxsize=settings.DOWNLOAD_PREFETCH_QUEUE_CHUNKS)
    cancelled = threading.Event()
    member_name = getattr(file_upload, "original_filename", None) or str(file_upload)
    thread = threading.Thread(
        target=_produce_file_chunks,
        args=(chunk_queue, file_upload),
        kwargs={
            **_download_kwargs(member_name, request_id or "single-file"),
            "cancelled": cancelled,
        },
        daemon=True,
    )
    thread.start()
    try:
        yield from _iter_queue_chunks(chunk_queue)
    finally:
        cancelled.set()
        thread.join(timeout=1)


class ZipDownloadQueuePrefetcher:
    """Prefetch upcoming file downloads into bounded queues in manifest order."""

    def __init__(self, file_uploads, request_id=None):
        self.file_uploads = list(file_uploads)
        self.request_id = request_id or "zip-download"
        self.parallelism = max(1, settings.DOWNLOAD_PARALLELISM)
        self._executor = ThreadPoolExecutor(max_workers=self.parallelism)
        self._pending = {}
        self._next_submit = 0
        self._pipeline_initialized = False
        self._cancelled = threading.Event()

    def _start_prefetch(self, index):
        file_upload = self.file_uploads[index]
        member_name = getattr(file_upload, "original_filename", None) or f"file-{index}"
        chunk_queue = queue.Queue(maxsize=settings.DOWNLOAD_PREFETCH_QUEUE_CHUNKS)
        self._executor.submit(
            _produce_file_chunks,
            chunk_queue,
            file_upload,
            **_download_kwargs(member_name, self.request_id),
            cancelled=self._cancelled,
        )
        self._pending[index] = chunk_queue

    def _init_pipeline(self):
        if self._pipeline_initialized:
            return
        while self._next_submit < min(self.parallelism, len(self.file_uploads)):
            self._start_prefetch(self._next_submit)
            self._next_submit += 1
        self._pipeline_initialized = True

    def iter_file_at(self, index):
        self._init_pipeline()
        chunk_queue = self._pending.pop(index)
        if self._next_submit < len(self.file_uploads):
            self._start_prefetch(self._next_submit)
            self._next_submit += 1
        yield from _iter_queue_chunks(chunk_queue)

    def zip_entries(self, cloud_uploads):
        entries = []
        for index, cloud_upload in enumerate(cloud_uploads):
            def make_stream(entry_index=index):
                def _generator():
                    yield from self.iter_file_at(entry_index)

                return _generator()

            entries.append(
                {
                    "stream": make_stream(),
                    "name": cloud_upload.file_upload.original_filename,
                }
            )
        return entries

    def close(self):
        self._cancelled.set()
        self._executor.shutdown(wait=False, cancel_futures=True)


def build_zip_file_entries(cloud_uploads, request_id=None):
    prefetcher = ZipDownloadQueuePrefetcher(
        [cloud_upload.file_upload for cloud_upload in cloud_uploads],
        request_id=request_id,
    )
    zip_entries = prefetcher.zip_entries(cloud_uploads)

    def stream_zip(zf_stream):
        try:
            yield from zf_stream
        finally:
            prefetcher.close()

    return zip_entries, stream_zip

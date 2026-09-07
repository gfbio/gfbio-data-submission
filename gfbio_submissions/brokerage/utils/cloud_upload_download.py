# -*- coding: utf-8 -*-
import logging
import queue
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import requests
from django.conf import settings
from django.core.mail import mail_admins
from django.db import close_old_connections, transaction
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from gfbio_submissions.generic.models.request_log import RequestLog

logger = logging.getLogger(__name__)

_STREAM_END = object()
_CLIENT_DISCONNECT = (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, GeneratorExit)


class _StreamError:
    __slots__ = ("exc",)

    def __init__(self, exc):
        self.exc = exc


class _PrefetchCancelled(Exception):
    pass


def get_download_url(file_upload):
    return file_upload.uploaded_file.url


def _is_client_disconnect(exc):
    return isinstance(exc, _CLIENT_DISCONNECT)


def create_incoming_download_request_log(
    *,
    url,
    user=None,
    submission_id=None,
    response_status=None,
    response_content="",
    request_details=None,
):
    """Create an incoming GET RequestLog for a cloud download. Never raises."""
    try:
        with transaction.atomic():
            return RequestLog.objects.create(
                type=RequestLog.INCOMING,
                method=RequestLog.GET,
                url=url,
                user=user,
                submission_id=submission_id,
                response_status=response_status,
                response_content=response_content or "",
                request_details=request_details or {},
            )
    except Exception:
        logger.exception("failed to create download RequestLog | url=%s submission=%s", url, submission_id)
        return None


def finalize_download_request_log(request_log_id, *, status, error=None):
    """Update download RequestLog outcome after the stream ends."""
    if not request_log_id:
        return
    try:
        close_old_connections()
        log = RequestLog.objects.filter(pk=request_log_id).first()
        if log is None:
            return
        details = dict(log.request_details or {})
        details["status"] = status
        if error is not None:
            details["error"] = str(error)
        log.request_details = details
        log.save(update_fields=["request_details", "modified"])
    except Exception:
        logger.exception(
            "failed to finalize download RequestLog | request_log_id=%s",
            request_log_id,
        )


def iter_tracked_download(chunks, request_log_id=None):
    """Yield a download stream and record completed / failed / client_aborted."""
    outcome = "completed"
    error = None
    try:
        yield from chunks
    except _CLIENT_DISCONNECT:
        outcome = "client_aborted"
        raise
    except Exception as exc:
        outcome = "failed"
        error = exc
        raise
    finally:
        finalize_download_request_log(request_log_id, status=outcome, error=error)


def notify_download_breakdown(*, request_id, member_name, exc, broker_submission_id=None):
    """Alert admins when a cloud download stream fails after retries."""
    if _is_client_disconnect(exc):
        return

    subject = "Cloud download failed after retries"
    if broker_submission_id:
        subject = '{0}. Compare submission "{1}"'.format(subject, broker_submission_id)

    message = (
        "Unrecoverable failure while streaming a cloud download.\n"
        "broker_submission_id: {0}\n"
        "request_id: {1}\n"
        "member: {2}\n"
        "error: {3}\n"
    ).format(broker_submission_id, request_id, member_name, exc)

    logger.error(
        "[DOWNLOAD FAILED] request_id=%s submission=%s member=%s error=%s",
        request_id,
        broker_submission_id,
        member_name,
        exc,
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    try:
        mail_admins(subject=subject, message=message)
    except Exception:
        logger.exception(
            "[DOWNLOAD FAILED] mail_admins failed | request_id=%s submission=%s",
            request_id,
            broker_submission_id,
        )


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


def _iter_queue_chunks(chunk_queue, *, request_id=None, member_name=None, broker_submission_id=None):
    while True:
        item = chunk_queue.get()
        if item is _STREAM_END:
            return
        if isinstance(item, _StreamError):
            notify_download_breakdown(
                request_id=request_id,
                member_name=member_name,
                broker_submission_id=broker_submission_id,
                exc=item.exc,
            )
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


def stream_file_upload(file_upload, request_id=None, broker_submission_id=None):
    chunk_queue = queue.Queue(maxsize=settings.DOWNLOAD_PREFETCH_QUEUE_CHUNKS)
    cancelled = threading.Event()
    member_name = getattr(file_upload, "original_filename", None) or str(file_upload)
    resolved_request_id = request_id or "single-file"
    thread = threading.Thread(
        target=_produce_file_chunks,
        args=(chunk_queue, file_upload),
        kwargs={
            **_download_kwargs(member_name, resolved_request_id),
            "cancelled": cancelled,
        },
        daemon=True,
    )
    thread.start()
    try:
        yield from _iter_queue_chunks(
            chunk_queue,
            request_id=resolved_request_id,
            member_name=member_name,
            broker_submission_id=broker_submission_id,
        )
    finally:
        cancelled.set()
        thread.join(timeout=1)


class ZipDownloadQueuePrefetcher:
    """Prefetch upcoming file downloads into bounded queues in manifest order."""

    def __init__(self, file_uploads, request_id=None, broker_submission_id=None):
        self.file_uploads = list(file_uploads)
        self.request_id = request_id or "zip-download"
        self.broker_submission_id = broker_submission_id
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
        file_upload = self.file_uploads[index]
        member_name = getattr(file_upload, "original_filename", None) or f"file-{index}"
        yield from _iter_queue_chunks(
            chunk_queue,
            request_id=self.request_id,
            member_name=member_name,
            broker_submission_id=self.broker_submission_id,
        )

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


def build_zip_file_entries(cloud_uploads, request_id=None, broker_submission_id=None):
    prefetcher = ZipDownloadQueuePrefetcher(
        [cloud_upload.file_upload for cloud_upload in cloud_uploads],
        request_id=request_id,
        broker_submission_id=broker_submission_id,
    )
    zip_entries = prefetcher.zip_entries(cloud_uploads)

    def stream_zip(zf_stream):
        try:
            yield from zf_stream
        finally:
            prefetcher.close()

    return zip_entries, stream_zip

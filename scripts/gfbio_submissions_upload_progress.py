# -*- coding: utf-8 -*-
"""
GFBio submission cloud upload CLI (same direct multipart flow as the profile UI).

Per file: compute MD5/SHA256, then ``POST …/start-uploads/`` (or ``POST …/restart-multipart/`` on
resume/retry when a session exists). For each part: ``POST …/uploads/{upload_id}/part/`` (presigned URL),
``PUT`` to S3, ``PUT …/update-part/``, then ``PUT …/complete/``. Up to 5 parts per file and up to 3 files
upload in parallel (thread pools). Built-in HTTP retries per step and extra full-file retry passes.

Uses only the Python standard library for HTTP (``urllib.request``). On Debian/Ubuntu use ``python3``.

Process flow: ``scripts/gfbio_submissions_upload_progress_flow.md``.

Example::

  python3 scripts/gfbio_submissions_upload_progress.py sync \\
    --api-url=http://127.0.0.1:8000/ --broker-submission-id=UUID --token=TOKEN \\
    --recursive --output failures.json ./datadir

  python3 scripts/gfbio_submissions_upload_progress.py sync \\
    --api-url=... --broker-submission-id=UUID --token=TOKEN \\
    --input failures.json --recursive ./datadir --output failures.json

``--api-url`` is the site root (or ``API_BASE``); a trailing ``/api`` is stripped. API paths are
``{site}/api/submissions/...``. ``PATH`` is one file or directory (optional with ``--input`` alone).

``--output`` writes ``failed``, ``sessions``, and ``errors`` for ``--input`` resume. Resume still
requires ``--api-url``, ``--broker-submission-id``, and ``--token`` (or env vars).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import logging
import mimetypes
import os
import shutil
import socket
import sys
import threading
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Mapping, Optional, Tuple
from urllib import error as urllib_error
from urllib import request as urllib_request

# Default part size (500 MiB); keep in sync with gfbio_submissions.brokerage.upload_defaults.
DEFAULT_MULTIPART_PART_SIZE_BYTES = 500 * 1024 * 1024

logger = logging.getLogger(__name__)

_HASH_CHUNK = 8 * 1024 * 1024
_PROGRESS_BAR_WIDTH = 32
_MIN_RENDER_INTERVAL_S = 0.05
DEFAULT_PART_RETRIES = 3
PART_RETRY_DELAY_S = 1.5
HTTP_CONNECT_TIMEOUT_S = 30
HTTP_READ_TIMEOUT_S = 600
RETRYABLE_HTTP_STATUS = frozenset({429, 500, 502, 503, 504})
DEFAULT_FILE_RETRY_ROUNDS = 3
# Seconds to wait before tries 2, 3, and 4 (after try 1).
DEFAULT_FILE_RETRY_DELAYS_S = (60, 300, 600)  # 1 min, 5 min, 10 min
DEFAULT_MAX_PART_WORKERS = 5
DEFAULT_MAX_FILE_WORKERS = 3
UPLOAD_STATE_VERSION = 1
_active_part_retries = DEFAULT_PART_RETRIES
_active_part_retry_delay_s = PART_RETRY_DELAY_S


def _format_bytes(num_bytes: int) -> str:
    """Human-readable size (binary units)."""
    if num_bytes < 1024:
        return f"{num_bytes} B"
    units = ("KiB", "MiB", "GiB", "TiB")
    value = float(num_bytes)
    for unit in units:
        value /= 1024.0
        if value < 1024.0 or unit == units[-1]:
            return f"{value:.1f} {unit}"
    return f"{value:.1f} TiB"


def _format_speed(bytes_per_sec: float) -> str:
    """Human-readable throughput (binary units per second)."""
    if bytes_per_sec <= 0:
        return "—"
    return f"{_format_bytes(int(bytes_per_sec))}/s"


def _progress_bar(pct: float, width: int = _PROGRESS_BAR_WIDTH) -> str:
    pct = max(0.0, min(100.0, pct))
    filled = int(round(width * pct / 100.0))
    if filled >= width:
        return "[" + "=" * width + "]"
    return "[" + "=" * filled + ">" + " " * (width - filled - 1) + "]"


def _terminal_width() -> int:
    try:
        return shutil.get_terminal_size(fallback=(120, 20)).columns
    except OSError:
        return 120


@dataclass
class _ActiveFile:
    filename: str
    file_size: int
    file_bytes: int = 0
    phase: str = "preparing"
    parts_done: int = 0
    parts_total: int = 0
    upload_started_at: float | None = None
    upload_ended_at: float | None = None
    upload_avg_bps: float | None = None
    speed_mark_bytes: int = 0
    speed_mark_at: float | None = None
    live_bps: float | None = None


def _bytes_for_overall(st: _ActiveFile) -> int:
    """Bytes credited toward overall progress (upload bytes only)."""
    if st.phase == "preparing":
        return 0
    if st.phase == "completing":
        return st.file_size
    return st.file_bytes


def _file_pct_display(st: _ActiveFile) -> float:
    if st.file_size <= 0:
        return 100.0
    if st.phase == "preparing":
        return 0.0
    if st.phase == "completing":
        return 100.0
    return 100.0 * st.file_bytes / st.file_size


def _phase_detail(st: _ActiveFile) -> str:
    if st.phase == "preparing":
        return "preparing"
    if st.phase == "completing":
        return "completing"
    if st.phase == "uploading":
        if st.parts_total > 1:
            return f"parts {st.parts_done}/{st.parts_total}"
        return "uploading"
    return st.phase


def _update_live_speed(st: _ActiveFile, now: float) -> None:
    """Rolling upload throughput from recent byte deltas (upload phase only)."""
    if st.phase != "uploading" or st.speed_mark_at is None:
        return
    dt = now - st.speed_mark_at
    if dt < 0.5:
        return
    db = st.file_bytes - st.speed_mark_bytes
    if dt > 0:
        st.live_bps = db / dt
    st.speed_mark_at = now
    st.speed_mark_bytes = st.file_bytes


def _file_speed_suffix(st: _ActiveFile, now: float) -> str:
    if st.phase == "preparing":
        return ""
    avg_bps: float | None = st.upload_avg_bps
    if avg_bps is None and st.phase == "uploading" and st.upload_started_at is not None:
        elapsed = now - st.upload_started_at
        if elapsed > 0 and st.file_bytes > 0:
            avg_bps = st.file_bytes / elapsed
    live_bps = st.live_bps
    parts: List[str] = []
    if live_bps is not None and live_bps > 0:
        parts.append(f"live {_format_speed(live_bps)}")
    if avg_bps is not None and avg_bps > 0:
        parts.append(f"avg {_format_speed(avg_bps)}")
    return ("  " + "  ".join(parts)) if parts else ""


class SyncProgressDisplay:
    """
    Live multi-line progress on stdout: one fixed overall line, then one line per
    in-flight file (removed when that file finishes).

    With multiple concurrent file uploads, several current lines appear at once.
    """

    def __init__(self, *, total_files: int, total_bytes: int) -> None:
        self.total_files = total_files
        self.total_bytes = total_bytes
        self._stream = sys.stdout
        self.use_tty = self._stream.isatty()
        self._lock = threading.Lock()
        self._display_lock = threading.Lock()
        self._active: Dict[str, _ActiveFile] = {}
        self._completed_files = 0
        self._completed_bytes = 0
        self._last_line_count = 0
        self._last_render = 0.0
        self._last_fallback_overall_pct = -1
        self._saved_log_level: int | None = None
        self._alt_screen = self.use_tty and os.environ.get("GFBIOS_NO_ALT_SCREEN", "") != "1"

    def begin_sync(self) -> None:
        if self.use_tty:
            root = logging.getLogger()
            self._saved_log_level = root.level
            root.setLevel(logging.WARNING)
            if self._alt_screen:
                self._stream.write("\033[?1049h\033[H")
                self._stream.flush()
        else:
            logger.info(
                "Uploading %d file(s), %s total",
                self.total_files,
                _format_bytes(self.total_bytes),
            )

    def register_file(self, file_path: str, file_size: int) -> None:
        with self._lock:
            self._active[file_path] = _ActiveFile(
                filename=os.path.basename(file_path),
                file_size=file_size,
            )
        self._render(force=True)

    def unregister_file(self, file_path: str) -> None:
        with self._lock:
            st = self._active.pop(file_path, None)
            if st is not None:
                self._completed_files += 1
                self._completed_bytes += st.file_size
                filename = st.filename
                upload_avg_bps = st.upload_avg_bps
                live_bps = st.live_bps
                upload_seconds = (
                    (st.upload_ended_at - st.upload_started_at)
                    if st.upload_started_at is not None and st.upload_ended_at is not None
                    else None
                )
            else:
                filename = os.path.basename(file_path)
                upload_avg_bps = None
                live_bps = None
                upload_seconds = None
        self._render(force=True)
        if upload_avg_bps is not None:
            logger.info(
                "%s upload: live %s  avg %s  (%.1fs)",
                filename,
                _format_speed(live_bps or upload_avg_bps),
                _format_speed(upload_avg_bps),
                upload_seconds or 0.0,
            )
        elif not self.use_tty:
            logger.info(
                "[%d/%d] finished %s",
                self._completed_files,
                self.total_files,
                filename,
            )

    def update_file(self, file_path: str, *, force: bool = False, **fields: Any) -> None:
        with self._lock:
            st = self._active[file_path]
            for key, value in fields.items():
                setattr(st, key, value)
        self._render(force=force)

    def start_upload(self, file_path: str) -> None:
        now = time.monotonic()
        with self._lock:
            st = self._active[file_path]
            st.phase = "uploading"
            st.file_bytes = 0
            st.parts_done = 0
            st.upload_started_at = now
            st.upload_ended_at = None
            st.upload_avg_bps = None
            st.speed_mark_at = now
            st.speed_mark_bytes = 0
            st.live_bps = None
        self._render(force=True)

    def finish_upload(self, file_path: str) -> None:
        now = time.monotonic()
        with self._lock:
            st = self._active[file_path]
            st.phase = "completing"
            st.file_bytes = st.file_size
            st.upload_ended_at = now
            if st.upload_started_at is not None:
                elapsed = now - st.upload_started_at
                if elapsed > 0:
                    st.upload_avg_bps = st.file_size / elapsed
        self._render(force=True)

    def add_part_completed(self, file_path: str, start: int, end: int) -> None:
        now = time.monotonic()
        with self._lock:
            st = self._active[file_path]
            st.phase = "uploading"
            st.parts_done += 1
            st.file_bytes += end - start
            if st.speed_mark_at is not None:
                dt = now - st.speed_mark_at
                if dt > 0:
                    db = st.file_bytes - st.speed_mark_bytes
                    st.live_bps = db / dt
                    if dt >= 0.5:
                        st.speed_mark_at = now
                        st.speed_mark_bytes = st.file_bytes
        self._render(force=True)

    def finish_sync(self) -> None:
        with self._display_lock:
            if self.use_tty and self._alt_screen:
                self._stream.write("\033[?1049l")
                self._stream.flush()
            self._last_line_count = 0
        if self._saved_log_level is not None:
            logging.getLogger().setLevel(self._saved_log_level)
            self._saved_log_level = None

    def _build_lines(self) -> List[str]:
        now = time.monotonic()
        with self._lock:
            for st in self._active.values():
                _update_live_speed(st, now)
            in_flight = sum(_bytes_for_overall(st) for st in self._active.values())
            overall_bytes = self._completed_bytes + in_flight
            completed_files = self._completed_files
            active_count = len(self._active)
            rows = sorted(self._active.items(), key=lambda item: item[0])

        overall_pct = (
            100.0 * overall_bytes / self.total_bytes if self.total_bytes > 0 else 0.0
        )
        if completed_files >= self.total_files and active_count == 0:
            overall_pct = 100.0
        line_overall = (
            f"Overall {_progress_bar(overall_pct)} {overall_pct:5.1f}%  "
            f"done {completed_files}/{self.total_files}  "
            f"active {active_count}  "
            f"{_format_bytes(overall_bytes)} / {_format_bytes(self.total_bytes)}"
        )
        lines = [line_overall]
        for _path, st in rows:
            file_pct = _file_pct_display(st)
            detail = _phase_detail(st)
            speeds = _file_speed_suffix(st, now)
            lines.append(
                f"  {st.filename} {_progress_bar(file_pct, width=20)} {file_pct:5.1f}%"
                f"{speeds}  ({detail})"
            )
        return lines

    def _render(self, *, force: bool = False) -> None:
        with self._display_lock:
            now = time.monotonic()
            if not force and now - self._last_render < _MIN_RENDER_INTERVAL_S:
                return
            self._last_render = now
            lines = self._build_lines()

            if self.use_tty:
                self._write_lines(lines)
                return

            overall_pct = 0.0
            if self.total_bytes > 0:
                with self._lock:
                    in_flight = sum(_bytes_for_overall(st) for st in self._active.values())
                    overall_bytes = self._completed_bytes + in_flight
                overall_pct = 100.0 * overall_bytes / self.total_bytes
            overall_pct_int = int(overall_pct)
            if force or overall_pct_int != self._last_fallback_overall_pct:
                self._last_fallback_overall_pct = overall_pct_int
                for line in lines:
                    logger.info("%s", line)

    def _write_lines(self, lines: List[str]) -> None:
        """Redraw the full progress block (must run under ``_display_lock``)."""
        width = _terminal_width()
        lines = [line[:width] for line in lines]
        if self._alt_screen:
            self._stream.write("\033[H")
        elif self._last_line_count > 0:
            self._stream.write(f"\033[{self._last_line_count}A")
        for line in lines:
            self._stream.write("\r\033[K" + line + "\n")
        for _ in range(self._last_line_count - len(lines)):
            self._stream.write("\r\033[K\n")
        self._stream.flush()
        self._last_line_count = len(lines)


class FileProgressTracker:
    """Per-file progress handle; one instance per concurrent upload."""

    def __init__(self, display: SyncProgressDisplay, file_path: str) -> None:
        self._display = display
        self._path = file_path
        self._size = os.path.getsize(file_path)
        display.register_file(file_path, self._size)

    def set_total_parts(self, total_parts: int) -> None:
        self._display.update_file(self._path, parts_total=total_parts)

    def hashing(self, hashed_bytes: int, _total: int | None = None) -> None:
        """Hashing is part of preparing; the bar stays at 0% until upload starts."""

    def hashing_done(self) -> None:
        """Still preparing while start-uploads runs."""

    def begin_upload(self) -> None:
        self._display.start_upload(self._path)

    def begin_complete(self) -> None:
        self._display.finish_upload(self._path)

    def part_completed(self, start: int, end: int) -> None:
        self._display.add_part_completed(self._path, start, end)

    def file_done(self) -> None:
        self._display.unregister_file(self._path)


def normalize_site_api_base(api_base_url: str) -> str:
    """
    Normalize the site root used to build REST paths.

    Callers may pass either ``https://host/`` or ``https://host/api``; we strip a trailing
    ``/api`` so URLs are not built as ``.../api/api/submissions/...``.
    """
    base = (api_base_url or "").strip().rstrip("/")
    if base.lower().endswith("/api"):
        base = base[:-4].rstrip("/")
    return base


def file_md5_sha256(
    file_path: str,
    *,
    on_progress: Callable[[int, int], None] | None = None,
) -> tuple[str, str]:
    md5 = hashlib.md5()
    sha256 = hashlib.sha256()
    total = os.path.getsize(file_path)
    done = 0
    with open(file_path, "rb") as f:
        while True:
            block = f.read(_HASH_CHUNK)
            if not block:
                break
            md5.update(block)
            sha256.update(block)
            done += len(block)
            if on_progress is not None:
                on_progress(done, total)
    return md5.hexdigest(), sha256.hexdigest()


def _is_windows_zone_identifier_junk(path: Path) -> bool:
    """Skip NTFS 'Zone.Identifier' sidecar files that often appear on WSL/Linux copies from Windows."""
    name = path.name
    return name == "Zone.Identifier" or name.endswith(":Zone.Identifier")


def collect_upload_paths(path: str, *, recursive: bool) -> List[str]:
    """
    Resolve a single file or directory path to a sorted list of regular files.
    Directories list immediate children only unless ``recursive`` is true.
    """
    paths = [path]
    out: List[Path] = []
    for raw in paths:
        p = Path(raw).expanduser().resolve()
        if not p.exists():
            raise FileNotFoundError(f"not found: {raw}")
        if p.is_file():
            if _is_windows_zone_identifier_junk(p):
                continue
            out.append(p)
        elif p.is_dir():
            if recursive:
                for child in p.rglob("*"):
                    if child.is_file() and not _is_windows_zone_identifier_junk(child):
                        out.append(child)
            else:
                for child in p.iterdir():
                    if child.is_file() and not _is_windows_zone_identifier_junk(child):
                        out.append(child)
        else:
            raise ValueError(f"not a file or directory: {raw}")

    if not out:
        raise ValueError("no files matched the given paths")

    by_name: Dict[str, List[Path]] = defaultdict(list)
    for fp in out:
        by_name[fp.name].append(fp)
    for name, lst in by_name.items():
        if len(lst) > 1:
            paths_s = ", ".join(str(x) for x in sorted(lst))
            raise ValueError(f"duplicate basename {name!r} — each upload filename must be unique: {paths_s}")

    return [str(x) for x in sorted(out)]


@dataclass
class FileUploadSession:
    """Server-side upload slot for one local file (created once via start-uploads)."""

    file_path: str
    cloud_upload_pk: int
    upload_id: str
    meta_data: bool = False
    attach_to_ticket: bool = False


@dataclass
class UploadFileResult:
    success: bool
    file_path: str
    session: FileUploadSession | None = None
    error: str | None = None
    data: Dict[str, Any] = field(default_factory=dict)


def _normalize_path(path: str) -> str:
    return os.path.normpath(os.path.abspath(path))


def _session_to_dict(session: FileUploadSession) -> Dict[str, Any]:
    return {
        "file_path": _normalize_path(session.file_path),
        "cloud_upload_pk": session.cloud_upload_pk,
        "upload_id": session.upload_id,
        "meta_data": session.meta_data,
        "attach_to_ticket": session.attach_to_ticket,
    }


def _session_from_dict(data: Mapping[str, Any]) -> FileUploadSession:
    return FileUploadSession(
        file_path=_normalize_path(str(data["file_path"])),
        cloud_upload_pk=int(data["cloud_upload_pk"]),
        upload_id=str(data["upload_id"]),
        meta_data=bool(data.get("meta_data", False)),
        attach_to_ticket=bool(data.get("attach_to_ticket", False)),
    )


def _build_upload_state(
    *,
    broker_submission_id: str,
    api_url: str,
    failed: List[str],
    sessions: Dict[str, FileUploadSession],
    errors: Dict[str, str],
) -> Dict[str, Any]:
    """JSON shape mirrors in-memory ``failed``, ``sessions``, and ``errors``."""
    failed_norm = [_normalize_path(p) for p in failed]
    failed_set = set(failed_norm)
    sessions_out: Dict[str, Any] = {}
    for fp in failed_norm:
        sess = sessions.get(fp)
        if sess is not None:
            sessions_out[fp] = _session_to_dict(sess)
    errors_out: Dict[str, str] = {}
    for key, msg in errors.items():
        nk = _normalize_path(key)
        if nk in failed_set:
            errors_out[nk] = msg
    return {
        "version": UPLOAD_STATE_VERSION,
        "broker_submission_id": broker_submission_id,
        "api_url": api_url,
        "failed": failed_norm,
        "sessions": sessions_out,
        "errors": errors_out,
    }


def _write_upload_state(path: str, state: Mapping[str, Any]) -> None:
    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=2)
        fh.write("\n")
    logger.info("Wrote upload state to %s (%d failed)", out_path, len(state.get("failed", [])))


def _load_upload_state(
    path: str,
    *,
    broker_submission_id: str,
    api_url: str,
) -> Tuple[List[str], Dict[str, FileUploadSession], Dict[str, str]]:
    with Path(path).open(encoding="utf-8") as fh:
        raw = json.load(fh)
    if raw.get("version") != UPLOAD_STATE_VERSION:
        raise ValueError(f"unsupported state version {raw.get('version')!r} (expected {UPLOAD_STATE_VERSION})")
    if raw.get("broker_submission_id") != broker_submission_id:
        raise ValueError(
            f"broker_submission_id mismatch: state has {raw.get('broker_submission_id')!r}, "
            f"CLI has {broker_submission_id!r}"
        )
    saved_api = (raw.get("api_url") or "").strip()
    if saved_api and api_url and normalize_site_api_base(saved_api) != normalize_site_api_base(api_url):
        logger.warning("api_url in state file (%s) differs from --api-url (%s)", saved_api, api_url)
    failed_raw = raw.get("failed") or []
    if not isinstance(failed_raw, list):
        raise ValueError("state file 'failed' must be a list")
    failed = [_normalize_path(str(p)) for p in failed_raw]
    sessions: Dict[str, FileUploadSession] = {}
    for key, value in (raw.get("sessions") or {}).items():
        nk = _normalize_path(str(key))
        sessions[nk] = _session_from_dict(value)
    errors_in = raw.get("errors") or {}
    errors = {_normalize_path(str(k)): str(v) for k, v in errors_in.items()}
    return failed, sessions, errors


@dataclass
class HttpResponse:
    status: int
    headers: Mapping[str, str]
    body: bytes

    @property
    def status_code(self) -> int:
        return self.status

    @property
    def text(self) -> str:
        return self.body.decode("utf-8", errors="replace")

    def json(self) -> Any:
        return json.loads(self.body.decode("utf-8"))

    def raise_for_status(self) -> None:
        if self.status >= 400:
            raise HttpError(f"HTTP {self.status}", self)

    def header_get(self, name: str, default: str = "") -> str:
        name_lower = name.lower()
        for key, value in self.headers.items():
            if key.lower() == name_lower:
                return value.strip().strip('"')
        return default


class HttpError(Exception):
    def __init__(self, message: str, response: HttpResponse | None = None) -> None:
        super().__init__(message)
        self.response = response


@dataclass
class ApiClient:
    """Minimal HTTP client (stdlib only) with token auth for submission API calls."""

    authorization: str
    timeout_s: float = float(HTTP_READ_TIMEOUT_S)

    def request(
        self,
        method: str,
        url: str,
        *,
        json_body: Any | None = None,
        data: bytes | None = None,
        headers: Dict[str, str] | None = None,
        use_auth: bool = True,
    ) -> HttpResponse:
        hdrs: Dict[str, str] = {}
        if use_auth:
            hdrs["Authorization"] = self.authorization
        if headers:
            hdrs.update(headers)
        body: bytes | None = None
        if json_body is not None:
            body = json.dumps(json_body).encode("utf-8")
            hdrs.setdefault("Content-Type", "application/json")
        elif data is not None:
            body = data

        req = urllib_request.Request(url, data=body, headers=hdrs, method=method.upper())
        try:
            with urllib_request.urlopen(req, timeout=self.timeout_s) as resp:
                return HttpResponse(
                    status=int(getattr(resp, "status", 200)),
                    headers=dict(resp.headers.items()),
                    body=resp.read(),
                )
        except urllib_error.HTTPError as exc:
            err_body = exc.read() if exc.fp else b""
            response = HttpResponse(
                status=int(exc.code),
                headers=dict(exc.headers.items()),
                body=err_body,
            )
            raise HttpError(f"HTTP {exc.code} for {method.upper()} {url}", response) from exc
        except urllib_error.URLError as exc:
            reason = exc.reason
            if isinstance(reason, (TimeoutError, socket.timeout)):
                raise TimeoutError(str(exc)) from exc
            raise ConnectionError(str(exc)) from exc


def _retryable_http_error(exc: BaseException) -> bool:
    if isinstance(exc, HttpError) and exc.response is not None:
        return exc.response.status in RETRYABLE_HTTP_STATUS
    return isinstance(exc, (ConnectionError, TimeoutError, OSError))


def _request_with_retry(
    client: ApiClient,
    method: str,
    url: str,
    *,
    max_retries: int | None = None,
    retry_delay_s: float | None = None,
    json_body: Any | None = None,
    data: bytes | None = None,
    headers: Dict[str, str] | None = None,
    use_auth: bool = True,
) -> HttpResponse:
    """Retry transient network / 5xx errors (same count as profile UI part retries)."""
    if max_retries is None:
        max_retries = _active_part_retries
    if retry_delay_s is None:
        retry_delay_s = _active_part_retry_delay_s
    last_exc: BaseException | None = None
    for attempt in range(1, max_retries + 1):
        try:
            response = client.request(
                method,
                url,
                json_body=json_body,
                data=data,
                headers=headers,
                use_auth=use_auth,
            )
            if response.status in RETRYABLE_HTTP_STATUS:
                last_exc = HttpError(
                    f"HTTP {response.status} for {method.upper()} {url}",
                    response,
                )
                if attempt >= max_retries:
                    response.raise_for_status()
            else:
                response.raise_for_status()
                return response
        except HttpError as exc:
            last_exc = exc
            if not _retryable_http_error(exc) or attempt >= max_retries:
                raise
        except (ConnectionError, TimeoutError, OSError) as exc:
            last_exc = exc
            if attempt >= max_retries:
                raise
        if attempt < max_retries:
            time.sleep(retry_delay_s)
    if last_exc is not None:
        raise last_exc
    raise RuntimeError(f"request failed without response: {method} {url}")


def _upload_one_part_direct(
    client: ApiClient,
    base: str,
    upload_id: str,
    file_path: str,
    file_type: str,
    part_number: int,
    start: int,
    end: int,
) -> Dict[str, Any]:
    """``end`` is an exclusive byte offset (same convention as the profile UI part ranges)."""
    part_url = f"{base}/api/submissions/uploads/{upload_id}/part/"
    r = _request_with_retry(
        client,
        "POST",
        part_url,
        json_body={"part_number": part_number},
    )
    presigned_url = r.json()["presigned_url"]

    with open(file_path, "rb") as f:
        f.seek(start)
        body = f.read(end - start)

    put_r = _request_with_retry(
        client,
        "PUT",
        presigned_url,
        data=body,
        headers={"Content-Type": file_type},
        use_auth=False,
    )
    etag = put_r.header_get("ETag")

    update_url = f"{base}/api/submissions/uploads/{upload_id}/update-part/"
    _request_with_retry(
        client,
        "PUT",
        update_url,
        json_body={
            "part_number": part_number,
            "etag": etag,
            "completed": True,
        },
    )
    return {"PartNumber": part_number, "ETag": etag}


def _multipart_start_payload(
    filename: str,
    file_type: str,
    file_size: int,
    part_size_bytes: int,
    total_parts: int,
    *,
    meta_data: bool,
    attach_to_ticket: bool,
    md5_hex: str,
    sha256_hex: str,
) -> Dict[str, Any]:
    return {
        "filename": filename,
        "filetype": file_type,
        "total_size": file_size,
        "part_size": part_size_bytes,
        "total_parts": total_parts,
        "meta_data": meta_data,
        "attach_to_ticket": attach_to_ticket,
        "md5": md5_hex,
        "sha256": sha256_hex,
    }


def _begin_upload_session(
    client: ApiClient,
    base: str,
    broker_submission_id: str,
    file_path: str,
    start_payload: Dict[str, Any],
    *,
    meta_data: bool,
    attach_to_ticket: bool,
) -> FileUploadSession:
    start_url = f"{base}/api/submissions/{broker_submission_id}/start-uploads/"
    start_r = _request_with_retry(client, "POST", start_url, json_body=start_payload)
    start_data = start_r.json()
    return FileUploadSession(
        file_path=file_path,
        cloud_upload_pk=int(start_data["id"]),
        upload_id=start_data["upload_id"],
        meta_data=meta_data,
        attach_to_ticket=attach_to_ticket,
    )


def _restart_upload_session(
    client: ApiClient,
    base: str,
    broker_submission_id: str,
    upload_session: FileUploadSession,
    start_payload: Dict[str, Any],
) -> FileUploadSession:
    restart_url = (
        f"{base}/api/submissions/{broker_submission_id}/uploads/"
        f"{upload_session.cloud_upload_pk}/restart-multipart/"
    )
    restart_r = _request_with_retry(client, "POST", restart_url, json_body=start_payload)
    restart_data = restart_r.json()
    upload_session.upload_id = restart_data["upload_id"]
    return upload_session


def _transfer_multipart(
    client: ApiClient,
    base: str,
    upload_session: FileUploadSession,
    *,
    part_size_bytes: int,
    max_workers: int,
    progress: FileProgressTracker | None,
) -> Dict[str, Any]:
    file_path = upload_session.file_path
    filename = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)
    file_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    upload_id = upload_session.upload_id

    if progress is not None:
        progress.begin_upload()

    total_parts = max(1, (file_size + part_size_bytes - 1) // part_size_bytes)
    tasks: List[Tuple[int, int, int]] = []
    for part_number in range(1, total_parts + 1):
        start_b = (part_number - 1) * part_size_bytes
        end_b = min(file_size, part_number * part_size_bytes)
        tasks.append((part_number, start_b, end_b))

    part_ranges: Dict[int, Tuple[int, int]] = {pn: (sb, eb) for pn, sb, eb in tasks}
    completed_parts: List[Dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futures = {
            ex.submit(
                _upload_one_part_direct,
                client,
                base,
                upload_id,
                file_path,
                file_type,
                pn,
                sb,
                eb,
            ): pn
            for pn, sb, eb in tasks
        }
        for fut in as_completed(futures):
            part_result = fut.result()
            completed_parts.append(part_result)
            if progress is not None:
                pn = int(part_result["PartNumber"])
                sb, eb = part_ranges[pn]
                progress.part_completed(sb, eb)

    completed_parts.sort(key=lambda p: p["PartNumber"])
    if progress is not None:
        progress.begin_complete()
    complete_url = f"{base}/api/submissions/uploads/{upload_id}/complete/"
    complete_r = _request_with_retry(
        client,
        "PUT",
        complete_url,
        json_body={"parts": completed_parts},
    )
    out: Dict[str, Any] = {"upload_id": upload_id, "id": upload_session.cloud_upload_pk}
    if complete_r.header_get("Content-Type").startswith("application/json"):
        try:
            out["complete"] = complete_r.json()
        except ValueError:
            out["complete"] = None
    return out


def upload_file_direct(
    client: ApiClient,
    api_base_url: str,
    broker_submission_id: str,
    file_path: str,
    *,
    part_size_bytes: int = DEFAULT_MULTIPART_PART_SIZE_BYTES,
    meta_data: bool = False,
    attach_to_ticket: bool = False,
    max_workers: int = DEFAULT_MAX_PART_WORKERS,
    progress: FileProgressTracker | None = None,
    upload_session: FileUploadSession | None = None,
    restart_multipart: bool = False,
) -> UploadFileResult:
    """Upload one file; returns result without raising (for batch + retry passes)."""
    base = normalize_site_api_base(api_base_url)
    filename = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)
    if file_size == 0:
        return UploadFileResult(
            success=False,
            file_path=file_path,
            error="empty file not supported",
        )

    content_type, _ = mimetypes.guess_type(filename)
    file_type = content_type or "application/octet-stream"
    total_parts = max(1, (file_size + part_size_bytes - 1) // part_size_bytes)
    if progress is not None:
        progress.set_total_parts(total_parts)

    try:
        if progress is None and upload_session is None:
            logger.info("Hashing %s for start-uploads", file_path)
        md5_hex, sha256_hex = file_md5_sha256(
            file_path,
            on_progress=(progress.hashing if progress is not None else None),
        )
        if progress is not None:
            progress.hashing_done()

        start_payload = _multipart_start_payload(
            filename,
            file_type,
            file_size,
            part_size_bytes,
            total_parts,
            meta_data=meta_data,
            attach_to_ticket=attach_to_ticket,
            md5_hex=md5_hex,
            sha256_hex=sha256_hex,
        )

        if restart_multipart and upload_session is not None:
            upload_session = _restart_upload_session(
                client,
                base,
                broker_submission_id,
                upload_session,
                start_payload,
            )
            if progress is None:
                logger.info(
                    "Restarted multipart upload_id=%s for %s (cloud_upload pk=%s)",
                    upload_session.upload_id,
                    filename,
                    upload_session.cloud_upload_pk,
                )
        elif upload_session is None:
            upload_session = _begin_upload_session(
                client,
                base,
                broker_submission_id,
                file_path,
                start_payload,
                meta_data=meta_data,
                attach_to_ticket=attach_to_ticket,
            )
            if progress is None:
                if restart_multipart:
                    logger.info(
                        "Started upload (first start-uploads for retry) upload_id=%s for %s (%d part(s))",
                        upload_session.upload_id,
                        filename,
                        total_parts,
                    )
                else:
                    logger.info(
                        "Started multipart upload_id=%s for %s (%d part(s))",
                        upload_session.upload_id,
                        filename,
                        total_parts,
                    )

        out = _transfer_multipart(
            client,
            base,
            upload_session,
            part_size_bytes=part_size_bytes,
            max_workers=max_workers,
            progress=progress,
        )
        if progress is not None:
            progress.file_done()
        else:
            logger.info("Completed multipart upload: %s", filename)
        return UploadFileResult(
            success=True,
            file_path=file_path,
            session=upload_session,
            data=out,
        )
    except Exception as exc:
        logger.error("Upload failed for %s: %s", file_path, exc)
        return UploadFileResult(
            success=False,
            file_path=file_path,
            session=upload_session,
            error=str(exc),
        )


def _api_base(api_url: str) -> str:
    if not api_url or not api_url.strip():
        raise SystemExit("Pass --api-url or set API_BASE to the site root (e.g. https://submissions.gfbio.org/).")
    return normalize_site_api_base(api_url)


def _api_client(token: str | None) -> ApiClient:
    t = (token or os.environ.get("API_TOKEN") or "").strip()
    if not t:
        raise SystemExit("Pass --token or set API_TOKEN for authenticated API calls.")
    return ApiClient(authorization=f"Token {t}")


def _run_upload_pass(
    paths: List[str],
    args: argparse.Namespace,
    *,
    display: SyncProgressDisplay | None,
    sessions: Dict[str, FileUploadSession],
    failed: List[str],
    errors: Dict[str, str],
    restart_multipart: bool,
    max_file_workers: int,
) -> None:
    def upload_one(file_path: str) -> UploadFileResult:
        client = _api_client(args.token)
        tracker = FileProgressTracker(display, file_path) if display is not None else None
        existing = sessions.get(file_path)
        return upload_file_direct(
            client,
            args.api_url,
            args.broker_submission_id,
            file_path,
            progress=tracker,
            upload_session=existing,
            restart_multipart=restart_multipart,
        )

    def _record_result(fp: str, result: UploadFileResult) -> None:
        if result.session is not None:
            sessions[fp] = result.session
        if result.success:
            if fp in failed:
                failed.remove(fp)
            errors.pop(fp, None)
        else:
            if fp not in failed:
                failed.append(fp)
            if result.error:
                errors[fp] = result.error

    if max_file_workers == 1:
        for fp in paths:
            _record_result(fp, upload_one(fp))
    else:
        with ThreadPoolExecutor(max_workers=max_file_workers) as pool:
            future_map = {pool.submit(upload_one, fp): fp for fp in paths}
            for fut in as_completed(future_map):
                _record_result(future_map[fut], fut.result())


def _resolve_sync_paths(
    args: argparse.Namespace,
) -> Tuple[List[str], bool, Dict[str, FileUploadSession], Dict[str, str]]:
    """
    Return (paths, resume_from_state, sessions, errors).

    ``resume_from_state`` is True when ``--input`` was used: only failed paths are
    uploaded and the first pass uses the same restart rules as an in-run retry round.
    """
    if not args.path and not args.input:
        raise SystemExit("Pass a file or directory path to upload and/or --input with a prior state file.")

    if args.input:
        state_failed, state_sessions, state_errors = _load_upload_state(
            args.input,
            broker_submission_id=args.broker_submission_id,
            api_url=args.api_url,
        )
        if not state_failed:
            raise SystemExit(f"No failed paths in state file: {args.input}")
        if args.path:
            folder_paths = collect_upload_paths(args.path, recursive=args.recursive)
            folder_set = {_normalize_path(p) for p in folder_paths}
            paths = [p for p in state_failed if p in folder_set]
            if not paths:
                raise SystemExit(
                    "No paths from --input state match the given path "
                    "(check path, --recursive, and absolute paths in the state file)."
                )
            skipped = len(state_failed) - len(paths)
            if skipped:
                logger.info(
                    "Resume: %d of %d failed path(s) from state match the given path (%d skipped)",
                    len(paths),
                    len(state_failed),
                    skipped,
                )
        else:
            paths = list(state_failed)
        missing = [p for p in paths if not os.path.isfile(p)]
        if missing:
            raise SystemExit(f"State file lists missing local file(s): {missing[0]}" + (f" (+{len(missing)-1})" if len(missing) > 1 else ""))
        sessions = {fp: state_sessions[fp] for fp in paths if fp in state_sessions}
        errors = {fp: state_errors[fp] for fp in paths if fp in state_errors}
        return paths, True, sessions, errors

    paths = collect_upload_paths(args.path, recursive=args.recursive)
    return [_normalize_path(p) for p in paths], False, {}, {}


def _cmd_sync(args: argparse.Namespace) -> None:
    paths, resume_from_state, sessions, errors = _resolve_sync_paths(args)
    base = _api_base(args.api_url)
    api_url_normalized = normalize_site_api_base(args.api_url)
    total_files = len(paths)
    total_bytes = sum(os.path.getsize(p) for p in paths)
    max_file_workers = DEFAULT_MAX_FILE_WORKERS
    global _active_part_retries, _active_part_retry_delay_s
    _active_part_retries = DEFAULT_PART_RETRIES
    _active_part_retry_delay_s = PART_RETRY_DELAY_S
    file_retry_rounds = DEFAULT_FILE_RETRY_ROUNDS

    display = SyncProgressDisplay(total_files=total_files, total_bytes=total_bytes)
    display.begin_sync()

    failed: List[str] = list(paths) if resume_from_state else []
    exit_code = 0

    if resume_from_state:
        with_session = sum(1 for fp in paths if fp in sessions)
        logger.info(
            "Resume from %s: %d file(s) (%d with session → restart-multipart, %d without → start-uploads)",
            args.input,
            len(paths),
            with_session,
            len(paths) - with_session,
        )

    try:
        if resume_from_state:
            logger.info("Resume pass: %d file(s)", len(paths))
        else:
            logger.info("Upload pass 1: %d file(s)", len(paths))
        _run_upload_pass(
            paths,
            args,
            display=display,
            sessions=sessions,
            failed=failed,
            errors=errors,
            restart_multipart=resume_from_state,
            max_file_workers=max_file_workers,
        )

        for round_idx in range(file_retry_rounds):
            if not failed:
                break
            delay = DEFAULT_FILE_RETRY_DELAYS_S[round_idx]
            logger.info(
                "Retry round %d/%d for %d failed file(s) in %.0fs",
                round_idx + 1,
                file_retry_rounds,
                len(failed),
                delay,
            )
            time.sleep(delay)
            retry_paths = list(failed)
            _run_upload_pass(
                retry_paths,
                args,
                display=display,
                sessions=sessions,
                failed=failed,
                errors=errors,
                restart_multipart=True,
                max_file_workers=max_file_workers,
            )
    finally:
        display.finish_sync()
        if args.output:
            state = _build_upload_state(
                broker_submission_id=args.broker_submission_id,
                api_url=api_url_normalized,
                failed=failed,
                sessions=sessions,
                errors=errors,
            )
            _write_upload_state(args.output, state)

    succeeded = total_files - len(failed)
    logger.info("Finished: %d/%d file(s) uploaded.", succeeded, total_files)
    if failed:
        logger.error("Failed file(s):")
        for fp in failed:
            err = errors.get(fp, "")
            if err:
                logger.error("  %s — %s", fp, err)
            else:
                logger.error("  %s", fp)
            if fp not in sessions:
                logger.error("    (no upload session — will use start-uploads on next resume)")
            else:
                logger.error(
                    "    (session cloud_upload_pk=%s — will use restart-multipart on next resume)",
                    sessions[fp].cloud_upload_pk,
                )
        exit_code = 1

    if exit_code:
        raise SystemExit(exit_code)

    root = base.rstrip("/")
    logger.info("%s/edit/%s", root, args.broker_submission_id)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Upload submission files via direct multipart (start-uploads + part URLs + complete).",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_sync = sub.add_parser(
        "sync",
        help="Upload files under one PATH (file or directory; same flow as the profile UI).",
    )
    p_sync.add_argument(
        "--api-url",
        default=os.environ.get("API_BASE", ""),
        help="Site root (trailing /api is stripped)",
    )
    p_sync.add_argument("--broker-submission-id", required=True)
    p_sync.add_argument("--token", default=os.environ.get("API_TOKEN", ""), help="Token (or set API_TOKEN)")
    p_sync.add_argument(
        "path",
        nargs="?",
        metavar="PATH",
        help="File or directory to upload (optional with --input alone)",
    )
    p_sync.add_argument(
        "--output",
        metavar="FILE",
        help="Write JSON state (failed, sessions, errors) after the run",
    )
    p_sync.add_argument(
        "--input",
        metavar="FILE",
        help="Resume: upload only failed paths from a prior --output file; optional path filters to a file or folder",
    )
    p_sync.add_argument("--recursive", action="store_true", help="Recurse into directories")
    p_sync.set_defaults(func=_cmd_sync)

    return parser


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s %(message)s",
        stream=sys.stderr,
    )
    parser = _build_parser()
    args = parser.parse_args()
    try:
        args.func(args)
    except HttpError as e:
        logger.error("HTTP error: %s", e)
        if e.response is not None and e.response.text:
            logger.error("Body: %s", e.response.text[:2000])
        raise SystemExit(1) from e
    except (OSError, ValueError, RuntimeError, KeyError) as e:
        logger.error("%s", e)
        raise SystemExit(1) from e


if __name__ == "__main__":
    main()

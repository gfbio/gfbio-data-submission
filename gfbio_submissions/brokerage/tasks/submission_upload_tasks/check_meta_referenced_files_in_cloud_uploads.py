import logging
import os
import tempfile
from collections import Counter

import requests
from kombu.utils import json

from config.celery_app import app

from ...models.submission import Submission
from ...models.submission_cloud_upload import SubmissionCloudUpload
from ...models.task_progress_report import TaskProgressReport
from ...utils.csv import parse_molecular_csv_with_encoding_detection
from ..submission_task import SubmissionTask

logger = logging.getLogger(__name__)


def _normalize_filename(name):
    if name is None:
        return ""
    # normalize by stripping and using only the basename
    return os.path.basename(name.strip())


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_meta_referenced_files_in_cloud_uploads_task",
)
def check_meta_referenced_files_in_cloud_uploads_task(self, previous_task_result=None, submission_id=None):
    # Create initial report entry
    report, created = TaskProgressReport.objects.create_initial_report(submission=None, task=self)

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "check_meta_referenced_files_in_cloud_uploads_task | previous task reported=CANCELLED | submission_id=%s",
            submission_id,
        )
        return TaskProgressReport.CANCELLED

    try:
        submission = Submission.objects.get(pk=submission_id)
    except Submission.DoesNotExist:
        logger.error(
            "check_meta_referenced_files_in_cloud_uploads_task | submission does not exist | submission_id=%s",
            submission_id,
        )
        return TaskProgressReport.CANCELLED

    report.submission = submission
    report.save()

    # Find meta CSV among cloud uploads
    meta_qs = SubmissionCloudUpload.objects.filter(submission=submission, meta_data=True).order_by("-modified")
    if meta_qs.count() == 0:
        msg = "No meta CSV cloud upload found for this submission"
        logger.error(
            "check_meta_referenced_files_in_cloud_uploads_task | %s | submission_id=%s",
            msg,
            submission_id,
        )
        report.task_exception_info = json.dumps({"error": msg})
        report.save()
        return TaskProgressReport.CANCELLED
    if meta_qs.count() > 1:
        pks = list(meta_qs.values_list("pk", flat=True))
        msg = f"Multiple meta CSV cloud uploads found: {pks}"
        logger.error(
            "check_meta_referenced_files_in_cloud_uploads_task | %s | submission_id=%s",
            msg,
            submission_id,
        )
        report.task_exception_info = json.dumps({"error": msg, "meta_upload_ids": pks})
        report.save()
        return TaskProgressReport.CANCELLED
    meta_upload = meta_qs.first()
    if meta_upload.file_upload is None or not meta_upload.file_upload.uploaded_file.url:
        msg = "Meta CSV cloud upload has no associated file or url"
        logger.error(
            "check_meta_referenced_files_in_cloud_uploads_task | %s | submission_id=%s",
            msg,
            submission_id,
        )
        report.task_exception_info = json.dumps({"error": msg, "meta_upload_id": meta_upload.pk})
        report.save()
        return TaskProgressReport.CANCELLED

    # Download meta CSV to temp file and parse
    with tempfile.NamedTemporaryFile() as tf:
        with requests.get(meta_upload.file_upload.uploaded_file.url, stream=True) as r:
            r.raise_for_status()
            tf.write(r.content)
            tf.flush()
            molecular_requirements = parse_molecular_csv_with_encoding_detection(tf.name, submission)

    # Collect referenced filenames from experiments (forward and reverse)
    referenced_files = []
    for experiment in molecular_requirements.get("experiments", []):
        files = experiment.get("files", {})
        fwd = _normalize_filename(files.get("forward_read_file_name", ""))
        rev = _normalize_filename(files.get("reverse_read_file_name", ""))
        if fwd:
            referenced_files.append(fwd)
        if rev:
            referenced_files.append(rev)

    # Detect duplicates in CSV references
    counts = Counter(referenced_files)
    duplicates_in_csv = sorted([name for name, cnt in counts.items() if cnt > 1])

    # Existing cloud-uploaded filenames for this submission (exclude the meta CSV itself)
    uploaded_names = set()
    meta_basename = _normalize_filename(meta_upload.file_upload.original_filename if meta_upload.file_upload else "")
    for upload in SubmissionCloudUpload.objects.filter(submission=submission):
        # skip meta csv uploads
        if upload.meta_data:
            continue
        if upload.file_upload and upload.file_upload.original_filename:
            normalized_name = _normalize_filename(upload.file_upload.original_filename)
            if normalized_name == meta_basename:
                # also skip identical name to the meta file just in case
                continue
            uploaded_names.add(normalized_name)

    referenced_set = set(referenced_files)
    missing = sorted(list(referenced_set - uploaded_names))
    extra_uploads = sorted(list(uploaded_names - referenced_set))

    result = {
        "submission_id": submission_id,
        "meta_cloud_upload_id": meta_upload.pk,
        "total_referenced": len(referenced_set),
        "total_uploaded": len(uploaded_names),
        "found": sorted(list(referenced_set & uploaded_names)),
        "missing": missing,
        "duplicates_in_csv": duplicates_in_csv,
        "extra_uploads": extra_uploads,
    }

    logger.info(
        "check_meta_referenced_files_in_cloud_uploads_task | submission_id=%s | result=%s",
        submission_id,
        result,
    )

    return result

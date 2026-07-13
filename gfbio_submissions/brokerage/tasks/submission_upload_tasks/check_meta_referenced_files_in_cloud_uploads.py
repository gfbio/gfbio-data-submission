import logging
import os
import requests
import tempfile

from collections import Counter
from kombu.utils import json
from config.celery_app import app
from dt_upload.models import FileUploadRequest

from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import get_submission_and_site_configuration

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


BAD_STATES = [
    {
        "key": "file_upload_missing",
        "headline": "The Cloud-Upload was created, but no file provided:",
    },
    {
        "key": f"file_upload_state_{FileUploadRequest.PENDING}",
        "headline": "Not completely uploaded by the submitter:",
    },
    {
        "key": f"file_upload_state_{FileUploadRequest.FAILED}",
        "headline": "Ran into errors during upload:",
    },
    {
        "key": f"cloud_upload_state_{SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_BAD_CHECKSUM}",
        "headline": "After transfer to ENA the checksum-check failed:",
    },
    {
        "key": f"cloud_upload_state_{SubmissionCloudUpload.STATUS_IS_TRANSFERRED}",
        "headline": "After transfer to ENA the checksum-check wasn't executed:",
    },
    {
        "key": f"cloud_upload_state_{SubmissionCloudUpload.STATUS_TRANSFER_FAILED}",
        "headline": "Transfer to ENA failed:",
    },
    {
        "key": f"cloud_upload_state_{SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM}",
        "headline": "After upload to us the checksum-check failed:",
    },
    {
        "key": f"cloud_upload_state_{SubmissionCloudUpload.STATUS_UPLOADED}",
        "headline": "After upload to us the checksum-check wasn't executed:",
    },
    {
        "key": f"cloud_upload_state_{SubmissionCloudUpload.STATUS_NEW}",
        "headline": "Not properly processed after upload:",
    },
]


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

    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.error(
            "check_meta_referenced_files_in_cloud_uploads_task | submission does not exist | submission_id=%s",
            submission_id,
        )
        return TaskProgressReport.CANCELLED

    report.submission = submission
    report.save()

    # Find meta CSV among cloud uploads
    meta_qs = SubmissionCloudUpload.objects.exclude(status=SubmissionCloudUpload.STATUS_DELETED).filter(submission=submission, meta_data=True).order_by("-modified")
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

    upload_report = generate_upload_report(submission, meta_upload, referenced_files)

    logger.info(
        "check_meta_referenced_files_in_cloud_uploads_task | submission_id=%s | result=%s",
        submission_id,
        upload_report,
    )

    jira_message = generate_jira_message(upload_report)
    send_completeness_report_to_jira(submission, site_configuration, jira_message)
    return upload_report


def generate_upload_report(submission, meta_upload, referenced_files):
    # Detect duplicates in CSV references
    counts = Counter(referenced_files)
    duplicates_in_csv = sorted([name for name, cnt in counts.items() if cnt > 1])

    # Existing cloud-uploaded filenames for this submission (exclude the meta CSV itself)
    uploaded = []
    for upload in SubmissionCloudUpload.objects.filter(submission=submission, meta_data=False).exclude(
            status=SubmissionCloudUpload.STATUS_DELETED
        ).filter(file_upload__status=FileUploadRequest.COMPLETED):
        if upload.file_upload and upload.file_upload.original_filename:
            normalized_name = _normalize_filename(upload.file_upload.original_filename)
            uploaded.append({"name": normalized_name, "status": upload.status})

    referenced_set = set(referenced_files)
    missing = sorted(list(referenced_set - {file["name"] for file in uploaded}))
    extra_uploads = [file for file in uploaded if file["name"] not in referenced_set]
    uploaded = [file for file in uploaded if file["name"] in referenced_set]
    uploads_with_issues = [
        file for file in uploaded 
        if file["status"] not in [
            SubmissionCloudUpload.STATUS_UPLOADED_WITH_CHECKED_CHECKSUM,
            SubmissionCloudUpload.STATUS_IS_TRANSFERRED_WITH_CHECKED_CHECKSUM
        ]
    ]

    return {
        "submission_id": submission.pk,
        "meta_cloud_upload_id": meta_upload.pk,
        "meta_cloud_upload_name": f"{meta_upload}",
        "total_referenced": len(referenced_set),
        "total_uploaded": len(uploaded),
        "found": uploaded,
        "found_with_problems": group_uploads_by_status(uploads_with_issues),
        "missing": missing,
        "duplicates_in_csv": duplicates_in_csv,
        "extra_uploads": extra_uploads,
        "uploads_in_bad_state": gather_uploads_in_bad_state(submission),
    }


def gather_uploads_in_bad_state(submission):
    uploads_in_bad_state = {}
    for upload in SubmissionCloudUpload.objects.filter(submission=submission, meta_data=False).exclude(
            status=SubmissionCloudUpload.STATUS_DELETED
        ).exclude(
            file_upload__status=FileUploadRequest.COMPLETED
        ):
        key = "file_upload_missing"
        file_name = f"Submission-upload {upload.pk}"
        if upload.file_upload:
            key = f"file_upload_state_{upload.file_upload.status}"
            file_name = _normalize_filename(upload.file_upload.original_filename)
        if key not in uploads_in_bad_state:
            uploads_in_bad_state[key] = []
        uploads_in_bad_state[key].append(file_name)
    return uploads_in_bad_state


def group_uploads_by_status(uploads):
    uploads_in_bad_state = {}
    for upload in uploads:
        key = f"cloud_upload_state_{upload['status']}"
        if key not in uploads_in_bad_state:
            uploads_in_bad_state[key] = []
        uploads_in_bad_state[key].append(_normalize_filename(upload['name']))
    
    return uploads_in_bad_state


def generate_jira_message(result):
    jira_message = f"Check for referenced files in csv-meta-file was executed for '{result['meta_cloud_upload_name']}' "
    if result['missing'] or result['duplicates_in_csv'] or result['found_with_problems']:
        jira_message = "{color:#de350b}" + jira_message + "with errors! {color}"
    elif result['extra_uploads'] or result['uploads_in_bad_state']:
        jira_message = "{color:#ff8b00}" + jira_message + "with warnings {color}"
    else:
        jira_message = "{color:#00875a}" + jira_message + "successfully {color}"
    
    jira_message = f"h3. {jira_message} \n\n"
    jira_message += f"Files in csv: {result['total_referenced']} | files uploaded: {result['total_uploaded']}\n\n"

    if result['duplicates_in_csv']:
        jira_message += "h4. The following files are referenced multiple times in the csv:\n"
        jira_message += "\n".join([f"- {file}" for file in result['duplicates_in_csv']]) + "\n\n"

    if result['found_with_problems']:
        jira_message += "h4. Files that were uploaded and referenced, but ran into problems:\n"
        jira_message += append_problems_grouped(result['found_with_problems'])

    if result['missing']:
        jira_message += "h4. Files missing (referenced in csv, but were not uploaded or have issues):\n"
        jira_message += "\n".join([f"- {file}" for file in result['missing']]) + "\n\n"

    if result['extra_uploads']:
        jira_message += "h4. Files that were uploaded, but not referenced in the csv:\n"
        jira_message += "\n".join([f"- {file['name']}" for file in result['extra_uploads']]) + "\n\n"
    
    if result['uploads_in_bad_state']:
        jira_message += "h4. Some files ran into problems while being processed (please check them and set their state to DELETED if no loger of concern):\n"
        jira_message += append_problems_grouped(result['uploads_in_bad_state'])
    return jira_message


def send_completeness_report_to_jira(submission, site_configuration, jira_message):
    jira_client = JiraClient(resource=site_configuration.helpdesk_server)
    reference = submission.get_primary_helpdesk_reference()
    jira_client.add_comment(key_or_issue=reference.reference_key, text=jira_message, is_internal=True)


def append_problems_grouped(uploads):
    jira_message = ""
    for state in BAD_STATES:
        if state['key'] in uploads:
            jira_message += state['headline'] + "\n"
            jira_message += "\n".join([f"- {file}" for file in uploads[state['key']]]) + "\n\n"
    for key in uploads:
        if key not in [state["key"] for state in BAD_STATES]:
            jira_message += f"Some files have the unexpected state {key} (please maybe contact an Admin about this): \n"
            jira_message += "\n".join([f"- {file}" for file in uploads[key]]) + "\n\n"
    return jira_message

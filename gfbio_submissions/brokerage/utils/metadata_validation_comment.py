from django.conf import settings
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport


def should_post_metadata_validation_jira_comment(report: MetadataValidationReport) -> bool:
    """Post validation results to Jira when the report has a known trigger user."""
    return report.triggered_by_id is not None


def is_internal_metadata_validation_jira_comment(report: MetadataValidationReport) -> bool:
    """Internal comments hide validation results from the submitter (e.g. curator/admin checks)."""
    submitter_id = report.submission.user_id
    triggered_by_id = report.triggered_by_id

    if submitter_id is None:
        return True

    triggered_by_submitter = triggered_by_id == submitter_id
    if triggered_by_submitter:
        return False

    return True


def build_metadata_validation_report_comment(report: MetadataValidationReport) -> str:
    upload_file = report.upload_file
    filename = "-"
    if upload_file.file_upload and upload_file.file_upload.original_filename:
        filename = upload_file.file_upload.original_filename


    findings = []
    for task_report in report.taskreport_set:
        findings.extend(list(task_report.validationfinding_set.all()))

    error_count = sum(1 for finding in findings if finding.status == "ERROR")
    warning_count = sum(1 for finding in findings if finding.status == "WARNING")
    info_count = sum(1 for finding in findings if finding.status == "INFO")

    report_path = f"{settings.HOST_URL_ROOT}/validations/{report.submission.broker_submission_id}/validation-reports/{report.pk}/"
    lines = [
        f"Metadata validation report ready for file {filename} ({report.file_md5_checksum})",
        "Summary:",
        f"ERRORS: {error_count}",
        f"WARNINGS: {warning_count}",
        f"INFOS: {info_count}",
        "",
        f"You can see the complete validation report here: {report_path}",
        "",
    ]
    if error_count > 0:
        lines.append("Please fix the issues and upload an updated metadata file.")
    elif warning_count > 0:
        lines.append("Please review the warnings and consider improving your metadata file before continuing.")
    elif info_count > 0:
        lines.append("Please review the infos above before continuing.")
    else:
        lines.append("The mandatory metadata checks completed without errors. Your submission should be ready to continue.")

    return "\n".join(lines).strip()

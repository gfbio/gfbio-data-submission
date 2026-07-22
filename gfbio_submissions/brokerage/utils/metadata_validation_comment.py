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

    task_reports = report.validationtaskreport_set.prefetch_related("validationfinding_set").order_by("created")
    findings = []
    for task_report in task_reports:
        findings.extend(list(task_report.validationfinding_set.all()))

    has_errors = any(task_report.status == "ERROR" for task_report in task_reports) or any(
        finding.status == "ERROR" for finding in findings
    )
    has_warnings = any(task_report.status == "WARNING" for task_report in task_reports) or any(
        finding.status == "WARNING" for finding in findings
    )
    has_issues = has_errors or has_warnings

    if has_errors:
        summary_status = "errors found"
    elif has_warnings:
        summary_status = "warnings found"
    else:
        summary_status = "no errors found"

    lines = [
        "Metadata validation report",
        "",
        f"File: {filename}",
        f"Result: {summary_status}",
        "",
    ]

    if not task_reports.exists():
        lines.append("No validation checks were recorded for this metadata file.")
    elif has_issues:
        for task_report in task_reports:
            lines.append(f"{task_report.task_name} ({task_report.status})")
            task_findings = list(task_report.validationfinding_set.all())
            if not task_findings:
                lines.append("- No issues reported.")
            else:
                for finding in task_findings:
                    location_parts = []
                    if finding.row is not None:
                        location_parts.append(f"row {finding.row}")
                    if finding.column_name:
                        location_parts.append(f"column '{finding.column_name}'")
                    elif finding.column is not None:
                        location_parts.append(f"column {finding.column}")
                    location = ", ".join(location_parts)
                    prefix = f"- {location}: " if location else "- "
                    help_text = ""
                    if finding.help_text:
                        help_text = f" ({finding.help_text})"
                    lines.append(f"{prefix}{finding.message}{help_text}")
            lines.append("")

    if has_errors:
        lines.append("Please fix the issues above and upload an updated metadata file.")
    elif has_warnings:
        lines.append("Please review the warnings above before continuing.")
    else:
        lines.append("The mandatory metadata checks completed without errors.")

    return "\n".join(lines).strip()

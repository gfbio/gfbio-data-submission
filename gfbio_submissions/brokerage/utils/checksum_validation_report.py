from gfbio_submissions.brokerage.models.checksum_validation_report import ChecksumFileResult, ChecksumValidationReport
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload


def get_checksum_validation_report(submission_id):
    uploads = SubmissionCloudUpload.objects.filter(
        submission__broker_submission_id=submission_id,
    ).exclude(
        status=SubmissionCloudUpload.STATUS_DELETED
    )
    
    checksum_report = ChecksumValidationReport()
    
    error_count = 0
    warning_count = 0
    pending_count = 0
    success_count = 0

    for upload in uploads:
        if upload.file_upload is None or upload.file_upload.status == "FAILED":
            warning_count = warning_count + 1
            checksum_report.checksumfileresults.append(
                ChecksumFileResult(
                    upload_pk = upload.pk,
                    file_name = "Unknown",
                    file_md5_checksum = "Unknown",
                    status = "WARNING",
                    message = "The file was not uploaded correctly."
                )
            )
        elif upload.status == SubmissionCloudUpload.STATUS_UPLOADED_WITH_BAD_CHECKSUM:
            error_count = error_count + 1
            checksum_report.checksumfileresults.append(
                ChecksumFileResult(
                    upload_pk = upload.pk,
                    file_name = upload.file_upload.original_filename,
                    file_md5_checksum = upload.file_upload.md5,
                    status = "ERROR",
                    message = "The checksum missmatched."
                )
            )
        elif upload.status in [SubmissionCloudUpload.STATUS_UPLOADED, SubmissionCloudUpload.STATUS_ACTIVE, SubmissionCloudUpload.STATUS_NEW] or upload.file_upload.status == "PENDING":
            pending_count = pending_count + 1
            checksum_report.checksumfileresults.append(
                ChecksumFileResult(
                    upload_pk = upload.pk,
                    file_name = upload.file_upload.original_filename,
                    file_md5_checksum = upload.file_upload.md5,
                    status = "PENDING",
                    message = "The checksum-calculation was not executed yet."
                )
            )
        else:
            success_count = success_count + 1
            checksum_report.checksumfileresults.append(
                ChecksumFileResult(
                    upload_pk = upload.pk,
                    file_name = upload.file_upload.original_filename,
                    file_md5_checksum = upload.file_upload.md5,
                    status = "SUCCESS",
                    message = "The checksums matched."
                )
            )

    checksum_report.error_count = error_count
    checksum_report.warning_count = warning_count
    checksum_report.success_count = success_count
    checksum_report.pending_count = pending_count

    checksum_report.status = "ERROR" if error_count > 0 else "WARNING" if warning_count > 0 else "PENDING" if pending_count > 0 else "SUCCESS"

    checksum_report.message = f"There are {error_count} failed checksum validations. " if error_count > 0 else ""
    checksum_report.message += f"There are {pending_count} pending checksum validations. " if pending_count > 0 else ""
    checksum_report.message += f"{success_count} files were validated successfully. " if success_count > 0 and (error_count != 0 or pending_count != 0) else ""
    checksum_report.message += f"Try upload the failed files again or contact the curator of the problem persists. " if error_count > 0 else ""
    checksum_report.message += f"Give the pending files some time to be validated or contact the curator if the problem persists. " if pending_count > 0 else ""
    checksum_report.message += f"All files were validated successfully. " if success_count > 0 and error_count == 0 and pending_count == 0 else ""
    
    return checksum_report
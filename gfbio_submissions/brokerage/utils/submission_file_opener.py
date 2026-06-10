import os
from django.conf import settings
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.models.submission_upload import SubmissionUpload
from gfbio_submissions.brokerage.utils.csv_format import sniff_encoding


class FileOpener:
    def get_metadata_files(self, submission):
        pass

    def get_files_by_file_ending(self, submission):
        pass

    def is_csv(self, metadata_file):
        pass

    def csv_reader(self, metadata_file):
        pass


class SubmissionCloudUploadOpener(FileOpener):
    def get_metadata_files(self, submission):
        return submission.submissioncloudupload_set.exclude(status=SubmissionCloudUpload.STATUS_DELETED).filter(meta_data=True)

    def get_files_by_file_ending(self, submission, file_ending):
        return submission.submissioncloudupload_set.exclude(status=SubmissionCloudUpload.STATUS_DELETED).filter(file_upload__original_filename__endswith=file_ending)

    def is_csv(self, metadata_file):
        return metadata_file.file_upload.original_filename.endswith(".csv")

    def csv_reader(self, submission_cloud_upload):
        file_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{submission_cloud_upload.file_upload.file_key}"
        encoding = sniff_encoding(file_path)
        return open(file_path, "r", encoding=encoding)


class SubmissionUploadOpener(FileOpener):
    def get_metadata_files(self, submission):
        return submission.submissionupload_set.filter(meta_data=True)

    def get_files_by_file_ending(self, submission, file_ending):
        return submission.submissionupload_set.filter(file__endswith=file_ending)

    def is_csv(self, metadata_file):
        return metadata_file.file.name.endswith(".csv")
    
    def csv_reader(self, submission_upload):
        # Converged onto the shared encoding strategy (sniff_encoding) so local
        # uploads detect Windows-1252 etc. like cloud uploads do, instead of
        # hardcoding "utf-8-sig". Deliberate behaviour change - see DASS-3563.
        file_path = submission_upload.file.path
        encoding = sniff_encoding(file_path)
        return open(file_path, "r", encoding=encoding, newline="")


def create_submission_file_opener(submission):
    return SubmissionCloudUploadOpener() if submission.submissioncloudupload_set.count() > 0 else SubmissionUploadOpener()

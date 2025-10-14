import csv
import os
import requests

from django.conf import settings
from django.utils.encoding import smart_str

from gfbio_submissions.brokerage.configuration.settings import ENA_TAXONOMY_URL_PREFIX
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.models.submission_upload import SubmissionUpload
from gfbio_submissions.brokerage.utils.encodings import sniff_encoding


class SubmittableDataHandler():
    def __init__(self, file_opener):
        self.messages = []
        self.file_opener = file_opener

    def run_taxons_are_submittable_check(self, submission):
        self.messages = []
        metadata_files = self.file_opener.get_metadata_files(submission)
        if not metadata_files:
            return True
        metadata_file = self.get_metadata_file(metadata_files)
        if self.messages or not self.check_file_is_csv(metadata_file):
            return False
        with self.file_opener.csv_reader(metadata_file) as file:
            data_to_check = self.get_data(file)
            if self.messages:
                return False
            status = self.run_check(data_to_check)
        return status
    
    def run_check(self, data_to_check):
        status = True
        not_submittable = []
        for data in data_to_check:
            is_submittable = self.query_ena(data)
            if not is_submittable:
                status = False
                not_submittable.append(data)

        if not status:
            self.append_error_message(not_submittable)
        return status
    
    def check_file_is_csv(self, metadata_file):
        if not self.file_opener.is_csv(metadata_file):
            self.messages.append("Invalid file format. Meta data file must be in CSV format.")
            return False
        return True
    
    def get_metadata_file(self, metadata_files):
        return []
            
    def query_ena(self, data):
        return True
    
    def append_error_message(self, erroneous_data):
        pass

    def get_data(self, csv_file):
        pass


class SubmittableTaxIdHandler(SubmittableDataHandler):
    def get_metadata_file(self, metadata_files):
        metadata_file = metadata_files.first()
        if not metadata_file:
            self.messages.append("No metadata-file available to check tax-ids are submittable to ENA.")
        return metadata_file
    
    # query ENA for the taxid and check if the result is submittable
    def query_ena(self, taxid):
        url = ENA_TAXONOMY_URL_PREFIX + "tax-id/" + taxid
        response = requests.get(url)
        if response.status_code == 200:
            response = response.json()
            if response["submittable"] == "true":
                return True
            else:
                return False
        return False

    def append_error_message(self, erroneous_data):
        self.messages.append(f"Data with the following taxon ids is not submittable: {','.join(erroneous_data)}")


    # parse meta data file for unique tax ids
    def get_data(self, file):
        tax_ids = set()
        dialect = csv.Sniffer().sniff(file.read(20))
        file.seek(0)
        csv_reader = csv.DictReader(file, dialect=dialect)
        for row in csv_reader:
            tax_id = row.get("taxon_id", "")
            if tax_id:
                tax_ids.add(tax_id)
        return tax_ids


class SubmittableScientificNameHandler(SubmittableDataHandler):
    def get_metadata_file(self, metadata_files):
        specimen_cols = ["specimen identifier", "basis of record", "scientific name"]
        for meta_data_file in metadata_files:
            with self.file_opener.csv_reader(meta_data_file) as file:
                line = file.readline()
                dialect = csv.Sniffer().sniff(smart_str(line))
                delimiter = dialect.delimiter if dialect.delimiter in [",", ";", "\t"] else ";"
                splitted = line.replace('"', "").lower().split(delimiter)
                if all(col in splitted for col in specimen_cols):
                    return meta_data_file
        self.messages.append("No metadata-file available to check scientific names are submittable to ENA.")
        return None
    
    # query ENA for the scientific name and check if the result is submittable
    def query_ena(self, scientific_name):
        url = ENA_TAXONOMY_URL_PREFIX + "scientific-name/" + requests.utils.quote(scientific_name)
        response = requests.get(url)
        if response.status_code == 200:
            response = response.json()
            if response and response[0]["submittable"] == "true":
                return True
        return False
    
    def append_error_message(self, erroneous_data):
        self.messages.append(f"Data with the following scientific names is not submittable: {','.join(erroneous_data)}")

    # parse meta data file for unique scientific names
    def get_data(self, file):
        scientific_names = set()
        dialect = csv.Sniffer().sniff(file.read(20))
        delimiter = dialect.delimiter if dialect.delimiter in [",", ";", "\t"] else ","
        file.seek(0)
        csv_reader = csv.DictReader(file, dialect=dialect, delimiter=delimiter, quoting=csv.QUOTE_ALL)
        csv_reader.fieldnames = [field.strip().lower() for field in csv_reader.fieldnames]
        for row in csv_reader:
            scientific_name = row.get("scientific name", "")
            if scientific_name:
                scientific_names.add(scientific_name)
        return scientific_names


class FileOpener:
    def get_metadata_files(self, submission):
        pass

    def is_csv(self, metadata_file):
        pass

    def csv_reader(self, metadata_file):
        pass


class SubmissionCloudUploadOpener(FileOpener):
    def get_metadata_files(self, submission):
        return submission.submissioncloudupload_set.exclude(status=SubmissionCloudUpload.STATUS_DELETED).filter(meta_data=True)
    
    def is_csv(self, metadata_file):
        return metadata_file.file_upload.original_filename.endswith(".csv")

    def csv_reader(self, submission_cloud_upload):
        file_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{submission_cloud_upload.file_upload.file_key}"
        encoding = sniff_encoding(file_path)
        return open(file_path, "r", encoding=encoding)


class SubmissionUploadOpener(FileOpener):
    def get_metadata_files(self, submission):
        return submission.submissionupload_set.filter(meta_data=True)

    def is_csv(self, metadata_file):
        return metadata_file.file.name.endswith(".csv")
    
    def csv_reader(self, submission_upload):
        return open(submission_upload.file.path, "r", encoding="utf-8-sig", newline="")
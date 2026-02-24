import csv
import logging
import os

from django.utils.encoding import smart_str

from gfbio_submissions.brokerage.configuration.settings import ENA, ENA_PANGAEA, SUBMISSION_MIN_COLS
from gfbio_submissions.brokerage.utils.csv import parse_molecular_csv
from gfbio_submissions.brokerage.utils.schema_validation import validate_data_full

logger = logging.getLogger(__name__)

class MolecularContentChecker():
    def __init__(self, submission, file_opener):
        self.submission = submission
        self.file_opener = file_opener
        self.status = False
        self.messages = []
        self.infos = [] # The logging needed to be improved, but messages are relevant for the process, so 2nd message-collection for 
        self.check_performed = False


    def check_minimum_header_cols(self, cloud_upload_file):
        try:
            with self.file_opener.csv_reader(cloud_upload_file) as csv_file:
                line = csv_file.readline()
                dialect = csv.Sniffer().sniff(smart_str(line))
                delimiter = dialect.delimiter if dialect.delimiter in [",", ";", "\t"] else ";"
                splitted = line.replace('"', "").lower().split(delimiter)

                res = {col in splitted for col in SUBMISSION_MIN_COLS}
                if len(res) == 1 and (True in res):
                    return True
                else:
                    self.messages.append(f"Info: {cloud_upload_file} is not a valid file-list.")
                    return False
        except Exception as e:
            self.messages.append(f"Error: Exception on parsing file {cloud_upload_file}: {e}.")
            return False


    def check_metadata_rule(self):
        meta_data = self.file_opener.get_metadata_files(self.submission)
        if len(meta_data) == 1:
            if self.check_minimum_header_cols(meta_data.first()):
                return True
            else:
                self.messages.append(f"Warning: There is a file {meta_data.first} marked as meta-data, but invalid structured.")
                return False
        else:
            return False


    def check_csv_file_rule(self):
        csv_uploads = self.file_opener.get_files_by_file_ending(self.submission, ".csv")
        if len(csv_uploads):
            for csv_file in csv_uploads:
                is_meta = self.check_minimum_header_cols(csv_file)
                if is_meta:
                    csv_file.meta_data = True
                    csv_file.save()
                    self.messages.append(f"Info: File {csv_file} was recognized and marked as the meta-data-file.")
                    return is_meta
            return False
        else:
            return False

    def set_submission_target_to_ENA(self, rule):
        self.status = True
        self.check_performed = True
        self.submission.target = ENA
        self.submission.data.get("requirements", {})["data_center"] = "ENA – European Nucleotide Archive"
        self.submission.save()
        self.infos.append(f"Info: The submission-target was set to ENA, based on the {rule}")
        logger.info(
                msg="check_for_molecular_content  | {0} | "
                    "return status={1} messages={2} "
                    "molecular_data_check_performed={3}".format(rule, self.status, self.messages + self.infos, self.check_performed)
            )

    
    def run_check(self):
        logger.info(
            msg="check_for_molecular_content | "
                "process submission={0} | target={1} | release={2}"
                "".format(self.submission.broker_submission_id, self.submission.target, self.submission.release)
        )
        if self.check_metadata_rule():
            self.set_submission_target_to_ENA("check_metadata_rule")
        elif self.check_csv_file_rule():
            self.set_submission_target_to_ENA("check_csv_file_rule")
        else:
            self.infos.append("Info: There is no valid meta-data-file in this submission.")

        if self.submission.release and self.submission.data.get("requirements", {}).get("data_center", "").count("ENA"):
            self.check_performed = True
            self.submission.target = ENA
            self.submission.save()

            meta_data_files = self.file_opener.get_metadata_files(self.submission)
            no_of_meta_data_files = len(meta_data_files)

            if no_of_meta_data_files != 1:
                logger.info(
                    msg="check_for_molecular_content | "
                        "invalid no. of meta_data_files, {0} | return=False"
                        "".format(no_of_meta_data_files)
                )
                self.messages.append("invalid no. of meta_data_files, " "{0}".format(no_of_meta_data_files))
                return self.status, self.messages, self.check_performed, self.infos

            meta_data_file = meta_data_files.first()

            molecular_requirements = {}
            with self.file_opener.csv_reader(meta_data_file) as csv_reader:
                molecular_requirements = parse_molecular_csv(csv_reader, self.submission)
            self.submission.data.get("requirements", {}).update(molecular_requirements)

            path = os.path.join(os.getcwd(), "gfbio_submissions/brokerage/schemas/ena_requirements.json")
            valid, full_errors = validate_data_full(
                data=self.submission.data,
                target=ENA_PANGAEA,
                schema_location=path,
            )
            if valid:
                logger.info(msg="check_for_molecular_content | valid data from csv | return=True")
                self.status = True
            else:
                self.messages.append([e.message for e in full_errors])
                self.submission.data.update({"validation": self.messages})
                logger.info(msg="check_for_molecular_content  | invalid data from csv | return=False")

            self.submission.save()
            logger.info(
                msg="check_for_molecular_content  | finished | return status={0} "
                    "messages={1} molecular_data_check_performed={2}".format(self.status, self.messages, self.check_performed)
            )
        else:
            self.infos.append("Info: Since there were neither meta-data-files nor was the target ENA, this process "
                            "deemed it a non-molecular submission and no further checks were performed.")
        return self.status, self.messages, self.check_performed, self.infos
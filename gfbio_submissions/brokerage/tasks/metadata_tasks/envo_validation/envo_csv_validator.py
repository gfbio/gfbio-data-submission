from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.ontology_column_validator import OntologyColumnValidator
from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.ontology_matcher import MediumOntologyMatcher, OntologyMatcher
from gfbio_submissions.brokerage.utils.csv_format import open_csv_reader
from gfbio_submissions.brokerage.utils.ena_mandatory_fields import every_data_row_has_valid_sample_accession


class EnvoCsvValidator:
    broad_scale_column_name = "broad-scale environmental context"
    medium_column_name = "environmental medium"
    local_column_name = "local environmental context"

    def __init__(self, ontology_requester, validation_task_report):
        self.validation_task_report = validation_task_report
        self.broad_scale_ontology_matcher = OntologyMatcher(ontology_requester, root_name="biome", root="http://purl.obolibrary.org/obo/ENVO_00000428", ontology="ENVO")
        self.medium_ontology_matcher = MediumOntologyMatcher(ontology_requester, root_name="enviromental material", root="http://purl.obolibrary.org/obo/ENVO_00010483", ontology="ENVO")
        self.local_ontology_matcher = MediumOntologyMatcher(ontology_requester)
        self.messages = []


    def validate(self, meta_file_content):
        csv_reader, format = open_csv_reader(meta_file_content)
        if csv_reader.fieldnames:
            csv_reader.fieldnames = [
                field.strip().lower() if isinstance(field, str) else field for field in csv_reader.fieldnames
            ]
        rows = list(csv_reader)
        existing_samples_only = every_data_row_has_valid_sample_accession(rows)

        self.columns = [
            OntologyColumnValidator(self.broad_scale_column_name, self.validation_task_report, csv_reader, self.broad_scale_ontology_matcher), 
            OntologyColumnValidator(self.medium_column_name, self.validation_task_report, csv_reader, self.medium_ontology_matcher),
            OntologyColumnValidator(self.local_column_name, self.validation_task_report, csv_reader, self.local_ontology_matcher),
        ]

        if rows and not existing_samples_only:
            for column in self.columns:
                column.set_column_index()
        for row_number, row in enumerate(rows, start=2):
            for column in self.columns:
                column.validate_row_value(row, row_number=row_number)

        if self.validation_task_report.status == "PENDING":
            self.validation_task_report.status = "SUCCESS"
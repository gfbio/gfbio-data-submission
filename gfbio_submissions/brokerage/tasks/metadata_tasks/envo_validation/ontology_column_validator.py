import re


class OntologyColumnValidator:
    perfect_regex = re.compile(r"^\s*(?P<name>[\w]+(?:[\s\-][\w]+)*)\s*\[(?P<id>\w+:\d+)\]\s*$")
    minimum_regex = re.compile(r"^\s*(?P<name>[\w]+(?:[\s\-][\w]+)*)\s*$")

    def __init__(self, column_name, validation_task_report, csv_reader, ontology_matcher):
        self.column_name = column_name
        self.validation_task_report = validation_task_report
        self.column_index = None
        self.csv_reader = csv_reader
        self.ontology_matcher = ontology_matcher

    def set_column_index(self):
        if self.column_name in self.csv_reader.fieldnames:
            self.column_index = self.csv_reader.fieldnames.index(self.column_name) + 1
        else:
            self.create_error_finding(
                message=f"Column '{self.column_name}' is missing.",
                help_text=f"Please ensure the column '{self.column_name}' exists and there has a value set for every row in the column.",
                row = 1,
            )

    def validate_row_value(self, row):
        if self.column_index == None:
            return # No column with the name was found so skip
        envo_col_value = row.get(self.column_name, "")
        if not envo_col_value.strip():
            self.create_error_finding(
                message=f"Value for column '{self.column_name}' is missing.",
                help_text=f"Please ensure there is a value set for every row in column '{self.column_name}'."
            )
        else:
            envo_values = [val.strip() for val in envo_col_value.split("|") if val.strip()]
            if not envo_values:
                self.create_error_finding(
                    message=f"Value for column '{self.column_name}' is missing.",
                    help_text=f"Please ensure there is a value set for every row in column '{self.column_name}'."
                )
                return

            for envo_val in envo_values:
                provided_name, provided_id = self.split_envo_value(envo_val)
                if not provided_name:
                    continue
                envo_match, finding = self.ontology_matcher.get_match(provided_name, provided_id)
                if finding:
                    self.create_finding(
                        message=finding["msg"],
                        help_text=finding["help_text"],
                        status=finding["status"]
                    )
                    if finding["status"] == "ERROR":
                        continue
                if provided_id:
                    if provided_id != envo_match["id"]:
                        self.create_error_finding(
                            message=f"The provided id '{provided_id}' does not match the ENVO-id '{envo_match['id']}' we found for '{provided_name}'.",
                            help_text=f"Did you maybe meant '{provided_name} [{envo_match['id']}]'?"
                        )

    def create_error_finding(self, message, help_text, row=0):
        self.create_finding(message, help_text, row, status = "ERROR")

    def create_warning_finding(self, message, help_text, row=0):
        self.create_finding(message, help_text, row, status = "WARNING")

    def create_finding(self, message, help_text, row=0, status="ERROR"):
        if self.validation_task_report.status != "ERROR":
            self.validation_task_report.status = status
        self.validation_task_report.validationfinding_set.create(
            message=message, help_text=help_text, column_name=self.column_name, status=status,
            row=row if row > 0 else self.csv_reader.line_num,
            column=self.column_index if self.column_index else None,
        )

    def split_envo_value(self, value_to_split):
        matches = self.perfect_regex.match(value_to_split)
        if matches:
            return matches.group("name"), matches.group("id")
        else:
            matches = self.minimum_regex.match(value_to_split)
            if matches:
                return matches.group("name"), None
            else:
                self.create_error_finding(
                    f"'{value_to_split}' seems to be in an invalid format or it contains invalid characters.",
                    help_text="Please provide values in format 'the terminology [ONTO:12345]'."
                )
                return None, None
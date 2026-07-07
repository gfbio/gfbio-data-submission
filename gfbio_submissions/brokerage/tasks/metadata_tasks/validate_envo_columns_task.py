import logging

from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.ontology_requester import OntologyRequester, OntologyRequesterCacheWrapper
from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.envo_csv_validator import EnvoCsvValidator
from gfbio_submissions.brokerage.tasks.submission_task import submission_task
from gfbio_submissions.brokerage.utils.submission_file_opener import create_submission_file_opener


logger = logging.getLogger(__name__)

@submission_task("tasks.validate_envo_columns_task")
def validate_envo_columns_task(self, previous_task_result=None,  submission_id=None, report_id=None):
    report = MetadataValidationReport.objects.get(pk=report_id)
    validation_task_report = report.validationtaskreport_set.create(task_name="Validate Metafile ENVO-columns")

    file_opener = create_submission_file_opener(report.submission)
    ontology_requester = get_ontology_requester()

    envo_csv_validator = EnvoCsvValidator(ontology_requester, validation_task_report)
    try:
        with file_opener.csv_reader(report.upload_file) as meta_file:
            envo_csv_validator.validate(meta_file)
    except Exception as e:
        msg = f"Error: Exception on parsing file {report.upload_file}: {e}."
        logger.error(msg)
        return False, msg
    finally:
        validation_task_report.save()

    return True, envo_csv_validator.messages

def get_ontology_requester():
    return OntologyRequesterCacheWrapper(OntologyRequester())
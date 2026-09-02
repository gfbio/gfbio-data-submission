import logging

from django.core.mail import mail_admins
from requests import RequestException

from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.ontology_requester import OntologyRequester, OntologyRequesterCacheWrapper
from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.envo_csv_validator import EnvoCsvValidator
from gfbio_submissions.brokerage.tasks.submission_task import submission_task
from gfbio_submissions.brokerage.utils.submission_file_opener import create_submission_file_opener


logger = logging.getLogger(__name__)

@submission_task("tasks.validate_envo_columns_task", retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES + 1})
def validate_envo_columns_task(self, previous_task_result=None,  submission_id=None, report_id=None):
    report = MetadataValidationReport.objects.get(pk=report_id)
    validation_task_report = report.validationtaskreport_set.create(task_name="Validate Metafile ENVO-columns")

    file_opener = create_submission_file_opener(report.submission)
    ontology_requester = get_ontology_requester()

    envo_csv_validator = EnvoCsvValidator(ontology_requester, validation_task_report)
    try:
        with file_opener.csv_reader(report.upload_file) as meta_file:
            envo_csv_validator.validate(meta_file)
    except RequestException as e:
        if self.request.retries < SUBMISSION_MAX_RETRIES:
            raise self.retry(exc=e)
        msg = f"Error: while requesting ontology data from the OntoPortal API: {e} Please refer to an admin for assistance."
        logger.error(msg)
        validation_task_report.validationfinding_set.create(
            message="An error occured while requesting ontology data. Your data could not be properly validated, but this doesn't mean your data is invalid.", 
            help_text="There seems to be a temporary issue with the OntoPortal API. Please contact the curator for assistance.",
            status="WARNING", finding_type="Server-Problem"
        )
        validation_task_report.status = "WARNING"
        mail_admins(
            subject=" Error: Request to OntoPortal API failed",
            message=f"An error occured while requesting ontology data from the OntoPortal API: {e} The submission in question is {submission_id}.",
        )
        return False, msg
    except Exception as e:
        msg = f"Error: Exception on parsing file {report.upload_file}: {e}."
        logger.error(msg)
        validation_task_report.validationfinding_set.create(
            message="An error occured while processing the file.", help_text="Was the file properly uploaded? Please verify and try uploading it again.",
            status="ERROR", finding_type="File-Problem"
        )
        validation_task_report.status = "ERROR"
        return False, msg
    finally:
        validation_task_report.save()

    return True, envo_csv_validator.messages

def get_ontology_requester():
    return OntologyRequesterCacheWrapper(OntologyRequester())
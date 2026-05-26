from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.notify_on_report_completed_task",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def notify_on_report_completed_task(self, previous_task_result=None, report_id=None):
    report = MetadataValidationReport.objects.get(pk=report_id)
    print("Test-Print for Report")
    print(report)
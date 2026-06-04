from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from gfbio_submissions.brokerage.models.metadata_validation_report import MetadataValidationReport
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.test_check",
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def test_check_task(self, previous_task_result=None, report_id=None):
    report = MetadataValidationReport.objects.get(pk=report_id)
    validation_task_report = report.validationtaskreport_set.create(task_name="Test task", status="WARNING")
    validation_task_report.validationfinding_set.create(message="Test message", help_text="This is just a test, don't worry")
    report.save()

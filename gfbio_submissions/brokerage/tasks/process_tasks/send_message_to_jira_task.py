import logging
from django.db import transaction
from django.utils import timezone
from config.celery_app import app

from gfbio_submissions.brokerage.models.jira_queue_message import JiraQueueMessage
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.utils.jira import JiraClient
from gfbio_submissions.brokerage.utils.task_utils import get_any_submission_and_site_configuration, jira_error_auto_retry
from ...configuration.settings import JIRA_MESSAGES_MAX_DELAY, JIRA_MESSAGES_MAX_MESSAGES_IN_QUEUE
from ...tasks.submission_task import SubmissionTask

logger = logging.getLogger(__name__)


@app.task(base=SubmissionTask, bind=True, name="tasks.send_message_to_jira_task")
def send_message_to_jira_task(self, previous_result, submission_id):
    if not previous_result or previous_result == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED, "Previous Task didn't provide message-id."
    
    message = JiraQueueMessage.objects.get(pk=previous_result)
    if message.status != JiraQueueMessage.STATUS_NOT_SENT:
        return True, f"Message already in state {message.status}."
    
    max_delay = timezone.now() - timezone.timedelta(seconds=JIRA_MESSAGES_MAX_DELAY)

    messages_to_send = []
    with transaction.atomic():
        query = JiraQueueMessage.objects.filter(submission_id=submission_id, status=JiraQueueMessage.STATUS_NOT_SENT, type=message.type)
        if not query.filter(created__lte=max_delay).exists() and query.count() < JIRA_MESSAGES_MAX_MESSAGES_IN_QUEUE:
            if query.filter(created__gt=message.created).exclude(pk=message.pk).exists():
                return True, f"Newer Message found."
        
        messages_to_send = query.all()
        for msg in messages_to_send:
            msg.status = JiraQueueMessage.STATUS_PICKED_UP
        JiraQueueMessage.objects.bulk_update(messages_to_send, ["status"])
    
    jira_message = "Missing Message"
    if message.type == JiraQueueMessage.TYPE_CHECKSUM_CALCULATED:
        jira_message = create_checksum_message(messages_to_send)

    submission, site_configuration = get_any_submission_and_site_configuration(
        submission_id=submission_id, task=self
    )
    reference = submission.get_primary_helpdesk_reference()
    if reference and site_configuration.helpdesk_server:
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.add_comment(key_or_issue=reference.reference_key, text=jira_message, is_internal=False)
        jira_sending_result = jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )
        if jira_sending_result == True:
            for msg in messages_to_send:
                msg.status = JiraQueueMessage.STATUS_SENT
            JiraQueueMessage.objects.bulk_update(messages_to_send, ["status"])
            return True, f"Message was sent: {jira_message}"
        else:
            for msg in messages_to_send:
                msg.status = JiraQueueMessage.STATUS_NOT_SENT
            JiraQueueMessage.objects.bulk_update(messages_to_send, ["status"])
            return jira_sending_result


def create_checksum_message(messages_to_send):
    jira_message = f"h3. {len(messages_to_send)} File(s) where uploaded to the submission and we verified the checksums:\n"
    bad_checksum_messages = [msg for msg in messages_to_send if msg.data["checksum_missmatched"]]
    nice_checksum_messages = [msg for msg in messages_to_send if not msg.data["checksum_missmatched"]]
    if len(bad_checksum_messages) > 0:
        jira_message += "h4. Checksum-fails:\n"
        jira_message += "\n".join(
            [
                (
                    f"- Missmatch for {msg.data['file_name']}: "
                    f"provided: {msg.data['provided_checksum']}"
                    f" | calculated: {msg.data['calculated_checksum']}"
                ) for msg in bad_checksum_messages
            ]
        )

    if len(nice_checksum_messages) > 0:
        jira_message += "h4. Files where the Checksums were matches:\n"
        jira_message += ", ".join([msg.data['file_name'] for msg in nice_checksum_messages])

    return jira_message
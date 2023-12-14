# -*- coding: utf-8 -*-
import datetime

from config.celery_app import app
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from ...configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ...exceptions.transfer_exceptions import TransferServerError, TransferClientError
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.jira import JiraClient
from ...utils.task_utils import (
    get_jira_comment_template,
    get_submission_and_site_configuration,
    jira_comment_replace,
    jira_error_auto_retry,
)


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.notify_user_embargo_expiry_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def notify_user_embargo_expiry_task(self):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)

    results = []

    site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
    if site_configuration is None or site_configuration.helpdesk_server is None:
        return TaskProgressReport.CANCELLED

    all_submissions = Submission.objects.all()
    for submission in all_submissions:
        # skip submission where embargo is null
        if not submission.embargo:
            continue
        # only send notification for closed submissions with PID type PRJ
        # and when embargo date is not in the past
        if submission.status != Submission.CLOSED or submission.embargo < datetime.date.today():
            continue
        # get study object
        study = submission.brokerobject_set.filter(type="study").first()
        if study:
            # get persistent identifier
            study_pid = study.persistentidentifier_set.filter(pid_type="PRJ").first()
            if study_pid:
                # check if hold_date is withing 4 weeks
                four_weeks_from_now = datetime.date.today() + datetime.timedelta(days=28)
                should_notify = True
                # check if user was already notified
                if study_pid.user_notified and study_pid.user_notified <= four_weeks_from_now:
                    should_notify = False
                if submission.embargo <= four_weeks_from_now and should_notify:
                    # send embargo notification comment to JIRA
                    comment = get_jira_comment_template(
                        template_name="NOTIFY_EMBARGO_EXPIRY",
                        task_name="notify_user_embargo_expiry_task",
                    )
                    if not comment:
                        return TaskProgressReport.CANCELLED

                    (
                        submission,
                        site_configuration,
                    ) = get_submission_and_site_configuration(
                        submission_id=submission.id, task=self, include_closed=True
                    )
                    reference = submission.get_primary_helpdesk_reference()

                    comment = jira_comment_replace(comment=comment, embargo=submission.embargo.isoformat())

                    jira_client = JiraClient(resource=site_configuration.helpdesk_server)
                    jira_client.add_comment(
                        key_or_issue=reference.reference_key,
                        text=comment,
                        is_internal=False,
                    )

                    jira_error_auto_retry(
                        jira_client=jira_client,
                        task=self,
                        broker_submission_id=submission.broker_submission_id,
                    )

                    if jira_client.comment:
                        study_pid.user_notified = datetime.date.today()
                        study_pid.save()

                        results.append(
                            {
                                "submission": submission.broker_submission_id,
                                "issue_key": reference.reference_key,
                                "embargo": submission.embargo.isoformat(),
                                "user_notified_on": datetime.date.today().isoformat(),
                            }
                        )

    if len(results) != 0:
        return results

    return "No notifications to send"

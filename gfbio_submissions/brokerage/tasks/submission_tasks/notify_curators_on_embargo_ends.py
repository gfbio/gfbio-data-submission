# -*- coding: utf-8 -*-
import datetime

from config.celery_app import app
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.users.models import User


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.notify_curators_on_embargo_ends_task",
)
def notify_curators_on_embargo_ends_task(self):
    from django.conf import settings
    from .configuration.settings import JIRA_TICKET_URL

    TaskProgressReport.objects.create_initial_report(submission=None, task=self)

    results = []
    all_submissions = Submission.objects.all()
    for submission in all_submissions:
        # ignore submission without embargo
        if not submission.embargo:
            continue
        # only send notification for closed submissions with PID type PRJ
        # and when embargo date is not in the past
        if (
            submission.status != Submission.CLOSED
            or submission.embargo < datetime.date.today()
        ):
            continue
        # get study object
        study = submission.brokerobject_set.filter(type="study").first()
        if study:
            # get persistent identifier
            study_pid = study.persistentidentifier_set.filter(pid_type="PRJ").first()
            if study_pid:
                # check if embargo is withing 7 days
                one_week_from_now = datetime.date.today() + datetime.timedelta(days=6)
                if submission.embargo <= one_week_from_now:
                    # get jira link
                    if submission.get_primary_helpdesk_reference():
                        jira_link = "{}{}".format(
                            JIRA_TICKET_URL, submission.get_primary_helpdesk_reference()
                        )
                    else:
                        jira_link = "No ticket found"

                    # collect details
                    results.append(
                        {
                            "submission_id": submission.broker_submission_id,
                            "accession_id": study_pid.pid,
                            "jira_link": jira_link,
                            "embargo": "{}".format(submission.embargo),
                        }
                    )

    curators = User.objects.filter(groups__name="Curators")
    if len(results) > 0 and len(curators) > 0:
        # send email
        curators_emails = [curator.email for curator in curators]
        message = "List of Embargo dates that expire within 7 days.\n\n"
        for result in results:
            message += "Submission ID: {}\nAccession ID: {}\nJira Link: {}\nEmbargo: {}\n\n".format(
                result["submission_id"],
                result["accession_id"],
                result["jira_link"],
                result["embargo"],
            )

        from django.core.mail import send_mail

        send_mail(
            subject="%s%s"
                    % (settings.EMAIL_SUBJECT_PREFIX, " Embargo expiry notification"),
            message=message,
            from_email=settings.SERVER_EMAIL,
            recipient_list=curators_emails,
            fail_silently=False,
        )
        results.append({"curators": curators_emails})
        return results

    return "No notifications to send"

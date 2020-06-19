# No issue for a submission

On 19.06.2020 Ivo noticed that there was a submission without a related primary
helpdesk ticket. This really bad since the user got no notification from jira
and we were not notified about this submission, also the regular communication 
did not happen. The reason for the missing ticket was that the user object related to 
this submission had no site-configuration associated, thus the ticket-creation chain
failed.

# create issue manually (production system)

    ssh -l cloud 141.5.106.43
    docker-compose -f production.yml run --rm django python manage.py shell
    
    >>> from gfbio_submissions.brokerage.tasks import create_submission_issue_task, get_gfbio_helpdesk_username_task
    >>> get_gfbio_helpdesk_username_task.s(submission_id=<SUBMISSION_PK>).set(countdown=10) | create_submission_issue_task.s(submission_id=<SUBMISSION_PK>).set(countdown=10)
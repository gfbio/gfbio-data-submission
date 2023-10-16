# -*- coding: utf-8 -*-
import logging

from config.celery_app import app
from ...configuration.settings import PANGAEA_JIRA_TICKET
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)

from ...tasks.submission_task import SubmissionTask
from ...utils.jira import JiraClient
from ...utils.pangaea import pull_pangaea_dois
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_for_pangaea_doi_task",
)
def check_for_pangaea_doi_task(self, resource_credential_id=None):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    # TODO: move this to top and check there are submissiont to fetch doi for, if not no request for login token is needed
    submissions = Submission.objects.get_submitted_submissions_containing_reference(
        reference_type=PANGAEA_JIRA_TICKET
    )
    logger.info(
        msg="check_for_pangaea_doi_task. pulling pangaea dois for {} "
        "submissions".format(len(submissions))
    )
    # TODO: in general suboptimal to fetch sc for every submission in set, but neeeded, reconsider to refactor
    #   schedule in database etc.
    for sub in submissions:
        site_config = SiteConfiguration.objects.get_hosting_site_configuration()
        jira_client = JiraClient(
            resource=site_config.pangaea_jira_server,
            token_resource=site_config.pangaea_token_server,
        )
        pull_pangaea_dois(sub, jira_client)

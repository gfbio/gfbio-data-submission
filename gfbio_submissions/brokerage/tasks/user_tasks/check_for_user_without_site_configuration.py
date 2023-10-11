# -*- coding: utf-8 -*-
from django.core.mail import mail_admins

from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import NO_SITE_CONFIG_EMAIL_SUBJECT_TEMPLATE
from gfbio_submissions.brokerage.models.task_progress_report import TaskProgressReport
from gfbio_submissions.brokerage.tasks import logger
from gfbio_submissions.brokerage.tasks.submission_task import SubmissionTask
from gfbio_submissions.generic.models import SiteConfiguration
from gfbio_submissions.users.models import User


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_for_user_without_site_configuration_task",
)
def check_for_user_without_site_configuration_task(self):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(
        msg="tasks.py | check_for_user_without_site_configuration_task | start search"
    )
    users_without_config = User.objects.filter(is_user=True, site_configuration=None)
    site_config = SiteConfiguration.objects.get_hosting_site_configuration()
    mail_content = "Users without site_configuration found:"
    for u in users_without_config:
        logger.info(
            msg="tasks.py | check_for_user_without_site_configuration_task | "
                "found user {0} without site_configuration | "
                "assign site_configuration"
                " {1}".format(u.username, site_config.title)
        )
        u.site_configuration = site_config
        u.save()
        mail_content += "\nusername: {0}\temail: {1}\tpk: {2}".format(
            u.username, u.email, u.pk
        )
    mail_content += "\nSite_configuration {0} was assigned automatically".format(
        site_config.title
    )
    if len(users_without_config):
        mail_admins(
            subject=NO_SITE_CONFIG_EMAIL_SUBJECT_TEMPLATE.format(
                len(users_without_config)
            ),
            message=mail_content,
        )
    return True

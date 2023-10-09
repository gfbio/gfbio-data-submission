# -*- coding: utf-8 -*-
import datetime
import logging
import math as m
import os
import textwrap

from django.core.mail import mail_admins
from django.db import transaction
from kombu.utils import json
from pytz import timezone
from requests import ConnectionError

from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import (
    GFBIO_HELPDESK_TICKET,
)
from gfbio_submissions.generic.models import SiteConfiguration
from gfbio_submissions.users.models import User
from .configuration.settings import (
    ENA,
    ENA_PANGAEA,
    ATAX,
    PANGAEA_ISSUE_VIEW_URL,
    SUBMISSION_COMMENT_TEMPLATE,
    NO_HELPDESK_ISSUE_EMAIL_SUBJECT_TEMPLATE,
    NO_HELPDESK_ISSUEE_EMAIL_MESSAGE_TEMPLATE,
    NO_SITE_CONFIG_EMAIL_SUBJECT_TEMPLATE,
)
from .configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from .exceptions.transfer_exceptions import TransferServerError, TransferClientError
from .models.auditable_text_data import AuditableTextData
from .models.ena_report import EnaReport
from .models.submission import Submission
from .models.submission_upload import SubmissionUpload
from .models.task_progress_report import TaskProgressReport
from .tasks.submission_task import SubmissionTask
from .utils.atax import (
    parse_taxonomic_csv_specimen,
    parse_taxonomic_csv_measurement,
    parse_taxonomic_csv_multimedia,
    analyze_filename_and_type,
)
from .utils.atax import (
    update_specimen_with_measurements_abcd_xml,
    update_specimen_with_multimedia_abcd_xml,
)
from .utils.csv_atax import store_atax_data_as_auditable_text_data
from .utils.ena import (
    prepare_ena_data,
    store_ena_data_as_auditable_text_data,
    fetch_ena_report,
    update_persistent_identifier_report_status,
    update_resolver_accessions,
    execute_update_accession_objects_chain,
)
from .utils.jira import JiraClient
from .utils.schema_validation import validate_atax_data_is_valid
from .utils.task_utils import (
    jira_error_auto_retry,
    get_submission_and_site_configuration,
    raise_transfer_server_exceptions,
    retry_no_ticket_available_exception,
    get_jira_comment_template,
    jira_comment_replace,
)
from ..generic.utils import logged_requests

logger = logging.getLogger(__name__)


# common tasks -----------------------------------------------------------------


# TODO: re-consider if needed when workflow is clear




# TODO: on_hold check is in this form obsolete, if target is ENA etc
#   submission to ena is triggered without prior creation of BOs and XML


# NEW PREP WORKFLOW BO CREATION AND SOID CREATION ------------------------------


# ENA submission transfer tasks ------------------------------------------------


# Pangea submission transfer tasks ---------------------------------------------


# HELPDESK TASKS --------------------------------------------------------------


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.create_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def create_submission_issue_task(self, prev_task_result=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    # TODO: test task without check for null, what happens when errors occur here, not caused inside a
    #  method called here

    # TODO: only needed for comment on ticket, thus remove
    # TODO: althouht filter for primary should deliver only on ticket, a dedicated manager method
    #   would be cleaner (no .first() on query set)
    # existing_tickets = submission.additionalreference_set.filter(
    #     Q(type=GFBIO_HELPDESK_TICKET) & Q(primary=True))

    jira_client = JiraClient(resource=site_configuration.helpdesk_server)
    jira_client.create_submission_issue(
        reporter=prev_task_result, site_config=site_configuration, submission=submission
    )

    jira_error_auto_retry(
        jira_client=jira_client,
        task=self,
        broker_submission_id=submission.broker_submission_id,
    )
    if jira_client.issue:
        submission.additionalreference_set.create(
            type=GFBIO_HELPDESK_TICKET,
            reference_key=jira_client.issue.key,
            primary=True,
        )
    else:
        return TaskProgressReport.CANCELLED


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def update_submission_issue_task(self, prev_task_result=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    reference = submission.get_primary_helpdesk_reference()
    if reference:
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.update_submission_issue(
            reporter=prev_task_result,
            key=reference.reference_key,
            site_config=site_configuration,
            submission=submission,
        )

        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )
    else:
        return TaskProgressReport.CANCELLED


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.add_accession_to_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def add_accession_to_submission_issue_task(
    self, prev_task_result=None, submission_id=None, target_archive=None
):
    if prev_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | add_accession_to_submission_issue_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED
    # No submission will be returned if submission.status is error
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )

    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    comment = get_jira_comment_template(
        template_name="ACCESSION_COMMENT",
        task_name="add_accession_to_submission_issue_task",
    )
    if not comment:
        return TaskProgressReport.CANCELLED

    # TODO: althouht filter for primary should deliver only on ticket, a dedicated manager method
    #   would be cleaner (no .first() on query set)
    # TODO: result is a list of GFbio helpdesk tickets wich are primary,
    #   tecnically len can only be 1, due to model.save ...
    # existing_tickets = submission.additionalreference_set.filter(
    #     Q(type=GFBIO_HELPDESK_TICKET) & Q(primary=True))
    reference = submission.get_primary_helpdesk_reference()

    submitter_name = "Submitter"
    try:
        user = submission.user
        if len(user.name):
            submitter_name = user.name
    except User.DoesNotExist as e:
        logger.warning(
            "tasks.py | add_accession_to_submission_issue_task | "
            "submission_id={0} | No user with "
            "submission.submiting_user={1} | "
            "{2}".format(submission_id, submission.user, e)
        )
    except ValueError as ve:
        logger.warning(
            "tasks.py | add_accession_to_submission_issue_task | "
            "submission_id={0} | ValueError with "
            "submission.submiting_user={1} | "
            "{2}".format(submission_id, submission.user, ve)
        )

    # TODO: previous task is process_ena_response_task, if ena responded successfully
    #  and delievered accesstions, theses are appended as persistentidentifiers
    #  if all worked Pids shoul be in DB and process returns true
    # TODO: makes sense only for ENA or ENA_PANGAEA targets
    if reference and prev_task_result is True:
        if target_archive == ENA or target_archive == ENA_PANGAEA:
            study_pid = (
                submission.brokerobject_set.filter(type="study")
                .first()
                .persistentidentifier_set.filter(pid_type="PRJ")
                .first()
            )

            comment = jira_comment_replace(
                comment=comment,
                submitter=submitter_name,
                primary_accession=study_pid.pid,
            )
            jira_client = JiraClient(resource=site_configuration.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key, text=comment, is_internal=False
            )
            return jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.add_accession_link_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def add_accession_link_to_submission_issue_task(
    self, prev_task_result=None, submission_id=None, target_archive=None
):
    if prev_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | add_accession_link_to_submission_issue_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED
    # No submission will be returned if submission.status is error
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )

    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    if reference and prev_task_result is True:
        if target_archive == ENA or target_archive == ENA_PANGAEA:
            study_pid = (
                submission.brokerobject_set.filter(type="study")
                .first()
                .persistentidentifier_set.filter(pid_type="PRJ")
                .first()
            )

            jira_client = JiraClient(resource=site_configuration.helpdesk_server)
            jira_client.add_ena_study_link_to_issue(
                reference.reference_key, study_pid.pid
            )
            return jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.add_posted_comment_to_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def add_posted_comment_to_issue_task(
    self, prev_task_result=None, submission_id=None, comment="", user_values={}
):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    if reference:
        comment_text = comment
        if "username" in user_values.keys() and "email" in user_values.keys():
            comment_text = SUBMISSION_COMMENT_TEMPLATE.format(
                user_values.get("username", ""), user_values.get("email", ""), comment
            )
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.add_comment(
            key_or_issue=reference.reference_key, text=comment_text, is_internal=False
        )
        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )
    else:
        logger.info(
            msg="add_posted_comment_to_issue_task no tickets found. "
                "submission_id={0} ".format(submission_id)
        )

        return retry_no_ticket_available_exception(
            task=self,
            broker_submission_id=submission.broker_submission_id,
            number_of_tickets=1 if reference else 0,
        )


# FIXME: here problems while using new jirclient to attach, especiall while put submissionupload
@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.attach_to_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def attach_to_submission_issue_task(
    self,
    kwargs=None,
    submission_id=None,
    submission_upload_id=None,
):
    logger.info(
        msg="attach_to_submission_issue_task. submission_id={0} | submission_upload_id={1}"
            "".format(submission_id, submission_upload_id)
    )

    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.info(
            msg="attach_to_submission_issue_task no Submission"
                " found. return {2}. | submission_id={0} | submission_upload_id={1}"
                "".format(submission_id, submission_upload_id, TaskProgressReport.CANCELLED)
        )
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    logger.info(msg="attach_to_submission_issue_task | reference={0}".format(reference))

    # TODO: if no ticket available, the reason may that this task is started independened of
    #  submission transfer chain that creates the ticket, so a proper retry has to be
    #  implemented
    if reference:
        submission_upload = (
            submission.submissionupload_set.filter(attach_to_ticket=True)
            .filter(pk=submission_upload_id)
            .first()
        )
        logger.info(
            msg="attach_to_submission_issue_task | submission_upload={0}".format(
                submission_upload
            )
        )
        if submission_upload:
            do_attach = False
            if submission_upload.attachment_id is None:
                do_attach = True
            if submission_upload.modified_recently:
                do_attach = True

            if not do_attach:
                logger.info(
                    msg="attach_to_submission_issue_task | do_attach={0} | return {1}".format(
                        do_attach, TaskProgressReport.CANCELLED
                    )
                )
                return TaskProgressReport.CANCELLED

            # TODO: access media nginx https://stackoverflow.com/questions/8370658/how-to-serve-django-media-files-via-nginx
            jira_client = JiraClient(
                resource=site_configuration.helpdesk_server,
            )
            file_name = None
            if submission_upload.file.name:
                file_name = submission_upload.file.name
            attachment = jira_client.add_attachment(
                key=reference.reference_key,
                file=submission_upload.file,
                file_name=file_name.replace("/", "_"),
            )

            jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )

            submission_upload.attachment_id = attachment.id
            submission_upload.modified_recently = False
            submission_upload.save(ignore_attach_to_ticket=True)

            logger.info(
                msg="attach_to_submission_issue_task | do_attach={0} | return {1}".format(
                    do_attach, True
                )
            )

            return True
        else:
            logger.info(
                msg="attach_to_submission_issue_task no SubmissionUpload"
                    " found. submission_id={0} | submission_upload_id={1}"
                    "".format(submission_id, submission_upload_id)
            )
            return False
    else:
        logger.info(
            msg="attach_to_submission_issue_task no tickets found. "
                "submission_id={0} | submission_upload_id={1}"
                "".format(submission_id, submission_upload_id)
        )

        return retry_no_ticket_available_exception(
            task=self,
            broker_submission_id=submission.broker_submission_id,
            number_of_tickets=1 if reference else 0,
        )


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.delete_submission_issue_attachment_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def delete_submission_issue_attachment_task(
    self, kwargs=None, submission_id=None, attachment_id=None
):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    # TODO: temporary solution until workflow is fix,
    #   also needs manager method to prevent exceptions here
    # TODO: maybe attachment id is better than submission upload id, which may be delete
    #   when task executes
    # submission_upload = SubmissionUpload.objects.filter(
    #     pk=submission_upload_id).first()

    jira_client = JiraClient(
        resource=site_configuration.helpdesk_server,
    )
    jira_client.delete_attachment(attachment_id)
    return jira_error_auto_retry(
        jira_client=jira_client,
        task=self,
        broker_submission_id=submission.broker_submission_id,
    )


# TODO: add tests ...
@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.add_pangaea_doi_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def add_pangaea_doi_task(
    self, prev_task_result=None, pangaea_doi=None, submission_id=None
):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()
    if reference:
        jira_client = JiraClient(
            resource=site_configuration.helpdesk_server,
        )
        jira_client.add_comment(
            key_or_issue=reference.reference_key,
            text="Pangaea DOI: {0}. broker_submission_id: {1}".format(
                pangaea_doi, submission.broker_submission_id
            ),
            is_internal=False,
        )
        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.add_pangaealink_to_submission_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def add_pangaealink_to_submission_issue_task(self, prev=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    helpdesk_reference = submission.get_primary_helpdesk_reference()
    pangaea_reference = submission.get_primary_pangaea_reference()

    if helpdesk_reference and pangaea_reference:
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)

        jira_client.add_comment(
            key_or_issue=helpdesk_reference.reference_key,
            text="[Pangaea Ticket {1}|{0}{1}]".format(
                PANGAEA_ISSUE_VIEW_URL, pangaea_reference.reference_key
            ),
            is_internal=False,
        )
        return jira_error_auto_retry(
            jira_client=jira_client,
            task=self,
            broker_submission_id=submission.broker_submission_id,
        )


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.fetch_ena_reports_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def fetch_ena_reports_task(self):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
    if site_configuration is None or site_configuration.ena_report_server is None:
        return TaskProgressReport.CANCELLED
    result = True
    logger.info(msg="tasks.py | fetch_ena_reports_task | start update")
    for report_type in EnaReport.REPORT_TYPES:
        type_key, type_name = report_type
        logger.info(
            msg="tasks.py | fetch_ena_reports_task | get report of type={0}".format(
                type_name
            )
        )
        try:
            response, request_id = fetch_ena_report(site_configuration, type_name)
            if response.ok:
                obj, updated = EnaReport.objects.update_or_create(
                    report_type=type_key,
                    defaults={
                        "report_type": type_key,
                        "report_data": json.loads(response.content),
                    },
                )
            else:
                # FIXME: retry count applies to fetch_ena_reports_task not
                #  single report type, thus if a retry is counted for a single
                #  report, this accumulates for all following reports types.
                #  e.g.: study retry+1. sample retry+1. no retries left
                #  for experiment or run
                result = raise_transfer_server_exceptions(
                    response=response, task=self, max_retries=SUBMISSION_MAX_RETRIES
                )
                logger.info(
                    msg="tasks.py | fetch_ena_reports_task | "
                        "raise_transfer_server_exceptions result={0}".format(result)
                )
        except ConnectionError as e:
            logger.error(
                msg="tasks.py | fetch_ena_reports_task | url={1} title={2} "
                    "| connection_error {0}".format(
                    e,
                    site_configuration.ena_report_server.url,
                    site_configuration.ena_report_server.title,
                )
            )
            return TaskProgressReport.CANCELLED
    return result


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_resolver_accessions_task",
)
def update_resolver_accessions_task(self, previous_task_result=False):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(
        msg="tasks.py | update_resolver_accessions_task "
            "| previous_task_result={0}".format(previous_task_result)
    )
    if (
        previous_task_result == TaskProgressReport.CANCELLED
        or previous_task_result is None
    ):
        logger.info(
            msg="tasks.py | update_resolver_accessions_task "
                "| error(s) in previous tasks | return={0}".format(previous_task_result)
        )
        mail_admins(
            subject='Failing update caused by error in "tasks.fetch_ena_reports_task"',
            message='Due to an error in "tasks.fetch_ena_reports_task" the execution'
                    "of {} was stopped.\nWARNING: Resolver tables are not "
                    "updated properly !".format(self.name),
        )
        return TaskProgressReport.CANCELLED, TaskProgressReport.CANCELLED
    success = update_resolver_accessions()
    logger.info(
        msg="tasks.py | update_resolver_accessions_task "
            "| success={0}".format(success)
    )

    return success, previous_task_result


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_persistent_identifier_report_status_task",
)
def update_persistent_identifier_report_status_task(self, previous_task_result=None):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(
        msg="tasks.py | update_persistent_identifier_report_status_task "
            "| previous_task_result={0}".format(previous_task_result)
    )
    fetch_report_status = False
    try:
        previous_task_status, fetch_report_status = previous_task_result
    except TypeError:
        pass
    if (
        fetch_report_status == TaskProgressReport.CANCELLED
        or fetch_report_status is None
    ):
        logger.info(
            msg="tasks.py | update_resolver_accessions_task "
                "| error(s) in previous tasks | return={0}".format(previous_task_result)
        )
        mail_admins(
            subject='Failing update caused by error in "tasks.fetch_ena_reports_task"',
            message='Due to an error in "tasks.fetch_ena_reports_task" the execution'
                    "of {} was stopped.\nWARNING: Persistent Identifier tables are not "
                    "updated properly !".format(self.name),
        )
        return TaskProgressReport.CANCELLED
    success = update_persistent_identifier_report_status()
    logger.info(
        msg="tasks.py | update_persistent_identifier_report_status_task "
            "| success={0}".format(success)
    )

    return success


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_accession_objects_from_ena_report_task",
)
def update_accession_objects_from_ena_report_task(self):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(
        msg="tasks.py | update_accession_objects_from_ena_report_task " "| start update"
    )
    execute_update_accession_objects_chain(name_on_error=self.name)
    logger.info(
        msg="tasks.py | update_accession_objects_from_ena_report_task " "| finished"
    )
    return True


# FIXME: It is possible to set a submission for the taskprogressreport here.
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
                # check if hold_date is withing 4 weeks
                four_weeks_from_now = datetime.date.today() + datetime.timedelta(
                    days=28
                )
                should_notify = True
                # check if user was already notified
                if (
                    study_pid.user_notified
                    and study_pid.user_notified <= four_weeks_from_now
                ):
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

                    comment = jira_comment_replace(
                        comment=comment, embargo=submission.embargo.isoformat()
                    )

                    jira_client = JiraClient(
                        resource=site_configuration.helpdesk_server
                    )
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


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_for_submissions_without_helpdesk_issue_task",
)
def check_for_submissions_without_helpdesk_issue_task(self):
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)
    logger.info(
        msg="tasks.py |  check_for_submissions_without_helpdesk_issue_task |"
            " start search"
    )
    submissions_without_issue = (
        Submission.objects.get_submissions_without_primary_helpdesk_issue()
    )
    for sub in submissions_without_issue:
        logger.info(
            msg="tasks.py | check_for_submissions_without_helpdesk_issue_task "
                "| no helpdesk issue for submission {} | "
                "sending mail to admins".format(sub.broker_submission_id)
        )
        mail_admins(
            subject=NO_HELPDESK_ISSUE_EMAIL_SUBJECT_TEMPLATE.format(
                sub.broker_submission_id
            ),
            message=NO_HELPDESK_ISSUEE_EMAIL_MESSAGE_TEMPLATE.format(
                sub.broker_submission_id, sub.user.username
            ),
        )
    return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.check_issue_existing_for_submission_task",
)
def check_issue_existing_for_submission_task(self, prev=None, submission_id=None):
    logger.info(
        "tasks.py | check_issue_existing_for_submission_task | "
        "submission_id={0}".format(submission_id)
    )

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if (
        len(
            submission.additionalreference_set.filter(
                primary=True, type=GFBIO_HELPDESK_TICKET
            )
        )
        < 1
    ):
        logger.error(
            "tasks.py | check_issue_existing_for_submission_task | "
            "no helpdesk issue found for submission={0}  | "
            "submission_id={1}".format(submission.broker_submission_id, submission_id)
        )
        mail_admins(
            subject=NO_HELPDESK_ISSUE_EMAIL_SUBJECT_TEMPLATE.format(
                submission.broker_submission_id
            ),
            message=NO_HELPDESK_ISSUEE_EMAIL_MESSAGE_TEMPLATE.format(
                submission.broker_submission_id, submission.user.username
            ),
        )
        return TaskProgressReport.CANCELLED

    return True


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


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.notify_on_embargo_ended_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def notify_on_embargo_ended_task(self, submission_id=None):
    if not submission_id:
        return "submission_id not provided"

    logger.info(
        "tasks.py | notify_on_embargo_ended_task | submission_id={}".format(
            submission_id
        )
    )

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if site_config and site_config.helpdesk_server:
        reference = submission.get_primary_helpdesk_reference()
        primary_accession = submission.get_primary_accession()
        if reference and primary_accession:
            comment = get_jira_comment_template(
                template_name="NOTIFY_EMBARGO_RELEASE",
                task_name="notify_on_embargo_ended_task",
            )
            if not comment:
                return TaskProgressReport.CANCELLED

            comment = jira_comment_replace(
                comment=comment, primary_accession=primary_accession.pid
            )

            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key, text=comment, is_internal=False
            )

            jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )

            if jira_client.comment:
                primary_accession.user_notified_released = datetime.date.today()
                primary_accession.save()
                return {
                    "submission": submission.broker_submission_id,
                    "issue_key": reference.reference_key,
                    "primary_accession": primary_accession.pid,
                    "user_notified_on": datetime.date.today().isoformat(),
                }

    return "No notifications to send"


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.update_ena_embargo_task",
)
def update_ena_embargo_task(self, prev=None, submission_id=None):
    logger.info(
        "tasks.py | update_ena_embargo_task | submission_id={0}".format(submission_id)
    )

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        mail_admins(
            subject="update_ena_embargo_task failed",
            message="Failed to get submission and site_config for the task.\n"
                    "Submission_id: {0}".format(submission_id),
        )
        return TaskProgressReport.CANCELLED

    study_primary_accession = submission.brokerobject_set.filter(type="study").first()
    if study_primary_accession:
        study_primary_accession = (
            study_primary_accession.persistentidentifier_set.filter(
                pid_type="PRJ"
            ).first()
        )

    if site_config is None or not site_config.ena_server:
        logger.warning(
            "ena.py | update_ena_embargo_task | no site_configuration found | submission_id={0}".format(
                submission.broker_submission_id
            )
        )
        return "no site_configuration"

    if study_primary_accession:
        logger.info(
            "ena.py | update_ena_embargo_task | primary accession "
            "found for study | accession_no={0} | submission_id={1}".format(
                study_primary_accession, submission.broker_submission_id
            )
        )

        current_datetime = datetime.datetime.now(timezone("UTC")).isoformat()
        submission_xml = textwrap.dedent(
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<SUBMISSION_SET xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
            ' xsi:noNamespaceSchemaLocation="ftp://ftp.sra.ebi.ac.uk/meta/xsd/sra_1_5/SRA.submission.xsd">'
            "<SUBMISSION"
            ' alias="gfbio:hold:{broker_submission_id}:{time_stamp}"'
            ' center_name="GFBIO" broker_name="GFBIO">'
            "<ACTIONS>"
            "<ACTION>"
            '<HOLD target="{accession_no}" HoldUntilDate="{hold_date}"/>'
            "</ACTION>"
            "</ACTIONS>"
            "</SUBMISSION>"
            "</SUBMISSION_SET>".format(
                hold_date=submission.embargo.isoformat(),
                broker_submission_id=submission.broker_submission_id,
                time_stamp=current_datetime,
                accession_no=study_primary_accession,
            )
        )

        auth_params = {
            "auth": site_config.ena_server.authentication_string,
        }
        data = {"SUBMISSION": ("submission.xml", submission_xml)}

        response = logged_requests.post(
            url=site_config.ena_server.url,
            submission=submission,
            return_log_id=False,
            params=auth_params,
            files=data,
            verify=False,
        )
        return ("success",)

    else:
        logger.warning(
            "ena.py | update_ena_embargo_task | no primary accession no "
            "found for study | submission_id={0}".format(
                submission.broker_submission_id
            )
        )
        return "no primary accession number found, submission={}".format(
            submission.broker_submission_id
        )


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.notify_user_embargo_changed_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def notify_user_embargo_changed_task(self, prev=None, submission_id=None):
    logger.info(
        "tasks.py | notify_user_embargo_changed_task | submission_id={0}".format(
            submission_id
        )
    )

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if site_config and site_config.helpdesk_server:
        reference = submission.get_primary_helpdesk_reference()
        if reference:
            comment = get_jira_comment_template(
                template_name="NOTIFY_EMBARGO_CHANGED",
                task_name="notify_user_embargo_changed_task",
            )
            if not comment:
                return TaskProgressReport.CANCELLED

            comment = jira_comment_replace(
                comment=comment, embargo=submission.embargo.isoformat()
            )

            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key, text=comment, is_internal=False
            )
            return jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )
    else:
        logger.info(
            "tasks.py | notify_user_embargo_changed_task | no site_config for helpdesk_serever"
        )

    return {
        "status": "error",
        "submission": "{}".format(submission.broker_submission_id),
        "msg": "missing site_config or jira ticket",
    }


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.jira_cancel_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def jira_cancel_issue_task(self, submission_id=None, admin=False):
    logger.info(
        "tasks.py | jira_cancel_issue_task | submission_id={} admin={}".format(
            submission_id, admin
        )
    )
    TaskProgressReport.objects.create_initial_report(submission=None, task=self)

    submission = Submission.objects.get(id=submission_id)

    if submission and submission.user:
        site_config = submission.user.site_configuration
        if site_config:
            reference = submission.get_primary_helpdesk_reference()
            if reference:
                jira_client = JiraClient(resource=site_config.helpdesk_server)
                jira_client.cancel_issue(
                    issue=reference.reference_key,
                    submission=submission,
                    admin=admin,
                )
                return jira_error_auto_retry(
                    jira_client=jira_client,
                    task=self,
                    broker_submission_id=submission.broker_submission_id,
                )

    return {
        "status": "not canceled",
        "submission": "{}".format(submission.broker_submission_id),
        "user": "{}".format(submission.user),
        "admin": "{}".format(admin),
    }


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.jira_transition_issue_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def jira_transition_issue_task(
    self, prev=None, submission_id=None, transition_id=871, resolution="Done"
):
    logger.info(
        "tasks.py | jira_transition_issue_task | "
        "submission_id={} transition_id={} resolution={}".format(
            submission_id, transition_id, resolution
        )
    )

    if not submission_id:
        return "submission_id not provided"

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if submission and submission.user and site_config:
        reference = submission.get_primary_helpdesk_reference()
        if reference:
            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.transition_issue(
                issue=reference.reference_key,
                submission=submission,
                transition_id=transition_id,
                resolution=resolution,
            )
            return jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )

    return {
        "status": "transition failed",
        "submission": "{}".format(submission.broker_submission_id),
        "user": "{}".format(submission.user),
        "transition_id": "{}".format(transition_id),
        "resolution": "{}".format(resolution),
    }


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.jira_initial_comment_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def jira_initial_comment_task(self, prev=None, submission_id=None):
    logger.info(
        "tasks.py | jira_initial_comment_task | submission_id={}".format(submission_id)
    )

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=False
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if submission and site_config:
        reference = submission.get_primary_helpdesk_reference()
        if reference:
            comment_template_name = "WELCOME_COMMENT"
            if submission.target == ENA or submission.target == ENA_PANGAEA:
                comment_template_name = "WELCOME_MOLECULAR_COMMENT"
            elif submission.target == ATAX:
                comment_template_name = "WELCOME_ATAX_COMMENT"

            comment = get_jira_comment_template(
                template_name=comment_template_name,
                task_name="jira_initial_comment_task",
            )
            if not comment:
                return TaskProgressReport.CANCELLED

            comment = jira_comment_replace(
                comment=comment,
                title=submission.data["requirements"]["title"],
                submission_id=submission.broker_submission_id,
                reference=reference.reference_key,
            )

            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key, text=comment, is_internal=False
            )
            jira_error_auto_retry(
                jira_client=jira_client,
                task=self,
                broker_submission_id=submission.broker_submission_id,
            )
            if jira_client.comment:
                return {
                    "status": "initial comment sent",
                    "submission": "{}".format(submission.broker_submission_id),
                    "reference": "{}".format(reference.reference_key),
                }

    return {
        "status": "initial comment not sent",
        "submission": "{}".format(submission.broker_submission_id),
        "user": "{}".format(submission.user),
    }


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.atax_submission_parse_csv_upload_to_xml_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def atax_submission_parse_csv_upload_to_xml_task(
    self, previous_task_result=None, submission_id=None, submission_upload_id=None
):
    request_file_keys = ["specimen", "measurement", "multimedia", "combination"]

    logger.info(
        "tasks.py | atax_submission_parse_csv_upload_to_xml_task | submission_id={}".format(
            submission_id
        )
    )

    report, created = TaskProgressReport.objects.create_initial_report(
        submission=None, task=self
    )

    # is this necessary here?
    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | atax_submission_parse_csv_upload_to_xml_task | "
            "previous task reported={0} | "
            "submission_id={1} |"
            "submission_upload_id={2}".format(
                TaskProgressReport.CANCELLED, submission_id, submission_upload_id
            )
        )
        return TaskProgressReport.CANCELLED

    # submission_upload = submission.submissionupload_set.filter(pk=submission_upload_id).filter(submission.target=ATAX)  # .first()
    if submission_upload_id:
        submission_upload = SubmissionUpload.objects.get_linked_atax_submission_upload(
            submission_upload_id
        )

    if submission_upload is None:
        logger.error(
            "tasks.py | atax_submission_parse_csv_upload_to_xml_task | "
            "no valid SubmissionUpload for submission.target ATAX available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    else:
        # determine the mimetype, later in an extra task?:
        import mimetypes

        errors = []
        file_mime = mimetypes.guess_type(submission_upload.file.path)
        the_mimes = ("text/csv",)  # expand this by excel later on

        if not file_mime[0] in the_mimes:
            logger.warning(
                "tasks.py | atax_submission_parse_csv_upload_to_xml | "
                'SubmissionUpload file"{0}" is not in csv format| '
                "submission_id={1}".format(submission_upload.file.path, submission_id)
            )
            return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission
    report.save()

    # xml_data_as_string = ''
    # ind = -1
    # differentiate between specimen and measurement and multimedia and combination csv file:
    file_key = analyze_filename_and_type(
        os.path.basename(submission_upload.file.path), submission_upload.meta_data
    )
    if file_key in request_file_keys:
        match str(file_key):
            case "specimen":
                # create xml data as string:
                with open(
                    submission_upload.file.path, "r", encoding="utf-8-sig"
                ) as data_file:
                    xml_data_as_string = parse_taxonomic_csv_specimen(
                        submission_upload.submission, data_file
                    )
                atax_xml_file_type = file_key
                ind = 0
            case "measurement":
                with open(
                    submission_upload.file.path, "r", encoding="utf-8-sig"
                ) as data_file:
                    xml_data_as_string = parse_taxonomic_csv_measurement(
                        submission_upload.submission, data_file
                    )
                atax_xml_file_type = file_key
                ind = 1
            case "multimedia":
                with open(
                    submission_upload.file.path, "r", encoding="utf-8-sig"
                ) as data_file:
                    xml_data_as_string = parse_taxonomic_csv_multimedia(
                        submission_upload.submission, data_file
                    )
                atax_xml_file_type = file_key
                ind = 2
            case _:
                logger.warning(
                    "tasks.py | atax_submission_parse_csv_upload_to_xml | "
                    'SubmissionUpload file"{0}" has no expected basename | '
                    "submission_id={1}".format(
                        submission_upload.file.path, submission_id
                    )
                )
                return TaskProgressReport.CANCELLED

        # store xml data informations in auditabletextdata:
        if xml_data_as_string and len(xml_data_as_string) > 0:
            store_atax_data_as_auditable_text_data(
                submission=submission_upload.submission,
                data_type=atax_xml_file_type,
                data=xml_data_as_string,
                comment="ABCD xml structure",
                atax_file_name=os.path.basename(submission_upload.file.path),
                atax_exp_index=ind,
            )
            # store specimen additionally as combination
            if atax_xml_file_type == request_file_keys[0]:
                store_atax_data_as_auditable_text_data(
                    submission=submission_upload.submission,
                    data_type=request_file_keys[3],
                    data=xml_data_as_string,
                    comment="ABCD xml structure",
                    atax_file_name=os.path.basename(submission_upload.file.path),
                    atax_exp_index=m.pow(2, ind),
                )

            return {"file_key": file_key}  # xml_data_as_string

        else:
            # no success while csv to xml  transformation:
            # is ERROR status correct here?
            submission_upload.submission.status = Submission.ERROR
            submission_upload.submission.save()

            logger.info(
                msg="atax_submission_parse_csv_upload_to_xml_task. no transformed xml upload data.  | "
                    " for {0},  return={1}  | "
                    "submission_id={2}".format(
                    str(file_key), TaskProgressReport.CANCELLED, submission_id
                )
            )
            return TaskProgressReport.CANCELLED

    return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.atax_submission_validate_xml_upload_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def atax_submission_validate_xml_upload_task(
    self,
    previous_task_result=None,
    submission_id=None,
    submission_upload_id=None,
    is_combination=False,
):
    report, created = TaskProgressReport.objects.create_initial_report(
        submission=None, task=self
    )

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | atax_submission_validate_xml_upload_task | "
            "previous task reported={0} | "
            "submission_upload_id={1}".format(
                TaskProgressReport.CANCELLED, submission_upload_id
            )
        )
        return TaskProgressReport.CANCELLED

    if submission_upload_id:
        submission_upload = SubmissionUpload.objects.get_linked_atax_submission_upload(
            submission_upload_id
        )

    # FIXME: logic ?
    if submission_upload is None and is_combination == False:
        logger.error(
            "tasks.py | atax_submission_validate_xml_upload_task | "
            "no valid SubmissionUpload available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission
    report.save()

    if not is_combination:
        # simple upload file name:
        upload_name = submission_upload.file.name.split("/")[-1:][0]

        # get the stored xml string back from auditabletextdata:
        text_to_validate = ""
        if len(
            submission_upload.submission.auditabletextdata_set.filter(
                atax_file_name=upload_name
            )
        ):
            upload_by_file__name = (
                submission_upload.submission.auditabletextdata_set.filter(
                    atax_file_name=upload_name
                ).first()
            )
    elif is_combination:
        upload_by_file__name = (
            submission_upload.submission.auditabletextdata_set.filter(
                name="combination"
            ).first()
        )

    if upload_by_file__name is not None:
        text_to_validate = upload_by_file__name.text_data

        is_val, errors = validate_atax_data_is_valid(
            submission=submission_upload.submission,
            schema_file="ABCD_2.06.XSD",
            xml_string=text_to_validate,  # string_abcd_xml_converted
        )
        # if abcd xml not valid:
        if errors:
            messages = [e.message for e in errors]
            submission_upload.submission.data.update({"validation": messages})
            report.task_exception_info = json.dumps({"validation": messages})

            report.save()
            submission_upload.submission.status = Submission.ERROR
            submission_upload.submission.save()
            return TaskProgressReport.CANCELLED

        else:
            submission_upload.submission.save()

            # update field atax_xml_valid:
            if upload_by_file__name is not None:
                upload_by_file__name.atax_xml_valid = True
                upload_by_file__name.save()

            return {"is_valid": upload_by_file__name.atax_xml_valid}  # text_to_validate

    else:
        return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.atax_submission_combine_xmls_to_one_structure_task",
    autoretry_for=(TransferServerError, TransferClientError),
    retry_kwargs={"max_retries": SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True,
)
def atax_submission_combine_xmls_to_one_structure_task(
    self, previous_task_result=None, submission_id=None, submission_upload_id=None
):
    report, created = TaskProgressReport.objects.create_initial_report(
        submission=None, task=self
    )

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "tasks.py | atax_submission_combine_xmls_to_one_structure_task | "
            "previous task reported={0} | "
            "submission_upload_id={1}".format(
                TaskProgressReport.CANCELLED, submission_upload_id
            )
        )
        return TaskProgressReport.CANCELLED

    if submission_upload_id:
        submission_upload = SubmissionUpload.objects.get_linked_atax_submission_upload(
            submission_upload_id
        )

    if submission_upload is None:
        logger.error(
            "tasks.py | atax_submission_combine_xmls_to_one_structure_task | "
            "no valid SubmissionUpload available | "
            "submission_id={0}".format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission
    report.save()

    upload_name = submission_upload.file.name.split("/")[-1:][0]

    text_to_validate = ""
    # each upload belongs to exactly one category (file names different):
    # current upload:
    if len(
        submission_upload.submission.auditabletextdata_set.filter(
            atax_file_name=upload_name
        )
    ):
        upload_by_file_name = submission_upload.submission.auditabletextdata_set.filter(
            atax_file_name=upload_name
        ).first()
        if upload_by_file_name is None:
            logger.info(
                "tasks.py | atax_auditable_task | no  textdata found | submission_id={0}".format(
                    submission_upload.submission.broker_submission_id
                )
            )
            return None

        specimen_abcd_updated = str()
        combi_name = str()
        combi_updated = False
        keys_found = (
            []
        )  # UnitIds of measurements or multimedias, found in specimen or combination for later tests!

        # all uploads for submission:
        atax_submission_upload = (
            AuditableTextData.objects.assemble_atax_submission_uploads(
                submission=submission_upload.submission
            )
        )
        if atax_submission_upload == {}:
            return TaskProgressReport.CANCELLED
        elif len(atax_submission_upload) <= 1:
            return {"upload length at all": str(len(atax_submission_upload))}
        else:
            #  integrate measurements /multimedia into specimen.xml:
            if (
                len(atax_submission_upload) > 1
                and "COMBINATION" in atax_submission_upload.keys()
            ):
                combi_name = "combination"
                tuple = atax_submission_upload["COMBINATION"]
                ind = tuple[5]
                add_int = 0
            # distinguish whether combination is already present or not:
            # put result into combination:
            if upload_by_file_name.name == "measurement" and bool(combi_name):
                (
                    specimen_abcd_updated,
                    keys_found,
                ) = update_specimen_with_measurements_abcd_xml(
                    upload=atax_submission_upload, name=combi_name
                )
                add_ind = 1
            elif upload_by_file_name.name == "multimedia" and bool(combi_name):
                (
                    specimen_abcd_updated,
                    keys_found,
                ) = update_specimen_with_multimedia_abcd_xml(
                    upload=atax_submission_upload, name=combi_name
                )
                add_ind = 2
            elif upload_by_file_name.name == "specimen":
                # are there measurement data from earlier?
                if len(
                    submission_upload.submission.auditabletextdata_set.filter(
                        name="measurement"
                    )
                ):
                    auditable_xml = (
                        submission_upload.submission.auditabletextdata_set.filter(
                            name="measurement"
                        ).first()
                    )
                    if auditable_xml is not None:
                        (
                            specimen_abcd_updated,
                            keys_found_ms,
                        ) = update_specimen_with_measurements_abcd_xml(
                            upload=atax_submission_upload, name="combination"
                        )
                        # store specimen plus measurements as combination:
                        if (
                            specimen_abcd_updated is not None
                            and len(specimen_abcd_updated) > 0
                        ):
                            store_atax_data_as_auditable_text_data(
                                submission=submission_upload.submission,
                                data_type="combination",
                                data=specimen_abcd_updated,
                                comment="ABCD xml structure",
                                atax_file_name="ABCD specimen with integrated metadata",
                                atax_exp_index=int(ind) + int(m.pow(2, 1)),
                            )
                            combi_updated = True

                # are there multimedia data?
                # refresh auditables
                atax_submission_upload = (
                    AuditableTextData.objects.assemble_atax_submission_uploads(
                        submission=submission_upload.submission
                    )
                )
                if (
                    len(atax_submission_upload) > 1
                    and "COMBINATION" in atax_submission_upload.keys()
                ):
                    combi_name = "combination"
                    tuple = atax_submission_upload["COMBINATION"]
                    ind = tuple[5]

                if len(
                    submission_upload.submission.auditabletextdata_set.filter(
                        name="multimedia"
                    )
                ):
                    auditable_xml = (
                        submission_upload.submission.auditabletextdata_set.filter(
                            name="multimedia"
                        ).first()
                    )
                    if auditable_xml is not None:
                        (
                            specimen_abcd_updated,
                            keys_found_m,
                        ) = update_specimen_with_multimedia_abcd_xml(
                            upload=atax_submission_upload, name=combi_name
                        )  #
                        if (
                            specimen_abcd_updated is not None
                            and len(specimen_abcd_updated) > 0
                        ):
                            store_atax_data_as_auditable_text_data(
                                submission=submission_upload.submission,
                                data_type="combination",
                                data=specimen_abcd_updated,
                                comment="ABCD xml structure",
                                atax_file_name="ABCD specimen with integrated meta data",
                                atax_exp_index=int(ind) + int(m.pow(2, 2)),
                            )
                            combi_updated = True

            if combi_updated == False:
                if specimen_abcd_updated is not None and len(specimen_abcd_updated) > 0:
                    store_atax_data_as_auditable_text_data(
                        submission=submission_upload.submission,
                        data_type="combination",
                        data=specimen_abcd_updated,
                        comment="ABCD xml structure",
                        atax_file_name="ABCD specimen with integrated meta data",
                        atax_exp_index=int(ind) + int(m.pow(2, int(add_ind))),
                    )
                    combi_updated = True

            submission_upload.submission.save()
            return {"combi_updated": combi_updated}

        return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.prepare_ena_submission_data_task",
)
def prepare_ena_submission_data_task(self, prev_task_result=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id, task=self, include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if len(submission.brokerobject_set.all()) > 0:
        with transaction.atomic():
            submission.auditabletextdata_set.all().delete()
        ena_submission_data = prepare_ena_data(submission=submission)
        store_ena_data_as_auditable_text_data(
            submission=submission, data=ena_submission_data
        )
        # TODO: this will become obsolete once, data is taken from AuditableTextData ....
        return ena_submission_data
    else:
        logger.info(
            msg="prepare_ena_submission_data_task. no brokerobjects. "
                "return={0} "
                "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED

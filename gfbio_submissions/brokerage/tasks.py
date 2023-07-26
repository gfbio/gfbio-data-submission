# -*- coding: utf-8 -*-
import datetime
import logging
import os
import textwrap

import celery
from celery.exceptions import SoftTimeLimitExceeded
from django.core.mail import mail_admins
from django.db import transaction
from django.db.utils import IntegrityError
from django.utils.encoding import smart_str
from kombu.utils import json
from pytz import timezone
from requests import ConnectionError, Response

from config.celery_app import app
from config.settings.base import HOST_URL_ROOT, ADMIN_URL
from gfbio_submissions.generic.models import SiteConfiguration, RequestLog
from gfbio_submissions.users.models import User
from .configuration.settings import ENA, ENA_PANGAEA, ATAX, PANGAEA_ISSUE_VIEW_URL, \
    SUBMISSION_COMMENT_TEMPLATE, JIRA_FALLBACK_USERNAME, \
    JIRA_FALLBACK_EMAIL, APPROVAL_EMAIL_SUBJECT_TEMPLATE, \
    APPROVAL_EMAIL_MESSAGE_TEMPLATE, NO_HELPDESK_ISSUE_EMAIL_SUBJECT_TEMPLATE, \
    NO_HELPDESK_ISSUEE_EMAIL_MESSAGE_TEMPLATE, \
    NO_SITE_CONFIG_EMAIL_SUBJECT_TEMPLATE
from .configuration.settings import SUBMISSION_MAX_RETRIES, \
    SUBMISSION_RETRY_DELAY
from .exceptions import TransferServerError, TransferClientError
from .models import BrokerObject, AuditableTextData, \
    AdditionalReference, TaskProgressReport, Submission
from .models import SubmissionUpload, EnaReport
from .utils.csv import check_for_molecular_content, parse_molecular_csv
from .utils.atax import parse_taxonomic_csv_specimen, parse_taxonomic_csv_measurement, \
    parse_taxonomic_csv_multimedia, analyze_filename_and_type
from .utils.ena import prepare_ena_data, store_ena_data_as_auditable_text_data, \
    send_submission_to_ena, parse_ena_submission_response, fetch_ena_report, \
    update_persistent_identifier_report_status, register_study_at_ena, \
    prepare_study_data_only, store_single_data_item_as_auditable_text_data, \
    update_resolver_accessions, execute_update_accession_objects_chain
from .utils.ena_cli import submit_targeted_sequences, \
    create_ena_manifest_text_data, store_manifest_to_filesystem, \
    extract_accession_from_webin_report
from .utils.gfbio import get_gfbio_helpdesk_username
from .utils.jira import JiraClient
from .utils.pangaea import pull_pangaea_dois
from .utils.schema_validation import validate_data_full, validate_atax_data_is_valid
from .utils.submission_transfer import SubmissionTransferHandler
from .utils.task_utils import jira_error_auto_retry, \
    get_submission_and_site_configuration, raise_transfer_server_exceptions, \
    retry_no_ticket_available_exception, \
    get_submitted_submission_and_site_configuration, \
    send_data_to_ena_for_validation_or_test, get_jira_comment_template, \
    jira_comment_replace
from ..generic.utils import logged_requests
from .utils.csv_atax import store_atax_data_as_auditable_text_data
from .utils.atax import update_specimen_measurements_abcd_xml, \
    create_ataxer, Ataxer

logger = logging.getLogger(__name__)


# abstract base class for tasks ------------------------------------------------

class SubmissionTask(celery.Task):
    abstract = True

    # TODO: consider a report for every def here OR refactor taskreport to
    #  keep track in one report. Keep in mind to resume chains from a certain
    #  point, add a DB clean up task to remove from database
    # @abstractmethod
    # def __init__(self):
    #     super(SubmissionTask, self).__init__()

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        logger.info('tasks.py | SubmissionTask | on_retry | task_id={0} | '
                    'name={1}'.format(task_id, self.name))
        # TODO: capture this idea of reporting to sentry
        # sentrycli.captureException(exc)
        TaskProgressReport.objects.update_report_on_exception(
            'RETRY', exc, task_id, args, kwargs, einfo, task_name=self.name)
        super(SubmissionTask, self).on_retry(exc, task_id, args, kwargs, einfo)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.info('tasks.py | SubmissionTask | on_failure | task_id={0} | '
                    'name={1}| args={2} | kwargs={3} | einfo={4} | '
                    ''.format(task_id, self.name, args, kwargs, einfo))
        TaskProgressReport.objects.update_report_on_exception(
            'FAILURE', exc, task_id, args, kwargs, einfo, task_name=self.name)
        super(SubmissionTask, self).on_failure(exc, task_id, args, kwargs,
                                               einfo)

    def on_success(self, retval, task_id, args, kwargs):
        logger.info('tasks.py | SubmissionTask | on_success | task_id={0} | '
                    'name={1} | retval={2}'.format(task_id, self.name, retval))
        TaskProgressReport.objects.update_report_on_success(
            retval, task_id, args, kwargs, task_name=self.name)
        super(SubmissionTask, self).on_success(retval, task_id, args, kwargs)

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        logger.info('tasks.py | SubmissionTask | after_return | task_id={0} | '
                    'name={1} | args={2} | kwargs={3} | einfo={4} | '
                    'retval={5}'.format(task_id, self.name, args, kwargs, einfo,
                                        retval))
        TaskProgressReport.objects.update_report_after_return(status, task_id,
                                                              task_name=self.name)
        super(SubmissionTask, self).after_return(
            status, retval, task_id, args, kwargs, einfo)


# common tasks -----------------------------------------------------------------

# TODO: re-consider if needed when workflow is clear
@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.check_for_molecular_content_in_submission_task',
)
def check_for_molecular_content_in_submission_task(self,
                                                   previous_task_result=None,
                                                   submission_id=None):
    logger.info(
        msg='check_for_molecular_content_in_submission_task. get submission'
            ' with pk={}.'.format(submission_id))

    # TODO: needs only submission, not both.
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    logger.info(
        msg='check_for_molecular_content_in_submission_task. '
            'process submission={}.'.format(submission.broker_submission_id))

    molecular_data_available, messages, check_performed = check_for_molecular_content(
        submission)

    logger.info(
        msg='check_for_molecular_content_in_submission_task. '
            'valid molecular data available={0}'
            ''.format(molecular_data_available)
    )

    return {
        'molecular_data_available': molecular_data_available,
        'messages': messages,
        'molecular_data_check_performed': check_performed,
    }


# FIXME: redundant/duplicate code with trigger_submission_transfer_for_updates. Refactor !
@app.task(base=SubmissionTask, bind=True,
             name='tasks.trigger_submission_transfer', )
def trigger_submission_transfer(self, previous_task_result=None,
                                submission_id=None):
    molecular_data_available = False
    check_performed = False
    messages = []

    if isinstance(previous_task_result, dict):
        molecular_data_available = previous_task_result.get(
            'molecular_data_available', False)
        check_performed = previous_task_result.get(
            'molecular_data_check_performed', False)
        messages = previous_task_result.get('messages', [])

    logger.info(
        msg='trigger_submission_transfer. get submission with pk={}.'.format(
            submission_id)
    )
    if len(messages):
        logger.warning(
            'tasks.py | trigger_submission_transfer | '
            'previous task reported error messages={0} | '
            'submission_id={1}'.format(messages, submission_id))
        return TaskProgressReport.CANCELLED
    # TODO: needs only submission, not both.
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )

    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    transfer_handler = SubmissionTransferHandler(
        submission_id=submission.pk,
        target_archive=submission.target,
        molecular_data_found=molecular_data_available,
        molecular_data_check_performed=check_performed
    )
    transfer_handler.initiate_submission_process(
        release=submission.release,
    )


@app.task(base=SubmissionTask, bind=True,
             name='tasks.trigger_submission_transfer_for_updates', )
def trigger_submission_transfer_for_updates(self, previous_task_result=None,
                                            broker_submission_id=None):
    molecular_data_available = False
    check_performed = False
    messages = []
    if isinstance(previous_task_result, dict):
        molecular_data_available = previous_task_result.get(
            'molecular_data_available', False)
        check_performed = previous_task_result.get(
            'molecular_data_check_performed', False)
        messages = previous_task_result.get('messages', [])

    logger.info(
        msg='trigger_submission_transfer_for_updates. get submission_id with broker_submission_id={}.'.format(
            broker_submission_id)
    )
    submission_id = Submission.objects.get_open_submission_id_for_bsi(
        broker_submission_id=broker_submission_id)

    if len(messages):
        logger.warning(
            'tasks.py | trigger_submission_transfer | '
            'previous task reported error messages={0} | '
            'submission_id={1}'.format(messages, submission_id))
    # TODO: needs only submission, not both.
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    transfer_handler = SubmissionTransferHandler(
        submission_id=submission.pk,
        target_archive=submission.target,
        molecular_data_found=molecular_data_available,
        molecular_data_check_performed=check_performed
    )
    transfer_handler.initiate_submission_process(
        release=submission.release,
        update=True,
    )


# TODO: on_hold check is in this form obsolete, if target is ENA etc
#   submission to ena is triggered without prior creation of BOs and XML
@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.check_on_hold_status_task',
)
def check_on_hold_status_task(self, previous_task_result=None,
                              submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if site_configuration.release_submissions:
        logger.info(
            msg='check_on_hold_status_task. submission pk={0}. '
                'site_config pk={1}. site_configuration.release_submissions'
                '={2}. execute submission.'
                ''.format(submission_id, site_configuration.pk,
                          site_configuration.release_submissions))
        transfer_handler = SubmissionTransferHandler(
            submission_id=submission.pk,
            target_archive=submission.target
        )
        transfer_handler.execute()
    else:
        if not submission.approval_notification_sent:
            # email admins, then do smth. to trigger chain once ok
            logger.info(
                msg='check_on_hold_status_task. submission pk={0}. '
                    'site_config pk={1}. site_configuration.release_submissions'
                    '={2}. send mail to admins.'
                    ''.format(submission_id, site_configuration.pk,
                              site_configuration.release_submissions))
            # TODO: refactor to method in task_utils, and use templates/constants
            mail_admins(
                subject=APPROVAL_EMAIL_SUBJECT_TEMPLATE.format(
                    HOST_URL_ROOT,
                    # site_configuration.site.username if site_configuration.site else site_configuration.title,
                    submission.user.username if submission.user else site_configuration.title,
                    submission.broker_submission_id
                ),
                message=APPROVAL_EMAIL_MESSAGE_TEMPLATE.format(
                    submission.broker_submission_id,
                    '{0}{1}brokerage/submission/{2}/change/'.format(
                        HOST_URL_ROOT,
                        ADMIN_URL,
                        submission.pk)
                )
            )
            submission.approval_notification_sent = True
            submission.save()


# NEW PREP WORKFLOW BO CREATION AND SOID CREATION ------------------------------


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.create_study_broker_objects_only_task',
)
def create_study_broker_objects_only_task(self, previous_task_result=None,
                                          submission_id=None):
    # TODO: refactor to general method for all tasks where applicable
    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | create_study_broker_objects_only_task | '
            'previous task reported={0} | '
            'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                       submission_id))
        return TaskProgressReport.CANCELLED
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | create_study_broker_objects_only_task | '
            ' do nothing because submission={0}'.format(
                TaskProgressReport.CANCELLED))
        return TaskProgressReport.CANCELLED
    if len(submission.brokerobject_set.filter(type='study')):
        study_pk = submission.brokerobject_set.filter(type='study').first().pk
        logger.info(
            'tasks.py | create_study_broker_objects_only_task | '
            ' broker object of type study found | return pk={0}'.format(
                study_pk))
        # TODO: for now return study BOs primary key
        return study_pk
    else:
        study = BrokerObject.objects.add_study_only(submission=submission)
        logger.info(
            'tasks.py | create_study_broker_objects_only_task | '
            ' created broker object of type study | return pk={0}'.format(
                study.pk))
        return study.pk


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.create_broker_objects_from_submission_data_task',
)
def create_broker_objects_from_submission_data_task(
        self,
        previous_task_result=None,
        submission_id=None,
        use_submitted_submissions=False):
    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | create_broker_objects_from_submission_data_task | '
            'previous task reported={0} | '
            'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                       submission_id))
        return TaskProgressReport.CANCELLED

    submission, site_configuration = \
        get_submitted_submission_and_site_configuration(
            submission_id=submission_id,
            task=self) if use_submitted_submissions else get_submission_and_site_configuration(
            submission_id=submission_id,
            task=self,
            include_closed=True
        )
    logger.info('tasks.py | create_broker_objects_from_submission_data_task | '
                'submission={0} | site_configuration={1}'.format(submission,
                                                                 site_configuration))
    if submission == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | create_broker_objects_from_submission_data_task | '
            ' do nothing because submission={0}'.format(
                TaskProgressReport.CANCELLED))
        return TaskProgressReport.CANCELLED

    try:
        logger.info(
            'tasks.py | create_broker_objects_from_submission_data_task '
            '| try delete broker objects and create new ones '
            'from submission data')
        with transaction.atomic():
            submission.brokerobject_set.all().delete()
            BrokerObject.objects.add_submission_data(submission)
            return True
    except IntegrityError as e:
        logger.error(
            'create_broker_objects_from_submission_data_task IntegrityError in "create_broker_objects_from'
            '_submission_data_task": {}'.format(e))


# ENA submission transfer tasks ------------------------------------------------

@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.delete_related_auditable_textdata_task',
)
def delete_related_auditable_textdata_task(self, prev_task_result=None,
                                           submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    with transaction.atomic():
        submission.auditabletextdata_set.all().delete()


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.prepare_ena_study_xml_task',
)
def prepare_ena_study_xml_task(self, previous_task_result=None,
                               submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    # TODO: refactor to general method for all tasks where applicable
    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | prepare_ena_study_xml_task | '
            'previous task reported={0} | '
            'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                       submission_id))
        return TaskProgressReport.CANCELLED
    if submission == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | prepare_ena_study_xml_task | '
            ' do nothing because submission={0}'.format(
                TaskProgressReport.CANCELLED))
        return TaskProgressReport.CANCELLED

    if len(submission.auditabletextdata_set.filter(name='study.xml')):
        study_pk = submission.auditabletextdata_set.filter(
            name='study.xml').first().pk
        logger.info(
            'tasks.py | prepare_ena_study_xml_task | '
            ' auditable textdata with name study.xml found | return pk={0}'.format(
                study_pk))
        # TODO: for now return XMLs primary key
        return study_pk
    elif not len(submission.brokerobject_set.filter(type='study')):
        logger.warning(
            'tasks.py | prepare_ena_study_xml_task | '
            ' do nothing because submission={0} has no broker object '
            'of type study'.format(TaskProgressReport.CANCELLED))
        return TaskProgressReport.CANCELLED
    else:
        study_data = prepare_study_data_only(submission=submission)
        study_text_data = store_single_data_item_as_auditable_text_data(
            submission=submission, data=study_data)
        logger.info(
            'tasks.py | prepare_ena_study_xml_task | '
            ' created auditable textdata with name study.xml | return pk={0}'.format(
                study_text_data.pk if study_text_data is not None else 'invalid'))
        return TaskProgressReport.CANCELLED if study_text_data is None else study_text_data.pk


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.prepare_ena_submission_data_task',
)
def prepare_ena_submission_data_task(self, prev_task_result=None,
                                     submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if len(submission.brokerobject_set.all()) > 0:
        with transaction.atomic():
            submission.auditabletextdata_set.all().delete()
        ena_submission_data = prepare_ena_data(submission=submission)
        store_ena_data_as_auditable_text_data(submission=submission,
                                              data=ena_submission_data)
        # TODO: this will become obsolete once, data is taken from AuditableTextData ....
        return ena_submission_data
    else:
        logger.info(
            msg='prepare_ena_submission_data_task. no brokerobjects. '
                'return={0} '
                'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                           submission_id)
        )
        return TaskProgressReport.CANCELLED


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.update_ena_submission_data_task',
)
def update_ena_submission_data_task(self, previous_task_result=None,
                                    submission_upload_id=None):
    # TODO: here it would be possible to get the related submission for the TaskReport
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    submission_upload = SubmissionUpload.objects.get_linked_molecular_submission_upload(
        submission_upload_id)

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | update_ena_submission_data_task | '
            'previous task reported={0} | '
            'submission_upload_id={1}'.format(TaskProgressReport.CANCELLED,
                                              submission_upload_id))
        return TaskProgressReport.CANCELLED

    if submission_upload is None:
        logger.error(
            'tasks.py | update_ena_submission_data_task | '
            'no valid SubmissionUpload available | '
            'submission_upload_id={0}'.format(submission_upload_id))
        return TaskProgressReport.CANCELLED

    ena_submission_data = prepare_ena_data(
        submission=submission_upload.submission)

    logger.info(
        'tasks.py | update_ena_submission_data_task | '
        'update AuditableTextData related to submission={0} '
        ''.format(submission_upload.submission.broker_submission_id))
    with transaction.atomic():
        for d in ena_submission_data:
            filename, filecontent = ena_submission_data[d]
            obj, created = submission_upload.submission.auditabletextdata_set.update_or_create(
                name=filename,
                defaults={'text_data': filecontent}
            )
        return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.clean_submission_for_update_task',
)
def clean_submission_for_update_task(self, previous_task_result=None,
                                     submission_upload_id=None):
    report, created = TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    submission_upload = SubmissionUpload.objects.get_linked_molecular_submission_upload(
        submission_upload_id)

    # TODO: add submission relation from submission_upload, relation

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | clean_submission_for_update_task | '
            'previous task reported={0} | '
            'submission_upload_id={1}'.format(TaskProgressReport.CANCELLED,
                                              submission_upload_id))
        return TaskProgressReport.CANCELLED

    if submission_upload is None:
        logger.error(
            'tasks.py | clean_submission_for_update_task | '
            'no valid SubmissionUpload available | '
            'submission_upload_id={0}'.format(submission_upload_id))
        return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission
    report.save()

    data = submission_upload.submission.data
    molecular_requirements_keys = ['samples', 'experiments']  # 'study_type',

    if 'validation' in data.keys():
        data.pop('validation')
    for k in molecular_requirements_keys:
        if k in data.get('requirements', {}).keys():
            data.get('requirements', {}).pop(k)

    with transaction.atomic():
        submission_upload.submission.save()
    return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.parse_csv_to_update_clean_submission_task',
)
def parse_csv_to_update_clean_submission_task(self, previous_task_result=None,
                                              submission_upload_id=None):
    # TODO: here it would be possible to get the related submission for the TaskReport
    report, created = TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    submission_upload = SubmissionUpload.objects.get_linked_molecular_submission_upload(
        submission_upload_id)

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | parse_csv_to_update_clean_submission_task | '
            'previous task reported={0} | '
            'submission_upload_id={1}'.format(TaskProgressReport.CANCELLED,
                                              submission_upload_id))
        return TaskProgressReport.CANCELLED

    if submission_upload is None:
        logger.error(
            'tasks.py | parse_csv_to_update_clean_submission_task | '
            'no valid SubmissionUpload available | '
            'submission_upload_id={0}'.format(submission_upload_id))
        return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission

    with open(submission_upload.file.path, 'r') as file:
        molecular_requirements = parse_molecular_csv(
            file,
        )

    path = os.path.join(
        os.getcwd(),
        'gfbio_submissions/brokerage/schemas/ena_requirements.json')

    with transaction.atomic():
        submission_upload.submission.data['requirements'].update(
            molecular_requirements)

        valid, full_errors = validate_data_full(
            data=submission_upload.submission.data,
            target=ENA_PANGAEA,
            schema_location=path,
        )

        if not valid:
            messages = [e.message for e in full_errors]
            submission_upload.submission.data.update(
                {'validation': messages})
            report.task_exception_info = json.dumps({'validation': messages})

        report.save()
        submission_upload.submission.save()
        if not valid:
            # TODO: update tpr with errors from validation
            return TaskProgressReport.CANCELLED
        else:
            return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.transfer_data_to_ena_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def transfer_data_to_ena_task(self, prepare_result=None, submission_id=None,
                              action='ADD'):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    ena_submission_data = AuditableTextData.objects.assemble_ena_submission_data(
        submission=submission)
    if ena_submission_data == {}:
        return TaskProgressReport.CANCELLED
    try:
        response, request_id = send_submission_to_ena(submission,
                                                      site_configuration.ena_server,
                                                      ena_submission_data,
                                                      action
                                                      )
        res = raise_transfer_server_exceptions(
            response=response,
            task=self,
            broker_submission_id=submission.broker_submission_id,
            max_retries=SUBMISSION_MAX_RETRIES)
    except SoftTimeLimitExceeded as se:
        logger.error(
            'tasks.py | transfer_data_to_ena_task | '
            'SoftTimeLimitExceeded | '
            'submission_id={0} | error={1}'.format(submission_id, se)
        )
        response = Response()
    except ConnectionError as e:
        logger.error(
            msg='tasks.py | transfer_data_to_ena_task | connection_error '
                '{}.url={} title={}'.format(
                e,
                site_configuration.ena_server.url,
                site_configuration.ena_server.title)
        )
        response = Response()
    return str(request_id), response.status_code, smart_str(
        response.content)


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.register_study_at_ena_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def register_study_at_ena_task(self, previous_result=None,
                               submission_id=None, ):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )

    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | register_study_at_ena_task | '
            'previous task reported={0} | '
            'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                       submission_id))
        return TaskProgressReport.CANCELLED
    if submission is None:
        logger.warning(
            'tasks.py | register_study_at_ena_task | '
            'no valid Submission available | '
            'submission_id={0}'.format(submission_id))
        return TaskProgressReport.CANCELLED

    primary_accession = BrokerObject.objects.get_study_primary_accession_number(
        submission)
    if primary_accession is not None:
        logger.info(
            'tasks.py | register_study_at_ena_task | '
            ' persistent_identifier={0} found | return pk={1}'.format(
                primary_accession, primary_accession.pk))
        return TaskProgressReport.CANCELLED

    study_text_data = submission.auditabletextdata_set.filter(
        name='study.xml').first()
    study_broker_object = submission.brokerobject_set.filter(
        type='study').first()

    if study_text_data is None:
        logger.info(
            'tasks.py | register_study_at_ena_task | no study textdata found | submission_id={0}'.format(
                submission.broker_submission_id)
        )
        return TaskProgressReport.CANCELLED
    elif study_broker_object is None:
        logger.info(
            'tasks.py | register_study_at_ena_task | no study brokerobject found | submission_id={0}'.format(
                submission.broker_submission_id)
        )
        return TaskProgressReport.CANCELLED
    else:
        try:
            response, request_id = register_study_at_ena(
                submission=submission,
                study_text_data=study_text_data)
            logger.info(
                'tasks.py | register_study_at_ena_task | '
                'register_study_at_ena executed | submission_id={0} '
                '| response status_code={1}'.format(
                    submission.broker_submission_id, response.status_code)
            )
            res = raise_transfer_server_exceptions(
                response=response,
                task=self,
                broker_submission_id=submission.broker_submission_id,
                max_retries=SUBMISSION_MAX_RETRIES)
        except ConnectionError as e:
            logger.error(
                msg='connection_error {}.url={} title={}'.format(
                    e,
                    site_configuration.ena_server.url,
                    site_configuration.ena_server.title)
            )
            response = Response()
        # TODO: followed by process_ena_response_task like in general submission process for ENA
        return str(request_id), response.status_code, smart_str(
            response.content)


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.create_targeted_sequence_ena_manifest_task',
)
def create_targeted_sequence_ena_manifest_task(self, previous_result=None,
                                               submission_id=None, ):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | create_targeted_sequence_ena_manifest_task | '
            'previous task reported={0} | '
            'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                       submission_id))
        return TaskProgressReport.CANCELLED
    if submission is None:
        logger.warning(
            'tasks.py | create_targeted_sequence_ena_manifest_task | '
            'no valid Submission available | '
            'submission_id={0}'.format(submission_id))
        return TaskProgressReport.CANCELLED

    text_data = create_ena_manifest_text_data(submission=submission)
    logger.info(
        'tasks.py | create_targeted_sequence_ena_manifest_task | '
        'created auditable_text_data pk={0} | '
        'submission_id={1} '.format(text_data.pk, submission_id))
    return text_data.pk


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.submit_targeted_sequences_to_ena_task',
)
def submit_targeted_sequences_to_ena_task(self, previous_result=None,
                                          submission_id=None, do_test=True,
                                          do_validate=True):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | submit_targeted_sequences_to_ena_task | '
            'previous task reported={0} | '
            'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                       submission_id))
        return TaskProgressReport.CANCELLED
    if submission is None:
        logger.warning(
            'tasks.py | submit_targeted_sequences_to_ena_task | '
            'no valid Submission available | '
            'submission_id={0}'.format(submission_id))
        return TaskProgressReport.CANCELLED

    logger.info(
        'tasks.py | submit_targeted_sequences_to_ena_task | '
        'store_manifest_to_filesystem | submission={}'.format(
            submission.broker_submission_id))
    store_manifest_to_filesystem(submission)
    logger.info(
        'tasks.py | submit_targeted_sequences_to_ena_task | '
        'submit_targeted_sequences| submission={}'.format(
            submission.broker_submission_id))
    success = submit_targeted_sequences(
        username=site_configuration.ena_server.username,
        password=site_configuration.ena_server.password,
        submission=submission,
        test=do_test,
        validate=do_validate
    )
    logger.info(
        'tasks.py | submit_targeted_sequences_to_ena_task | '
        'done | return success={0} | submission={1}'.format(
            success,
            submission.broker_submission_id))
    return success


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.process_targeted_sequence_results_task',
)
def process_targeted_sequence_results_task(self, previous_result=None,
                                           submission_id=None, ):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | process_targeted_sequence_results_task | '
            'previous task reported={0} | '
            'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                       submission_id))
        return TaskProgressReport.CANCELLED
    if submission is None:
        logger.warning(
            'tasks.py | process_targeted_sequence_results_task | '
            'no valid Submission available | '
            'submission_id={0}'.format(submission_id))
        return TaskProgressReport.CANCELLED
    logger.info(
        'tasks.py | process_targeted_sequence_results_task | '
        'extract_accession_from_webin_report | broker_submission_id={}'.format(
            submission.broker_submission_id))
    accession = extract_accession_from_webin_report(
        submission.broker_submission_id)
    logger.info(
        'tasks.py | process_targeted_sequence_results_task | '
        'extract_accession_from_webin_report | accession={}'.format(
            accession))
    if accession == '-1':
        return TaskProgressReport.CANCELLED
    else:
        study_bo = submission.brokerobject_set.filter(type='study').first()
        if study_bo is None:
            logger.warning(
                'tasks.py | process_targeted_sequence_results_task | '
                'no valid study broker object available | '
                'submission_id={0}'.format(submission_id))
            return TaskProgressReport.CANCELLED
        study_pid = study_bo.persistentidentifier_set.create(
            archive='ENA',
            pid_type='TSQ',
            pid=accession,
        )
        return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.validate_against_ena_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def validate_against_ena_task(self, submission_id=None, action='VALIDATE'):
    results = send_data_to_ena_for_validation_or_test(self, submission_id,
                                                      action)
    return results


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.submit_to_ena_test_server_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def submit_to_ena_test_server_task(self, submission_id=None, action='ADD'):
    results = send_data_to_ena_for_validation_or_test(self, submission_id,
                                                      action)
    return results


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.process_ena_response_task',
)
def process_ena_response_task(self, transfer_result=None, submission_id=None,
                              close_submission_on_success=True):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if transfer_result == TaskProgressReport.CANCELLED or submission == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | process_ena_response_task | '
            'transfer_result or submission unavailable | '
            'submission_id={0} | submission={1} | transfer_result={2} | '
            'return={3}'.format(
                submission_id, submission, transfer_result,
                TaskProgressReport.CANCELLED, ))
        return TaskProgressReport.CANCELLED

    try:
        request_id, response_status_code, response_content = transfer_result
    except TypeError as te:
        logger.warning(
            'tasks.py | process_ena_response_task | '
            'type error parsing transfer_result of previous task | '
            'submission_id={0} | Error={1} | transfer_result={2}'.format(
                submission_id, te, transfer_result))
        return TaskProgressReport.CANCELLED

    parsed = parse_ena_submission_response(response_content)
    success = True if parsed.get('success', False) == 'true' else False
    if success:
        BrokerObject.objects.append_pids_from_ena_response(parsed)
        if close_submission_on_success:
            submission.status = Submission.CLOSED
        submission.save()
        return True
    else:
        submission.status = Submission.ERROR
        outgoing_request = RequestLog.objects.get(request_id=request_id)
        outgoing_request.request_details['parsed_ena_response'] = parsed
        outgoing_request.save()
        submission.save()
        logger.info(
            msg='process_ena_response_task. ena reported error(s) '
                'for submisison={}. refer to RequestLog={}'.format(
                submission.broker_submission_id,
                outgoing_request.request_id)
        )
        return TaskProgressReport.CANCELLED


# Pangea submission transfer tasks ---------------------------------------------

@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.create_pangaea_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def create_pangaea_issue_task(self, prev=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    jira_client = JiraClient(
        resource=site_configuration.pangaea_jira_server,
        token_resource=site_configuration.pangaea_token_server)
    jira_client.create_pangaea_issue(site_config=site_configuration,
                                     submission=submission)
    jira_error_auto_retry(jira_client=jira_client, task=self,
                          broker_submission_id=submission.broker_submission_id)
    if jira_client.issue:
        submission.additionalreference_set.create(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key=jira_client.issue.key,
            primary=True
        )
        return {
            'issue_key': jira_client.issue.key,
        }
    else:
        return TaskProgressReport.CANCELLED

@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.add_accession_to_pangaea_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_accession_to_pangaea_issue_task(self, kwargs=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    if 'issue_key' in kwargs.keys():

        # TODO: manager method to get panagea issue without needing pre-chain result
        ticket_key = kwargs.get('issue_key', 'None')
        study_pid = submission.get_primary_accession()
        if study_pid:
            jira_client = JiraClient(
                resource=site_configuration.pangaea_jira_server,
                token_resource=site_configuration.pangaea_token_server)
            jira_client.add_comment(
                key_or_issue=ticket_key,
                text='ENA Accession No. of study {}. broker_submission_id: '
                     '{0}. {1}'.format(study_pid.pid,
                                       submission.broker_submission_id),
                is_internal=False
            )

            return jira_error_auto_retry(jira_client=jira_client, task=self,
                                         broker_submission_id=submission.broker_submission_id)
    else:
        return TaskProgressReport.CANCELLED


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.attach_to_pangaea_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def attach_to_pangaea_issue_task(self, kwargs={}, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    if 'issue_key' in kwargs.keys():

        issue_key = kwargs.get('issue_key', 'None')
        jira_client = JiraClient(
            resource=site_configuration.pangaea_jira_server,
            token_resource=site_configuration.pangaea_token_server
        )
        jira_client.attach_to_pangaea_issue(key=issue_key,
                                            submission=submission)
        jira_error_auto_retry(jira_client=jira_client, task=self,
                              broker_submission_id=submission.broker_submission_id)
        return {'issue_key': issue_key}

    else:
        return TaskProgressReport.CANCELLED


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.check_for_pangaea_doi_task',
)
def check_for_pangaea_doi_task(self, resource_credential_id=None):
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    # TODO: move this to top and check there are submissiont to fetch doi for, if not no request for login token is needed
    submissions = \
        Submission.objects.get_submitted_submissions_containing_reference(
            reference_type=AdditionalReference.PANGAEA_JIRA_TICKET
        )
    logger.info(
        msg='check_for_pangaea_doi_task. pulling pangaea dois for {} '
            'submissions'.format(len(submissions)))
    # TODO: in general suboptimal to fetch sc for every submission in set, but neeeded, reconsider to refactor
    #   schedule in database etc.
    for sub in submissions:
        site_config = SiteConfiguration.objects.get_hosting_site_configuration()
        jira_client = JiraClient(resource=site_config.pangaea_jira_server,
                                 token_resource=site_config.pangaea_token_server)
        pull_pangaea_dois(sub, jira_client)


# HELPDESK TASKS --------------------------------------------------------------


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.get_gfbio_helpdesk_username_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def get_gfbio_helpdesk_username_task(self, prev_task_result=None,
                                     submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.info(
            'tasks.py | get_gfbio_helpdesk_username_task | return TaskProgressReport.CANCELLED')
        return TaskProgressReport.CANCELLED

    user_name = JIRA_FALLBACK_USERNAME
    user_email = JIRA_FALLBACK_EMAIL
    user_full_name = ''
    result = {
        'jira_user_name': user_name,
        'email': user_email,
        'full_name': user_full_name
    }
    goe_id = submission.user.externaluserid_set.filter(
        provider='goe_id').first()
    user_name = goe_id.external_id if goe_id else submission.user.username
    user_email = submission.user.email
    user_full_name = submission.user.name
    result['email'] = user_email if len(user_email) else JIRA_FALLBACK_EMAIL
    result['full_name'] = user_full_name

    response = get_gfbio_helpdesk_username(user_name=user_name,
                                           email=user_email,
                                           fullname=user_full_name)
    logger.info(
        'tasks.py | get_gfbio_helpdesk_username_task | response status={0} | content={1}'.format(
            response.status_code, response.content))

    raise_transfer_server_exceptions(
        response=response,
        task=self,
        broker_submission_id=submission.broker_submission_id,
        max_retries=SUBMISSION_MAX_RETRIES
    )

    if response.status_code == 200:
        result['jira_user_name'] = smart_str(response.content)

    logger.info(
        'tasks.py | get_gfbio_helpdesk_username_task |return={0}'.format(
            result))
    return result


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.create_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def create_submission_issue_task(self, prev_task_result=None,
                                 submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED
    # TODO: test task without check for null, what happens when errors occur here, not caused inside a
    #  method called here

    # TODO: only needed for comment on ticket, thus remove
    # TODO: althouht filter for primary should deliver only on ticket, a dedicated manager method
    #   would be cleaner (no .first() on query set)
    # existing_tickets = submission.additionalreference_set.filter(
    #     Q(type=AdditionalReference.GFBIO_HELPDESK_TICKET) & Q(primary=True))

    jira_client = JiraClient(resource=site_configuration.helpdesk_server)
    jira_client.create_submission_issue(reporter=prev_task_result,
                                        site_config=site_configuration,
                                        submission=submission)

    jira_error_auto_retry(jira_client=jira_client, task=self,
                          broker_submission_id=submission.broker_submission_id)
    if jira_client.issue:
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key=jira_client.issue.key,
            primary=True
        )
    else:
        return TaskProgressReport.CANCELLED


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.update_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def update_submission_issue_task(self, prev_task_result=None,
                                 submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
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

        return jira_error_auto_retry(jira_client=jira_client, task=self,
                                     broker_submission_id=submission.broker_submission_id)
    else:
        return TaskProgressReport.CANCELLED


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.add_accession_to_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_accession_to_submission_issue_task(self, prev_task_result=None,
                                           submission_id=None,
                                           target_archive=None):
    if prev_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | add_accession_to_submission_issue_task | '
            'previous task reported={0} | '
            'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                       submission_id))
        return TaskProgressReport.CANCELLED
    # No submission will be returned if submission.status is error
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )

    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    comment = get_jira_comment_template(
        template_name="ACCESSION_COMMENT",
        task_name="add_accession_to_submission_issue_task")
    if not comment:
        return TaskProgressReport.CANCELLED

    # TODO: althouht filter for primary should deliver only on ticket, a dedicated manager method
    #   would be cleaner (no .first() on query set)
    # TODO: result is a list of GFbio helpdesk tickets wich are primary,
    #   tecnically len can only be 1, due to model.save ...
    # existing_tickets = submission.additionalreference_set.filter(
    #     Q(type=AdditionalReference.GFBIO_HELPDESK_TICKET) & Q(primary=True))
    reference = submission.get_primary_helpdesk_reference()

    submitter_name = 'Submitter'
    try:
        user = submission.user
        if len(user.name):
            submitter_name = user.name
    except User.DoesNotExist as e:
        logger.warning(
            'tasks.py | add_accession_to_submission_issue_task | '
            'submission_id={0} | No user with '
            'submission.submiting_user={1} | '
            '{2}'.format(submission_id, submission.user, e))
    except ValueError as ve:
        logger.warning(
            'tasks.py | add_accession_to_submission_issue_task | '
            'submission_id={0} | ValueError with '
            'submission.submiting_user={1} | '
            '{2}'.format(submission_id, submission.user, ve))

    # TODO: previous task is process_ena_response_task, if ena responded successfully
    #  and delievered accesstions, theses are appended as persistentidentifiers
    #  if all worked Pids shoul be in DB and process returns true
    # TODO: makes sense only for ENA or ENA_PANGAEA targets
    if reference and prev_task_result is True:
        if target_archive == ENA or target_archive == ENA_PANGAEA:
            study_pid = submission.brokerobject_set.filter(
                type='study'
            ).first().persistentidentifier_set.filter(
                pid_type='PRJ'
            ).first()

            comment = jira_comment_replace(
                comment=comment,
                submitter=submitter_name,
                primary_accession=study_pid.pid)
            jira_client = JiraClient(
                resource=site_configuration.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key,
                text=comment,
                is_internal=False
            )
            return jira_error_auto_retry(jira_client=jira_client, task=self,
                                         broker_submission_id=submission.broker_submission_id)


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.add_accession_link_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_accession_link_to_submission_issue_task(self, prev_task_result=None,
                                                submission_id=None,
                                                target_archive=None):
    if prev_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | add_accession_link_to_submission_issue_task | '
            'previous task reported={0} | '
            'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                       submission_id))
        return TaskProgressReport.CANCELLED
    # No submission will be returned if submission.status is error
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )

    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    if reference and prev_task_result is True:
        if target_archive == ENA or target_archive == ENA_PANGAEA:
            study_pid = submission.brokerobject_set.filter(
                type='study'
            ).first().persistentidentifier_set.filter(
                pid_type='PRJ'
            ).first()

            jira_client = JiraClient(
                resource=site_configuration.helpdesk_server)
            jira_client.add_ena_study_link_to_issue(reference.reference_key,
                                                    study_pid.pid)
            return jira_error_auto_retry(jira_client=jira_client, task=self,
                                         broker_submission_id=submission.broker_submission_id)


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.add_posted_comment_to_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_posted_comment_to_issue_task(self, prev_task_result=None,
                                     submission_id=None, comment='',
                                     user_values={}):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    if reference:
        comment_text = comment
        if 'username' in user_values.keys() and 'email' in user_values.keys():
            comment_text = SUBMISSION_COMMENT_TEMPLATE.format(
                user_values.get('username', ''),
                user_values.get('email', ''),
                comment)
        jira_client = JiraClient(resource=site_configuration.helpdesk_server)
        jira_client.add_comment(
            key_or_issue=reference.reference_key,
            text=comment_text,
            is_internal=False
        )
        return jira_error_auto_retry(jira_client=jira_client, task=self,
                                     broker_submission_id=submission.broker_submission_id)
    else:
        logger.info(
            msg='add_posted_comment_to_issue_task no tickets found. '
                'submission_id={0} '.format(submission_id)
        )

        return retry_no_ticket_available_exception(
            task=self,
            broker_submission_id=submission.broker_submission_id,
            number_of_tickets=1 if reference else 0
        )


# FIXME: here problems while using new jirclient to attach, especiall while put submissionupload
@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.attach_to_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def attach_to_submission_issue_task(self, kwargs=None, submission_id=None,
                                    submission_upload_id=None, ):
    logger.info(
        msg='attach_to_submission_issue_task. submission_id={0} | submission_upload_id={1}'
            ''.format(submission_id, submission_upload_id))

    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        logger.info(
            msg='attach_to_submission_issue_task no Submission'
                ' found. return {2}. | submission_id={0} | submission_upload_id={1}'
                ''.format(submission_id, submission_upload_id,
                          TaskProgressReport.CANCELLED))
        return TaskProgressReport.CANCELLED

    reference = submission.get_primary_helpdesk_reference()

    logger.info(
        msg='attach_to_submission_issue_task | reference={0}'.format(reference))

    # TODO: if no ticket available, the reason may that this task is started independened of
    #  submission transfer chain that creates the ticket, so a proper retry has to be
    #  implemented
    if reference:
        submission_upload = submission.submissionupload_set.filter(
            attach_to_ticket=True).filter(pk=submission_upload_id).first()
        logger.info(
            msg='attach_to_submission_issue_task | submission_upload={0}'.format(
                submission_upload))
        if submission_upload:

            do_attach = False
            if submission_upload.attachment_id is None:
                do_attach = True
            if submission_upload.modified_recently:
                do_attach = True

            if not do_attach:
                logger.info(
                    msg='attach_to_submission_issue_task | do_attach={0} | return {1}'.format(
                        do_attach, TaskProgressReport.CANCELLED))
                return TaskProgressReport.CANCELLED

            # TODO: access media nginx https://stackoverflow.com/questions/8370658/how-to-serve-django-media-files-via-nginx
            jira_client = JiraClient(
                resource=site_configuration.helpdesk_server,
            )
            attachment = jira_client.add_attachment(
                key=reference.reference_key,
                file=submission_upload.file,
            )

            jira_error_auto_retry(jira_client=jira_client, task=self,
                                  broker_submission_id=submission.broker_submission_id)

            submission_upload.attachment_id = attachment.id
            submission_upload.modified_recently = False
            submission_upload.save(ignore_attach_to_ticket=True)

            logger.info(
                msg='attach_to_submission_issue_task | do_attach={0} | return {1}'.format(
                    do_attach, True))

            return True
        else:
            logger.info(
                msg='attach_to_submission_issue_task no SubmissionUpload'
                    ' found. submission_id={0} | submission_upload_id={1}'
                    ''.format(submission_id, submission_upload_id))
            return False
    else:
        logger.info(
            msg='attach_to_submission_issue_task no tickets found. '
                'submission_id={0} | submission_upload_id={1}'
                ''.format(submission_id, submission_upload_id))

        return retry_no_ticket_available_exception(
            task=self,
            broker_submission_id=submission.broker_submission_id,
            number_of_tickets=1 if reference else 0
        )


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.delete_submission_issue_attachment_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def delete_submission_issue_attachment_task(self, kwargs=None,
                                            submission_id=None,
                                            attachment_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
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
    return jira_error_auto_retry(jira_client=jira_client, task=self,
                                 broker_submission_id=submission.broker_submission_id)


# TODO: add tests ...
@app.task(
    base=SubmissionTask, bind=True, name='tasks.add_pangaea_doi_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_pangaea_doi_task(self, prev_task_result=None,
                         pangaea_doi=None, submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
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
            text='Pangaea DOI: {0}. broker_submission_id: {1}'.format(
                pangaea_doi, submission.broker_submission_id),
            is_internal=False
        )
        return jira_error_auto_retry(jira_client=jira_client, task=self,
                                     broker_submission_id=submission.broker_submission_id)


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.add_pangaealink_to_submission_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def add_pangaealink_to_submission_issue_task(
        self,
        prev=None,
        submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    helpdesk_reference = submission.get_primary_helpdesk_reference()
    pangaea_reference = submission.get_primary_pangaea_reference()

    if helpdesk_reference and pangaea_reference:
        jira_client = JiraClient(
            resource=site_configuration.helpdesk_server)

        jira_client.add_comment(
            key_or_issue=helpdesk_reference.reference_key,
            text='[Pangaea Ticket {1}|{0}{1}]'.format(
                PANGAEA_ISSUE_VIEW_URL,
                pangaea_reference.reference_key),
            is_internal=False
        )
        return jira_error_auto_retry(jira_client=jira_client, task=self,
                                     broker_submission_id=submission.broker_submission_id)


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.fetch_ena_reports_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def fetch_ena_reports_task(self):
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
    if site_configuration is None or site_configuration.ena_report_server is None:
        return TaskProgressReport.CANCELLED
    result = True
    logger.info(msg='tasks.py | fetch_ena_reports_task | start update')
    for report_type in EnaReport.REPORT_TYPES:
        type_key, type_name = report_type
        logger.info(
            msg='tasks.py | fetch_ena_reports_task | get report of type={0}'.format(
                type_name))
        try:
            response, request_id = fetch_ena_report(site_configuration,
                                                    type_name)
            if response.ok:
                obj, updated = EnaReport.objects.update_or_create(
                    report_type=type_key,
                    defaults={
                        'report_type': type_key,
                        'report_data': json.loads(response.content)
                    }
                )
            else:
                # FIXME: retry count applies to fetch_ena_reports_task not
                #  single report type, thus if a retry is counted for a single
                #  report, this accumulates for all following reports types.
                #  e.g.: study retry+1. sample retry+1. no retries left
                #  for experiment or run
                result = raise_transfer_server_exceptions(
                    response=response,
                    task=self,
                    max_retries=SUBMISSION_MAX_RETRIES)
                logger.info(
                    msg='tasks.py | fetch_ena_reports_task | '
                        'raise_transfer_server_exceptions result={0}'.format(
                        result))
        except ConnectionError as e:
            logger.error(
                msg='tasks.py | fetch_ena_reports_task | url={1} title={2} '
                    '| connection_error {0}'.format(
                    e,
                    site_configuration.ena_report_server.url,
                    site_configuration.ena_report_server.title)
            )
            return TaskProgressReport.CANCELLED
    return result


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.update_resolver_accessions_task',
)
def update_resolver_accessions_task(self, previous_task_result=False):
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    logger.info(
        msg='tasks.py | update_resolver_accessions_task '
            '| previous_task_result={0}'.format(previous_task_result))
    if previous_task_result == TaskProgressReport.CANCELLED or previous_task_result is None:
        logger.info(
            msg='tasks.py | update_resolver_accessions_task '
                '| error(s) in previous tasks | return={0}'.format(
                previous_task_result))
        mail_admins(
            subject='Failing update caused by error in "tasks.fetch_ena_reports_task"',
            message='Due to an error in "tasks.fetch_ena_reports_task" the execution'
                    'of {} was stopped.\nWARNING: Resolver tables are not '
                    'updated properly !'.format(self.name)
        )
        return TaskProgressReport.CANCELLED, TaskProgressReport.CANCELLED
    success = update_resolver_accessions()
    logger.info(
        msg='tasks.py | update_resolver_accessions_task '
            '| success={0}'.format(success))

    return success, previous_task_result


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.update_persistent_identifier_report_status_task',
)
def update_persistent_identifier_report_status_task(self,
                                                    previous_task_result=None):
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    logger.info(
        msg='tasks.py | update_persistent_identifier_report_status_task '
            '| previous_task_result={0}'.format(previous_task_result))
    fetch_report_status = False
    try:
        previous_task_status, fetch_report_status = previous_task_result
    except TypeError:
        pass
    if fetch_report_status == TaskProgressReport.CANCELLED or fetch_report_status is None:
        logger.info(
            msg='tasks.py | update_resolver_accessions_task '
                '| error(s) in previous tasks | return={0}'.format(
                previous_task_result))
        mail_admins(
            subject='Failing update caused by error in "tasks.fetch_ena_reports_task"',
            message='Due to an error in "tasks.fetch_ena_reports_task" the execution'
                    'of {} was stopped.\nWARNING: Persistent Identifier tables are not '
                    'updated properly !'.format(self.name)
        )
        return TaskProgressReport.CANCELLED
    success = update_persistent_identifier_report_status()
    logger.info(
        msg='tasks.py | update_persistent_identifier_report_status_task '
            '| success={0}'.format(success))

    return success


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.update_accession_objects_from_ena_report_task',
)
def update_accession_objects_from_ena_report_task(self):
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    logger.info(
        msg='tasks.py | update_accession_objects_from_ena_report_task '
            '| start update')
    execute_update_accession_objects_chain(
        name_on_error=self.name
    )
    logger.info(
        msg='tasks.py | update_accession_objects_from_ena_report_task '
            '| finished')
    return True


# FIXME: It is possible to set a submission for the taskprogressreport here.
@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.notify_user_embargo_expiry_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def notify_user_embargo_expiry_task(self):
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)

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
        study = submission.brokerobject_set.filter(type='study').first()
        if study:
            # get persistent identifier
            study_pid = study.persistentidentifier_set.filter(
                pid_type='PRJ').first()
            if study_pid:
                # check if hold_date is withing 4 weeks
                four_weeks_from_now = datetime.date.today() + datetime.timedelta(
                    days=28)
                should_notify = True
                # check if user was already notified
                if study_pid.user_notified and study_pid.user_notified <= four_weeks_from_now:
                    should_notify = False
                if submission.embargo <= four_weeks_from_now and should_notify:
                    # send embargo notification comment to JIRA
                    comment = get_jira_comment_template(
                        template_name="NOTIFY_EMBARGO_EXPIRY",
                        task_name="notify_user_embargo_expiry_task")
                    if not comment:
                        return TaskProgressReport.CANCELLED

                    submission, site_configuration = get_submission_and_site_configuration(
                        submission_id=submission.id,
                        task=self,
                        include_closed=True
                    )
                    reference = submission.get_primary_helpdesk_reference()

                    comment = jira_comment_replace(
                        comment=comment,
                        embargo=submission.embargo.isoformat())

                    jira_client = JiraClient(
                        resource=site_configuration.helpdesk_server)
                    jira_client.add_comment(
                        key_or_issue=reference.reference_key,
                        text=comment,
                        is_internal=False
                    )

                    jira_error_auto_retry(jira_client=jira_client, task=self,
                                          broker_submission_id=submission.broker_submission_id)

                    if jira_client.comment:
                        study_pid.user_notified = datetime.date.today()
                        study_pid.save()

                        results.append({
                            'submission': submission.broker_submission_id,
                            'issue_key': reference.reference_key,
                            'embargo': submission.embargo.isoformat(),
                            'user_notified_on': datetime.date.today().isoformat(),
                        })

    if len(results) != 0:
        return results

    return "No notifications to send"


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.check_for_submissions_without_helpdesk_issue_task',
)
def check_for_submissions_without_helpdesk_issue_task(self):
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    logger.info(
        msg='tasks.py |  check_for_submissions_without_helpdesk_issue_task |'
            ' start search')
    submissions_without_issue = Submission.objects.get_submissions_without_primary_helpdesk_issue()
    for sub in submissions_without_issue:
        logger.info(
            msg='tasks.py | check_for_submissions_without_helpdesk_issue_task '
                '| no helpdesk issue for submission {} | '
                'sending mail to admins'.format(sub.broker_submission_id))
        mail_admins(
            subject=NO_HELPDESK_ISSUE_EMAIL_SUBJECT_TEMPLATE.format(
                sub.broker_submission_id),
            message=NO_HELPDESK_ISSUEE_EMAIL_MESSAGE_TEMPLATE.format(
                sub.broker_submission_id, sub.user.username
            )
        )
    return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.check_issue_existing_for_submission_task',
)
def check_issue_existing_for_submission_task(self, prev=None,
                                             submission_id=None):
    logger.info('tasks.py | check_issue_existing_for_submission_task | '
                'submission_id={0}'.format(submission_id))

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if len(submission.additionalreference_set.filter(
            primary=True, type=AdditionalReference.GFBIO_HELPDESK_TICKET)) < 1:
        logger.error(
            'tasks.py | check_issue_existing_for_submission_task | '
            'no helpdesk issue found for submission={0}  | '
            'submission_id={1}'.format(
                submission.broker_submission_id, submission_id)
        )
        mail_admins(
            subject=NO_HELPDESK_ISSUE_EMAIL_SUBJECT_TEMPLATE.format(
                submission.broker_submission_id),
            message=NO_HELPDESK_ISSUEE_EMAIL_MESSAGE_TEMPLATE.format(
                submission.broker_submission_id, submission.user.username
            )
        )
        return TaskProgressReport.CANCELLED

    return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.check_for_user_without_site_configuration_task',
)
def check_for_user_without_site_configuration_task(self):
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    logger.info(
        msg='tasks.py | check_for_user_without_site_configuration_task | start search')
    users_without_config = User.objects.filter(is_user=True,
                                               site_configuration=None)
    site_config = SiteConfiguration.objects.get_hosting_site_configuration()
    mail_content = 'Users without site_configuration found:'
    for u in users_without_config:
        logger.info(
            msg='tasks.py | check_for_user_without_site_configuration_task | '
                'found user {0} without site_configuration | '
                'assign site_configuration'
                ' {1}'.format(u.username, site_config.title))
        u.site_configuration = site_config
        u.save()
        mail_content += '\nusername: {0}\temail: {1}\tpk: {2}'.format(
            u.username, u.email, u.pk)
    mail_content += '\nSite_configuration {0} was assigned automatically'.format(
        site_config.title)
    if len(users_without_config):
        mail_admins(
            subject=NO_SITE_CONFIG_EMAIL_SUBJECT_TEMPLATE.format(
                len(users_without_config)),
            message=mail_content)
    return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.notify_curators_on_embargo_ends_task',
)
def notify_curators_on_embargo_ends_task(self):
    from django.conf import settings
    from .configuration.settings import JIRA_TICKET_URL
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)

    results = []
    all_submissions = Submission.objects.all()
    for submission in all_submissions:
        # ignore submission without embargo
        if not submission.embargo:
            continue
        # only send notification for closed submissions with PID type PRJ
        # and when embargo date is not in the past
        if submission.status != Submission.CLOSED or submission.embargo < datetime.date.today():
            continue
        # get study object
        study = submission.brokerobject_set.filter(type='study').first()
        if study:
            # get persistent identifier
            study_pid = study.persistentidentifier_set.filter(
                pid_type='PRJ').first()
            if study_pid:
                # check if embargo is withing 7 days
                one_week_from_now = datetime.date.today() + datetime.timedelta(
                    days=6)
                if submission.embargo <= one_week_from_now:
                    # get jira link
                    if submission.get_primary_helpdesk_reference():
                        jira_link = '{}{}'.format(JIRA_TICKET_URL,
                                                  submission.get_primary_helpdesk_reference())
                    else:
                        jira_link = 'No ticket found'

                    # collect details
                    results.append({
                        'submission_id': submission.broker_submission_id,
                        'accession_id': study_pid.pid,
                        'jira_link': jira_link,
                        'embargo': '{}'.format(submission.embargo),
                    })

    curators = User.objects.filter(groups__name='Curators')
    if len(results) > 0 and len(curators) > 0:
        # send email
        curators_emails = [curator.email for curator in curators]
        message = "List of Embargo dates that expire within 7 days.\n\n"
        for result in results:
            message += "Submission ID: {}\nAccession ID: {}\nJira Link: {}\nEmbargo: {}\n\n".format(
                result['submission_id'],
                result['accession_id'],
                result['jira_link'],
                result['embargo'])

        from django.core.mail import send_mail
        send_mail(
            subject='%s%s' % (
                settings.EMAIL_SUBJECT_PREFIX, ' Embargo expiry notification'),
            message=message,
            from_email=settings.SERVER_EMAIL,
            recipient_list=curators_emails,
            fail_silently=False,
        )
        results.append({'curators': curators_emails})
        return results

    return "No notifications to send"


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.notify_on_embargo_ended_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def notify_on_embargo_ended_task(self, submission_id=None):
    if not submission_id:
        return "submission_id not provided"

    logger.info(
        'tasks.py | notify_on_embargo_ended_task | submission_id={}'.format(
            submission_id))

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if site_config and site_config.helpdesk_server:
        reference = submission.get_primary_helpdesk_reference()
        primary_accession = submission.get_primary_accession()
        if reference and primary_accession:
            comment = get_jira_comment_template(
                template_name="NOTIFY_EMBARGO_RELEASE",
                task_name="notify_on_embargo_ended_task")
            if not comment:
                return TaskProgressReport.CANCELLED

            comment = jira_comment_replace(
                comment=comment,
                primary_accession=primary_accession.pid)

            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key,
                text=comment,
                is_internal=False
            )

            jira_error_auto_retry(jira_client=jira_client, task=self,
                                  broker_submission_id=submission.broker_submission_id)

            if jira_client.comment:
                primary_accession.user_notified_released = datetime.date.today()
                primary_accession.save()
                return {
                    'submission': submission.broker_submission_id,
                    'issue_key': reference.reference_key,
                    'primary_accession': primary_accession.pid,
                    'user_notified_on': datetime.date.today().isoformat(),
                }

    return "No notifications to send"


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.update_ena_embargo_task',
)
def update_ena_embargo_task(self, prev=None, submission_id=None):
    logger.info('tasks.py | update_ena_embargo_task | submission_id={0}'.format(
        submission_id))

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        mail_admins(
            subject="update_ena_embargo_task failed",
            message='Failed to get submission and site_config for the task.\n'
                    'Submission_id: {0}'.format(submission_id)
        )
        return TaskProgressReport.CANCELLED

    study_primary_accession = submission.brokerobject_set.filter(
        type='study').first()
    if study_primary_accession:
        study_primary_accession = study_primary_accession.persistentidentifier_set.filter(
            pid_type='PRJ').first()

    if site_config is None or not site_config.ena_server:
        logger.warning(
            'ena.py | update_ena_embargo_task | no site_configuration found | submission_id={0}'.format(
                submission.broker_submission_id)
        )
        return 'no site_configuration'

    if study_primary_accession:
        logger.info(
            'ena.py | update_ena_embargo_task | primary accession '
            'found for study | accession_no={0} | submission_id={1}'.format(
                study_primary_accession,
                submission.broker_submission_id)
        )

        current_datetime = datetime.datetime.now(timezone('UTC')).isoformat()
        submission_xml = textwrap.dedent(
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<SUBMISSION_SET xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
            ' xsi:noNamespaceSchemaLocation="ftp://ftp.sra.ebi.ac.uk/meta/xsd/sra_1_5/SRA.submission.xsd">'
            '<SUBMISSION'
            ' alias="gfbio:hold:{broker_submission_id}:{time_stamp}"'
            ' center_name="GFBIO" broker_name="GFBIO">'
            '<ACTIONS>'
            '<ACTION>'
            '<HOLD target="{accession_no}" HoldUntilDate="{hold_date}"/>'
            '</ACTION>'
            '</ACTIONS>'
            '</SUBMISSION>'
            '</SUBMISSION_SET>'.format(
                hold_date=submission.embargo.isoformat(),
                broker_submission_id=submission.broker_submission_id,
                time_stamp=current_datetime,
                accession_no=study_primary_accession,
            )
        )

        auth_params = {
            'auth': site_config.ena_server.authentication_string,
        }
        data = {'SUBMISSION': ('submission.xml', submission_xml)}

        response = logged_requests.post(
            url=site_config.ena_server.url,
            submission=submission,
            return_log_id=False,
            params=auth_params,
            files=data,
            verify=False
        )
        return 'success',

    else:
        logger.warning(
            'ena.py | update_ena_embargo_task | no primary accession no '
            'found for study | submission_id={0}'.format(
                submission.broker_submission_id)
        )
        return 'no primary accession number found, submission={}'.format(
            submission.broker_submission_id)


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.notify_user_embargo_changed_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def notify_user_embargo_changed_task(self, prev=None, submission_id=None):
    logger.info(
        'tasks.py | notify_user_embargo_changed_task | submission_id={0}'.format(
            submission_id))

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if site_config and site_config.helpdesk_server:
        reference = submission.get_primary_helpdesk_reference()
        if reference:
            comment = get_jira_comment_template(
                template_name="NOTIFY_EMBARGO_CHANGED",
                task_name="notify_user_embargo_changed_task")
            if not comment:
                return TaskProgressReport.CANCELLED

            comment = jira_comment_replace(
                comment=comment,
                embargo=submission.embargo.isoformat())

            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key,
                text=comment,
                is_internal=False
            )
            return jira_error_auto_retry(jira_client=jira_client, task=self,
                                         broker_submission_id=submission.broker_submission_id)
    else:
        logger.info(
            'tasks.py | notify_user_embargo_changed_task | no site_config for helpdesk_serever')

    return {
        'status': 'error',
        'submission': '{}'.format(submission.broker_submission_id),
        'msg': 'missing site_config or jira ticket'
    }


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.jira_cancel_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def jira_cancel_issue_task(self, submission_id=None, admin=False):
    logger.info(
        'tasks.py | jira_cancel_issue_task | submission_id={} admin={}'.format(
            submission_id, admin))
    TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)

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
                return jira_error_auto_retry(jira_client=jira_client, task=self,
                                             broker_submission_id=submission.broker_submission_id)

    return {
        'status': 'not canceled',
        'submission': '{}'.format(submission.broker_submission_id),
        'user': '{}'.format(submission.user),
        'admin': '{}'.format(admin)
    }


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.jira_transition_issue_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def jira_transition_issue_task(self, prev=None, submission_id=None,
                               transition_id=871, resolution="Done"):
    logger.info('tasks.py | jira_transition_issue_task | '
                'submission_id={} transition_id={} resolution={}'.format(
        submission_id, transition_id, resolution))

    if not submission_id:
        return "submission_id not provided"

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
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
                resolution=resolution
            )
            return jira_error_auto_retry(jira_client=jira_client, task=self,
                                         broker_submission_id=submission.broker_submission_id)

    return {
        'status': 'transition failed',
        'submission': '{}'.format(submission.broker_submission_id),
        'user': '{}'.format(submission.user),
        'transition_id': '{}'.format(transition_id),
        'resolution': '{}'.format(resolution),
    }


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.jira_initial_comment_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def jira_initial_comment_task(self, prev=None, submission_id=None):
    logger.info(
        'tasks.py | jira_initial_comment_task | submission_id={}'.format(
            submission_id))

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=False
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
                task_name="jira_initial_comment_task")
            if not comment:
                return TaskProgressReport.CANCELLED

            comment = jira_comment_replace(
                comment=comment,
                title=submission.data['requirements']['title'],
                submission_id=submission.broker_submission_id,
                reference=reference.reference_key
            )

            jira_client = JiraClient(resource=site_config.helpdesk_server)
            jira_client.add_comment(
                key_or_issue=reference.reference_key,
                text=comment,
                is_internal=False
            )
            jira_error_auto_retry(jira_client=jira_client, task=self,
                                  broker_submission_id=submission.broker_submission_id)
            if jira_client.comment:
                return {
                    'status': 'initial comment sent',
                    'submission': '{}'.format(submission.broker_submission_id),
                    'reference': '{}'.format(reference.reference_key),
                }

    return {
        'status': 'initial comment not sent',
        'submission': '{}'.format(submission.broker_submission_id),
        'user': '{}'.format(submission.user),
    }


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.atax_submission_parse_csv_upload_to_xml_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def atax_submission_parse_csv_upload_to_xml_task(self, previous_task_result=None,
                                              submission_id=None,  submission_upload_id=None):

    request_file_keys = [
        'specimen',
        'measurement',
        'multimedia'
        'combination'
    ]
    atax_xml_file_names_basis = ['specimen', 'measurement', 'multimedia', 'combination',]
    atax_xml_file_name = ''

    logger.info(
        'tasks.py | atax_submission_parse_csv_upload_to_xml_task | submission_id={}'.format(
            submission_id))

    # submission, site_config = get_submission_and_site_configuration(
        # submission_id=submission_id,
        # task=self,
        # include_closed=True
    # )
    # if submission == TaskProgressReport.CANCELLED:
        # return TaskProgressReport.CANCELLED

    # TODO: here it would be possible to get the related submission for the TaskReport
    report, created = TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | parse_csv_as_xml_to_update_clean_submission_task | '
            'previous task reported={0} | '
            'submission_id={1} |'
            'submission_upload_id={2}'.format(TaskProgressReport.CANCELLED,
                                              submission_id, submission_upload_id))
        pass
        #return TaskProgressReport.CANCELLED

    submission_upload = None
    #submission_upload = submission.submissionupload_set.filter(pk=submission_upload_id).filter(target=ATAX)  # .first()
    submission_upload = SubmissionUpload.objects.get_linked_atax_submission_upload(
        submission_upload_id)


    if submission_upload is None:
        logger.error(
            'tasks.py | parse_csv_as_xml_to_update_clean_submission_task | '
            'no valid SubmissionUpload available | '
            'submission_id={0}'.format(submission_id))
        return TaskProgressReport.CANCELLED

    else:
        # determine the mimetype, do this in an extra task outside here:
        import mimetypes
        from django.forms import ValidationError
        errors = []
        file_mime = mimetypes.guess_type(submission_upload.file.path)
        the_mimes = ('text/csv',)

        if not file_mime[0] in the_mimes:
            logger.warning(
                'tasks.py | atax_submission_parse_csv_upload_to_xml | '
                'SubmissionUpload file"{0}" is not in csv format={0} | '
                'submission_id={1}'.format(submission_upload.file.path, submission_id))
            return TaskProgressReport.CANCELLED

    #report.submission = submission
    report.submission = submission_upload.submission

    xml_data_as_string = ''

    # or use submission_id direct!?
    #differentiate between specimen and measurement and multimedia and combination csv file:
    file_key = analyze_filename_and_type(os.path.basename(submission_upload.file.path),submission_upload.meta_data )
    if file_key in request_file_keys:

        match str(file_key):
            case 'specimen':
                # create xml data as string:
                with open(submission_upload.file.path,
                          'r', encoding='utf-8-sig') as data_file:
                    xml_data_as_string = parse_taxonomic_csv_specimen(submission_upload.submission, data_file)
                atax_xml_file_name = atax_xml_file_names_basis[0]

            case 'measurement':
                with open(submission_upload.file.path,
                          'r', encoding='utf-8-sig') as data_file:
                    xml_data_as_string = parse_taxonomic_csv_measurement(submission_upload.submission, data_file)
                atax_xml_file_name = atax_xml_file_names_basis[1]

            case 'multimedia':
                with open(submission_upload.file.path,
                          'r', encoding='utf-8-sig') as data_file:
                    xml_data_as_string = parse_taxonomic_csv_multimedia(submission_upload.submission, data_file)
                atax_xml_file_name = atax_xml_file_names_basis[2]

            case _:
                logger.warning(
                    'tasks.py | atax_submission_parse_csv_upload_to_xml | '
                    'SubmissionUpload file"{0}" has no expected type={0} | '
                    'submission_id={1}'.format(submission_upload.file.path, submission_id))
                return TaskProgressReport.CANCELLED

        # store xml data informations in auditabletextdata:
        if xml_data_as_string and  len(xml_data_as_string) > 0:
            store_atax_data_as_auditable_text_data(submission=submission_upload.submission,
                          file_name_basis=atax_xml_file_name,
                          data=xml_data_as_string,
                          comment=os.path.basename(submission_upload.file.path))
            #remove this line: test
            atax_submission_upload, n1, n2, n3, n4 = AuditableTextData.objects.assemble_atax_submission_uploads(
                submission=submission_upload.submission)
            return xml_data_as_string

        else:
            # no success while csv to xml  transformation:
            submission_upload.submission.status = Submission.ERROR
            submission_upload.submission.save()

            logger.info(
                msg='atax_submission_parse_csv_upload_to_xml_task. no transformed xml upload data. '
                    'return={0} '
                    'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                               submission_id)
            )
            return TaskProgressReport.CANCELLED

    #return False
    return True

@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.atax_submission_validate_xml_converted_upload_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def atax_submission_validate_xml_converted_upload_task(self, previous_task_result=None,
                                              submission_id=None, submission_upload_id=None):

    #logger.info(
    #   'tasks.py | jira_initial_comment_task | submission_id={}'.format(
    #      submission_id))

    #submission, site_config = get_submission_and_site_configuration(
    #    submission_id=submission_id,
    #    task=self,
    #    include_closed=False
    #)
    #if submission == TaskProgressReport.CANCELLED:
    #   return TaskProgressReport.CANCELLED

    # TODO: here it would be possible to get the related submission for the TaskReport
    # maybe this is for the filename to extract from auditable text data
    # or omit this and do this by passing the xml string as parameter
    report, created = TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | atax_submission_has_upload_task | '
            'previous task reported={0} | '
            'submission_upload_id={1}'.format(TaskProgressReport.CANCELLED,
                                              submission_upload_id))
        return TaskProgressReport.CANCELLED

    submission_upload = SubmissionUpload.objects.get_linked_atax_submission_upload(
        submission_upload_id)

    # or test here if xml_string is None
    if submission_upload is None:
        logger.error(
            'tasks.py | atax_submission_has_upload_task | '
            'no valid SubmissionUpload available | '
            'submission_id={0}'.format(submission_id))
        return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission

    #  determine the path for the ABCD validation schema file
    path = os.path.join(
        os.getcwd(),
        'gfbio_submissions/brokerage/schemas/ABCD_2.06.XSD')

    # return  the auditabletextdata from Upload, [0] means first element in the upload list:
    upload_name = submission_upload.file.name.split('/')[-1:][0]

    text_to_validate=''
    if len(submission_upload.submission.auditabletextdata_set.filter(comment=upload_name)):
        auditable_xml = submission_upload.submission.auditabletextdata_set.filter(
            comment=upload_name).first().pk
        if auditable_xml is None:
            logger.info(
                'tasks.py | atax_auditable_task | no  textdata found | submission_id={0}'.format(
                    submission_upload.submission.broker_submission_id)
            )
        fname_of_first_upload = submission_upload.submission.auditabletextdata_set.filter(
            comment=upload_name).first()
        if fname_of_first_upload is not None:
            text_to_validate = fname_of_first_upload.text_data

            is_val, errors=validate_atax_data_is_valid(
                submission = submission_upload.submission,
                schema_file='ABCD_2.06.XSD',
                xml_string=text_to_validate  # string_xml_converted
            )
        #if not valid:
            if errors:
                messages = [e.message for e in errors]
                submission_upload.submission.data.update(
                    {'validation': messages})
                report.task_exception_info = json.dumps({'validation': messages})

                report.save()
                submission_upload.submission.status = Submission.ERROR
                submission_upload.submission.save()
                return TaskProgressReport.CANCELLED

            else:
                submission_upload.submission.save()
                # try to update audit entry:

                if fname_of_first_upload is not None:

                    fname_of_first_upload.comment = fname_of_first_upload.comment + " - ABCD validated!"
                    fname_of_first_upload.save()

                return text_to_validate

        '''
        # INSERTION of MEASUREMENT values into SPECIMEN
        # not necessary, only if the specimen.xml should contain all the information
        atax_submission_upload = AuditableTextData.objects.assemble_atax_submission_uploads(
            submission=submission_upload.submission)
        if atax_submission_upload == {}:
            return TaskProgressReport.CANCELLED
        else:
            #  integrate measurements or/ and multimedia into specimen.xml:
            if len(atax_submission_upload)>1 and 'SPECIMEN' in atax_submission_upload.keys():
                if 'MEASUREMENT' in atax_submission_upload.keys():
                    specimen_abcd_updated = update_specimen_measurements_abcd_xml(atax_submission_upload)
                    #validate the combined construct:

                    is_val, errors = validate_atax_data_is_valid(
                        schema_file='ABCD_2.06.XSD',
                        xml_string=specimen_abcd_updated  # string_xml_converted
                    )
                    # if not valid:
                    if errors:
                        messages = [e.message for e in errors]
                        submission_upload.submission.data.update(
                            {'validation of combined measurements integrated in specimen failed': messages})
                        report.task_exception_info = json.dumps({'validation of combined measurements integrated in specimen failed': messages})

                        report.save()

                        # submission_upload.submission.status = Submission.ERROR
                        # return TaskProgressReport.CANCELLED
                    else:
                        # submission_upload.submission.save()
                        # save enlarged xml structure (SPECIMEN and MEASUREMENT):
                        specimen_tuple = atax_submission_upload['SPECIMEN']
                        specimen_base = str(specimen_tuple[2])

                        measurement_tuple = atax_submission_upload['MEASUREMENT']
                        measurement_base = str(measurement_tuple[2])

                        if specimen_abcd_updated is not None and len(specimen_abcd_updated) > 0:
                            store_atax_data_as_auditable_text_data(submission=submission_upload.submission,
                                                                   file_name='specimen_2.xml',
                                                                   data=specimen_abcd_updated,
                                                                   comment=specimen_base+', '+measurement_base)
                            #evtl. for database entry of these auditable data:
                            submission_upload.submission.save()
                            #control this:
                            #new_atax_submission_upload = AuditableTextData.objects.assemble_atax_submission_uploads(
                            #    submission=submission_upload.submission)
                            # return specimen_abcd_updated
        '''
    else:
        return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.atax_submission_combine_xmls_and_validate_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def atax_submission_combine_xmls_and_validate_task(self, previous_task_result=None,
                                              submission_id=None, submission_upload_id=None):

    #logger.info(
    #   'tasks.py | jira_initial_comment_task | submission_id={}'.format(
    #      submission_id))

    # submission, site_config = get_submission_and_site_configuration(
      #  submission_id=submission_id,
       # task=self,
      #  include_closed=False
    # )
    #if submission == TaskProgressReport.CANCELLED:
     #   return TaskProgressReport.CANCELLED

    # TODO: here it would be possible to get the related submission for the TaskReport
    # maybe this is for the filename to extract from auditable text data
    # or omit this and do this by passing the xml string as parameter
    report, created = TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)

    if previous_task_result == TaskProgressReport.CANCELLED:
        logger.warning(
            'tasks.py | atax_submission_has_upload_task | '
            'previous task reported={0} | '
            'submission_upload_id={1}'.format(TaskProgressReport.CANCELLED,
                                              submission_upload_id))
        return TaskProgressReport.CANCELLED

    submission_upload = SubmissionUpload.objects.get_linked_atax_submission_upload(
        submission_upload_id)

    # or test here if xml_string is None
    if submission_upload is None:
        logger.error(
            'tasks.py | atax_submission_has_upload_task | '
            'no valid SubmissionUpload available | '
            'submission_id={0}'.format(submission_id))
        return TaskProgressReport.CANCELLED

    report.submission = submission_upload.submission

    #  determine the path for the ABCD validation schema file
    path = os.path.join(
        os.getcwd(),
        'gfbio_submissions/brokerage/schemas/ABCD_2.06.XSD')

    # return  the auditabletextdata from Upload, [0] means first element in the upload list:
    # precondition: is valid, has this addition
    upload_name = submission_upload.file.name.split('/')[-1:][0] + " - ABCD validated!"

    text_to_validate=''
    if len(submission_upload.submission.auditabletextdata_set.filter(comment=upload_name)):
        auditable_xml = submission_upload.submission.auditabletextdata_set.filter(
            comment=upload_name).first().pk
        if auditable_xml is None:
            logger.info(
                'tasks.py | atax_auditable_task | no  textdata found | submission_id={0}'.format(
                    submission_upload.submission.broker_submission_id)
            )
        # fname_of_first_upload = submission_upload.submission.auditabletextdata_set.filter(
        #     comment=upload_name).first()
        # if fname_of_first_upload is not None:
        #    text_to_validate = fname_of_first_upload.text_data

        # INSERTION of MEASUREMENT values into SPECIMEN
        # if the specimen.xml should contain all the information
        # build dictionary, present is the last upload only!
        atax_submission_upload, n1, n2, n3, n4 = AuditableTextData.objects.assemble_atax_submission_uploads(
            submission=submission_upload.submission)
        if atax_submission_upload == {}:
            return TaskProgressReport.CANCELLED
        else:
            #  integrate measurements or/ and multimedia into specimen.xml:
            if len(atax_submission_upload)>1 and 'SPECIMEN' in atax_submission_upload.keys():
                if 'MEASUREMENT' in atax_submission_upload.keys():
                    specimen_abcd_updated = update_specimen_measurements_abcd_xml(atax_submission_upload)
                    #validate the combined construct:
                    errors = []
                    #this reactivate!
                    # is_val, errors = validate_atax_data_is_valid(
                    #    schema_file='ABCD_2.06.XSD',
                    #    xml_string=specimen_abcd_updated  # string_xml_converted
                    #)
                    # if not valid:
                    if errors:
                        messages = [e.message for e in errors]
                        submission_upload.submission.data.update(
                            {'validation of combined measurements integrated in specimen failed': messages})
                        report.task_exception_info = json.dumps({'validation of combined measurements integrated in specimen failed': messages})

                        report.save()

                        # submission_upload.submission.status = Submission.ERROR
                        # return TaskProgressReport.CANCELLED
                    else:

                        # submission_upload.submission.save()
                        # save enlarged xml structure (SPECIMEN and MEASUREMENT):
                        specimen_tuple = atax_submission_upload['SPECIMEN']
                        specimen_base = str(specimen_tuple[2])

                        measurement_tuple = atax_submission_upload['MEASUREMENT']
                        measurement_base = str(measurement_tuple[2])

                        if specimen_abcd_updated is not None and len(specimen_abcd_updated) > 0:
                            store_atax_data_as_auditable_text_data(submission=submission_upload.submission,
                                                                   file_name_basis='combination',
                                                                   data=specimen_abcd_updated,
                                                                   comment=specimen_base+', '+measurement_base)
                            #evtl. for database entry of these auditable data:
                            submission_upload.submission.save()
                            return specimen_abcd_updated
                            #control this:
                            #new_atax_submission_upload = AuditableTextData.objects.assemble_atax_submission_uploads(
                            #    submission=submission_upload.submission)
                            # return specimen_abcd_updated

        return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.atax_submission_validate_xml_combination_task',
    autoretry_for=(TransferServerError,
                   TransferClientError
                   ),
    retry_kwargs={'max_retries': SUBMISSION_MAX_RETRIES},
    retry_backoff=SUBMISSION_RETRY_DELAY,
    retry_jitter=True
)
def atax_submission_validate_xml_combination_task(self, previous_task_result=None,
                                              submission_id=None):
    if not submission_id:
        return "submission_id not provided"

    submission, site_config = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    report, created = TaskProgressReport.objects.create_initial_report(
        submission=None,
        task=self)
    report.submission = submission

    #  determine the path for the ABCD validation schema file
    path = os.path.join(
        os.getcwd(),
        'gfbio_submissions/brokerage/schemas/ABCD_2.06.XSD')

    # return  the auditabletextdata from Upload, [0] means first element in the upload list:
    #upload_name = submission_upload.file.name.split('/')[-1:][0]

    text_to_validate=''
    if len(submission.auditabletextdata_set.filter(name='combination_1.xml')):
        auditable_xml = submission.auditabletextdata_set.filter(
            name='combination_1.xml').first().pk
        if auditable_xml is None:
            logger.info(
                'tasks.py | atax_auditable_task | no  textdata found | submission_id={0}'.format(
                    submission.broker_submission_id)
            )
        fname_of_combination = submission.auditabletextdata_set.filter(
            name='combination_1.xml').first()
        if fname_of_combination is not None:
            text_to_validate = fname_of_combination.text_data

            is_val, errors=validate_atax_data_is_valid(
                schema_file='ABCD_2.06.XSD',
                xml_string=text_to_validate  # string_xml_converted
            )
        #if not valid:
            if errors:
                messages = [e.message for e in errors]
                submission.data.update(
                    {'validation': messages})
                report.task_exception_info = json.dumps({'validation': messages})

                report.save()
                submission.status = Submission.ERROR
                submission.save()
                return TaskProgressReport.CANCELLED

            else:
                submission.save()
                return text_to_validate


    else:
        return True


@app.task(
    base=SubmissionTask,
    bind=True,
    name='tasks.prepare_ena_submission_data_task',
)
def prepare_ena_submission_data_task(self, prev_task_result=None,
                                     submission_id=None):
    submission, site_configuration = get_submission_and_site_configuration(
        submission_id=submission_id,
        task=self,
        include_closed=True
    )
    if submission == TaskProgressReport.CANCELLED:
        return TaskProgressReport.CANCELLED

    if len(submission.brokerobject_set.all()) > 0:
        with transaction.atomic():
            submission.auditabletextdata_set.all().delete()
        ena_submission_data = prepare_ena_data(submission=submission)
        store_ena_data_as_auditable_text_data(submission=submission,
                                              data=ena_submission_data)
        # TODO: this will become obsolete once, data is taken from AuditableTextData ....
        return ena_submission_data
    else:
        logger.info(
            msg='prepare_ena_submission_data_task. no brokerobjects. '
                'return={0} '
                'submission_id={1}'.format(TaskProgressReport.CANCELLED,
                                           submission_id)
        )
        return TaskProgressReport.CANCELLED
# -*- coding: utf-8 -*-
import json
import logging
from io import StringIO
from json import JSONDecodeError

from django.db import transaction
from jira import JIRA, JIRAError
from requests import ConnectionError
from rest_framework import status

from gfbio_submissions.brokerage.configuration.settings import \
    PANGAEA_ISSUE_DOI_FIELD_NAME, JIRA_FALLBACK_USERNAME, \
    ENA_STUDY_URL_PREFIX
from gfbio_submissions.brokerage.utils.gfbio import \
    gfbio_prepare_create_helpdesk_payload
from gfbio_submissions.brokerage.utils.pangaea import \
    prepare_pangaea_issue_content, get_csv_from_samples
from .pangaea import request_pangaea_login_token, \
    parse_pangaea_login_token_response
from ...generic.models import RequestLog

logger = logging.getLogger(__name__)


# FIXME: Class and all methods need explicit tests
# TODO: compare tests for pangaea token
class JiraClient(object):

    def __init__(self, resource, token_resource=None):
        self.resource = resource
        self.token_resource = token_resource
        if token_resource is None:
            self.jira = self._get_connection()
        else:
            self.jira = self._get_connection(
                options={'cookies': self._get_pangaea_token()})
        self.issue = None
        self.comment = None
        self.error = None
        self.retry_count = 0
        self.max_retry_count = 3

    def _get_connection(self, max_retries=0, get_server_info=False, options={}):
        options.update({
            'server': self.resource.url
        })
        try:
            return JIRA(
                options=options,
                basic_auth=(self.resource.username, self.resource.password),
                max_retries=max_retries,
                get_server_info=get_server_info,
            )
        except ConnectionError as ce:
            RequestLog.objects.create_jira_log(
                {
                    'method': RequestLog.NONE,
                    'url': self.resource.url,
                    'request_details': {'error': '{}'.format(ce)}
                }
            )
            logger.error(
                'JiraClient | _get_connection | ConnectionError | {0}'.format(
                    ce))
        except JIRAError as je:
            RequestLog.objects.create_jira_log(
                {
                    'method': RequestLog.NONE,
                    'url': self.resource.url,
                    'request_details': {'error': '{}'.format(je)}
                }
            )
            logger.error(
                'JiraClient | _get_connection | JIRAError | {0}'.format(je))
        return None

    def _get_pangaea_token(self):
        response = request_pangaea_login_token(
            resource_credential=self.token_resource)
        return dict(PanLoginID=parse_pangaea_login_token_response(response))

    # generic methods ----------------------------------------------------------

    # https://jira.readthedocs.io/en/master/examples.html#issues
    def create_issue(self, fields={}):
        log_arguments = {
            'method': RequestLog.POST,
            'data': {'fields': fields},
            'url': self.jira._get_url('issue'),
            'request_details': {
                'function_called': '{}'.format(self.create_issue)}
        }
        try:
            self.issue = self.jira.create_issue(fields=fields)
            self.error = None
            log_arguments['response_content'] = self.issue.raw
        except JIRAError as e:
            logger.warning(
                'JiraClient | create_issue | JIRAError {0} | {1}'.format(e,
                                                                         e.text))
            log_arguments['request_details']['error'] = '{}'.format(e)
            self.issue = None
            self.error = e

        RequestLog.objects.create_jira_log(log_arguments)

    def get_issue(self, key=''):
        log_arguments = {
            'method': RequestLog.GET,
            'data': {'key': key},
            'url': self.jira._get_url('issue'),
            'request_details': {
                'function_called': '{}'.format(self.get_issue)}
        }
        try:
            self.issue = self.jira.issue(key)
            log_arguments['response_content'] = self.issue.raw
            self.error = None
        except JIRAError as e:
            logger.warning(
                'JiraClient | get_issue | JIRAError {0} | {1}'.format(e,
                                                                      e.text))
            log_arguments['request_details']['error'] = '{}'.format(e)
            self.issue = None
            self.error = e
        RequestLog.objects.create_jira_log(log_arguments)

    def update_issue(self, key, fields, notify=False):
        self.get_issue(key)
        log_arguments = {
            'method': RequestLog.PUT,
            'data': {'fiels': fields, 'key': key},
            'url': self.jira._get_url('issue'),
            'request_details': {
                'function_called': '{}'.format(self.update_issue)}
        }
        try:
            self.issue.update(notify=notify, fields=fields)
            log_arguments['response_content'] = self.issue.raw
            self.error = None
        except JIRAError as e:
            self.error = e
            log_arguments['request_details']['error'] = '{}'.format(e)
        RequestLog.objects.create_jira_log(log_arguments)

    # https://jira.readthedocs.io/en/master/examples.html#comments
    def add_comment(self, key_or_issue, text):
        log_arguments = {
            'method': RequestLog.POST,
            'data': {'key_or_issue': key_or_issue, 'text': text},
            'url': self.jira._get_url('issue/{}/comment'.format(key_or_issue)),
            'request_details': {
                'function_called': '{}'.format(self.add_comment)}
        }
        try:
            self.comment = self.jira.add_comment(key_or_issue, text)
            log_arguments['response_content'] = self.comment.raw
            self.error = None
        except JIRAError as e:
            logger.warning(
                'JiraClient | add_comment | JIRAError {0} | {1}'.format(e,
                                                                        e.text))
            self.comment = None
            self.error = e
            log_arguments['request_details']['error'] = '{}'.format(e)
        RequestLog.objects.create_jira_log(log_arguments)

    def get_comments(self, key):
        self.get_issue(key)
        log_arguments = {
            'method': RequestLog.GET,
            'data': {'key': key},
            'url': self.jira._get_url('issue/{}/comment'.format(key)),
            'request_details': {
                'function_called': '{}'.format(self.get_comments)}
        }
        try:
            comments = self.jira.comments(self.issue)
            log_arguments['response_content'] = comments
            return comments
        except JIRAError as e:
            logger.warning(
                'JiraClient | get_comments | key={0} | JIRAError {1} | '
                '{2}'.format(key, e, e.text))
            self.error = e
            log_arguments['request_details']['error'] = '{}'.format(e)
            return None
        RequestLog.objects.create_jira_log(log_arguments)

    # https://jira.readthedocs.io/en/master/examples.html#attachments
    # file-like, string-path, stringIO (requires filename)
    def add_attachment(self, key, file, file_name=None):
        self.get_issue(key)
        log_arguments = {
            'method': RequestLog.POST,
            'data': {'key': key, 'file': '{}'.format(file)},
            'url': self.jira._get_url(
                'issue/{}/attachments'.format(self.issue)),
            'request_details': {
                'function_called': '{}'.format(self.add_attachment)}
        }
        try:
            if file_name:
                attachement = self.jira.add_attachment(issue=self.issue.key,
                                                       attachment=file,
                                                       filename=file_name)
            else:
                attachement = self.jira.add_attachment(issue=self.issue.key,
                                                       attachment=file)
            log_arguments['response_content'] = attachement.raw
            return attachement
        except JIRAError as e:
            logger.warning(
                'JiraClient | add_attachment | JIRAError {0} | {1}'.format(e,
                                                                           e.text))
            self.error = e
            log_arguments['request_details']['error'] = '{}'.format(e)
            return None
        RequestLog.objects.create_jira_log(log_arguments)

    def delete_attachment(self, id):
        log_arguments = {
            'method': RequestLog.DELETE,
            'data': {'id': id},
            'url': self.jira._get_url('attachment/{}'.format(id)),
            'request_details': {
                'function_called': '{}'.format(self.delete_attachment)}
        }
        try:
            response = self.jira.delete_attachment(id)
            log_arguments['response_content'] = response.content
            log_arguments['response_status'] = response.status_code
            self.error = None
        except JIRAError as e:
            logger.warning(
                'JiraClient | delete_attachment | JIRAError {0} | {1}'.format(e,
                                                                              e.text))
            log_arguments['request_details']['error'] = '{}'.format(e)
            self.error = e
        RequestLog.objects.create_jira_log(log_arguments)

    def add_remote_link(self, key_or_issue, url='', title=''):
        log_arguments = {
            'method': RequestLog.POST,
            'data': {'key_or_issue': key_or_issue, 'url': url, 'title': title},
            'url': self.jira._get_url(
                'issue/{}/remotelink'.format(key_or_issue)),
            'request_details': {
                'function_called': '{}'.format(self.add_remote_link)}
        }
        try:
            remote_link = self.jira.add_remote_link(key_or_issue, {
                'url': url,
                'title': title
            })
            log_arguments['response_content'] = remote_link.raw
            self.error = None
        except JIRAError as e:
            logger.warning(
                'JiraClient | add_remote_link | JIRAError {0} | {1}'.format(e,
                                                                            e.text))
            self.error = e
            log_arguments['request_details']['error'] = '{}'.format(e)
        RequestLog.objects.create_jira_log(log_arguments)

    # specialized methods ------------------------------------------------------
    # TODO: ADD RequestLogs or aquivalent ...

    def create_submission_issue(self, reporter, site_config, submission):
        self.create_issue(
            fields=gfbio_prepare_create_helpdesk_payload(
                reporter=reporter,
                site_config=site_config,
                submission=submission
            )
        )
        self.force_submission_issue(submission, site_config)

    def update_submission_issue(self, key, site_config, submission,
                                reporter=None):
        self.update_issue(
            key=key,
            fields=gfbio_prepare_create_helpdesk_payload(
                reporter=reporter,
                site_config=site_config,
                submission=submission,
                prepare_for_update=True,
            ),
            notify=True,
        )

    def force_submission_issue(self, submission, site_config):
        if self.retry_count >= self.max_retry_count:
            logger.warning(
                'JiraClient | force_submission_issue | submission {0} | '
                'retry_count too high'.format(submission.broker_submission_id))
            return None
        if self.error and self.error.status_code >= 400:
            try:
                error_messages = json.loads(self.error.response.text)
            except JSONDecodeError as e:
                pass
            # deal with jira unknown reporter
            if 'reporter' in error_messages.get('errors', {}).keys():
                reporter_errors = error_messages.get('errors', {})
                if 'The reporter specified is not a user' in reporter_errors.get(
                        'reporter', ''):
                    default = {
                        'name': JIRA_FALLBACK_USERNAME,
                        'user_full_name': '',
                        'first_name': '',
                        'last_name': '',
                    }
                    self.retry_count += 1
                    return self.create_submission_issue(
                        reporter=default,
                        submission=submission,
                        site_config=site_config
                    )

    def create_pangaea_issue(self, site_config, submission):
        self.create_issue(
            fields=prepare_pangaea_issue_content(
                site_configuration=site_config, submission=submission)
        )

    def attach_to_pangaea_issue(self, key, submission):
        attachment = StringIO()
        attachment.write(get_csv_from_samples(submission=submission))
        self.add_attachment(key=key, file=attachment,
                            file_name='contextual_data.csv')
        attachment.close()

    def add_ena_study_link_to_issue(self, key_or_issue, accession_number):
        self.add_remote_link(
            key_or_issue,
            url='{0}{1}'.format(ENA_STUDY_URL_PREFIX, accession_number),
            title='{0}'.format(accession_number)
        )

    def get_doi_from_pangaea_issue(self, key):
        logger.info(
            'JiraClient | get_doi_from_pangaea_issue | key {0} '.format(key))
        self.get_issue(key=key)
        logger.info(
            'JiraClient | get_doi_from_pangaea_issue | issue {0} '.format(
                self.issue))
        if PANGAEA_ISSUE_DOI_FIELD_NAME in self.issue.raw['fields'].keys():
            field_value = self.issue.raw['fields'][PANGAEA_ISSUE_DOI_FIELD_NAME]
            logger.info(
                'JiraClient | get_doi_from_pangaea_issue | field_value={0}'.format(
                    field_value))
            if field_value is not None and 'doi' in field_value:
                return field_value
        return None

    def cancel_issue(self, issue, submission, admin):
        transitions = self.jira.transitions(issue)
        with transaction.atomic():
            RequestLog.objects.create(
                type=RequestLog.OUTGOING,
                method=RequestLog.GET,
                url='https://helpdesk.gfbio.org/rest/api/2/issue/{}/transitions'.format(issue),
                user=submission.user,
                submission_id=submission.broker_submission_id,
                response_content=transitions,
                response_status=status.HTTP_200_OK,
            )

        cancel_transition_id = '0'
        # [(t['id'], t['name']) for t in transitions] => [(u'5', u'Resolve Issue'), (u'2', u'Close Issue')]
        for t in transitions:
            if t['id'] == '761' or t['id'] == '801':
                cancel_transition_id = t['id']
                break

        logger.info(
            'JiraClient | cancel_issue | key {} | transition_id {} '.format(issue, cancel_transition_id))

        if cancel_transition_id != '0':
            try:
                resolution_name = 'Cancelled by submitter' if not admin else 'Incomplete'
                response = self.jira.transition_issue(
                    issue,
                    cancel_transition_id,
                    fields={'resolution':{'name': resolution_name}},
                )
                response_content = response.content
                response_status = response.status_code
            except JIRAError as e:
                response_content = e.response.content
                response_status = e.status_code
                logger.info('JiraClient | cancel_issue | Error {}'.format(e))

            with transaction.atomic():
                RequestLog.objects.create(
                    type=RequestLog.OUTGOING,
                    method=RequestLog.POST,
                    url='https://helpdesk.gfbio.org/rest/api/2/issue/{}/transitions'.format(issue),
                    user=submission.user,
                    submission_id=submission.broker_submission_id,
                    response_content=response_content,
                    response_status=response_status,
                )
            return

        logger.info('JiraClient | cancel_issue | transition id 801 or 761 not found')

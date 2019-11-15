# -*- coding: utf-8 -*-
import json
import logging
from io import StringIO
from json import JSONDecodeError

from jira import JIRA, JIRAError
from requests import ConnectionError

from gfbio_submissions.brokerage.configuration.settings import \
    PANGAEA_ISSUE_DOI_FIELD_NAME, JIRA_FALLBACK_EMAIL, JIRA_FALLBACK_USERNAME
from gfbio_submissions.brokerage.utils.gfbio import \
    gfbio_prepare_create_helpdesk_payload
from gfbio_submissions.brokerage.utils.pangaea import \
    prepare_pangaea_issue_content, get_csv_from_samples
from .pangaea import request_pangaea_login_token, \
    parse_pangaea_login_token_response

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
            logger.error(
                'JiraClient | _get_connection | ConnectionError | {0}'.format(
                    ce))
        except JIRAError as je:
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
        try:
            self.issue = self.jira.create_issue(fields=fields)
            self.error = None
        except JIRAError as e:
            logger.warning(
                'JiraClient | create_issue | JIRAError {0} | {1}'.format(e,
                                                                         e.text))
            self.issue = None
            self.error = e

    def get_issue(self, key=''):
        try:
            self.issue = self.jira.issue(key)
            self.error = None
        except JIRAError as e:
            logger.warning(
                'JiraClient | get_issue | JIRAError {0} | {1}'.format(e,
                                                                      e.text))
            self.issue = None
            self.error = e

    def update_issue(self, key, fields, notify=False):
        self.get_issue(key)
        try:
            self.issue.update(notify=notify, fields=fields)
            self.error = None
        except JIRAError as e:
            self.error = e

    # https://jira.readthedocs.io/en/master/examples.html#comments
    def add_comment(self, key_or_issue, text):
        try:
            self.comment = self.jira.add_comment(key_or_issue, text)
            self.error = None
        except JIRAError as e:
            logger.warning(
                'JiraClient | add_comment | JIRAError {0} | {1}'.format(e,
                                                                        e.text))
            self.comment = None
            self.error = e

    def get_comments(self, key):
        self.get_issue(key)
        try:
            return self.jira.comments(self.issue)
        except JIRAError as e:
            logger.warning(
                'JiraClient | get_comments | key={0} | JIRAError {1} | '
                '{2}'.format(key, e, e.text))
            self.error = e
            return None

    # def get_comments(self, issue):
    #     try:
    #         return self.jira.comments(issue)
    #     except JIRAError as e:
    #         logger.warning(
    #             'JiraClient | get_comments | issue={0} | JIRAError {1} | '
    #             '{2}'.format(issue, e, e.text))
    #         self.error = e

    # https://jira.readthedocs.io/en/master/examples.html#attachments
    # file-like, string-path, stringIO (requires filename)
    def add_attachment(self, key, file, file_name=None):
        self.get_issue(key)
        try:
            if file_name:
                return self.jira.add_attachment(issue=self.issue.key,
                                                attachment=file,
                                                filename=file_name)
            else:
                return self.jira.add_attachment(issue=self.issue.key,
                                                attachment=file)
        except JIRAError as e:
            logger.warning(
                'JiraClient | add_attachment | JIRAError {0} | {1}'.format(e,
                                                                           e.text))
            self.error = e

    def delete_attachment(self, id):
        try:
            self.jira.delete_attachment(id)
            self.error = None
        except JIRAError as e:
            logger.warning(
                'JiraClient | delete_attachment | JIRAError {0} | {1}'.format(e,
                                                                              e.text))
            self.error = e

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

    def update_submission_issue(self, key, site_config, submission):
        self.update_issue(
            key=key,
            fields=gfbio_prepare_create_helpdesk_payload(
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
                        # FIXME: parameter, not hardcoded. user has to exist
                        # 'user_email': JIRA_FALLBACK_EMAIL,
                        'name': JIRA_FALLBACK_USERNAME,
                        # 'user_email': 'maweber@mpi-bremen.de',
                        # brokeragent@gfbio.org
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

    def get_doi_from_pangaea_issue(self, key):
        self.get_issue(key=key)
        if PANGAEA_ISSUE_DOI_FIELD_NAME in self.issue.raw['fields'].keys():
            field_value = self.issue.raw['fields'][PANGAEA_ISSUE_DOI_FIELD_NAME]
            if 'doi' in field_value:
                return field_value
        return None

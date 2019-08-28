# -*- coding: utf-8 -*-
import json
import logging
from io import StringIO
from json import JSONDecodeError

import sys
from jira import JIRA, JIRAError
from requests import ConnectionError

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
            logger.error('JiraClient | _get_connection | ConnectionError ', ce)
        except JIRAError as je:
            logger.error('JiraClient | _get_connection | JIRAError ', je)
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
        print('GET_ISSUE ', key)
        try:
            print('try')
            self.issue = self.jira.issue(key)
            self.error = None
            print('end of try')
        except JIRAError as e:
            logger.warning(
                'JiraClient | get_issue | JIRAError {0} | {1}'.format(e,
                                                                      e.text))
            self.issue = None
            self.error = e
        except:
            print("Unexpected error:", sys.exc_info()[0])
        print('leave get')

    def update_issue(self, key='', fields={}):
        self.get_issue(key)
        try:
            self.issue.update(fields=fields)
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

    # https://jira.readthedocs.io/en/master/examples.html#attachments
    # file-like, string-path, stringIO (requires filename)
    def add_attachment(self, key, file, file_name=None):
        self.get_issue(key)
        # print('KEY ', key)
        # try:
        #     print('ISSUE ', self.issue)
        # except TypeError as t:
        #     print("add_attachment Unexpected error:", sys.exc_info()[0], " -- >  ", t)
        try:
            if file_name:
                return self.jira.add_attachment(issue=self.issue.key, attachment=file,
                                         filename=file_name)
            else:
                print('Try attach .... ')
                print(file)
                return self.jira.add_attachment(issue=self.issue.key, attachment=file)
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

    def force_submission_issue(self, submission, site_config):
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
                        'user_email': 'maweber@mpi-bremen.de',
                        # brokeragent@gfbio.org
                        'user_full_name': '',
                        'first_name': '',
                        'last_name': '',
                    }
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

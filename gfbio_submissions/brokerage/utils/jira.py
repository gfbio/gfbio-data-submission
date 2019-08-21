# -*- coding: utf-8 -*-
import json
import logging
from json import JSONDecodeError

from jira import JIRA, JIRAError
from requests import ConnectionError

from gfbio_submissions.brokerage.utils.gfbio import \
    gfbio_prepare_create_helpdesk_payload
from .pangaea import request_pangaea_login_token, \
    parse_pangaea_login_token_response

logger = logging.getLogger(__name__)


class JiraClient(object):

    def __init__(self, resource, token_resource=None):
        self.resource = resource
        self.token_resource = token_resource
        if token_resource is None:
            self.jira = self._get_connection()
            print(self.jira)
        else:
            self.jira = self._get_connection(
                options={'cookies': self._get_pangaea_token()})
            print(self.jira)
        self.issue = None
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
        print('GET TOKEN')
        response = request_pangaea_login_token(
            resource_credential=self.token_resource)
        print(response)
        return dict(PanLoginID=parse_pangaea_login_token_response(response))

    # generic methods ----------------------------------------------------------

    def create_issue(self, fields={}):
        try:
            self.issue = self.jira.create_issue(fields=fields)
            self.error = None
        except JIRAError as e:
            logger.warning('JiraClient | create_issue | JIRAError ', e)
            self.issue = None
            self.error = e

    # specialized methods ------------------------------------------------------

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

# def create_issue():
#     options = {
#         'server': 'http://helpdesk.gfbio.org/'
#     }
#     # may cause exceptions
#     jira = JIRA(options=options,
#                 basic_auth=('brokeragent', ''),
#                 max_retries=1, get_server_info=True)
#     new_issue = jira.create_issue(fields={})

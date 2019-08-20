# -*- coding: utf-8 -*-
import logging

from jira import JIRA, JIRAError
from requests import ConnectionError

from .pangaea import request_pangaea_login_token, \
    parse_pangaea_login_token_response

logger = logging.getLogger(__name__)


class JiraClient(object):

    def __init__(self, resource, token_resource=None):
        self.resource = resource
        self.token_resource = token_resource
        if token_resource is None:
            print('TOKEN RES IS NULL')
            self.jira = self._get_connection()
            print(self.jira)
        else:
            print('TOKENRES NOT NULL')
            self.jira = self._get_connection(
                options={'cookies': self._get_pangaea_token()})
            print(self.jira)

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

# def create_issue():
#     options = {
#         'server': 'http://helpdesk.gfbio.org/'
#     }
#     # may cause exceptions
#     jira = JIRA(options=options,
#                 basic_auth=('brokeragent', ''),
#                 max_retries=1, get_server_info=True)
#     new_issue = jira.create_issue(fields={})

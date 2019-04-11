# -*- coding: utf-8 -*-
import datetime
import json
import logging

import requests
from django.db import transaction
from requests.structures import CaseInsensitiveDict

from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL, \
    HELPDESK_COMMENT_SUB_URL, HELPDESK_ATTACHMENT_SUB_URL, \
    HELPDESK_LICENSE_MAPPINGS, HELPDESK_METASCHEMA_MAPPINGS, \
    HELPDESK_DATACENTER_USER_MAPPINGS, HELPDESK_REQUEST_TYPE_MAPPINGS
from gfbio_submissions.brokerage.models import SiteConfiguration, RequestLog

logger = logging.getLogger(__name__)


# TODO: this is used nowhere, is implemenation still correct
def gfbio_create_submission_registry_entries(submission, site_configuration):
    try:
        submitting_user = int(submission.submitting_user)
    except ValueError as e:
        logger.error(
            msg='gfbio_create_submission_registry_entries ValueError: {}'.format(
                e.message))
        submitting_user = -1
    data = json.dumps([
        {
            'userid': submitting_user,
            'researchobjectid': bo.site_object_id,
            'researchobjectversion': 1,
            'archive': 'PANGAEA',
            'brokersubmissionid': '{}'.format(
                submission.broker_submission_id)
        }
        for bo in submission.brokerobject_set.all()]).replace(
        '\\"', '\'')
    # http://gfbio-pub2.inf-bb.uni-jena.de:8080
    url = '{0}/' \
          'api/jsonws/GFBioProject-portlet.submission/create-submision/' \
          'request-json/{1}'.format(site_configuration.gfbio_server.url, data)

    headers = {
        'Accept': 'application/json'
    }
    # requestlog: ok
    response = requests.post(
        url=url,
        auth=(site_configuration.gfbio_server.username,
              site_configuration.gfbio_server.password),
        headers=headers,
    )
    with transaction.atomic():
        # prevent cyclic dependencies
        from gfbio_submissions.brokerage.models import RequestLog
        request_log = RequestLog.objects.create(
            type=RequestLog.OUTGOING,
            url=url,
            site_user=submission.submitting_user if submission.submitting_user is not None else '',
            submission_id=submission.broker_submission_id,
            response_status=response.status_code,
            response_content=response.content,
            triggered_by=None,
            request_details={
                'request_headers': str(headers),
            }
        )

    return response


def gfbio_get_user_by_id(user_id, site_configuration, submission):
    try:
        id = int(user_id)
    except ValueError as e:
        id = -1
    data = json.dumps({
        'userid': id
    })
    url = '{0}/api/jsonws/GFBioProject-portlet.userextension/get-user-by-id/request-json/{1}'.format(
        site_configuration.gfbio_server.url, data)
    # requestlog: ok, leaves out bsi stuff ?
    response = requests.get(
        url=url,
        auth=(site_configuration.gfbio_server.username,
              site_configuration.gfbio_server.password),
        headers={
            'Accept': 'application/json'
        },
    )
    details = response.headers or ''

    with transaction.atomic():
        request_log = RequestLog.objects.create(
            type=RequestLog.OUTGOING,
            url=url,
            data=data,
            site_user=user_id,
            submission_id=submission.broker_submission_id,
            response_status=response.status_code,
            response_content=response.content,
            request_details={
                'response_headers': str(details)
            }
        )

    return response


def gfbio_prepare_create_helpdesk_payload(site_config, submission, reporter={}):
    if reporter is None:
        reporter = {}

    requirements = submission.data.get('requirements', {})

    summary = requirements.get('title', '')
    if len(summary) >= 45:
        summary = '{0}{1}'.format(summary[:45], '...')

    # molecular or generic
    jira_request_target = HELPDESK_REQUEST_TYPE_MAPPINGS.get(
        requirements.get('data_center', ''),
        HELPDESK_REQUEST_TYPE_MAPPINGS.get('default', '')
    )
    jira_request_type = 'dsub/{0}'.format(jira_request_target) \
        if site_config.jira_project_key == SiteConfiguration.DSUB \
        else 'sand/{0}-data'.format(jira_request_target)

    mutual_data = {
        'project': {
            'key': site_config.jira_project_key
        },
        'summary': '{0}'.format(summary),
        'description': '{0}'.format(requirements.get('description', '')),
        'issuetype': {
            'name': 'Data Submission'
        },
        'reporter': {
            'name': reporter.get('user_email',
                                 'No valid user, name or email available')
        },
        'customfield_10010': jira_request_type,
        'customfield_10200': '{0}'.format(submission.embargo.isoformat())
        if submission.embargo is not None
        else '{0}'.format(
            (datetime.date.today() +
             datetime.timedelta(days=365)).isoformat()),
        'customfield_10201': requirements.get('title', ''),
        'customfield_10208': requirements.get('description', ''),
        'customfield_10303': '{0}'.format(submission.broker_submission_id),
        'customfield_10311': requirements.get(
            'data_collection_time', ''),
        'customfield_10308': [{'value': c} for c in
                              requirements.get(
                                  'dataset_label',
                                  [])],
        'customfield_10313': ', '.join(
            requirements.get('categories', [])),
        # used this way by generic submission
        # 'customfield_10205': requirements.get('dataset_author', ''),
        # used this way by molecular submission
        'customfield_10205': '{0},{1};{2}'.format(
            reporter.get('first_name', ''),
            reporter.get('last_name', ''),
            reporter.get('user_email', '')),
        'customfield_10307': '; '.join(
            requirements.get('related_publications', [])),
        'customfield_10216': [{'value': l} for l in
                              requirements.get('legal_requirements',
                                               [])],
        'customfield_10314': requirements.get('project_id', ''),
        'customfield_10202': HELPDESK_LICENSE_MAPPINGS.get(
            requirements.get('license', 'Other')),
        'customfield_10600': requirements.get('download_url', ''),
    }
    assignee = HELPDESK_DATACENTER_USER_MAPPINGS.get(
        requirements.get('data_center', ''), '')
    if len(assignee) > 0:
        mutual_data['assignee'] = {'name': assignee}

    metadata_schema = requirements.get('metadata_schema',
                                       'Other metadata or documentation')
    if metadata_schema == 'Other metadata or documentation' and jira_request_target == 'molecular':
        metadata_schema = 'MIxS 4.0'
    mutual_data['customfield_10229'] = [HELPDESK_METASCHEMA_MAPPINGS.get(
        metadata_schema)]

    # generic_data = {
    #     'customfield_10311': requirements.get(
    #         'data_collection_time', ''),
    #     'customfield_10308': [{'value': c} for c in
    #                           requirements.get(
    #                               'dataset_label',
    #                               [])],
    #     'customfield_10313': ', '.join(
    #         requirements.get('categories', [])),
    #     'customfield_10205': requirements.get('dataset_author', ''),
    #     'customfield_10307': '; '.join(
    #         requirements.get('related_publications', [])),
    #     'customfield_10216': [{'value': l} for l in
    #                           requirements.get('legal_requirements',
    #                                            [])],
    #     'customfield_10314': requirements.get('project_id', ''),
    #     'customfield_10202': HELPDESK_LICENSE_MAPPINGS.get(
    #         requirements.get('license', 'Other'))
    # }
    # molecular_data = {
    #     # 'customfield_10205': '{0},{1};{2}'.format(
    #     #     reporter.get('first_name', ''),
    #     #     reporter.get('last_name', ''),
    #     #     reporter.get('user_email', '')),
    #
    #     # TODO: generic not yet in schema, use submission property
    #     #   generic: primary_data field in form if link.. radio button is clicked
    #     #   ba: submission property, but not yet in schema, done via serializer
    #     # FIXME: url in data and model, decide and review
    #     # TODO: rename to consistent name for all types ? portals 'link online resource' sounds good
    #     # TODO: if consistent name and from serializer.
    #
    #     # TODO: 11.04.2019: currently it is download_url in submission model
    #     #   and download_url in data from widget -> data.requirements.download_url.
    #     #   both are set when submitting via (new) widget.
    #
    #     # 'customfield_10600': requirements.get(
    #     #     'download_url', ''),
    #
    #     # ba: hardcoded this value
    #     # generic: one of list or none
    #     # 'customfield_10229': [{'value': 'MIxS'}],
    #
    #     # ba hardcoded this value
    #     # generic: legal_requirements field, array of certain values
    #     # 'customfield_10216': [{"value": "Uncertain"}],
    # }
    # if submission.target == GENERIC:
    #     pass
    #     # mutual_data.update(generic_data)
    # else:
    #     mutual_data.update(molecular_data)
    return {'fields': mutual_data}


def gfbio_helpdesk_create_ticket(site_config, submission, data={}, reporter={}):
    # if reporter is None:
    #     reporter = {}
    # if data is None:
    #     data = {}
    url = '{0}{1}'.format(
        site_config.helpdesk_server.url,
        HELPDESK_API_SUB_URL
    )
    # TODO: if data is handed in as a parameter, this method here would be generic
    # data = json.dumps({
    #     'fields': gfbio_prepare_create_helpdesk_payload(
    #         reporter, site_config, submission)
    # })
    response = requests.post(
        url=url,
        auth=(site_config.helpdesk_server.username,
              site_config.helpdesk_server.password),
        headers={'Content-Type': 'application/json'},
        data=json.dumps(data)
    )
    with transaction.atomic():
        details = response.headers or ''
        RequestLog.objects.create(
            type=RequestLog.OUTGOING,
            url=url,
            data=data,
            submission_id=submission.broker_submission_id,
            response_status=response.status_code,
            response_content=response.content,
            request_details={
                'response_headers': str(details)
            }
        )
    return response


def gfbio_update_helpdesk_ticket(site_configuration, submission, ticket_key,
                                 data={}):
    url = '{0}{1}/{2}'.format(
        site_configuration.helpdesk_server.url,
        HELPDESK_API_SUB_URL,
        ticket_key
    )
    response = requests.put(
        url=url,
        auth=(site_configuration.helpdesk_server.username,
              site_configuration.helpdesk_server.password),
        headers={'Content-Type': 'application/json'},
        data=json.dumps(data)
    )
    with transaction.atomic():
        details = response.headers or ''
        RequestLog.objects.create(
            type=RequestLog.OUTGOING,
            url=url,
            data=data,
            submission_id=submission.broker_submission_id,
            response_status=response.status_code,
            response_content=response.content,
            request_details={
                'response_headers': str(details)
            }
        )
    return response


def gfbio_helpdesk_comment_on_ticket(site_config, ticket_key, comment_body,
                                     submission):
    url = '{0}{1}/{2}/{3}'.format(
        site_config.helpdesk_server.url,
        HELPDESK_API_SUB_URL,
        ticket_key,
        HELPDESK_COMMENT_SUB_URL,
    )
    data = json.dumps({
        'body': '{}'.format(comment_body)
    })
    # requestlog: ok
    response = requests.post(
        url=url,
        auth=(site_config.helpdesk_server.username,
              site_config.helpdesk_server.password),
        headers={
            'Content-Type': 'application/json'
        },
        data=data
    )
    with transaction.atomic():
        details = response.headers or ''
        request_log = RequestLog.objects.create(
            type=RequestLog.OUTGOING,
            url=url,
            data=data,
            site_user=submission.submitting_user if submission.submitting_user is not None else '',
            submission_id=submission.broker_submission_id,
            response_status=response.status_code,
            response_content=response.content,
            request_details={
                'response_headers': str(details)
            }
        )
    return response


def gfbio_helpdesk_attach_file_to_ticket(site_config, ticket_key, file,
                                         submission):
    url = '{0}{1}/{2}/{3}'.format(
        site_config.helpdesk_server.url,
        HELPDESK_API_SUB_URL,
        ticket_key,
        HELPDESK_ATTACHMENT_SUB_URL,
    )
    headers = CaseInsensitiveDict({'content-type': None,
                                   'X-Atlassian-Token': 'nocheck'})
    files = {'file': file}
    # files = {'file': open(file, 'rb')}
    response = requests.post(
        url=url,
        auth=(site_config.helpdesk_server.username,
              site_config.helpdesk_server.password),
        headers=headers,
        files=files,
    )

    with transaction.atomic():
        details = response.headers or ''
        request_log = RequestLog.objects.create(
            type=RequestLog.OUTGOING,
            url=url,
            data=files,
            site_user=submission.submitting_user if submission.submitting_user is not None else '',
            submission_id=submission.broker_submission_id,
            response_status=response.status_code,
            response_content=response.content,
            request_details={
                'response_headers': str(details)
            }
        )
    return response

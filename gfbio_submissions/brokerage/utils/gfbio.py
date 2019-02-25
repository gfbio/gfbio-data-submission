# -*- coding: utf-8 -*-
import datetime
import json
import logging

import requests
from django.db import transaction
from requests.structures import CaseInsensitiveDict

from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL, \
    HELPDESK_COMMENT_SUB_URL, HELPDESK_ATTACHMENT_SUB_URL, GENERIC
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
    # ena+gen
    summary = requirements.get('title', '')
    if len(summary) >= 45:
        summary = '{0}{1}'.format(summary[:45], '...')
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
        'customfield_10200': '{0}'.format(submission.embargo.isoformat())
        if submission.embargo is not None
        else '{0}'.format(
            (datetime.date.today() +
             datetime.timedelta(days=365)).isoformat()),
        'customfield_10201': requirements.get('title', ''),
        'customfield_10208': requirements.get('description', ''),
        'customfield_10303': '{0}'.format(submission.broker_submission_id),
    }
    generic_data = {
        'customfield_10010': 'dsub/generic'
        if site_config.jira_project_key == SiteConfiguration.DSUB
        else 'sand/generic-data',
        'customfield_10311': requirements.get('data_collection_time', ''),
        'customfield_10308': [{'value': c} for c in
                              requirements.get('dataset_label', [])],
        # TODO: change JIRA type to array. makes no sense to use string with separators
        # 'customfield_10313': [{'value': c} for c in
        #                       requirements.get('categories', [])],
        'customfield_10313': ', '.join(requirements.get('categories', [])),
        'customfield_10205': requirements.get('dataset_author', ''),
        # 'customfield_10202': requirements.get('license', ''),
        # FROM TICKET: https://helpdesk.gfbio.org/rest/api/2/issue/SAND-1460
        # "customfield_10202": {
        #     "self": "https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10500",
        #     "value": "other",
        #     "id": "10500"
        # },
        'customfield_10202': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10500',
            'value': requirements.get('license', 'other'),
            'id': '10500'
        },
        'customfield_10307': requirements.get('related_publications', ''),
        # 'customfield_10229': requirements.get('metadata_schema', ''),
        # FROM TICKET: https://helpdesk.gfbio.org/rest/api/2/issue/SAND-1460
        # "customfield_10229": [
        #     {
        #         "self": "https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10300",
        #         "value": "other",
        #         "id": "10300"
        #     }
        # ],
        'customfield_10229': [
            {
                'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10300',
                'value': requirements.get('metadata_schema', 'other'),
                'id': '10300'
            }
        ],
        'customfield_10216': [{'value': l} for l in
                              requirements.get('legal_requirements', [])],
        # project_id is potentially derived from portal db table, null in test-submission
        'customfield_10314': requirements.get('project_id', ''),
        'customfield_10311': requirements.get('data_collection_time', ''),
        # omit DCRT related fields completely. 'customfield_10217', 'customfield_10500'
        # omit researchobjectid field 'customfield_10309'. maybe use site_object_id or brokerobject_id
        # omit id version field 'customfield_10309'
    }
    # ena/mol specific
    molecular_data = {
        # md
        # 'project': {
        #     'key': site_config.jira_project_key
        # },
        # md
        # 'summary': '{0}'.format(summary),
        # TODO: + 'user iD:'.USER-ID + 'study type: STUDY - TYPE
        # md
        # 'description': '{0}'.format(
        #     requirements.get('description', '')),
        # md
        # 'issuetype': {
        #     'name': 'Data Submission'
        # },
        # generic: submitting gfbio user, prefilled
        # ba: submitting gfbio user, sc.contact or error text (see below)
        # md
        # 'reporter': {
        #     'name': reporter.get('user_email', 'No valid user, name or email available')
        # },

        # ba: hardcoded val after slash
        # generic: assuming it is analog to molecular
        'customfield_10010': 'dsub/molecular' if site_config.jira_project_key == SiteConfiguration.DSUB else 'sand/molecular-data',

        # generic: RO - from data, but plain text
        # ba: this here
        # FIXME: use embargo from Submission, this as fallback
        # 'customfield_10200': '{0}'.format(
        #     (datetime.date.today() + datetime.timedelta(
        #         days=365)).isoformat()
        # ),
        # md
        # 'customfield_10200': '{0}'.format(submission.embargo.isoformat())
        # if submission.embargo is not None
        # else '{0}'.format((datetime.date.today() + datetime.timedelta(days=365)).isoformat()),
        # md
        # 'customfield_10201': requirements.get(
        #     'title', ''),

        # generic: data_set_author, comma separated list of authors possible
        # ba: this
        'customfield_10205': '{0},{1};{2}'.format(
            reporter.get('first_name', 'invalid first name'),
            reporter.get('last_name', 'invalid last name'),
            reporter.get('user_email', 'invalid email')),
        # md
        # 'customfield_10208': requirements.get(
        #     'description', ''),
        # md
        # 'customfield_10303': '{0}'.format(submission.broker_submission_id),

        # TODO: generic not yet in schema, use submission property
        # generic: primary_data field in form if link.. radio button is clicked
        # ba: submission property, but not yet in schema, done via serializer
        # FIXME: url in data and model, decide and review
        # TODO: rename to consistent name for all types ? portals 'link online resource' sounds good
        # TODO: if consistent name and from serializer. this is #md
        'customfield_10600': requirements.get(
            'download_url', ''),

        # ba: hardcoded this value
        # generic: one of list or none
        'customfield_10229': [{'value': 'MIxS'}],

        # ba hardcoded this value
        # generic: legal_requirements field, array of certain values
        'customfield_10216': [{"value": "Uncertain"}],
    }
    if submission.target == GENERIC:
        mutual_data.update(generic_data)
    else:
        mutual_data.update(molecular_data)
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

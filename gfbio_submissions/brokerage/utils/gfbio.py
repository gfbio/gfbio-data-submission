# -*- coding: utf-8 -*-
import datetime
import json
import logging
from pprint import pprint

import requests
from django.db import transaction
from requests.structures import CaseInsensitiveDict

from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL, \
    HELPDESK_COMMENT_SUB_URL, HELPDESK_ATTACHMENT_SUB_URL
from gfbio_submissions.brokerage.models import BrokerObject, \
    SiteConfiguration, RequestLog
from gfbio_submissions.brokerage.utils.generic import \
    SOID_KEY

logger = logging.getLogger(__name__)


def gfbio_assemble_research_object_id_json(broker_object_set):
    result = []
    broker_object_pks = []
    for a, b in BrokerObject.ENTITY_TYPES:
        for broker_object in broker_object_set.filter(type=b):
            type_alias = broker_object.data.get('{}_alias'.format(b), '')
            broker_object_pks.append(int(broker_object.pk))
            result.append(
                {
                    'name': type_alias,
                    'label': type_alias,
                    'extendeddata': json.dumps(broker_object.data),
                    'researchobjecttype': '{}'.format(b),
                    'brokerobjectid': '{}'.format(broker_object.pk)
                }
            )
    return json.dumps(result).replace('\\"', '\''), broker_object_pks


# TODO: there is a test where a single study object is created, adapt this for a permanent solution
def gfbio_create_research_object_ids(submission, site_configuration):
    json_data, broker_object_pks = gfbio_assemble_research_object_id_json(
        submission.brokerobject_set)

    # TODO: keep port in mind: http: // gfbio - dev1.inf - bb.uni - jena.de:8080
    url = '{0}/api/jsonws/' \
          'GFBioProject-portlet.researchobject/create-research-object/' \
          'request-json/{1}'.format(site_configuration.gfbio_server.url,
                                    json_data)
    # requestlog: no -> submission/bsi ?
    response = requests.post(
        url=url,
        auth=(site_configuration.gfbio_server.username,
              site_configuration.gfbio_server.password),
        headers={
            'Accept': 'application/json'
        }
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
        )
    return response, broker_object_pks


def gfbio_site_object_ids_service(submission, site_configuration):
    response, broker_object_pks = gfbio_create_research_object_ids(
        submission, site_configuration)
    content = json.loads(response.content)
    # project_id = create_dummy_gfbio_project_id()
    for c in content:
        broker_object_id = int(c.get('brokerobjectid', '-1'))
        if broker_object_id not in broker_object_pks:
            logger.error('gfbio_site_object_ids_service error '
                         'broker_object_id from response not in list of transmitted'
                         ' broker_object_ids  broker_object_id={} | list_of_brokerobject_ids={}'.format(
                broker_object_id, broker_object_pks))
            return False
        try:
            bo = submission.brokerobject_set.get(pk=broker_object_id)
        except BrokerObject.DoesNotExist as e:
            logger.error('gfbio_site_object_ids_service error accessing '
                         'brokerobject with pk={} | Error={}'.format(
                broker_object_id, e.message))
        if bo:
            with transaction.atomic():
                # TODO: check if the soid is needed in the actual data
                try:
                    object_id = c.get('researchobjectid', -1)
                    bo.data[SOID_KEY] = c.get('researchobjectid', -1)
                except IndexError as e:
                    logger.error('gfbio_site_object_ids_service IndexError '
                                 'brokerobject with pk={} | '
                                 'Error={}'.format(bo.pk, e.message))
                bo.site_object_id = object_id
                # bo.site_project_id = project_id
                bo.save()
    return response


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


# TODO: refactor -> now molecular specific. improve
# TODO: review if smarter Implementation possible
def gfbio_helpdesk_create_ticket(site_config, submission, reporter=None):
    if reporter is None:
        reporter = {}
    url = '{0}{1}'.format(
        site_config.helpdesk_server.url,
        HELPDESK_API_SUB_URL
    )

    # ena+gen
    summary = submission.data.get('requirements', {}).get('title', '')
    if len(summary) >= 45:
        summary = '{0}{1}'.format(summary[:45], '...')

    mutual_data = {
        'fields': {
            'project': {
                'key': site_config.jira_project_key
            },
            'summary': '{0}'.format(summary),
            'description': '{0}'.format(submission.data.get('requirements', {}).get('description', '')),
            'issuetype': {
                'name': 'Data Submission'
            },
            'reporter': {
                'name': reporter.get('user_email', 'No valid user, name or email available')
            },
            'customfield_10201': submission.data.get('requirements', {}).get('title', ''),
            'customfield_10208': submission.data.get('requirements', {}).get('description', ''),
        }
    }

    # TODO: extract, refactor for multi purpose, ENA + Generic
    # ena/mol specific
    data_dict = {
        'fields': {
            # md
            'project': {
                'key': site_config.jira_project_key
            },
            # md
            'summary': '{0}'.format(summary),
            # TODO: + 'user iD:'.USER-ID + 'study type: STUDY - TYPE
            # md
            'description': '{0}'.format(
                submission.data.get('requirements', {}).get('description', '')),
            # md
            'issuetype': {
                'name': 'Data Submission'
            },
            # generic: submitting gfbio user, prefilled
            # ba: submitting gfbio user, sc.contact or error text (see below)
            # md
            'reporter': {
                'name': reporter.get('user_email', 'No valid user, name or email available')
            },
            # ba: hardcoded val after slash
            # generic: assuming it is analog to molecular
            'customfield_10010': 'dsub/molecular' if site_config.jira_project_key == SiteConfiguration.DSUB else 'sand/molecular-data',

            # generic
            # ba: this here
            # FIXME: use embargo from Submission, this as fallback
            'customfield_10200': '{0}'.format(
                (datetime.date.today() + datetime.timedelta(
                    days=365)).isoformat()
            ),
            'customfield_10201': submission.data.get('requirements', {}).get(
                'title', ''),
            'customfield_10205': '{0},{1};{2}'.format(
                reporter.get('first_name', ''),
                reporter.get('last_name', ''),
                reporter.get('user_email', '')),
            # md
            'customfield_10208': submission.data.get('requirements', {}).get(
                'description', ''),
            'customfield_10303': '{0}'.format(submission.broker_submission_id),
            # FIXME: url in data and model, decide and review
            'customfield_10600': submission.data.get('requirements', {}).get(
                'download_url', ''),
            'customfield_10229': [{'value': 'MIxS'}],
            'customfield_10216': [{"value": "Uncertain"}],
        }
    }
    data = json.dumps(data_dict)

    print('gfbio_helpdesk_create_ticket. DATA:')
    pprint(data_dict)
    print('\n************************************\n')

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

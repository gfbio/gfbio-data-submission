# -*- coding: utf-8 -*-
import datetime
import json
import logging

import requests
from django.db import transaction

from gfbio_submissions.brokerage.configuration.settings import \
    GFBIO_LICENSE_MAPPINGS, \
    GFBIO_METASCHEMA_MAPPINGS, \
    GFBIO_DATACENTER_USER_MAPPINGS, GFBIO_REQUEST_TYPE_MAPPINGS
from gfbio_submissions.brokerage.models import SiteConfiguration, RequestLog
from gfbio_submissions.users.models import User

logger = logging.getLogger(__name__)


# TODO: remove !
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


def gfbio_prepare_create_helpdesk_payload(site_config, submission, reporter={},
                                          prepare_for_update=False):
    requirements = submission.data.get('requirements', {})
    # -----------------------------------------------------------------------
    # TODO: refactor once gfbio portal services are removed.
    if reporter is None or reporter is {}:
        reporter = {}
        try:
            local_user = User.objects.get(pk=submission.submitting_user)
            reporter['user_full_name'] = local_user.name
            reporter['user_email'] = local_user.email
        except User.DoesNotExist as e:
            pass
        except ValueError:
            pass
    # FIXME: compatibilty with gfbio portal services
    user_full_name = reporter.get('user_full_name', '')
    user_email = reporter.get('user_email', '')

    author = '{0} {1}'.format(user_full_name, user_email)

    contributors = requirements.get('contributors', [])
    authors_text = '{0}\n'.format(author) if len(author.strip()) else ''
    for c in contributors:
        fname = c.get('firstName', '')
        lname = c.get('lastName', '')
        email = c.get('emailAddress', '')
        lname = '{0},'.format(lname) if len(lname) else ','
        fname = '{0},'.format(fname) if len(fname) else ','
        email = '{0},'.format(email) if len(email) else ','
        contributor = '{0}{1}{2}\n'.format(
            lname,
            fname,

        )
        authors_text += contributor if len(contributor.strip()) else ''

    # -----------------------------------------------------------------------

    summary = requirements.get('title', '')
    if len(summary) >= 45:
        summary = '{0}{1}'.format(summary[:45], '...')

    # molecular or generic
    jira_request_target = GFBIO_REQUEST_TYPE_MAPPINGS.get(
        requirements.get('data_center', ''),
        GFBIO_REQUEST_TYPE_MAPPINGS.get('default', '')
    )
    # TODO: generic is failing to send emails -> corect value is: dsub/general-data-submission
    # jira_request_type = 'dsub/{0}'.format(jira_request_target) \
    #     if site_config.jira_project_key == SiteConfiguration.DSUB \
    #     else 'sand/{0}-data'.format(jira_request_target)
    jira_request_type = 'sand/{0}-data'.format(jira_request_target)
    if site_config.jira_project_key == SiteConfiguration.DSUB:
        jira_request_type = 'dsub/{0}'.format(jira_request_target) \
            if jira_request_type == 'molecular' \
            else 'dsub/general-data-submission'

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
            'name': reporter.get('user_email', site_config.contact)
        },
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
        # FIXME: looks strange in ticket -> ['label 1', 'label 2'] => 1 2 label
        'customfield_10308': requirements.get('dataset_labels', []),
        'customfield_10313': ', '.join(
            requirements.get('categories', [])),
        'customfield_10205': authors_text,
        'customfield_10307': '; '.join(
            requirements.get('related_publications', [])),
        'customfield_10216': [{'value': l} for l in
                              requirements.get('legal_requirements',
                                               [])],
        'customfield_10314': requirements.get('project_id', ''),
        'customfield_10202': GFBIO_LICENSE_MAPPINGS.get(
            requirements.get('license', 'Other License')),
        'customfield_10600': requirements.get('download_url', ''),
    }
    assignee = GFBIO_DATACENTER_USER_MAPPINGS.get(
        requirements.get('data_center', ''), '')
    if len(assignee) > 0:
        mutual_data['assignee'] = {'name': assignee}

    metadata_schema = requirements.get('metadata_schema',
                                       'Other metadata or documentation')
    if metadata_schema == 'Other metadata or documentation' and jira_request_target == 'molecular':
        metadata_schema = 'MIxS 4.0'
    metadata_schema_value = [
        {
            'value': GFBIO_METASCHEMA_MAPPINGS.get(metadata_schema, {}).get(
                'value', 'other')
        }
    ]
    mutual_data['customfield_10229'] = metadata_schema_value

    if not prepare_for_update:
        mutual_data['customfield_10010'] = jira_request_type
    return mutual_data

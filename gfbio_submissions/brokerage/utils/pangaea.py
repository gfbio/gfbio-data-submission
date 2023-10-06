# -*- coding: utf-8 -*-

import csv
import io
import json
import logging
import textwrap
import xml.etree.ElementTree as ET
from uuid import uuid4

from django.db import transaction

from gfbio_submissions.generic.models import TicketLabel
from gfbio_submissions.generic.utils import logged_requests
from ..configuration.settings import SUBMISSION_DELAY, \
    CSV_WRITER_QUOTING, SEPARATOR
from ..models.submission import Submission
from ..utils.gcdj_utils import flatten_dictionary

logger = logging.getLogger(__name__)


# requests to pangaea infrastructure ------------------------------------------

def request_pangaea_login_token(resource_credential):
    headers = {
        'Accept': 'text/xml',
        'SOAPAction': 'login'
    }
    body = textwrap.dedent("""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:java:de.pangaea.login.PanLogin">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:login>
      <urn:username>{0}</urn:username>
      <urn:password>{1}</urn:password>
    </urn:login>
  </soapenv:Body>
</soapenv:Envelope>""".format(resource_credential.username,
                              resource_credential.password))
    return logged_requests.post(
        url=resource_credential.url,
        data=body,
        headers=headers,
        request_id=uuid4()
    )


def parse_pangaea_login_token_response(soap_response):
    try:
        root = ET.fromstring(soap_response.content)
        loginReturn_element = root.findall('.//loginReturn').pop()
        return loginReturn_element.text
    except ET.ParseError as e:
        logger.error(
            'ParseError. parse_pangaea_login_token_response. '
            'Error: {}'.format(e)
        )
        return ''


def get_pangaea_login_token(archive_access):
    return parse_pangaea_login_token_response(
        request_pangaea_login_token(resource_credential=archive_access))


# TODO: is checklist/package mandatory in schema now ???
def get_csv_from_sample(sample_data={}):
    if 'gcdjson' in sample_data.keys():
        # TODO: validation needed ? should have taken place along with submission_data serialization
        # checklist = sample_data.get('gcdjson').get('checklist', '')
        # package = sample_data.get('gcdjson').get('package', '')
        # schema, created = GcdjSchema.get_or_create_schema_for_checklist_names(
        #     checklist, package
        # )
        csv_form = Gcdj2CsvForm(
            {'gcdjson': json.dumps(sample_data.get('gcdjson'))})
        csv_form.is_valid()
        flat_json_dict = flatten_dictionary(
            dictionary=csv_form.cleaned_data,
            separator=SEPARATOR
        )
        return True, flat_json_dict
    else:
        return False, {}


def get_csv_from_samples(submission):
    samples = submission.brokerobject_set.filter(type='sample')
    output = io.StringIO()
    writer = csv.writer(output, delimiter=str(','), quotechar=str('"'),
                        quoting=CSV_WRITER_QUOTING)
    for s in samples:
        contains_csv, csv_data = get_csv_from_sample(s.data)
        if contains_csv:
            writer.writerow(csv_data.keys())
            writer.writerow(csv_data.values())

    csv_from_samples = output.getvalue().replace('True', 'true').replace(
        'False', 'false')
    output.close()
    return csv_from_samples


def prepare_pangaea_issue_content(site_configuration, submission):
    data = {
        'project': {
            'key': 'PDI',
        },
        'customfield_10002': submission.user.email,
        'customfield_10004': submission.data.get('requirements', {}).get(
            'title', ''),
        'issuetype': {
            "name": "Data Submission",
        },
        'description': submission.data.get('requirements', {}).get(
            'description', ''),
        'summary': 'Automated request by GFBio BrokerAgent',
        'labels': site_configuration.get_ticket_labels(
            label_type=TicketLabel.PANGAEA_JIRA)
    }
    return data


def pull_pangaea_dois(submission, jira_client):
    references = submission.get_primary_pangaea_references()
    for p in references:
        doi = jira_client.get_doi_from_pangaea_issue(p.reference_key)
        if doi:
            study_broker_object = submission.brokerobject_set.filter(
                type='study').first()
            with transaction.atomic():
                persistent_identifier = study_broker_object.append_pid_for_pangea_doi(
                    doi=doi)
                submission.status = Submission.CLOSED
                submission.save()
                logger.info(
                    msg='pull_pangaea_dois adding PersistentIdentifier {} to '
                        'BrokerObject {} of Submission {}. Closing Submission'.format(
                        persistent_identifier.pid, study_broker_object,
                        submission.broker_submission_id))

            logger.info(
                msg='pull_pangaea_dois. add comment with pangea doi '
                    'to helpdeskticket. submission_id={}'.format(submission.pk))
            from gfbio_submissions.brokerage.tasks import \
                add_pangaea_doi_task

            add_pangaea_doi_task.apply_async(
                kwargs={
                    'submission_id': submission.pk,
                    'pangaea_doi': persistent_identifier.pid,
                },
                countdown=SUBMISSION_DELAY
            )

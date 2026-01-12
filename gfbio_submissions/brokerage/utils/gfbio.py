# -*- coding: utf-8 -*-
import datetime
import logging
from urllib.parse import quote

from django.conf import settings

from gfbio_submissions.brokerage.configuration.settings import (
    GFBIO_LICENSE_MAPPINGS,
    JIRA_FALLBACK_EMAIL,
    JIRA_FALLBACK_USERNAME,
    JIRA_USERNAME_URL_FULLNAME_TEMPLATE,
    JIRA_USERNAME_URL_TEMPLATE,
)
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.generic.utils import logged_requests

logger = logging.getLogger(__name__)


def get_gfbio_helpdesk_username(user_name, email, fullname=""):
    url = JIRA_USERNAME_URL_TEMPLATE.format(user_name, email)
    if len(fullname):
        url = JIRA_USERNAME_URL_FULLNAME_TEMPLATE.format(user_name, email, quote(fullname))
    return logged_requests.get(
        url=url,
        auth=(
            settings.JIRA_ACCOUNT_SERVICE_USER,
            settings.JIRA_ACCOUNT_SERVICE_PASSWORD,
        ),
    )


def check_length_for_jira(requirements):
    summary = requirements.get("title", "")
    description = requirements.get("description", "")
    truncated_description = description
    jira_summary_max_length = 254
    jira_description_max_length = 30000
    truncation_text = " (... TRUNCATED)."
    if len(summary) > jira_summary_max_length:
        summary = '{0}{1}'.format(summary[:jira_summary_max_length - len(truncation_text)], truncation_text)
    if len(description) > jira_description_max_length:
        description = '{0}{1}'.format(description[:jira_description_max_length - len(truncation_text)], truncation_text)
    if len(truncated_description) > jira_summary_max_length:
        truncated_description = '{0}{1}'.format(truncated_description[:jira_summary_max_length - len(truncation_text)], truncation_text)
    return description, summary, truncated_description


def gfbio_prepare_create_helpdesk_payload(site_config, submission, reporter={}, prepare_for_update=False):
    requirements = submission.data.get("requirements", {})
    if reporter is None:
        reporter = {
            "jira_user_name": JIRA_FALLBACK_USERNAME,
            "email": JIRA_FALLBACK_EMAIL,
            "full_name": "",
        }
    # TODO: DASS-497: currently not used
    # author = '{0} {1}'.format(
    #     reporter.get('full_name', ''),
    #     reporter.get('email', '')
    # )

    contributors = requirements.get("contributors", [])
    # FIXME: include author ?
    # authors_text = '{0}\n'.format(author) if len(author.strip()) else ''
    authors_text = ""
    for c in contributors:
        fname = c.get("firstName", "")
        lname = c.get("lastName", "")
        email = c.get("emailAddress", "")
        institution = c.get("institution", "")
        contribution = c.get("contribution", "")

        contributor = "{0}|{1}|{2}|{3}|{4}\n".format(
            lname,
            fname,
            email,
            institution,
            contribution,
        )
        authors_text += contributor if len(contributor.strip()) else ""

    # TODO / Error: DASS-2801 customfield_10201 & summary/title must be less then 255 according to Jira
    # (400, b'{"errorMessages":[],"errors":{"summary":"Summary must be less than 255 characters.",
    # "customfield_10201":"The entered text is too long. It exceeds the allowed limit of 255 characters."}}')
    description, summary, truncated_description = check_length_for_jira(requirements)

    # as requested in: GFBIO-2679 & DEVOPS-3
    # if len(summary) >= 45:
    #     summary = '{0}{1}'.format(summary[:45], '...')

    # FIXME: 15.07.2020 issue #390: as a hotfix the mapping solution below is
    #  replaced by a specific check for 'ENA'. At this point of time this is ok
    #   since there are ony two options: molecular or not (generic)
    # molecular or generic
    # jira_request_target = GFBIO_REQUEST_TYPE_MAPPINGS.get(
    #     requirements.get('data_center', ''),
    #     GFBIO_REQUEST_TYPE_MAPPINGS.get('default', '')
    # )
    jira_request_target = "molecular" if requirements.get("data_center", "").startswith("ENA") else "generic"

    jira_request_type = "sand/{0}-data".format(jira_request_target)
    if site_config.jira_project_key == SiteConfiguration.DSUB:
        jira_request_type = (
            "dsub/{0}".format(jira_request_target)
            if jira_request_type == "molecular"
            else "dsub/general-data-submission"
        )

    mutual_data = {
        "project": {"key": site_config.jira_project_key},
        "summary": "{0}".format(summary),
        "description": "{0}".format(description),
        "issuetype": {"name": "Data Submission"},
        "reporter": {"name": reporter.get("jira_user_name", site_config.contact)},
        "customfield_10200": "{0}".format(submission.embargo.isoformat())
        if submission.embargo is not None
        else "{0}".format((datetime.date.today() + datetime.timedelta(days=365)).isoformat()),
        "customfield_10201": summary,
        "customfield_10208": truncated_description,
        "customfield_10303": "{0}".format(submission.broker_submission_id),
        "customfield_10311": requirements.get("data_collection_time", ""),
        # FIXME: looks strange in ticket -> ['label 1', 'label 2'] => 1 2 label
        "customfield_10308": requirements.get("dataset_labels", []),
        "customfield_10313": ", ".join(requirements.get("categories", [])),
        "customfield_10205": authors_text,
        "customfield_10307": "; ".join(requirements.get("related_publications", [])),
        "customfield_10216": [{"value": l} for l in requirements.get("legal_requirements", [])],
        "customfield_10314": requirements.get("project_id", ""),
        "customfield_10202": GFBIO_LICENSE_MAPPINGS.get(requirements.get("license", "Other License")),
        "customfield_10600": requirements.get("download_url", ""),
        "customfield_13100": f"{settings.HOST_URL_ROOT}api/downloads/submissions/{submission.broker_submission_id}/cloudupload/zip/",
        "customfield_13101": f"{settings.HOST_URL_ROOT}profile/ui/form/{submission.broker_submission_id}/",
    }

    # metadata_schema = requirements.get('metadata_schema',
    #                                    'Other metadata or documentation')
    # if metadata_schema == 'Other metadata or documentation' and jira_request_target == 'molecular':
    #     metadata_schema = 'MIxS 4.0'
    # metadata_schema_value = [
    #     {
    #         'value': GFBIO_METASCHEMA_MAPPINGS.get(metadata_schema, {}).get(
    #             'value', 'other')
    #     }
    # ]
    # mutual_data['customfield_10229'] = metadata_schema_value

    if not prepare_for_update:
        # TODO: DASS-497: The general process has changed, so Curator is always assigning the submissions manually.
        # assignee = GFBIO_DATACENTER_USER_MAPPINGS.get(
        #     requirements.get('data_center', ''), '')
        # if len(assignee) > 0:
        #     mutual_data['assignee'] = {'name': assignee}
        mutual_data["customfield_10010"] = jira_request_type
    return mutual_data

# -*- coding: utf-8 -*-
import datetime
import json
import logging
import os
import xml.etree.ElementTree as ET

from django.conf import settings
from django.forms import ValidationError
from jsonschema.validators import Draft3Validator, Draft4Validator

from gfbio_submissions.brokerage.configuration.settings import \
    STATIC_ENA_REQUIREMENTS_LOCATION, STATIC_MIN_REQUIREMENTS_LOCATION, ENA, \
    ENA_PANGAEA, STATIC_SAMPLE_SCHEMA_LOCATION, \
    STATIC_STUDY_SCHEMA_LOCATION, STATIC_EXPERIMENT_SCHEMA_LOCATION, \
    STATIC_RUN_SCHEMA_LOCATION, GENERIC, STATIC_GENERIC_REQUIREMENTS_LOCATION, \
    ATAX, STATIC_ATAX_REQUIREMENTS_LOCATION
from gfbio_submissions.brokerage.utils.atax import create_ataxer

logger = logging.getLogger(__name__)


def collect_errors(data, validator):
    return [
        'Error(s) regarding field \'{0}\' because: {1}'.format(
            error.relative_path.pop(),
            error.message.replace('u\'', '\'')
        )
        if len(error.relative_path) > 0
        else '{0}'.format(error.message.replace('u\'', '\''))
        for error in validator.iter_errors(data)
    ]


def collect_validation_errors(data, validator):
    return [
        ValidationError('{} : {}'.format(
            error.relative_path.pop() if len(error.relative_path) else '',
            error.message.replace('u\'', '\''))
        ) for error in validator.iter_errors(data)
    ]


def collect_validation_xml_errors(data, validator):
    return [
        ValidationError('error : {}'.format(
            error.message.replace('u\'', '\''))
        ) for error in validator.iter_errors(data)
    ]


def validate_data(data={}, schema_file=None, schema_string='{}',
                  use_draft04_validator=False):
    if schema_file:
        with open(schema_file, 'r') as schema:
            schema = json.load(schema)
    else:
        schema = json.loads(schema_string)
    if use_draft04_validator:
        validator = Draft4Validator(schema)
    else:
        validator = Draft3Validator(schema)
    data_valid = validator.is_valid(data)
    errors = [] if data_valid else collect_validation_errors(data, validator)
    return data_valid, errors


def validate_study(data):
    return validate_data(data=data,
                         schema_file=os.path.join(settings.STATIC_ROOT,
                                                  STATIC_STUDY_SCHEMA_LOCATION))


def validate_experiment(data):
    return validate_data(data=data,
                         schema_file=os.path.join(settings.STATIC_ROOT,
                                                  STATIC_EXPERIMENT_SCHEMA_LOCATION))


def validate_run(data):
    return validate_data(data=data,
                         schema_file=os.path.join(settings.STATIC_ROOT,
                                                  STATIC_RUN_SCHEMA_LOCATION))


# def get_gcdj_schema(checklist, package):
#     url = GCDJ_SCHEMA_URL.format(host=BASE_HOST_NAME,
#                                  checklist=checklist,
#                                  package=package)
#     # requestlog: no, neccessary ?
#     response = requests.get(url=url)
#     return response.content


def validate_gcdj(sample, schema):
    gcdj_valid, gcdj_errors = validate_data(data=sample['gcdjson'],
                                            schema_string=schema,
                                            use_draft04_validator=True)
    return gcdj_errors


def validate_sample(data):
    sample_valid, sample_errors = validate_data(data=data,
                                                schema_file=os.path.join(
                                                    settings.STATIC_ROOT,
                                                    STATIC_SAMPLE_SCHEMA_LOCATION))
    if not sample_valid:
        return sample_valid, sample_errors
    errors = []
    # TODO: decouple GCDJ stuff
    # schemas = {}
    # for sample in data['samples']:
    #     if 'gcdjson' in sample.keys():
    #         checklist = sample['gcdjson'].get('checklist', '')
    #         package = sample['gcdjson'].get('package')
    #         if (checklist, package) not in schemas.keys():
    #             schemas[(checklist, package)] = get_gcdj_schema(checklist,
    #                                                             package)
    #         errors.extend(validate_gcdj(sample, schemas[(checklist, package)]))

    return len(errors) == 0, errors


TARGET_SCHEMA_MAPPINGS = {
    ENA: STATIC_ENA_REQUIREMENTS_LOCATION,
    ENA_PANGAEA: STATIC_ENA_REQUIREMENTS_LOCATION,
    GENERIC: STATIC_GENERIC_REQUIREMENTS_LOCATION,
    ATAX: STATIC_ATAX_REQUIREMENTS_LOCATION
}


def validate_ena_relations(data):
    errors = []
    study_alias = data.get('requirements', {}).get('study_alias', None)

    sample_aliases = [s.get('sample_alias', '') for s in
                      data.get('requirements', {}).get('samples', [])]

    experiment_aliases = [e.get('experiment_alias', '') for e in
                          data.get('requirements', {}).get('experiments', [])]

    experiment_sample_descriptors = [
        e.get('design', {}).get('sample_descriptor', '') for e in
        data.get('requirements', {}).get('experiments', [])]

    # experiment_study_refs = [e.get('study_ref', '') for e in
    #                          data.get('requirements', {}).get('experiments',
    #                                                           [])]

    run_experiment_refs = [r.get('experiment_ref') for r in
                           data.get('requirements', {}).get('runs', [])]

    for e in experiment_sample_descriptors:
        if e not in sample_aliases:
            errors.append(
                ValidationError('experiment: sample_descriptor "{}" in '
                                'experiment does not match any sample_alias '
                                'defined in samples'.format(e)))

    # for e in experiment_study_refs:
    #     if e != study_alias:
    #         errors.append(
    #             ValidationError(
    #                 'experiment: study_ref "{}" in experiment does '
    #                 'not match the study_alias defined in study'
    #                 ''.format(e)))

    for r in run_experiment_refs:
        if r not in experiment_aliases:
            errors.append(
                ValidationError('run: experiment_ref "{}" in run does not '
                                'match any experiment_alias defined in '
                                'experiments'.format(e)))
    return errors


def validate_atax_data_is_valid(submission=None, schema_file=None, xml_string=None):
    xml_string_valid = False
    # create ataxer
    ataxer = create_ataxer(submission)
    schema = ataxer.schema

    # path = os.path.join(settings.STATIC_ROOT, 'schemas', schema_file)
    # schema = xmlschema.XMLSchema(path)

    if (xml_string):
        root = ET.fromstring(xml_string)
        tree = ET.ElementTree(ET.fromstring(xml_string))

        xml_string_valid = schema.is_valid(tree)
        errors = [] if xml_string_valid else collect_validation_xml_errors(tree, schema)

        return xml_string_valid, errors


# TODO: remove draft03 stuff completly or invert logic and make draft04 default

# FIXME: in unit tests: "id": "file:///opt/project/staticfiles/schemas/minimal_requirements.json",
# FIXME: when running docker-compose with dev.yml
# FIXME: id to /app/staticfiles/schemas/ena_requirements.json
# FIXME: since id determins root for looking up included files
def validate_data_full(data, target, schema_location=None):
    if schema_location is None:
        schema_location = os.path.join(
            settings.STATIC_ROOT, TARGET_SCHEMA_MAPPINGS[target])
    valid, errors = validate_data(
        data=data, schema_file=schema_location,
        use_draft04_validator=True
    )
    if valid and (target == ENA or target == ENA_PANGAEA):
        errors = validate_ena_relations(data)
        if len(errors):
            valid = False
    return valid, errors


def validate_data_min(data):
    return validate_data(
        data=data, schema_file=os.path.join(
            settings.STATIC_ROOT,
            STATIC_MIN_REQUIREMENTS_LOCATION),
        use_draft04_validator=True
    )


def validate_contributors(data):
    try:
        contributors = data['requirements']['contributors']
    except KeyError:
        contributors = None
    if contributors:
        for contributor in contributors:
            for key in contributor:
                value = '{}'.format(contributor[key])
                if "|" in value:
                    return False, 'Contributors: pipe "|" character is not allowed'
    return True, ''


def validate_embargo(embargo):
    # check if date is between tomorrow and 2 years from now
    earliest_embargo_date = datetime.date.today() + datetime.timedelta(days=1)
    latest_embargo_date = datetime.date(datetime.date.today().year + 2,
                                        datetime.date.today().month, datetime.date.today().day)
    if embargo < earliest_embargo_date:
        return False, 'Embargo : earliest possible date is 24 hours from today'
    elif embargo > latest_embargo_date:
        return False, 'Embargo : latest possible date is 2 years from today'

    return True, ''

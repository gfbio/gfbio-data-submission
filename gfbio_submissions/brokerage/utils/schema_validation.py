# -*- coding: utf-8 -*-
import json
import logging
import os

from django.conf import settings
from django.forms import ValidationError
from jsonschema.validators import Draft3Validator, Draft4Validator

from gfbio_submissions.brokerage.configuration.settings import \
    STATIC_ENA_REQUIREMENTS_LOCATION, STATIC_MIN_REQUIREMENTS_LOCATION, ENA, \
    ENA_PANGAEA, STATIC_SAMPLE_SCHEMA_LOCATION, \
    STATIC_STUDY_SCHEMA_LOCATION, STATIC_EXPERIMENT_SCHEMA_LOCATION, \
    STATIC_RUN_SCHEMA_LOCATION

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
    ENA_PANGAEA: STATIC_ENA_REQUIREMENTS_LOCATION
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


# TODO: remove draft03 stuff completly or invert logic and make draft04 default

# FIXME: in unit tests: "id": "file:///opt/project/staticfiles/schemas/minimal_requirements.json",
# FIXME: when running docker-compose with dev.yml
# FIXME: id to /app/staticfiles/schemas/ena_requirements.json
# FIXME: since id determins root for looking up included files
def validate_data_full(data, target):
    schema_location = TARGET_SCHEMA_MAPPINGS[target]
    # print '\n\nFULL_VAL:  SCHEMA LOCATION ', schema_location
    # print os.path.join(
    #         settings.STATIC_ROOT,
    #         schema_location)
    # print '\n\n'
    valid, errors = validate_data(
        data=data, schema_file=os.path.join(
            settings.STATIC_ROOT,
            schema_location),
        use_draft04_validator=True
    )
    if valid and (target == ENA or target == ENA_PANGAEA):
        errors = validate_ena_relations(data)
        if len(errors):
            valid = False
    return valid, errors


def validate_data_min(data):
    # print '\n\nMIN_VAL:  SCHEMA LOCATION '
    # print os.path.join(
    #     settings.STATIC_ROOT,
    #     STATIC_MIN_REQUIREMENTS_LOCATION)
    # print '\n\n'
    return validate_data(
        data=data, schema_file=os.path.join(
            settings.STATIC_ROOT,
            STATIC_MIN_REQUIREMENTS_LOCATION),
        use_draft04_validator=True
    )

# -*- coding: utf-8 -*-
import _csv
import csv
import logging
import os
from collections import OrderedDict

import dpath
from django.utils.encoding import smart_text
from shortid import ShortId

from gfbio_submissions.brokerage.configuration.settings import ENA_PANGAEA
from gfbio_submissions.brokerage.utils.schema_validation import \
    validate_data_full

logger = logging.getLogger(__name__)

sample_core_fields = [
    'sample_alias',
    'sample_title',
    'taxon_id'
]

experiment_core_fields = [
    'layout_type',
    'nominal_length',  # if paired
    'library_strategy',
    'library_source',
    'library_selection',
    'library_layout',
    'library_descriptor',
    'sample_descriptor',
    'forward_read_file_name',
    'experiment_alias',
    'platform',
    'design',
    # from react app
    'sequencing_platform',
    'forward_read_file_checksum',
    'reverse_read_file_name', 'reverse_read_file_checksum',
    'checksum_method'
]

core_fields = sample_core_fields + experiment_core_fields

unit_mapping = {
    'Depth': 'm',
    'depth': 'm',
    'geographic location (altitude)': 'm',
    'geographic location (depth)': 'm',
    'geographic location (elevation)': 'm',
    'geographic location (latitude)': 'DD',
    'geographic location (longitude)': 'DD',
    'Salinity': 'psu',
    'salinity': 'psu',
    'temperature': '&#176;C',
    'total depth of water column': 'm',
}

unit_mapping_keys = unit_mapping.keys()


def extract_sample(row, field_names, sample_id):
    for k in row.keys():
        row[k] = row[k].strip()

    sample_attributes = [
        OrderedDict(
            [('tag', o), ('value', row[o]),
             ('unit', unit_mapping[o])])
        if o in unit_mapping_keys
        else OrderedDict([('tag', o), ('value', row[o])])
        for o in field_names if o not in core_fields
    ]
    try:
        taxon_id = int(row.get('taxon_id', '-1'))
    except ValueError as e:
        taxon_id = -1
    sample = {
        'sample_title': row.get('sample_title', ''),
        'sample_alias': sample_id,
        'sample_description': row.get('sample_description', '').replace('"',
                                                                        ''),
        'taxon_id': taxon_id,
    }
    if len(sample_attributes):
        sample['sample_attributes'] = sample_attributes

    return sample


def extract_experiment(experiment_id, row, sample_id):
    try:
        design_description = int(row.get('design_description', '-1'))
    except ValueError as e:
        design_description = -1
    try:
        nominal_length = int(row.get('nominal_length', '-1'))
    except ValueError as e:
        nominal_length = -1
    experiment = {
        'experiment_alias': experiment_id,
        'platform': row.get('sequencing_platform', '').lower()
    }

    library_layout = row.get('library_layout', '').lower()

    dpath.util.new(experiment, 'design/sample_descriptor', sample_id)
    dpath.util.new(experiment, 'design/library_descriptor/library_strategy',
                   row.get('library_strategy', '').lower())
    dpath.util.new(experiment, 'design/library_descriptor/library_source',
                   row.get('library_source', '').lower())
    dpath.util.new(experiment,
                   'design/library_descriptor/library_selection',
                   row.get('library_selection', '').lower())
    dpath.util.new(experiment,
                   'design/library_descriptor/library_layout/layout_type',
                   library_layout)

    dpath.util.new(experiment, 'files/forward_read_file_name',
                   row.get('forward_read_file_name', ''))
    dpath.util.new(experiment, 'files/forward_read_file_checksum',
                   row.get('forward_read_file_checksum', ''))

    # TODO: with single layout, only forward_read_file attribute are considered
    #   is it ok to use such a file name for a single ?
    if library_layout != 'single':
        dpath.util.new(experiment, 'files/reverse_read_file_name',
                       row.get('reverse_read_file_name', ''))
        dpath.util.new(experiment, 'files/reverse_read_file_checksum',
                       row.get('reverse_read_file_checksum', ''))

    if len(row.get('design_description', '').strip()):
        dpath.util.new(experiment, 'design/design_description',
                       design_description)
    if row.get('library_layout', '') == 'paired':
        dpath.util.new(
            experiment,
            'design/library_descriptor/library_layout/nominal_length',
            nominal_length
        )
    return experiment


# TODO: maybe csv is in a file like implemented or comes as text/string
def parse_molecular_csv(csv_file):
    header = csv_file.readline()
    dialect = csv.Sniffer().sniff(smart_text(header))
    csv_file.seek(0)
    delimiter = dialect.delimiter if dialect.delimiter in [',', ';',
                                                           '\t'] else ';'
    csv_reader = csv.DictReader(
        csv_file,
        quoting=csv.QUOTE_ALL,
        delimiter=delimiter,
        quotechar='"',
        skipinitialspace=True,
        restkey='extra_columns_found',
        restval='extra_value_found',
    )
    molecular_requirements = {
        'study_type': 'Other',
        'samples': [],
        'experiments': [],
    }
    try:
        field_names = csv_reader.fieldnames
        for i in range(0, len(field_names)):
            field_names[i] = field_names[i].strip().lower()

    except _csv.Error as e:
        return molecular_requirements
    short_id = ShortId()
    for row in csv_reader:
        # every row is one sample (except header)

        sample_id = short_id.generate()
        experiment_id = short_id.generate()
        sample = extract_sample(row, field_names, sample_id)
        experiment = extract_experiment(experiment_id, row, sample_id)
        molecular_requirements['samples'].append(
            sample
        )
        molecular_requirements['experiments'].append(
            experiment
        )
    return molecular_requirements


# TODO: may move to other location, perhaps model, serializer or manager method
def check_for_molecular_content(submission):
    logger.info(
        msg='check_for_molecular_content | '
            'process submission={0} | target={1} | release={2}'
            ''.format(submission.broker_submission_id, submission.target,
                      submission.release))

    # GFBIO-2658: old state, pass with target ena and check for GENERIC in addition to datacenter
    # TODO: but csv has to be parsed anyway ? or not ?
    # TODO: compare with usecase api submissions
    # if submission.target == ENA or submission.target == ENA_PANGAEA:
    #     logger.info(
    #         msg='check_for_molecular_content | '
    #             'ena is default target return=True')
    #     return True, []

    # TODO: consider GFBIO_REQUEST_TYPE_MAPPINGS for data_center mappings
    # elif submission.release and submission.target == GENERIC \
    #         and submission.data.get('requirements', {}) \
    #         .get('data_center', '').count('ENA'):
    # ######################################################################

    # GFBIO-2658: independent of target, check for data_center ENA
    if submission.release and submission.data.get('requirements', {}).get(
            'data_center', '').count('ENA'):

        submission.target = ENA_PANGAEA

        meta_data_files = submission.submissionupload_set.filter(meta_data=True)
        no_of_meta_data_files = len(meta_data_files)

        if no_of_meta_data_files != 1:
            logger.info(
                msg='check_for_molecular_content | '
                    'invalid no. of meta_data_files, {0} | return=False'
                    ''.format(no_of_meta_data_files))
            return False, [
                'invalid no. of meta_data_files, {0}'.format(
                    no_of_meta_data_files)
            ]
        meta_data_file = meta_data_files.first()
        with open(meta_data_file.file.path, 'r') as file:
            molecular_requirements = parse_molecular_csv(
                file,
            )
        submission.data.get('requirements', {}).update(molecular_requirements)
        path = os.path.join(
            os.getcwd(),
            'gfbio_submissions/brokerage/schemas/ena_requirements.json')
        valid, full_errors = validate_data_full(
            data=submission.data,
            target=ENA_PANGAEA,
            schema_location=path,
        )
        status = False
        messages = []
        if valid:
            # submission.target = ENA_PANGAEA
            # submission.save()
            logger.info(
                msg='check_for_molecular_content | valid data from csv |'
                    ' return=True')
            # return True, []
            status = True
        else:
            status = False
            messages = [e.message for e in full_errors]
            submission.data.update(
                {'validation': messages})
            # submission.save()
            logger.info(
                msg='check_for_molecular_content  | invalid data from csv |'
                    ' return=False')
            # return False, error_messages

        submission.save()
        return status, messages
    else:
        logger.info(
            msg='check_for_molecular_content | no criteria matched | '
                'return=False')
        return False, ['no criteria matched']

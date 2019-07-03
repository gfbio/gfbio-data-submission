# -*- coding: utf-8 -*-
import csv
import json
from collections import OrderedDict

import _csv
import dpath
from shortid import ShortId

from gfbio_submissions.brokerage.configuration.settings import GENERIC, \
    ENA_PANGAEA, ENA
from gfbio_submissions.brokerage.serializers import SubmissionDetailSerializer

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

# everthing else is optional and goes to sample attributes
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
    sample_attributes = [
        OrderedDict(
            [('tag', o), ('value', row[o]),
             ('unit', unit_mapping[o])])
        if o in unit_mapping_keys
        else OrderedDict([('tag', o), ('value', row[o])])
        for o in field_names if o not in core_fields
    ]
    sample = {
        'sample_title': row.get('sample_title', ''),
        'sample_alias': sample_id,
        'sample_description': row.get('sample_description', '').replace('"',
                                                                        ''),
        'taxon_id': int(row.get('taxon_id', '-1')),
    }
    if len(sample_attributes):
        sample['sample_attributes'] = sample_attributes
    return sample


def extract_experiment(experiment_id, row, sample_id):
    experiment = {
        'experiment_alias': experiment_id,
        'platform': row.get('sequencing_platform', '')
    }
    dpath.util.new(experiment, 'design/sample_descriptor', sample_id)
    dpath.util.new(experiment, 'design/library_descriptor/library_strategy',
                   row.get('library_strategy', ''))
    dpath.util.new(experiment, 'design/library_descriptor/library_source',
                   row.get('library_source', ''))
    dpath.util.new(experiment,
                   'design/library_descriptor/library_selection',
                   row.get('library_selection', ''))
    dpath.util.new(experiment,
                   'design/library_descriptor/library_layout/layout_type',
                   row.get('library_layout', ''))
    dpath.util.new(experiment, 'design/files/forward_read_file_name',
                   row.get('forward_read_file_name', ''))
    dpath.util.new(experiment, 'design/files/forward_read_file_checksum',
                   row.get('forward_read_file_checksum', ''))
    dpath.util.new(experiment, 'design/files/reverse_read_file_name',
                   row.get('reverse_read_file_name', ''))
    dpath.util.new(experiment, 'design/files/reverse_read_file_checksum',
                   row.get('reverse_read_file_checksum', ''))
    if len(row.get('design_description', '').strip()):
        dpath.util.new(experiment, 'design/design_description',
                       int(row.get('design_description', '-1')))
    if row.get('library_layout', '') == 'paired':
        dpath.util.new(
            experiment,
            'design/library_descriptor/library_layout/nominal_length',
            int(row.get('nominal_length', '-1'))
        )
    return experiment


# TODO: maybe csv is in a file like implemented or comes as text/string
def parse_molecular_csv(csv_file):
    csv_reader = csv.DictReader(
        csv_file,
        quoting=csv.QUOTE_ALL,
        delimiter=',',
        quotechar='"',
        skipinitialspace=True,
        restkey='extra_columns_found',
        restval='extra_value_found',
    )
    molecular_requirements = {
        # 'requirements': {
        # minimal_requirements
        # 'title': title,
        # 'description': description,
        # study_reqs
        'study_type': 'Other',
        # sample, experiment, runs reqs
        'samples': [],
        'experiments': [],
        # no explicit runs from csv. files in experiments
        # 'runs': [],
        # }
    }
    try:
        field_names = csv_reader.fieldnames
    except _csv.Error as e:
        print('ERROR ', e)
        return molecular_requirements
    # print(field_names)
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
    if submission.target == ENA or submission.target == ENA_PANGAEA:
        return True
    # TODO: consider HELPDESK_REQUEST_TYPE_MAPPINGS for data_center mappings
    elif submission.release and submission.target == GENERIC \
            and submission.data.get('requirements', {}) \
            .get('data_center', '').count('ENA'):
        meta_data_files = submission.submissionupload_set.filter(meta_data=True)
        if len(meta_data_files) != 1:
            # TODO: add some sort of error to submission.data / validation hint
            return False
        meta_data_file = meta_data_files.first()
        with open(meta_data_file.file.path, 'r') as file:
            molecular_requirements = parse_molecular_csv(
                file,
            )
        submission.data.get('requirements', {}).update(molecular_requirements)
        fake_request_data = {
            'target': ENA,
            'release': True,
            'data': submission.data,
        }
        serializer = SubmissionDetailSerializer(data=fake_request_data)
        valid = serializer.is_valid()
        print('valid ', valid)
        # print('errors ', serializer.errors)
        # print(json.dumps(serializer.errors))
        submission.target = ENA_PANGAEA
        submission.save(allow_update=False)
        if valid:
            return True
        else:
            return False
    else:
        return False

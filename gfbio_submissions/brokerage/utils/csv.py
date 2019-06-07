# -*- coding: utf-8 -*-
import csv
from collections import OrderedDict
from pprint import pprint

import dpath
from shortid import ShortId

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


def parse_csv(csv_file):
    print('parse_csv ', csv_file)
    print(core_fields)

    csv_reader = csv.DictReader(csv_file)
    data = {
        'requirements': {
            # minimal_requirements
            'title': 't',
            'description': 'd',
            # study_reqs
            'study_type': 'enum_value',
            # sample, experiment, runs reqs
            'samples': [],
            'experiments': [],
            'runs': [],
        }
    }
    unit_mapping_keys = unit_mapping.keys()
    short_id = ShortId()
    for row in csv_reader:
        # every row is one sample (except header)
        # unique s id ? -> sample_alias
        sample_id = short_id.generate()
        # unique e id ?
        experiment_id = short_id.generate()
        row_keys = row.keys()
        print('\n#############################\n')

        # sample ###############################

        sample_attributes = [
            OrderedDict(
                [('tag', o), ('value', row[o]), ('unit', unit_mapping[o])])
            if o in unit_mapping_keys
            else OrderedDict([('tag', o), ('value', row[o])])
            for o in row_keys if o not in core_fields
        ]
        sample = {
            'sample_title': row.get('sample_title', ''),
            'sample_alias': sample_id,
            'sample_description': row.get('sample_description', ''),
            'taxon_id': int(row.get('taxon_id', '-1')),
        }
        # sample = OrderedDict([
        #     ('sample_title', row.get('sample_title', '')),
        #     ('sample_alias', sample_id),
        #     ('sample_description', row.get('sample_description', '')),
        #     ('taxon_id', int(row.get('taxon_id', '-1'))),
        # ])
        if len(sample_attributes):
            sample['sample_attributes'] = sample_attributes

        # experiment #####################################

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
        # pprint(experiment, indent=3)
        ###############################
        data['requirements']['samples'].append(
            sample
        )
        data['requirements']['experiments'].append(
            experiment
        )
        # print(json.dumps(sample_attributes, indent=4))

        # pprint(row, indent=4)
    pprint(data, indent=4)
    #     id = row['id']
    #     data[id] = row
    # pprint(data, indent=4)

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

library_selection_mappings = {
    '5-methylcytidine antibody': '5-methylcytidine antibody',
    'cage': 'CAGE',
    'cdna': 'cDNA',
    'cdna_oligo_dt': 'cDNA_oligo_dT',
    'cdna_randompriming': 'cDNA_randomPriming',
    'chip': 'ChIP',
    'chip-seq': 'ChIP-Seq',
    'dnase': 'DNase',
    'hmpr': 'HMPR',
    'hybrid selection': 'Hybrid Selection',
    'inverse rrna': 'Inverse rRNA',
    'inverse rrna selection': 'Inverse rRNA selection',
    'mbd2 protein methyl-cpg binding domain': 'MBD2 protein methyl-CpG binding '
                                              'domain',
    'mda': 'MDA',
    'mf': 'MF',
    'mnase': 'MNase',
    'msll': 'MSLL',
    'oligo-dt': 'Oligo-dT',
    'other': 'other',
    'padlock probes capture method': 'padlock probes capture method',
    'pcr': 'PCR',
    'polya': 'PolyA',
    'race': 'RACE',
    'random': 'RANDOM',
    'random pcr': 'RANDOM PCR',
    'reduced representation': 'Reduced Representation',
    'repeat fractionation': 'repeat fractionation',
    'restriction digest': 'Restriction Digest',
    'rt-pcr': 'RT-PCR',
    'size fractionation': 'size fractionation',
    'unspecified': 'unspecified'
}

library_strategy_mappings = {
    'amplicon': 'AMPLICON',
    'atac-seq': 'ATAC-seq',
    'bisulfite-seq': 'Bisulfite-Seq',
    'chia-pet': 'ChIA-PET',
    'chip-seq': 'ChIP-Seq',
    'clone': 'CLONE',
    'cloneend': 'CLONEEND',
    'cts': 'CTS',
    'dnase-hypersensitivity': 'DNase-Hypersensitivity',
    'est': 'EST',
    'faire-seq': 'FAIRE-seq',
    'finishing': 'FINISHING',
    'fl-cdna': 'FL-cDNA',
    'hi-c': 'Hi-C',
    'mbd-seq': 'MBD-Seq',
    'medip-seq': 'MeDIP-Seq',
    'mirna-seq': 'miRNA-Seq',
    'mnase-seq': 'MNase-Seq',
    'mre-seq': 'MRE-Seq',
    'ncrna-seq': 'ncRNA-Seq',
    'nome-seq': 'NOMe-Seq',
    'other': 'OTHER',
    'poolclone': 'POOLCLONE',
    'rad-seq': 'RAD-Seq',
    'rip-seq': 'RIP-Seq',
    'rna-seq': 'RNA-Seq',
    'selex': 'SELEX',
    'ssrna-seq': 'ssRNA-seq',
    'synthetic-long-read': 'Synthetic-Long-Read',
    'targeted-capture': 'Targeted-Capture',
    'tethered chromatin conformation capture': 'Tethered Chromatin Conformation '
                                               'Capture',
    'tn-seq': 'Tn-Seq',
    'validation': 'VALIDATION',
    'wcs': 'WCS',
    'wga': 'WGA',
    'wgs': 'WGS',
    'wxs': 'WXS'
}

platform_mappings = {
    '454 gs': '454 GS',
    '454 gs 20': '454 GS 20',
    '454 gs flx': '454 GS FLX',
    '454 gs flx titanium': '454 GS FLX Titanium',
    '454 gs flx+': '454 GS FLX+',
    '454 gs junior': '454 GS Junior',
    'ab 310 genetic analyzer': 'AB 310 Genetic Analyzer',
    'ab 3130 genetic analyzer': 'AB 3130 Genetic Analyzer',
    'ab 3130xl genetic analyzer': 'AB 3130xL Genetic Analyzer',
    'ab 3500 genetic analyzer': 'AB 3500 Genetic Analyzer',
    'ab 3500xl genetic analyzer': 'AB 3500xL Genetic Analyzer',
    'ab 3730 genetic analyzer': 'AB 3730 Genetic Analyzer',
    'ab 3730xl genetic analyzer': 'AB 3730xL Genetic Analyzer',
    'ab 5500 genetic analyzer': 'AB 5500 Genetic Analyzer',
    'ab 5500xl genetic analyzer': 'AB 5500xl Genetic Analyzer',
    'ab 5500xl-w genetic analysis system': 'AB 5500xl-W Genetic Analysis System',
    'ab solid 3 plus system': 'AB SOLiD 3 Plus System',
    'ab solid 4 system': 'AB SOLiD 4 System',
    'ab solid 4hq system': 'AB SOLiD 4hq System',
    'ab solid pi system': 'AB SOLiD PI System',
    'ab solid system': 'AB SOLiD System',
    'ab solid system 2.0': 'AB SOLiD System 2.0',
    'ab solid system 3.0': 'AB SOLiD System 3.0',
    'bgiseq-500': 'BGISEQ-500',
    'complete genomics': 'Complete Genomics',
    'gridion': 'GridION',
    'helicos heliscope': 'Helicos HeliScope',
    'hiseq x five': 'HiSeq X Five',
    'hiseq x ten': 'HiSeq X Ten',
    'illumina genome analyzer': 'Illumina Genome Analyzer',
    'illumina genome analyzer ii': 'Illumina Genome Analyzer II',
    'illumina genome analyzer iix': 'Illumina Genome Analyzer IIx',
    'illumina hiscansq': 'Illumina HiScanSQ',
    'illumina hiseq 1000': 'Illumina HiSeq 1000',
    'illumina hiseq 1500': 'Illumina HiSeq 1500',
    'illumina hiseq 2000': 'Illumina HiSeq 2000',
    'illumina hiseq 2500': 'Illumina HiSeq 2500',
    'illumina hiseq 3000': 'Illumina HiSeq 3000',
    'illumina hiseq 4000': 'Illumina HiSeq 4000',
    'illumina iseq 100': 'Illumina iSeq 100',
    'illumina miniseq': 'Illumina MiniSeq',
    'illumina miseq': 'Illumina MiSeq',
    'illumina novaseq 6000': 'Illumina NovaSeq 6000',
    'ion torrent pgm': 'Ion Torrent PGM',
    'ion torrent proton': 'Ion Torrent Proton',
    'ion torrent s5': 'Ion Torrent S5',
    'ion torrent s5 xl': 'Ion Torrent S5 XL',
    'minion': 'MinION',
    'nextseq 500': 'NextSeq 500',
    'nextseq 550': 'NextSeq 550',
    'pacbio rs': 'PacBio RS',
    'pacbio rs ii': 'PacBio RS II',
    'promethion': 'PromethION',
    'sequel': 'Sequel',
    'sequel ii': 'Sequel II',
    'unspecified': 'unspecified'
}

attribute_value_blacklist = [
    'na', 'NA', 'n/a', 'N/A',
]


def extract_sample(row, field_names, sample_id):
    for k in row.keys():
        row[k] = row[k].strip()

    sample_attributes = []
    for o in field_names:
        if o not in core_fields and len(row[o]) and \
                row[o] not in attribute_value_blacklist:
            if o in unit_mapping_keys:
                sample_attributes.append(
                    OrderedDict([
                        ('tag', o),
                        ('value', row[o]),
                        ('units', unit_mapping[o])
                    ])
                )
            else:
                sample_attributes.append(
                    OrderedDict([
                        ('tag', o), ('value', row[o])
                    ])
                )

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
        'platform': platform_mappings.get(
            row.get('sequencing_platform', '').lower(), ''
        )
    }

    library_layout = row.get('library_layout', '').lower()

    dpath.util.new(experiment, 'design/sample_descriptor', sample_id)
    dpath.util.new(
        experiment, 'design/library_descriptor/library_strategy',
        library_strategy_mappings.get(
            row.get('library_strategy', '').lower(), ''
        )
    )
    # For sake of simplicity library_source is converted to upper case since
    # all values in schema are uppercase
    dpath.util.new(experiment, 'design/library_descriptor/library_source',
                   row.get('library_source', '').upper()
                   )
    dpath.util.new(
        experiment,
        'design/library_descriptor/library_selection',
        library_selection_mappings.get(
            row.get('library_selection', '').lower(), ''
        )
    )
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
        # 'study_type': 'Other',
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
    sample_titles = []
    sample_ids = []
    for row in csv_reader:
        # every row is one sample (except header)
        title = row.get('sample_title', None)
        if title:
            experiment_id = short_id.generate()
            if title not in sample_titles:
                sample_titles.append(title)
                sample_id = short_id.generate()
                sample_ids.append(sample_id)
                sample = extract_sample(row, field_names, sample_id)
                molecular_requirements['samples'].append(
                    sample
                )

                experiment = extract_experiment(experiment_id, row, sample_id)
            else:
                experiment = extract_experiment(experiment_id, row, sample_ids[
                    sample_titles.index(title)])

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

    # TODO: Note: this check makes only sense for submissions via react app, since
    #   only there the datacenter selection can be made (of course this could also
    #   be add explicitly in any POST request). Json-schema does not check for this ..
    # GFBIO-2658: independent of target, check for data_center ENA

    status = False
    messages = []
    check_performed = False

    if submission.release and submission.data.get('requirements', {}).get(
            'data_center', '').count('ENA'):

        check_performed = True
        submission.target = ENA_PANGAEA
        submission.save()

        meta_data_files = submission.submissionupload_set.filter(meta_data=True)
        no_of_meta_data_files = len(meta_data_files)

        if no_of_meta_data_files != 1:
            logger.info(
                msg='check_for_molecular_content | '
                    'invalid no. of meta_data_files, {0} | return=False'
                    ''.format(no_of_meta_data_files))
            messages = ['invalid no. of meta_data_files, '
                        '{0}'.format(no_of_meta_data_files)]
            return status, messages, check_performed

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
        if valid:
            # submission.target = ENA_PANGAEA
            # submission.save()
            logger.info(
                msg='check_for_molecular_content | valid data from csv |'
                    ' return=True')
            # return True, []
            status = True
        else:
            # status = False
            messages = [e.message for e in full_errors]
            submission.data.update(
                {'validation': messages})
            # submission.save()
            logger.info(
                msg='check_for_molecular_content  | invalid data from csv |'
                    ' return=False')
            # return False, error_messages

        submission.save()
    #     return status, messages
    # else:
    #     logger.info(
    #         msg='check_for_molecular_content | no criteria matched | '
    #             'return=False')
    #     return False, ['no criteria matched']
    logger.info(
        msg='check_for_molecular_content  | finished | return status={0} '
            'messages={1} check_performed={2}'.format(status, messages,
                                                      check_performed))
    return status, messages, check_performed

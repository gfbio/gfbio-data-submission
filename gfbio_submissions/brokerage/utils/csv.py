# -*- coding: utf-8 -*-
import _csv
import csv
import json
import logging
import os
from collections import OrderedDict

import dpath.util as dpath
from django.utils.encoding import smart_str
from shortid import ShortId

from gfbio_submissions.brokerage.configuration.settings import ENA_PANGAEA, ENA,\
    SUBMISSION_MIN_COLS
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

specimen_core_fields = [
    'specimen identifier'
    #'basis of record',
    #'scientific name'
]

abcd_mapping = {
'specimen identifier': 'UnitID',
'basis of record': 'RecordBasis',
'scientific name': 'FullScientificNameString',
'country (area)': 'Country',
'locality': 'LocalityText',
'date: day': 'ISODateTimeBegin',
'date: month': 'ISODateTimeBegin',
'date: year': 'ISODateTimeBegin',
'catalogue number': 'PhysicalObjectID',
'field number': 'CollectorFieldNumber',
'collector/observer': 'AgentText',
'sex': 'Sex',
'kingdom': 'HigherClassification',
'other higher taxon': 'HigherTaxonName',
'rank of other higher taxon': 'HigherTaxonRank',
'longitude (decimal, wgs84)': 'LongitudeDecimal',
'latitude decimal (decimal, wgs84)': 'LatitudeDecimal',
'type status': 'TypeStatus',
'original name linked to type': 'TypifiedName',
'globally unique identifier (if existing)': 'UnitGUID',
}

abcd_mapping_keys = abcd_mapping.keys()

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
                if str(o).lower() == 'environmental package':
                    sample_attributes.append(
                        OrderedDict([
                            ('tag', o), ('value', row[o].lower())
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


def find_correct_platform_and_model(platform_value):
    if platform_value == '':
        return platform_value
    # removing any leading and trailing whitespaces, make it lower case, don't rely on external methods
    platform_value_fixed = platform_value.strip()
    platform_value_fixed = platform_value_fixed.lower()

    # return empty string if value unspecified, which will otherwise be found in multiple platforms
    if platform_value_fixed == 'unspecified':
        return ''

    # load ena_experiment_definitions.json
    path = os.path.join(
        os.getcwd(),
        'gfbio_submissions/brokerage/schemas/ena_experiment_definitions.json')
    with open(path, 'r') as f:
        json_dict = json.load(f)

    # save all matched platform when fixed value is treated as an instrument
    matched_platforms_value_as_instrument = []
    # save all matched platform when fixed value is treated as a platform
    matched_platforms_value_as_platform = []
    # when first word in platform value could be a platform name or part of it
    # examples:
    # pacbio should match pacbio_smrt unspecified
    # pacbio Sequel should match pacbio_smrt Sequel
    # illum should match illumina unspecified
    partial_platform_match = []
    # try to connect all words together to find a platform or instrument
    # stores {} format platform:instrument
    combined_vlaue_match = []
    combined_platform_value = '_'.join(platform_value_fixed.split())

    for platform in json_dict:
        # identify viable platforms in json file
        if (len(json_dict[platform]) == 2 and
                "enum" in json_dict[platform].keys() and
                "type" in json_dict[platform].keys() and
                json_dict[platform]["type"] == 'string'):

            instruments = json_dict[platform]["enum"]

            # match value as instrument
            for instrument in instruments:
                if platform_value_fixed == instrument.lower():
                    matched_platforms_value_as_instrument.append(
                        {platform: instrument})
                # combined value as instrument check
                if combined_platform_value == instrument.lower():
                    combined_vlaue_match.append({platform: instrument})

            # match value as platform
            if platform_value_fixed == platform.lower():
                matched_platforms_value_as_platform.append(platform)

            # partial match
            partial_instrument = "unspecified" if len(
                platform_value_fixed.split()) == 1 else platform_value_fixed.split()[
                                                        1:]
            if partial_instrument != "unspecified":
                partial_instrument = ' '.join(partial_instrument)
                partial_instrument = partial_instrument.lower()
            if platform_value_fixed.split()[0] in platform.lower():
                partial_platform_match.append({platform: ""})
                for instrument in instruments:
                    if partial_instrument == instrument.lower():
                        partial_platform_match[len(partial_platform_match) - 1][
                            platform] = instrument

            # combined value match
            if combined_platform_value == platform.lower():
                combined_vlaue_match.append({platform: "unspecified"})

    if len(matched_platforms_value_as_instrument) == 1:
        platform_key = list(matched_platforms_value_as_instrument[0].keys())[0]
        return platform_key + ' ' + matched_platforms_value_as_instrument[0][
            platform_key]
    elif len(matched_platforms_value_as_platform) == 1:
        # check if unspecified value is allowed
        if 'unspecified' in json_dict[matched_platforms_value_as_platform[0]][
            "enum"]:
            return matched_platforms_value_as_platform[0] + ' unspecified'
        else:
            return ''
    elif len(combined_vlaue_match) == 1:
        platform_key = list(combined_vlaue_match[0].keys())[0]
        # check if unspecified value is allowed
        if combined_vlaue_match[0][
            platform_key] == 'unspecified' and 'unspecified' in \
                json_dict[platform_key]["enum"]:
            return platform_key + ' unspecified'
        else:
            return platform_key + ' ' + combined_vlaue_match[0][platform_key]
    elif len(partial_platform_match) == 1:
        platform_key = list(partial_platform_match[0].keys())[0]
        if partial_platform_match[0][platform_key] == "":
            return ''
        else:
            return platform_key + ' ' + partial_platform_match[0][platform_key]
    else:
        # unidentifiable value
        return ''


def extract_experiment(experiment_id, row, sample_id):
    try:
        design_description = int(row.get('design_description', '-1'))
    except ValueError as e:
        design_description = -1
    try:
        nominal_length = int(row.get('nominal_length', '-1'))
    except ValueError as e:
        nominal_length = -1
    fixed_platform_value = find_correct_platform_and_model(
        row.get('sequencing_platform', ''))
    experiment = {
        'experiment_alias': experiment_id,
        'platform': ' '.join(fixed_platform_value.split()[1:])
    }

    library_layout = row.get('library_layout', '').lower()

    dpath.new(experiment, 'design/sample_descriptor', sample_id)
    dpath.new(
        experiment, 'design/library_descriptor/library_strategy',
        library_strategy_mappings.get(
            row.get('library_strategy', '').lower(), ''
        )
    )
    # For sake of simplicity library_source is converted to upper case since
    # all values in schema are uppercase
    dpath.new(experiment, 'design/library_descriptor/library_source',
                       row.get('library_source', '').upper()
                      )
    dpath.new(
        experiment,
        'design/library_descriptor/library_selection',
        library_selection_mappings.get(
            row.get('library_selection', '').lower(), ''
        )
    )
    dpath.new(experiment,
              'design/library_descriptor/library_layout/layout_type',
              library_layout)

    dpath.new(experiment, 'files/forward_read_file_name',
              row.get('forward_read_file_name', ''))
    dpath.new(experiment, 'files/forward_read_file_checksum',
              row.get('forward_read_file_checksum', ''))

    # TODO: with single layout, only forward_read_file attribute are considered
    #   is it ok to use such a file name for a single ?
    if library_layout != 'single':
        dpath.new(experiment, 'files/reverse_read_file_name',
                  row.get('reverse_read_file_name', ''))
        dpath.new(experiment, 'files/reverse_read_file_checksum',
                  row.get('reverse_read_file_checksum', ''))

    if len(row.get('design_description', '').strip()):
        dpath.new(experiment, 'design/design_description',
                  design_description)
    if library_layout == 'paired':
        dpath.new(
            experiment,
            'design/library_descriptor/library_layout/nominal_length',
            nominal_length
        )
    return experiment


# TODO: maybe csv is in a file like implemented or comes as text/string
def parse_molecular_csv(csv_file):
    header = csv_file.readline()
    dialect = csv.Sniffer().sniff(smart_str(header))
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


def check_minimum_header_cols(meta_data):
    with open(meta_data.file.path, 'r') as file:
        line = file.readline()
        dialect = csv.Sniffer().sniff(smart_str(line))
        delimiter = dialect.delimiter if dialect.delimiter in [',', ';',
                                                               '\t'] else ';'
        splitted = line.replace('"', '').lower().split(delimiter)

        res = {col in splitted for col in SUBMISSION_MIN_COLS}
        if len(res) == 1 and (True in res):
            return True
        else:
            return False


def check_metadata_rule(submission):
    meta_data = submission.submissionupload_set.filter(meta_data=True)
    if len(meta_data) == 1:
        return check_minimum_header_cols(meta_data.first())
    else:
        return False


def check_csv_file_rule(submission):
    csv_uploads = submission.submissionupload_set.filter(file__endswith='.csv')

    if len(csv_uploads):
        for csv_file in csv_uploads:
            is_meta = check_minimum_header_cols(csv_file)
            if is_meta:
                csv_file.meta_data = True
                csv_file.save()
                return is_meta
        return False
    else:
        return False


# TODO: may move to other location, perhaps model, serializer or manager method
def check_for_molecular_content(submission):
    logger.info(
        msg='check_for_molecular_content | '
            'process submission={0} | target={1} | release={2}'
            ''.format(submission.broker_submission_id, submission.target,
                      submission.release))

    status = False
    messages = []
    check_performed = False

    # FIXME: this is redundant to method below
    if check_metadata_rule(submission):
        status = True
        check_performed = True
        submission.target = ENA
        submission.data.get('requirements', {})[
            'data_center'] = 'ENA – European Nucleotide Archive'
        submission.save()
        logger.info(
            msg='check_for_molecular_content  | check_csv_file_rule=True | '
                'return status={0} messages={1} '
                'molecular_data_check_performed={2}'.format(status,
                                                            messages,
                                                            check_performed)
        )

    # FIXME: this is redundant to method above
    elif check_csv_file_rule(submission):
        status = True
        check_performed = True
        submission.target = ENA
        submission.data.get('requirements', {})[
            'data_center'] = 'ENA – European Nucleotide Archive'
        submission.save()
        logger.info(
            msg='check_for_molecular_content  | check_metadata_rule=True | '
                'return status={0} messages={1} '
                'molecular_data_check_performed={2}'.format(status,
                                                            messages,
                                                            check_performed)
        )

    if submission.release and submission.data.get('requirements', {}).get(
            'data_center', '').count('ENA'):

        check_performed = True
        submission.target = ENA
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
            logger.info(
                msg='check_for_molecular_content | valid data from csv |'
                    ' return=True')
            status = True
        else:
            messages = [e.message for e in full_errors]
            submission.data.update(
                {'validation': messages})
            logger.info(
                msg='check_for_molecular_content  | invalid data from csv |'
                    ' return=False')

        submission.save()
        logger.info(
            msg='check_for_molecular_content  | finished | return status={0} '
                'messages={1} molecular_data_check_performed={2}'.format(status,
                                                                         messages,
                                                                         check_performed))
    return status, messages, check_performed

def extract_specimen(row, field_names, sample_id):
    from datetime import date
    import datetime

    for k in row.keys():
        row[k] = row[k].strip()

    date_string = str()
    year = ''
    month = ''
    day = ''

    specimen_attributes = []
    for o in field_names:
        if o not in specimen_core_fields and len(row[o]) and \
                row[o] not in attribute_value_blacklist:
            if o in abcd_mapping_keys and str(o) == 'date: year':
               year = str(row[o])
               dt_obj = datetime.datetime(int(year),int(month),int(day))
               dt_str = dt_obj.strftime("%Y-%m-%d")  #should be a string
               specimen_attributes.append(
                   OrderedDict([
                       ('tag', 'IsoDateTimeBegin'),
                       ('value', dt_str),
                   ]))
            elif o in abcd_mapping_keys and str(o) == 'date: month':
                month = str(row[o])
            elif o in abcd_mapping_keys and str(o) == 'date: day':
                day = str(row[o])
            elif o in abcd_mapping_keys:
                specimen_attributes.append(
                    OrderedDict([
                        ('tag', abcd_mapping[o]),
                        ('value', row[o]),
                    ])
                )

    try:
        unit_id= str(row.get('specimen identifier', 'empty value'))
    except:
        unit_id =  'empty value'
    specimen = {
        'UnitId': row.get('specimen identifier', ''),
        #'RecordBasis': row.get('Basis of record', ''),
        #'FullScientificNameString': row.get('Scientific name', '')
    }
    if len(specimen_attributes):
        specimen['specimen_attributes'] = specimen_attributes

    return specimen

def parse_taxonomic_csv(csv_file):
    header = csv_file.readline()
    dialect = csv.Sniffer().sniff(smart_str(header))
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
    taxonomic_requirements = {
        'atax_specimens': [],
    }
    try:
        field_names = csv_reader.fieldnames
        for i in range(0, len(field_names)):
            field_names[i] = field_names[i].strip().lower()
    except _csv.Error as e:
        return taxonomic_requirements

    short_id = ShortId()
    specimen_identifiers = []
    specimen_ids = []

    for row in csv_reader:
        # every row is one sample (except header)
        identifier = row.get('specimen identifier', None)
        if identifier:
            if identifier not in specimen_identifiers:
                specimen_identifiers.append(identifier)
                specimen_id = short_id.generate()
                specimen_ids.append(specimen_id)
                specimen = extract_specimen(row, field_names, specimen_id)
                taxonomic_requirements['atax_specimens'].append(
                    specimen
                )

    return taxonomic_requirements

def AddDataSet( root):

    from lxml import etree
    import os

    abcd = "http://www.tdwg.org/schemas/abcd/2.06"
    dataset = etree.SubElement(root, "{" + abcd + "}" + "DataSet")
    return dataset

def AddTechnicalContacts(user, dataset):

    from lxml import etree
    import os

    abcd = "http://www.tdwg.org/schemas/abcd/2.06"
    contacts = etree.SubElement(dataset, "{" + abcd + "}" + "TechnicalContacts")
    contact = etree.SubElement(contacts, "{" + abcd + "}" + "TechnicalContact")
    name = etree.SubElement(contact, "{" + abcd + "}" + "Name")
    name.text  = user.email

def AddContentContacts(user, dataset):

    from lxml import etree
    import os

    abcd = "http://www.tdwg.org/schemas/abcd/2.06"
    contacts = etree.SubElement(dataset, "{" + abcd + "}" + "ContentContacts")
    contact = etree.SubElement(contacts, "{" + abcd + "}" + "ContentContact")
    name = etree.SubElement(contact, "{" + abcd + "}" + "Name")
    name.text  = user.username

def AddMetaData(user, created, dataset):

    from lxml import etree
    import os
    abcd = "http://www.tdwg.org/schemas/abcd/2.06"
    metadata = etree.SubElement(dataset, "{" + abcd + "}" + "Metadata")
    description = etree.SubElement(metadata, "{" + abcd + "}" + "Description")
    representation = etree.SubElement(description, "{" + abcd + "}" + "Representation", language="EN")
    title = etree.SubElement(representation, "{" + abcd + "}" + "Title")
    title.text = 'TaxonOmics - New approaches to discovering and naming biodiversity'
    uri = etree.SubElement(representation, "{" + abcd + "}" + "URI")
    uri.text = 'https://www.taxon-omics.com/projects'
    revisiondata = etree.SubElement(metadata, "{" + abcd + "}" + "RevisionData")
    creators = etree.SubElement(revisiondata, "{" + abcd + "}" + "Creators")
    creators.text = user.username
    datemodified = etree.SubElement(revisiondata, "{" + abcd + "}" + "DateModified")
    datemodified.text = date_time = created.strftime("%Y-%m-%dT%H:%M:%S")

def AddUnits( dataset):

    from lxml import etree
    import os

    abcd = "http://www.tdwg.org/schemas/abcd/2.06"
    units = etree.SubElement(dataset, "{" + abcd + "}" + "Units")
    return units

def AddUnit( units):

    from lxml import etree
    import os

    abcd = "http://www.tdwg.org/schemas/abcd/2.06"
    unit = etree.SubElement(units, "{" + abcd + "}" + "Unit")
    return unit

def AddUnitData(unit, unid, attr_list):
    from lxml import etree
    import os

    lookup_list = ['UnitID',
    'RecordBasis',
    'FullScientificNameString',
    'Country',
    'AreaDetail',
    'ISODateTimeBegin',
    'PhysicalObjectID',
    'CollectorFieldNumber',
    'AgentText',
    'Sex',
    'HigherClassification',
    'HigherTaxonName',
    'HigherTaxonRank',
    'LongitudeDecimal',
    'LatitudeDecimal',
    'TypeStatus',
    'TypifiedName',
    'UnitGUID'
    ]
    cdict = {}
    hlist = []
    ndict = {}

    for e in attr_list:
        sdict = dict(e)
        tagval = ''
        valval = ''
        #iterate over the two items and reduce:
        for key in sdict.keys():
            #key is a string
            if(key=='tag'):
                tagval=sdict[key]
            elif(key == 'value'):
                valval=sdict[key]
        #ndict = {tagval, valval}
        #cdict.update(ndict)
        cdict[tagval] = valval

    abcd = "http://www.tdwg.org/schemas/abcd/2.06"
    #unit = etree.SubElement(units, "{" + abcd + "}" + "Unit")
    unitguid = etree.SubElement(unit, "{" + abcd + "}" + "UnitGUID")
    unitguid.text = 'Place here UnitGUID if there'
    sourceinstitutionid = etree.SubElement(unit, "{" + abcd + "}" + "SourceInstitutionID")
    sourceinstitutionid.text = 'Place here SourceInstitutionID'
    sourceid = etree.SubElement(unit, "{" + abcd + "}" + "SourceID")
    sourceid.text = unid[0:2]   #'Place here SourceID'
    unitid = etree.SubElement(unit, "{" + abcd + "}" + "UnitID")
    unitid.text = unid   #'Place here UnitID'
    identifications = etree.SubElement(unit, "{" + abcd + "}" + "Identifications")
    identification = etree.SubElement(identifications, "{" + abcd + "}" + "Identification")
    result = etree.SubElement(identification, "{" + abcd + "}" + "Result")
    taxonidentified = etree.SubElement(result, "{" + abcd + "}" + "TaxonIdentified")
    highertaxa = etree.SubElement(taxonidentified, "{" + abcd + "}" + "HigherTaxa")
    highertaxon1 = etree.SubElement(highertaxa, "{" + abcd + "}" + "HigherTaxon")
    highertaxonname = etree.SubElement(highertaxon1, "{" + abcd + "}" + "HigherTaxonName")
    highertaxonname.text = cdict.get('HigherTaxonName')
    highertaxonrank = etree.SubElement(highertaxon1, "{" + abcd + "}" + "HigherTaxonRank")
    highertaxonrank.text = 'familia'  #cdict.get('HigherTaxonRank') is not correct
    highertaxon2 = etree.SubElement(highertaxa, "{" + abcd + "}" + "HigherTaxon")
    highertaxonname = etree.SubElement(highertaxon2, "{" + abcd + "}" + "HigherTaxonName")
    highertaxonname.text = cdict.get('HigherClassification')
    highertaxonrank = etree.SubElement(highertaxon2, "{" + abcd + "}" + "HigherTaxonRank")
    highertaxonrank.text = 'regnum'
    scientificname = etree.SubElement(taxonidentified, "{" + abcd + "}" + "ScientificName")
    fullscientificnamestring1 = etree.SubElement(scientificname, "{" + abcd + "}" + "FullScientificNameString")
    fullscientificnamestring1.text = cdict.get('FullScientificNameString')  #cdict['FullScientificNameString']   #'Place here FullScientificNameString'
    recordbasis = etree.SubElement(unit, "{" + abcd + "}" + "RecordBasis")
    recordbasis.text = cdict.get('RecordBasis')   #cdict['RecordBasis']   #''place here fixed vocabulary for RecordBasis ,PreservedSpecimen'
    if cdict.get('PhysicalObjectID', None) or cdict.get('TypifiedName', None) or cdict.get('TypeStatus', None):
        specimenunit = etree.SubElement(unit, "{" + abcd + "}" + "SpecimenUnit")
        if cdict.get('PhysicalObjectID', None):
            accessions = etree.SubElement(specimenunit, "{" + abcd + "}" + "Accessions")
            accessionnumber = etree.SubElement(accessions, "{" + abcd + "}" + "AccessionNumber")
            accessionnumber.text = cdict.get('PhysicalObjectID')  # Phacidium congener Ces.
        if cdict.get('TypifiedName', None) or cdict.get('TypeStatus', None):
            nomenclaturaltypedesignations = etree.SubElement(specimenunit, "{" + abcd + "}" + "NomenclaturalTypeDesignations")
            nomenclaturaltypedesignation = etree.SubElement(nomenclaturaltypedesignations, "{" + abcd + "}" + "NomenclaturalTypeDesignation")
        if cdict.get('TypifiedName', None):
            typifiedname = etree.SubElement(nomenclaturaltypedesignation, "{" + abcd + "}" + "TypifiedName")
            fullscientificnamestring2 = etree.SubElement(typifiedname, "{" + abcd + "}" + "FullScientificNameString")
            fullscientificnamestring2.text = cdict.get('TypifiedName')  #Phacidium congener Ces.
        if cdict.get('TypeStatus', None):
            typestatus = etree.SubElement(nomenclaturaltypedesignation, "{" + abcd + "}" + "TypeStatus")
            typestatus.text = cdict.get('TypeStatus')
    gathering = etree.SubElement(unit, "{" + abcd + "}" + "Gathering")
    datetime = etree.SubElement(gathering, "{" + abcd + "}" + "DateTime")
    isodatetimebegin = etree.SubElement(datetime, "{" + abcd + "}" + "ISODateTimeBegin")
    isodatetimebegin.text = cdict.get('IsoDateTimeBegin')
    agents = etree.SubElement(gathering, "{" + abcd + "}" + "Agents")
    gatheringagentstext = etree.SubElement(agents, "{" + abcd + "}" + "GatheringAgentsText")
    gatheringagentstext.text = cdict.get('AgentText')
    localitytext = etree.SubElement(gathering, "{" + abcd + "}" + "LocalityText")
    localitytext.set('language', ''"EN"'')
    localitytext.text = cdict.get('LocalityText')
    country = etree.SubElement(gathering, "{" + abcd + "}" + "Country")
    name = etree.SubElement(country, "{" + abcd + "}" + "Name")
    name.text = cdict.get('Country')
    sitecoordinatesets = etree.SubElement(gathering, "{" + abcd + "}" + "SiteCoordinateSets")
    sitecoordinates = etree.SubElement(sitecoordinatesets, "{" + abcd + "}" + "SiteCoordinates")
    coordinateslatlong = etree.SubElement(sitecoordinates, "{" + abcd + "}" + "CoordinatesLatLong")
    longitudedecimal = etree.SubElement(coordinateslatlong, "{" + abcd + "}" + "LongitudeDecimal")
    longitudedecimal.text = cdict.get('LongitudeDecimal')
    latitudedecimal = etree.SubElement(coordinateslatlong, "{" + abcd + "}" + "LatitudeDecimal")
    latitudedecimal.text = cdict.get('LatitudeDecimal')
    collectorsfieldnumber = etree.SubElement(unit, "{" + abcd + "}" + "CollectorsFieldNumber")
    collectorsfieldnumber.text =cdict.get('CollectorFieldNumber')
    if cdict.get('Sex',None):
        sex = etree.SubElement(unit, "{" + abcd + "}" + "Sex")
        sex.text = cdict.get('Sex')[:1]

def create_taxonomic_xml_from_dict(csv_file):
    # use a real path later on
    from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
    import xml.etree.ElementTree as ET
    #from xml.etree.ElementTree import Element, SubElement, tostring, XML

    # switching is possible:
    # from lxml import etree as ElementTree, more functions
    import os

    file_names = [
            'csv_files/specimen_table_Platypelis.csv',
            #'csv_files/mol_comma_with_empty_rows_cols.csv',
        ]

    for fn in file_names:
        with open(os.path.join(_get_test_data_dir_path(), fn),
            'r',  encoding = 'utf-8-sig') as data_file:
            requirements = parse_taxonomic_csv(data_file)

        #Creating XML Using the ElementTree Module:
        root = ET.Element('abcd:DataSet')

        tree = ET.ElementTree(root)

        ET.register_namespace('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        ET.register_namespace('xmlns:abcd', 'http://www.tdwg.org/schemas/abcd/2.06')
        ET.register_namespace('xsi:schemaLocation', 'http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD')
        name_space = {
            'xmlns: xsi = "http://www.w3.org/2001/XMLSchema-instance" xmlns: abcd = "http://www.tdwg.org/schemas/abcd/2.06" xsi: schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"'
        }
        namespace = ET.Element(name_space)
        root.append(namespace)


        #xml_file_name = os.path.basename(fn).split('/')[-1]
        xml_file_name = os.path.basename(fn)
        xml_file_name = xml_file_name + '.xml'
        xml_file_name = ''.join(('xml_files/',xml_file_name))
        with open(os.path.join(_get_test_data_dir_path(), xml_file_name),'wb') as f:
           #f.write('<?xml version="1.0"?>' + "\n")
           #f.write('abcd:DataSets xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:abcd="http://www.tdwg.org/schemas/abcd/2.06" xsi:schemaLocation=" http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"'+ "\n")
            tree.write(f)
            f.close()

def create_taxonomic_xml_from_dict_lxml(submission, csv_file):
    # use a real path later on
    from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path

    import lxml
    from lxml import etree
    import os

    file_names = [
            'csv_files/specimen_table_Platypelis.csv',
            #'csv_files/mol_comma_with_empty_rows_cols.csv',
        ]

    for fn in file_names:
        with open(os.path.join(_get_test_data_dir_path(), fn),
            'r',  encoding = 'utf-8-sig') as data_file:
            requirements = parse_taxonomic_csv(data_file)

        #Creating XML Using the lxml  etree Module:
        # set of strings, not used
        nsmap = {
            'xmlns: xsi = "http://www.w3.org/2001/XMLSchema-instance",'
            ' xmlns: abcd = "http://www.tdwg.org/schemas/abcd/2.06",'
            ' xsi: schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"'
        }
        xsi = "http://www.w3.org/2001/XMLSchema-instance"
        abcd = "http://www.tdwg.org/schemas/abcd/2.06"
        schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"


        #goal:
        #abcd: DataSets
        #xmlns: xsi = "http://www.w3.org/2001/XMLSchema-instance"
        #xmlns: abcd = "http://www.tdwg.org/schemas/abcd/2.06"
        #xsi: schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"


        ns = {"xsi": xsi, "abcd": abcd} # "schemaLocation": schemaLocation}
        root = etree.Element("{" + abcd + "}DataSets", attrib={"{" + xsi + "}schemaLocation": schemaLocation}, nsmap=ns)
        #etree.SubElement(root, "{" + abcd + "}" + "DataSet").text = "The data of one line"
        dataset = AddDataSet( root)
        AddTechnicalContacts(submission.user, dataset)
        AddContentContacts(submission.user, dataset)
        AddMetaData(submission.user, submission.created, dataset)
        units = AddUnits( dataset)
        #requirement = atax_specimens:
        unid=None
        attr_list = None
        #requirements: dict 1
        for key, value in requirements.items():
            if(key=='atax_specimens'):
                attr_list = value
        #attr_list: list of dicts

        length = len(attr_list)

        for i in range(length):
            unid = attr_list[i]['UnitId']
            inhalt = attr_list[i] ['specimen_attributes']  #list 14

            unit = AddUnit(units)
            AddUnitData(unit, unid, inhalt)

        xml_file_name = os.path.basename(fn)
        xml_file_name = (os.path.splitext(xml_file_name))[0]
        xml_file_name = xml_file_name + '.xml'
        xml_file_name = ''.join(('xml_files/',xml_file_name))

        with open(os.path.join(_get_test_data_dir_path(), xml_file_name),'wb') as f:
            tree = root.getroottree()
            tree.write(f, encoding="utf-8", xml_declaration=True, pretty_print=True)
            f.close()
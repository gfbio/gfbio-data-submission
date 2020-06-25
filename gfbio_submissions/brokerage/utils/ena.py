# -*- coding: utf-8 -*-

import datetime
import gzip
import io
import json
import logging
import os
import textwrap
import uuid
import xml.etree.ElementTree as ET
from collections import OrderedDict
from ftplib import FTP
from pprint import pprint
from xml.etree.ElementTree import Element, SubElement

import dicttoxml
from django.conf import settings
from django.db import transaction
# TODO: read jsonschem 2.6.0 changelog
from django.utils.encoding import smart_text
from jsonschema import Draft3Validator
from pytz import timezone

from gfbio_submissions.brokerage.configuration.settings import \
    DEFAULT_ENA_CENTER_NAME, \
    DEFAULT_ENA_BROKER_NAME, CHECKLIST_ACCESSION_MAPPING, \
    STATIC_SAMPLE_SCHEMA_LOCATION
from gfbio_submissions.brokerage.models import AuditableTextData, \
    EnaReport, PersistentIdentifier
from gfbio_submissions.brokerage.utils.csv import \
    find_correct_platform_and_model
from gfbio_submissions.generic.utils import logged_requests

logger = logging.getLogger(__name__)
dicttoxml.LOG.setLevel(logging.ERROR)


#  ENALIZER  xml for ena -------------------------------------------------------
class Enalizer(object):
    def __init__(self, submission, alias_postfix=uuid.uuid4()):
        study, samples, experiments, runs = submission.get_json_with_aliases(
            alias_postfix=alias_postfix)
        self.study_alias = study.pop('study_alias', '')
        self.study = study
        self.sample = samples
        self.samples_key = 'samples'
        self.experiment = experiments
        self.experiments_key = 'experiments'
        self.experiments_contain_files = False
        self.run = runs
        self.runs_key = 'runs'
        self.embargo = submission.embargo
        if submission.center_name is not None \
                and submission.center_name.center_name != '':
            self.center_name = submission.center_name.center_name
        else:
            self.center_name = DEFAULT_ENA_CENTER_NAME

    def _upper_case_dictionary(self, dictionary):
        if isinstance(dictionary, list):
            return [self._upper_case_dictionary(v) for v in dictionary]
        elif isinstance(dictionary, dict):
            return dict((k.upper(), self._upper_case_dictionary(v)) for k, v in
                        dictionary.items())
        else:
            return dictionary

    def _upper_case_ordered_dictionary(self, dictionary):
        if isinstance(dictionary, list):
            return [self._upper_case_ordered_dictionary(v) for v in dictionary]
        elif isinstance(dictionary, OrderedDict) or isinstance(dictionary,
                                                               dict):
            return OrderedDict(
                (k.upper(), self._upper_case_ordered_dictionary(v)) for k, v in
                dictionary.items()
            )
        else:
            return dictionary

    def _capitalize_dictionary(self, dictionary):
        if isinstance(dictionary, list):
            return [self._upper_case_dictionary(v) for v in dictionary]
        else:
            dict((k.upper(), v) for k, v in dictionary.items())
            return self._upper_case_dictionary(dictionary)

    def _capitalize_ordered_dictionary(self, dictionary):
        if isinstance(dictionary, list):
            return [self._upper_case_ordered_dictionary(v) for v in dictionary]
        else:
            OrderedDict((k.upper(), v) for k, v in dictionary.items())
            return self._upper_case_ordered_dictionary(dictionary)

    # modified version of this one: https://gist.github.com/higarmi/6708779
    def flatten_dict(self, d, result=None):
        if result is None:
            result = {}
        for key, value in d.items():
            if isinstance(value, dict):
                value1 = {
                    ".".join([key, key_in_value]): value[key_in_value]
                    for key_in_value in value
                }
                self.flatten_dict(value1, result)
            elif isinstance(value, (list, tuple)):
                for indexB, element in enumerate(value):
                    if isinstance(element, dict):
                        value1 = {}
                        index = 0
                        for key_in_element in element:
                            # newkey = ".".join([key, keyIn])
                            value1[".".join([key, key_in_element])] = \
                                value[indexB][key_in_element]
                            index += 1
                        for keyA in value1:
                            # self.flatten_dict(value1, result)
                            self.flatten_dict(keyA, result)
                    else:
                        result["{}.{}".format(key, indexB)] = element
            else:
                result[key] = value
        return result

    def create_submission_xml(self,
                              action='VALIDATE',
                              hold_date=None,
                              outgoing_request_id='add_outgoing_id'):
        logger.info(
            msg='Enalizer create_submission_xml. action={} hold_date={}'.format(
                action, hold_date))
        actions = '<ACTION><{}/></ACTION>'.format(action)
        if not hold_date:
            # today + 1 year
            hold_date = '{0}'.format((datetime.date.today() +
                                      datetime.timedelta(days=365)).isoformat())
        else:
            hold_date = hold_date.isoformat()
        return textwrap.dedent(
            '<?xml version = \'1.0\' encoding = \'UTF-8\'?>'
            '<SUBMISSION alias="{2}" center_name="{3}" broker_name="{4}">'
            '<ACTIONS>'
            '{0}'
            '<ACTION><HOLD HoldUntilDate="{1}"/></ACTION>'
            '</ACTIONS>'
            '</SUBMISSION>'.format(
                actions,
                hold_date, outgoing_request_id,
                self.center_name,
                DEFAULT_ENA_BROKER_NAME
            )
        )

    def create_study_xml(self):
        study_dict = OrderedDict([('study', OrderedDict())])
        study_attributes = self.study.pop('study_attributes', [])

        # TODO: this migth become a class member, refer original enalizer
        # study_alias = self.study.pop('study_alias', '')
        # self.center_name = self.study.pop('center_name', ENA_CENTER_NAME)

        # site_object_id = self.study.pop('site_object_id', '')

        study_dict['study']['descriptor'] = self.study
        if len(study_attributes):
            study_dict['study']['study_attributes'] = study_attributes

        study_dict['study']['descriptor']['study_type'] = 'Other'

        study_dict = self._capitalize_dictionary(study_dict)

        study_xml = dicttoxml.dicttoxml(study_dict,
                                        custom_root='STUDY_SET',
                                        attr_type=False)

        # TODO: candidate for refactoring to generic method, params could be find_element and replacement
        root = ET.fromstring(study_xml)
        for item in root.findall('./STUDY/STUDY_ATTRIBUTES/item'):
            item.tag = 'STUDY_ATTRIBUTE'

        study_type = root.find('./STUDY/DESCRIPTOR/STUDY_TYPE')
        study_type.set('existing_study_type', study_type.text)
        study_type.text = ''

        study = root.find('./STUDY')
        study.set('alias', self.study_alias)
        study.set('center_name', self.center_name)
        study.set('broker_name', DEFAULT_ENA_BROKER_NAME)

        return ET.tostring(root, encoding='utf-8', method='xml')

    def append_environmental_package_attributes(self, sample_attributes):
        checklist_mappings_keys = CHECKLIST_ACCESSION_MAPPING.keys()
        # only add add_checklist and renamed_additional_checklist for first occurence of environmental package
        add_checklist = ''
        renamed_additional_checklist_tag = 'NO_VAL'
        renamed_additional_checklist_value = ''
        for s in sample_attributes:
            if s.get('tag', 'no_tag_found') == 'environmental package':
                renamed_additional_checklist_tag = '{0} {1}'.format(
                    s.get('value', 'NO_VAL'),
                    'environmental package'
                )
                renamed_additional_checklist_value = s.get(
                    'value', 'NO_VAL')
                break
        for s in sample_attributes:
            if s.get('tag', 'no_tag_found') == 'environmental package' \
                    and s.get('value', 'no_value_found') \
                    in checklist_mappings_keys:
                add_checklist = CHECKLIST_ACCESSION_MAPPING.get(
                    s.get('value', ''), ''
                )
                break
        if 'NO_VAL' not in renamed_additional_checklist_tag:
            sample_attributes.append(
                OrderedDict([('tag', renamed_additional_checklist_tag),
                             ('value', renamed_additional_checklist_value)])
            )
        if len(add_checklist):
            sample_attributes.append(
                # {'tag': 'ENA-CHECKLIST', 'value': add_checklist}
                OrderedDict(
                    [('tag', 'ENA-CHECKLIST'), ('value', add_checklist)])
            )

    def convert_sample(self, s, sample_index,
                       sample_descriptor_platform_mappings):
        sample_attributes = s.pop('sample_attributes', [])
        sample_attributes.append(
            OrderedDict([('tag', 'submitted to insdc'), ('value', 'true')]))
        sample_alias = s.get('sample_alias', 'NO_SAMPLE_ALIAS')
        if sample_alias in sample_descriptor_platform_mappings.keys():
            sample_attributes.append(
                OrderedDict([
                    ('tag', 'sequencing method'),
                    ('value',
                     sample_descriptor_platform_mappings.get(sample_alias))
                ]))
        res = OrderedDict()
        res['title'] = s.pop('sample_title', '')
        res['sample_alias'] = 'sample_alias_{0}'.format(sample_index)

        sname = OrderedDict()
        self.add_if_existing(sname, 'taxon_id', s)
        self.add_if_existing(sname, 'scientific_name', s)
        self.add_if_existing(sname, 'common_name', s)
        self.add_if_existing(sname, 'anonymized_name', s)
        self.add_if_existing(sname, 'individual_name', s)
        res['sample_name'] = sname

        res['description'] = s.pop('sample_description', '')
        res.update(s)
        if len(sample_attributes):
            self.append_environmental_package_attributes(sample_attributes)
            res['sample_attributes'] = [
                # {k.upper(): v for k, v in s.items()}
                OrderedDict([(k.upper(), v) for k, v in s.items()])
                for s in sample_attributes]
        return res

    def add_if_existing(self, ordered_dict, key, data_dict):
        if data_dict.get(key, None) is not None:
            ordered_dict[key] = data_dict.pop(key, None)

    def create_sample_xml(self, sample_descriptor_platform_mappings):
        for s in self.sample:
            gcdjson = s.pop('gcdjson', {})
            flattened_gcdj = self.flatten_dict(gcdjson)
            if 'sample_attributes' in s.keys():
                s.get('sample_attributes', []).extend(
                    [
                        # {'tag': k, 'value': v}
                        OrderedDict(('tag', k), ('value', v))
                        for k, v in
                        flattened_gcdj.items()
                    ]
                )
            else:
                s['sample_attributes'] = [OrderedDict(('tag', k), ('value', v))
                                          for k, v in
                                          flattened_gcdj.items()]
            s.pop('gcdjson_key', '')

        # TODO / FIXME: how deal with sample_alias ?
        samples = []
        index_for_sample = 0
        for s in self.sample:
            samples.append(self.convert_sample(s, index_for_sample,
                                               sample_descriptor_platform_mappings))
            index_for_sample += 1

        samples = self._capitalize_ordered_dictionary(samples)
        sample_xml = dicttoxml.dicttoxml(samples,
                                         custom_root='SAMPLE_SET',
                                         attr_type=False)
        root = ET.fromstring(sample_xml)
        for item in root.findall('./item'):
            item.tag = 'SAMPLE'
            alias = item.find('SAMPLE_ALIAS')
            item.set('alias', alias.text)
            item.remove(alias)
            # TODO: this might be a dedicated property ....
            item.set('center_name', self.center_name)
            item.set('broker_name', DEFAULT_ENA_BROKER_NAME)
        for item in root.findall('./SAMPLE/'):
            if item.tag == 'SAMPLE_ATTRIBUTES':
                for atr in item.findall('./item'):
                    atr.tag = 'SAMPLE_ATTRIBUTE'

        return ET.tostring(root, encoding='utf-8', method='xml')

    @staticmethod
    def create_subelement(root, element_name, data_dict):
        if element_name in data_dict.keys():
            sub = SubElement(root, '{}'.format(element_name).upper())
            sub.text = data_dict.get(element_name, '')

    def create_subelements(self, root, element_names, data_dict):
        [self.create_subelement(root, name, data_dict) for name in
         element_names]

    @staticmethod
    def create_subelement_with_attribute(root, element_name, attrib_name,
                                         data_dict, data_key=None):
        if data_key:
            return SubElement(root, element_name.upper(), {
                attrib_name.lower(): data_dict.get(data_key, '')})
        return SubElement(root, element_name.upper(), {
            attrib_name.lower(): data_dict.get(element_name, '')})

    @staticmethod
    def create_library_layout(root, data_dict):
        if 'library_layout' in data_dict.keys():
            library_layout = SubElement(root, 'LIBRARY_LAYOUT')
            layout = data_dict.get('library_layout', {}).get(
                'layout_type', '').upper()
            layout_element = SubElement(library_layout, layout)
            if layout == 'PAIRED':
                layout_element.set(
                    'NOMINAL_LENGTH',
                    str(data_dict.get('library_layout', {}).get(
                        'nominal_length', -1)))

    def create_targeted_loci(self, root, data_dict):
        for locus_data in data_dict:
            description = locus_data.get('description', '')
            if len(description):
                locus = SubElement(root, 'LOCUS', {
                    'locus_name': locus_data.get('locus_name', ''),
                    'description': locus_data.get('description', '')
                })
            else:
                locus = SubElement(root, 'LOCUS', {
                    'locus_name': locus_data.get('locus_name', ''),
                })
            probe_set_data = locus_data.get('probe_set', {})
            if probe_set_data != {}:
                probe_set = SubElement(locus, 'PROBE_SET')
                self.create_subelement(probe_set, 'db', probe_set_data)
                self.create_subelement(probe_set, 'id', probe_set_data)
                self.create_subelement(probe_set, 'label', probe_set_data)

    # FIXME: this uppper() and lower() stuff has to be simplified, also in json-schema !
    @staticmethod
    def create_platform(root, platform_value):
        # TODO: check and discuss if this new platform is ok -> one string with Instrument + model
        # TODO: assuming platform <space> model <space> model-detail
        platform = find_correct_platform_and_model(platform_value).split()
        instrument = SubElement(
            root,
            platform[0].upper()
        )
        instrument_model = SubElement(instrument, 'INSTRUMENT_MODEL')
        instrument_model.text = ' '.join(platform[1:])

    def create_attributes(self, root, data_dict, attribute_prefix=''):
        for attribute in data_dict:
            experiment_attribute = SubElement(root, '{}_ATTRIBUTE'.format(
                attribute_prefix).upper())
            self.create_subelement(experiment_attribute, 'tag', attribute)
            if 'value' in attribute.keys():
                self.create_subelement(experiment_attribute, 'value', attribute)
            if 'units' in attribute.keys():
                self.create_subelement(experiment_attribute, 'units', attribute)

    def create_single_experiment_xml(self, experiment_set, data,
                                     sample_descriptor_platform_mappings):
        experiment = self.create_subelement_with_attribute(experiment_set,
                                                           'EXPERIMENT',
                                                           'alias', data,
                                                           'experiment_alias')
        experiment.set('broker_name', DEFAULT_ENA_BROKER_NAME)
        experiment.set('center_name', self.center_name)
        self.create_subelement(experiment, 'title', data)
        self.create_subelement_with_attribute(experiment, 'study_ref',
                                              'refname', data)
        design_data = data.get('design', {})
        sample_decriptor = design_data.get('sample_descriptor')

        design = SubElement(experiment, 'DESIGN')
        if 'design_description' in design_data.keys():
            self.create_subelement(design, 'design_description', design_data)
        else:
            SubElement(design, 'DESIGN_DESCRIPTION')
        self.create_subelement_with_attribute(design, 'sample_descriptor',
                                              'refname', design_data)

        library_descriptor_data = design_data.get('library_descriptor', {})
        library_descriptor = SubElement(design, 'LIBRARY_DESCRIPTOR')
        self.create_subelements(
            library_descriptor,
            ['library_name', 'library_strategy', 'library_source',
             'library_selection', ],
            library_descriptor_data)

        self.create_library_layout(library_descriptor, library_descriptor_data)

        targeted_loci_data = library_descriptor_data.get('targeted_loci', {})
        if len(targeted_loci_data) > 0:
            targeted_loci = SubElement(library_descriptor, 'TARGETED_LOCI')
            self.create_targeted_loci(targeted_loci, targeted_loci_data)

        self.create_subelement(library_descriptor, 'pooling_strategy',
                               library_descriptor_data)
        self.create_subelement(library_descriptor,
                               'library_construction_protocol',
                               library_descriptor_data)

        platform_data = data.get('platform', {})
        if len(platform_data) > 0:
            sample_descriptor_platform_mappings[
                sample_decriptor] = platform_data
            platform = SubElement(experiment, 'PLATFORM')
            self.create_platform(platform, platform_data)

        experiment_attributes_data = data.get('experiment_attributes', {})
        if len(experiment_attributes_data) > 0:
            experiment_attributes = SubElement(experiment,
                                               'EXPERIMENT_ATTRIBUTES')
            self.create_attributes(experiment_attributes,
                                   experiment_attributes_data, 'experiment')

        experiment_files = data.get('files', {})
        if len(experiment_files):
            self.experiments_contain_files = True
        # return sample_descriptor_platform_mapping

    def create_experiment_xml(self):
        experiment_set = Element('EXPERIMENT_SET')
        sample_descriptor_platform_mappings = {}
        for experiment in self.experiment:
            self.create_single_experiment_xml(experiment_set, experiment,
                                              sample_descriptor_platform_mappings)
        return sample_descriptor_platform_mappings, ET.tostring(experiment_set,
                                                                encoding='utf-8',
                                                                method='xml')

    def create_run_data_block(self, file_attributes, run, run_root,
                              broker_submission_id=None):
        if 'data_block' in run.keys():
            data_block = SubElement(run_root, 'DATA_BLOCK')

            files = SubElement(data_block, 'FILES')
            for file in run.get('data_block', {}).get('files', []):
                file_element = SubElement(files, 'FILE')

                for attrib in file_attributes:
                    if attrib == 'filename' and broker_submission_id:
                        file[attrib] = '{0}/{1}'.format(broker_submission_id,
                                                        file[attrib])
                    file_element.set(attrib,
                                     file.get(attrib, 'no_attribute_found'))
            return data_block
        else:
            return None

    def get_files_from_experiment(self):
        return [e['files'] for e in self.experiment if 'files' in e]

    def create_run_xml(self, broker_submission_id=None):
        run_set = Element('RUN_SET')

        # without checksum attributes
        file_attributes = ['filename', 'filetype', ]
        for r in self.run:
            # center=wenn gfbio center vom user | broker_name="Wir als GFBio" siehe brokeraccount   | (optional) run_center=wer hat sequenziert, registriert bei ena ?
            run = self.create_subelement_with_attribute(run_set, 'RUN', 'alias',
                                                        r, 'run_alias')
            run.set('center_name', self.center_name)
            run.set('broker_name', DEFAULT_ENA_BROKER_NAME)
            experiment_ref = self.create_subelement_with_attribute(run,
                                                                   'experiment_ref',
                                                                   'refname', r)
            data_block = self.create_run_data_block(file_attributes, r, run,
                                                    broker_submission_id)

            run_attributes_data = r.get('run_attributes', [])
            if len(run_attributes_data) > 0:
                run_attributes = SubElement(run, 'RUN_ATTRIBUTES')
                self.create_attributes(run_attributes, run_attributes_data,
                                       'run')

        return ET.tostring(run_set, encoding='utf-8', method='xml')

    def prepare_submission_data(self, broker_submission_id=None):
        logger.info(
            msg='Enalizer prepare_submission_data. broker_submission_id='.format(
                broker_submission_id))
        sample_descriptor_platform_mappings, experiment_xml = self.create_experiment_xml()
        sample_xml = self.create_sample_xml(
            sample_descriptor_platform_mappings=sample_descriptor_platform_mappings)
        if len(self.run):
            return {
                'STUDY': ('study.xml', smart_text(self.create_study_xml())),
                'SAMPLE': ('sample.xml', smart_text(sample_xml)),
                'EXPERIMENT': ('experiment.xml', smart_text(experiment_xml)),
                'RUN': ('run.xml', smart_text(self.create_run_xml(
                    broker_submission_id=broker_submission_id))),
            }
        else:
            return {
                'STUDY': ('study.xml', smart_text(self.create_study_xml())),
                'SAMPLE': ('sample.xml', smart_text(sample_xml)),
                'EXPERIMENT': ('experiment.xml', smart_text(experiment_xml)),
            }

    def prepare_submission_xml_for_sending(self, action='VALIDATE',
                                           outgoing_request_id=None):
        return (
            'submission.xml',
            smart_text(self.create_submission_xml(
                action=action,
                hold_date=self.embargo,
                outgoing_request_id=outgoing_request_id))
        )


# END --- ENALIZER  xml for ena -----------------------------------------------


def prepare_ena_data(submission):
    # outgoing_request_id = uuid.uuid4()
    enalizer = Enalizer(submission=submission,
                        alias_postfix=submission.broker_submission_id)
    return enalizer.prepare_submission_data(
        broker_submission_id=submission.broker_submission_id)


def store_ena_data_as_auditable_text_data(submission, data):
    for d in data:
        filename, filecontent = data[d]
        logger.info(
            msg='store_ena_data_as_auditable_text_data create '
                'AuditableTextData | submission_pk={0} filename={1}'
                ''.format(submission.pk, filename)
        )
        with transaction.atomic():
            AuditableTextData.objects.create(
                name=filename,
                submission=submission,
                text_data=filecontent
            )


# https://github.com/enasequence/schema/blob/master/src/main/resources/uk/ac/ebi/ena/sra/schema/SRA.study.xsd
def send_submission_to_ena(submission, archive_access, ena_submission_data,
                           action='ADD'):
    logger.info(
        msg='send_submission_to_ena submission_pk={} archive_access_pk={} method=POST'.format(
            submission.pk, archive_access.pk))
    auth_params = {
        'auth': archive_access.authentication_string,
    }

    outgoing_request_id = uuid.uuid4()
    # TODO: this needs refactoring, maybe static method for submission.xml thus the DB is not hit by constructor
    enalizer = Enalizer(submission=submission,
                        alias_postfix=submission.broker_submission_id)
    ena_submission_data[
        'SUBMISSION'] = enalizer.prepare_submission_xml_for_sending(
        action=action,
        outgoing_request_id=outgoing_request_id, )

    return logged_requests.post(
        archive_access.url,
        submission=submission,
        return_log_id=True,
        params=auth_params,
        files=ena_submission_data,
        verify=False
    )


def release_study_on_ena(submission):
    study_primary_accession = submission.brokerobject_set.filter(
        type='study').first().persistentidentifier_set.filter(
        pid_type='PRJ').first()
    site_config = submission.user.site_configuration
    if site_config is None:
        logger.warning(
            'ena.py | release_study_on_ena | no site_configuration found | submission_id={0}'.format(
                submission.broker_submission_id)
        )
        return None
    if study_primary_accession:

        logger.info(
            'ena.py | release_study_on_ena | primary accession no '
            'found for study | accession_no={0} | submission_id={1}'.format(
                study_primary_accession,
                submission.broker_submission_id)
        )

        current_datetime = datetime.datetime.now(timezone('UTC')).isoformat()

        submission_xml = textwrap.dedent(
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<SUBMISSION_SET xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
            ' xsi:noNamespaceSchemaLocation="ftp://ftp.sra.ebi.ac.uk/meta/xsd/sra_1_5/SRA.submission.xsd">'
            '<SUBMISSION'
            ' alias="gfbio:release:{broker_submission_id}:{time_stamp}"'
            ' center_name="GFBIO" broker_name="GFBIO">'
            '<ACTIONS>'
            '<ACTION>'
            '<RELEASE target="{accession_no}"/>'
            '</ACTION>'
            '</ACTIONS>'
            '</SUBMISSION>'
            '</SUBMISSION_SET>'.format(
                broker_submission_id=submission.broker_submission_id,
                time_stamp=current_datetime,
                accession_no=study_primary_accession,
            )
        )

        auth_params = {
            'auth': site_config.ena_server.authentication_string,
        }
        data = {'SUBMISSION': ('submission.xml', submission_xml)}

        return logged_requests.post(
            url=site_config.ena_server.url,
            submission=submission,
            return_log_id=True,
            params=auth_params,
            files=data,
            verify=False,
        )
    else:
        logger.warning(
            'ena.py | release_study_on_ena | no primary accession no '
            'found for study | submission_id={0}'.format(
                submission.broker_submission_id)
        )
        return None


def parse_ena_submission_response(response_content=''):
    res = {}

    root = ET.fromstring(response_content)
    res['success'] = root.attrib.get('success', 'false')
    # res['receipt_date'] = parse(root.attrib.get('receiptDate', '0'))
    res['receipt_date'] = root.attrib.get('receiptDate', '0')
    res['errors'] = [e.text.strip() for e in root.findall('.//ERROR')]
    res['infos'] = [i.text.strip().replace('\n', '') for i in
                    root.findall('.//INFO')]

    xml_study = root.findall('.//STUDY')
    if len(xml_study):
        for x in xml_study:
            attr = x.attrib
            attr['ext_ids'] = [e.attrib for e in x.findall('./EXT_ID')]

        res['study'] = xml_study.pop().attrib

    xml_experiments = root.findall('.//EXPERIMENT')
    if len(xml_experiments):
        res['experiments'] = [x.attrib for x in xml_experiments]

    xml_runs = root.findall('.//RUN')
    if len(xml_runs):
        res['runs'] = [x.attrib for x in xml_runs]

    xml_samples = root.findall('.//SAMPLE')
    if len(xml_samples):
        res['samples'] = []
        for x in xml_samples:
            attr = x.attrib
            attr['ext_ids'] = [e.attrib for e in x.findall('./EXT_ID')]
            res['samples'].append(attr)

    return res


def validate_sample_data(json_data):
    try:
        with open(os.path.join(settings.STATIC_ROOT,
                               STATIC_SAMPLE_SCHEMA_LOCATION)) as schema_file:
            schema = json.load(schema_file)
    except IOError as e:
        return e
    validator = Draft3Validator(schema)
    is_valid = validator.is_valid(json_data)
    if not is_valid:
        return is_valid, [
            'Error(s) regarding field \'{0}\' because: {1}'.format(
                error.relative_path.pop(),
                error.message.replace('u\'', '\'')
            )
            if len(error.relative_path) > 0
            else '{0}'.format(error.message.replace('u\'', '\''))
            for error in validator.iter_errors(json_data)
        ]
    else:
        return True, []


def download_submitted_run_files_to_string_io(site_config, decompressed_io):
    ftp_rc = site_config.ena_ftp
    transmission_report = []
    ftp = FTP(ftp_rc.url)
    transmission_report.append(
        ftp.login(user=ftp_rc.username, passwd=ftp_rc.password))
    transmission_report.append(ftp.cwd('report'))
    transmission_report.append(ftp.retrlines('LIST'))

    compressed_file = io.StringIO()

    transmission_report.append(
        ftp.retrbinary(
            'RETR submitted_run_files.txt.gz', compressed_file.write
        )
    )
    transmission_report.append(ftp.quit())

    compressed_file.seek(0)
    decompressed_io.write(
        gzip.GzipFile(fileobj=compressed_file, mode='rb').read()
    )
    compressed_file.close()
    return transmission_report


def fetch_ena_report(site_configuration, report_type):
    url = '{0}{1}?format=json'.format(
        site_configuration.ena_report_server.url, report_type)
    return logged_requests.get(
        url=url,
        return_log_id=True,
        auth=(
            site_configuration.ena_report_server.username,
            site_configuration.ena_report_server.password
        )
    )


def update_embargo_date_in_submissions(hold_date, study_pid):
    if len(study_pid) > 0:
        for study in study_pid:
            submissions = study.broker_object.submissions.all()
            for submission in submissions:
                if hold_date != submission.embargo:
                    submission.embargo = hold_date
                    submission.save()
                    logger.info(
                        msg='update_embargo_date_in_submissions | '
                            'ENA hold date does not match Submission embargo | '
                            'submission date: {} | '
                            'submission id: {} | '
                            'persistent_identifier_date: {} | '
                            'persistent_identifier_id: {}'
                            ''.format(submission.embargo,
                                      submission.broker_submission_id,
                                      study.hold_date, study.pid))


def update_persistent_identifier_report_status():
    for report_type in EnaReport.REPORT_TYPES:
        report_key, report_name = report_type
        reports = EnaReport.objects.filter(report_type=report_key)
        if len(reports) == 1:
            logger.info('ena.py | update_persistent_identifier_report_status '
                        '| process report of type={0}'.format(report_name))
            for report in reports.first().report_data:
                report_dict = report.get('report', {})
                pri_id = report_dict.get('id')
                sec_id = report_dict.get('secondaryId')
                status = report_dict.get('releaseStatus')
                hold_date = report_dict.get('holdDate')
                hold_date_time = datetime.datetime.now()
                if hold_date:
                    # holdDate from ENA report 2022-03-10T17:17:04
                    # https://www.journaldev.com/23365/python-string-to-datetime-strptime
                    ena_hold_date_format = "%Y-%m-%dT%X"
                    hold_date_time = datetime.datetime.strptime(hold_date,
                                                                ena_hold_date_format).date()
                ids_to_use = []
                if pri_id:
                    ids_to_use.append(pri_id)
                if sec_id:
                    ids_to_use.append(sec_id)

                for vid in ids_to_use:
                    if hold_date and status:
                        PersistentIdentifier.objects.filter(pid=vid).update(
                            status=status, hold_date=hold_date_time)
                        update_embargo_date_in_submissions(hold_date_time,
                                                           PersistentIdentifier.objects.filter(
                                                               pid=vid))
                    elif status:
                        PersistentIdentifier.objects.filter(pid=vid).update(
                            status=status)

            return True
        else:
            logger.warning(
                'ena.py | update_persistent_identifier_report_status '
                '| found {0} occurences for report of type={1} found'.format(
                    len(reports), report_name))
            return False


def update_ena_embargo_date(submission):
    study_primary_accession = submission.brokerobject_set.filter(
        type='study').first()
    if study_primary_accession:
        study_primary_accession = study_primary_accession.persistentidentifier_set.filter(
            pid_type='PRJ').first()
    site_config = submission.user.site_configuration
    if site_config is None:
        logger.warning(
            'ena.py | update_ena_embargo_date | no site_configuration found | submission_id={0}'.format(
                submission.broker_submission_id)
        )
        return None

    if study_primary_accession:
        logger.info(
            'ena.py | update_ena_embargo_date | primary accession '
            'found for study | accession_no={0} | submission_id={1}'.format(
                study_primary_accession,
                submission.broker_submission_id)
        )

        current_datetime = datetime.datetime.now(timezone('UTC')).isoformat()

        submission_xml = textwrap.dedent(
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<SUBMISSION_SET xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
            ' xsi:noNamespaceSchemaLocation="ftp://ftp.sra.ebi.ac.uk/meta/xsd/sra_1_5/SRA.submission.xsd">'
            '<SUBMISSION'
            ' alias="gfbio:hold:{broker_submission_id}:{time_stamp}"'
            ' center_name="GFBIO" broker_name="GFBIO">'
            '<ACTIONS>'
            '<ACTION>'
            '<HOLD target="{accession_no}" HoldUntilDate="{hold_date}"/>'
            '</ACTION>'
            '</ACTIONS>'
            '</SUBMISSION>'
            '</SUBMISSION_SET>'.format(
                hold_date=submission.embargo.isoformat(),
                broker_submission_id=submission.broker_submission_id,
                time_stamp=current_datetime,
                accession_no=study_primary_accession,
            )
        )

        auth_params = {
            'auth': site_config.ena_server.authentication_string,
        }
        data = {'SUBMISSION': ('submission.xml', submission_xml)}

        response, request_id = logged_requests.post(
            url=site_config.ena_server.url,
            submission=submission,
            return_log_id=True,
            params=auth_params,
            files=data,
            verify=False
        )

        return response, request_id
    else:
        logger.warning(
            'ena.py | update_ena_embargo_date | no primary accession no '
            'found for study | submission_id={0}'.format(
                submission.broker_submission_id)
        )
        return None

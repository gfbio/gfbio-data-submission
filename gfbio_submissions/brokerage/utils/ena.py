# -*- coding: utf-8 -*-

import datetime
import gzip
import hashlib
import io
import json
import logging
import os
import textwrap
import uuid
import xml.etree.ElementTree as ET
from collections import OrderedDict
from ftplib import FTP
from uuid import uuid4
from xml.etree.ElementTree import Element, SubElement

import dicttoxml
from django.conf import settings
from django.db import transaction
from django.utils.encoding import smart_str
from jsonschema import Draft3Validator
from pytz import timezone

from gfbio_submissions.generic.utils import logged_requests
from gfbio_submissions.resolve.models import Accession
from .email_curators import send_checklist_mapping_error_notification
from ..configuration.settings import (
    CHECKLIST_ACCESSION_MAPPING,
    DEFAULT_ENA_BROKER_NAME,
    DEFAULT_ENA_CENTER_NAME,
    STATIC_SAMPLE_SCHEMA_LOCATION,
    SUBMISSION_DELAY,
)
from ..models.auditable_text_data import AuditableTextData
from ..models.ena_report import EnaReport
from ..models.persistent_identifier import PersistentIdentifier
from ..models.submission import Submission
from ..utils.csv import find_correct_platform_and_model

logger = logging.getLogger(__name__)
dicttoxml.LOG.setLevel(logging.ERROR)

locus_attribute_mappings = {
    "16s rrna": "16S rRNA",
    "18s rrna": "18S rRNA",
    "28s rrna": "28S rRNA",
    "rbcl": "RBCL",
    "matk": "matK",
    "cox1": "COX1",
    "its1-5.8s-its2": "ITS1-5.8S-ITS2",
    "exome": "exome",
    "16s": "16S rRNA",
    "18s": "18S rRNA",
    "28s": "28S rRNA",
}


#  ENALIZER  xml for ena -------------------------------------------------------
class Enalizer(object):
    def __init__(self, submission, alias_postfix=uuid.uuid4()):
        study, samples, experiments, runs = submission.get_json_with_aliases(alias_postfix=alias_postfix)
        self.study_alias = study.pop("study_alias", "")
        self.study = study
        self.sample = samples
        self.samples_key = "samples"
        self.experiment = experiments
        self.experiments_key = "experiments"
        self.experiments_contain_files = False
        self.run = runs
        self.runs_key = "runs"
        self.embargo = submission.embargo
        if submission.center_name is not None and submission.center_name.center_name != "":
            self.center_name = submission.center_name.center_name
        else:
            self.center_name = DEFAULT_ENA_CENTER_NAME
        self.submission_id = submission.id
        self.submission = submission
        self.samples_with_checklist_errors = []

    def _upper_case_dictionary(self, dictionary):
        if isinstance(dictionary, list):
            return [self._upper_case_dictionary(v) for v in dictionary]
        elif isinstance(dictionary, dict):
            return dict((k.upper(), self._upper_case_dictionary(v)) for k, v in dictionary.items())
        else:
            return dictionary

    def _upper_case_ordered_dictionary(self, dictionary):
        if isinstance(dictionary, list):
            return [self._upper_case_ordered_dictionary(v) for v in dictionary]
        elif isinstance(dictionary, OrderedDict) or isinstance(dictionary, dict):
            return OrderedDict((k.upper(), self._upper_case_ordered_dictionary(v)) for k, v in dictionary.items())
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
                value1 = {".".join([key, key_in_value]): value[key_in_value] for key_in_value in value}
                self.flatten_dict(value1, result)
            elif isinstance(value, (list, tuple)):
                for indexB, element in enumerate(value):
                    if isinstance(element, dict):
                        value1 = {}
                        index = 0
                        for key_in_element in element:
                            # newkey = ".".join([key, keyIn])
                            value1[".".join([key, key_in_element])] = value[indexB][key_in_element]
                            index += 1
                        for keyA in value1:
                            # self.flatten_dict(value1, result)
                            self.flatten_dict(keyA, result)
                    else:
                        result["{}.{}".format(key, indexB)] = element
            else:
                result[key] = value
        return result

    def set_submission_state_to_error(self):
        try:
            submission = Submission.objects.get(pk=self.submission_id)
            submission.status = Submission.ERROR
            submission.save()
        except Submission.DoesNotExist:
            logger.warning(
                "ena.py | Enalizer | set_submission_state_to_error | Submission with pk {} does not exist".format(
                    self.submission_id))

    def create_submission_xml(self, action="VALIDATE", hold_date=None, outgoing_request_id="add_outgoing_id"):
        logger.info(msg="Enalizer create_submission_xml. action={} hold_date={}".format(action, hold_date))
        actions = "<ACTION><{}/></ACTION>".format(action)
        if not hold_date:
            # today + 1 year
            hold_date = "{0}".format((datetime.date.today() + datetime.timedelta(days=365)).isoformat())
        else:
            hold_date = hold_date.isoformat()
        return textwrap.dedent(
            "<?xml version = '1.0' encoding = 'UTF-8'?>"
            '<SUBMISSION alias="{2}" center_name="{3}" broker_name="{4}">'
            "<ACTIONS>"
            "{0}"
            '<ACTION><HOLD HoldUntilDate="{1}"/></ACTION>'
            "</ACTIONS>"
            "</SUBMISSION>".format(
                actions,
                hold_date,
                outgoing_request_id,
                self.center_name,
                DEFAULT_ENA_BROKER_NAME,
            )
        )

    def create_study_xml(self):
        study_dict = OrderedDict([("study", OrderedDict())])
        study_attributes = self.study.pop("study_attributes", [])

        # TODO: this migth become a class member, refer original enalizer
        # study_alias = self.study.pop('study_alias', '')
        # self.center_name = self.study.pop('center_name', ENA_CENTER_NAME)

        # site_object_id = self.study.pop('site_object_id', '')

        study_dict["study"]["descriptor"] = self.study
        if len(study_attributes):
            study_dict["study"]["study_attributes"] = study_attributes

        study_dict["study"]["descriptor"]["study_type"] = "Other"

        study_dict = self._capitalize_dictionary(study_dict)

        study_xml = dicttoxml.dicttoxml(study_dict, custom_root="STUDY_SET", attr_type=False)

        # TODO: candidate for refactoring to generic method, params could be find_element and replacement
        root = ET.fromstring(study_xml)
        for item in root.findall("./STUDY/STUDY_ATTRIBUTES/item"):
            item.tag = "STUDY_ATTRIBUTE"

        study_type = root.find("./STUDY/DESCRIPTOR/STUDY_TYPE")
        study_type.set("existing_study_type", study_type.text)
        study_type.text = ""

        study = root.find("./STUDY")
        study.set("alias", self.study_alias)
        study.set("center_name", self.center_name)
        study.set("broker_name", DEFAULT_ENA_BROKER_NAME)

        return ET.tostring(root, encoding="utf-8", method="xml")

    def append_environmental_package_attributes(self, sample_attributes, sample_title, sample_alias):
        checklist_mappings_keys = CHECKLIST_ACCESSION_MAPPING.keys()
        checklist_mappings_keys = [s.lower() for s in checklist_mappings_keys]
        # only add add_checklist and renamed_additional_checklist for first occurence of environmental package
        add_checklist = ""
        renamed_additional_checklist_tag = "NO_VAL"
        renamed_additional_checklist_value = ""
        for s in sample_attributes:
            if s.get("tag", "no_tag_found") == "environmental package":
                renamed_additional_checklist_tag = "{0} {1}".format(s.get("value", "NO_VAL"), "environmental package")
                renamed_additional_checklist_value = s.get("value", "NO_VAL")
                break
        for s in sample_attributes:
            value = s.get("value", "no_value_found").strip().lower()
            tag = s.get("tag", "no_tag_found")
            if (
                tag == "environmental package"
                and value in checklist_mappings_keys
            ):
                add_checklist = CHECKLIST_ACCESSION_MAPPING.get(s.get("value", ""), "")
                break
            elif (
                tag == "environmental package"
                and value not in checklist_mappings_keys
            ):
                self.samples_with_checklist_errors.append((sample_title, sample_alias, value))

        if "NO_VAL" not in renamed_additional_checklist_tag:
            sample_attributes.append(
                OrderedDict(
                    [
                        ("tag", renamed_additional_checklist_tag),
                        ("value", renamed_additional_checklist_value),
                    ]
                )
            )
        if len(add_checklist):
            sample_attributes.append(
                # {'tag': 'ENA-CHECKLIST', 'value': add_checklist}
                OrderedDict([("tag", "ENA-CHECKLIST"), ("value", add_checklist)])
            )

    def convert_sample(self, s, sample_index, sample_descriptor_platform_mappings):
        sample_attributes = s.pop("sample_attributes", [])
        # lower case required columns
        lower_case_cols = ["investigation type", "library_layout"]
        for sample in sample_attributes:
            if sample["tag"] in lower_case_cols:
                sample["value"] = sample["value"].lower()
        sample_attributes.append(OrderedDict([("tag", "submitted to insdc"), ("value", "true")]))
        sample_alias = s.get("sample_alias", "NO_SAMPLE_ALIAS")
        if sample_alias in sample_descriptor_platform_mappings.keys():
            sample_attributes.append(
                OrderedDict(
                    [
                        ("tag", "sequencing method"),
                        (
                            "value",
                            sample_descriptor_platform_mappings.get(sample_alias),
                        ),
                    ]
                )
            )
        res = OrderedDict()
        res["title"] = s.pop("sample_title", "")
        res["sample_alias"] = "sample_alias_{0}".format(sample_index)

        sname = OrderedDict()
        self.add_if_existing(sname, "taxon_id", s)
        self.add_if_existing(sname, "scientific_name", s)
        self.add_if_existing(sname, "common_name", s)
        self.add_if_existing(sname, "anonymized_name", s)
        self.add_if_existing(sname, "individual_name", s)
        res["sample_name"] = sname

        res["description"] = s.pop("sample_description", "")
        res.update(s)
        if len(sample_attributes):
            self.append_environmental_package_attributes(sample_attributes, sample_title=res["title"],
                                                         sample_alias=res["sample_alias"])
            res["sample_attributes"] = [
                OrderedDict([(k.upper(), v) for k, v in s.items()])
                for s in sample_attributes
            ]
        return res

    def add_if_existing(self, ordered_dict, key, data_dict):
        if data_dict.get(key, None) is not None:
            ordered_dict[key] = data_dict.pop(key, None)

    def create_sample_xml(self, sample_descriptor_platform_mappings):
        for s in self.sample:
            gcdjson = s.pop("gcdjson", {})
            flattened_gcdj = self.flatten_dict(gcdjson)
            if "sample_attributes" in s.keys():
                s.get("sample_attributes", []).extend(
                    [
                        # {'tag': k, 'value': v}
                        OrderedDict(("tag", k), ("value", v))
                        for k, v in flattened_gcdj.items()
                    ]
                )
            else:
                s["sample_attributes"] = [OrderedDict(("tag", k), ("value", v)) for k, v in flattened_gcdj.items()]
            s.pop("gcdjson_key", "")

        # TODO / FIXME: how deal with sample_alias ?
        samples = []
        index_for_sample = 0
        for s in self.sample:
            samples.append(self.convert_sample(s, index_for_sample, sample_descriptor_platform_mappings))
            index_for_sample += 1

        samples = self._capitalize_ordered_dictionary(samples)
        sample_xml = dicttoxml.dicttoxml(samples, custom_root="SAMPLE_SET", attr_type=False)
        root = ET.fromstring(sample_xml)
        for item in root.findall("./item"):
            item.tag = "SAMPLE"
            alias = item.find("SAMPLE_ALIAS")
            item.set("alias", alias.text)
            item.remove(alias)
            # TODO: this might be a dedicated property ....
            item.set("center_name", self.center_name)
            item.set("broker_name", DEFAULT_ENA_BROKER_NAME)
        for item in root.findall("./SAMPLE/"):
            if item.tag == "SAMPLE_ATTRIBUTES":
                for atr in item.findall("./item"):
                    atr.tag = "SAMPLE_ATTRIBUTE"
        # remove xml encoding for temperature unit
        bytestring = ET.tostring(root, encoding="utf-8", method="xml")
        xmlstring = bytestring.decode("utf-8").replace("&amp;#186;C", "&#186;C")
        return xmlstring.encode("utf-8")

    @staticmethod
    def create_subelement(root, element_name, data_dict):
        if element_name in data_dict.keys():
            sub = SubElement(root, "{}".format(element_name).upper())
            sub.text = data_dict.get(element_name, "")

    def create_subelements(self, root, element_names, data_dict):
        [self.create_subelement(root, name, data_dict) for name in element_names]

    @staticmethod
    def create_subelement_with_attribute(root, element_name, attrib_name, data_dict, data_key=None):
        if data_key:
            return SubElement(
                root,
                element_name.upper(),
                {attrib_name.lower(): data_dict.get(data_key, "")},
            )
        return SubElement(
            root,
            element_name.upper(),
            {attrib_name.lower(): data_dict.get(element_name, "")},
        )

    @staticmethod
    def create_library_layout(root, data_dict):
        if "library_layout" in data_dict.keys():
            library_layout = SubElement(root, "LIBRARY_LAYOUT")
            layout = data_dict.get("library_layout", {}).get("layout_type", "").upper()
            layout_element = SubElement(library_layout, layout)
            if layout == "PAIRED":
                layout_element.set(
                    "NOMINAL_LENGTH",
                    str(data_dict.get("library_layout", {}).get("nominal_length", -1)),
                )

    def create_targeted_loci(self, root, data_dict):
        for locus_data in data_dict:
            description = locus_data.get("description", "")
            if len(description):
                locus = SubElement(
                    root,
                    "LOCUS",
                    {
                        "locus_name": locus_data.get("locus_name", ""),
                        "description": locus_data.get("description", ""),
                    },
                )
            else:
                locus = SubElement(
                    root,
                    "LOCUS",
                    {
                        "locus_name": locus_data.get("locus_name", ""),
                    },
                )
            probe_set_data = locus_data.get("probe_set", {})
            if probe_set_data != {}:
                probe_set = SubElement(locus, "PROBE_SET")
                self.create_subelement(probe_set, "db", probe_set_data)
                self.create_subelement(probe_set, "id", probe_set_data)
                self.create_subelement(probe_set, "label", probe_set_data)

    def create_targeted_loci_without_probe_set(self, root, data_dict):
        if "targeted_loci" in data_dict.keys():
            description = data_dict.get("targeted_loci", {}).get("description", "")
            if len(description):
                odict = OrderedDict(
                    [
                        (
                            "locus_name",
                            data_dict.get("targeted_loci", {}).get("locus_name", ""),
                        ),
                        (
                            "description",
                            data_dict.get("targeted_loci", {}).get("description", ""),
                        ),
                    ]
                )
                locus = SubElement(root, "LOCUS", odict)
            else:
                locus = SubElement(
                    root,
                    "LOCUS",
                    {
                        "locus_name": data_dict.get("targeted_loci", {}).get("locus_name", ""),
                    },
                )

    # FIXME: this uppper() and lower() stuff has to be simplified, also in json-schema !
    @staticmethod
    def create_platform(root, platform_value):
        # TODO: check and discuss if this new platform is ok -> one string with Instrument + model
        # TODO: assuming platform <space> model <space> model-detail
        platform = find_correct_platform_and_model(platform_value).split()
        instrument = SubElement(root, platform[0].upper())
        instrument_model = SubElement(instrument, "INSTRUMENT_MODEL")
        instrument_model.text = " ".join(platform[1:])

    def create_attributes(self, root, data_dict, attribute_prefix=""):
        for attribute in data_dict:
            experiment_attribute = SubElement(root, "{}_ATTRIBUTE".format(attribute_prefix).upper())
            self.create_subelement(experiment_attribute, "tag", attribute)
            if "value" in attribute.keys():
                self.create_subelement(experiment_attribute, "value", attribute)
            if "units" in attribute.keys():
                self.create_subelement(experiment_attribute, "units", attribute)

    def translate_target_gene_insensitiv(self, sample_descriptor, targeted_loci_dict):
        for s in self.sample:
            sample_alias = s.get("sample_alias", "NO_SAMPLE_ALIAS")
            if sample_alias in sample_descriptor:
                if "sample_attributes" in s.keys():
                    for m in range(len(s.get("sample_attributes", []))):
                        if str(s.get("sample_attributes", [])[m]["tag"]).lower() == "target gene":
                            gene_loc = s.get("sample_attributes", [])[m]["value"]
                            if len(gene_loc):
                                mapped_locus = locus_attribute_mappings.get(gene_loc.lower())
                                if mapped_locus is not None:
                                    targeted_loci_dict["targeted_loci"] = dict(
                                        targeted_loci_dict, **OrderedDict([("locus_name", mapped_locus)])
                                    )
                                else:
                                    targeted_loci_dict["targeted_loci"] = dict(
                                        targeted_loci_dict,
                                        **OrderedDict(
                                            [
                                                ("locus_name", "other"),
                                                ("description", str(gene_loc)),
                                            ]
                                        ),
                                    )
                            del s.get("sample_attributes", [])[m]
                            break
                break
        return targeted_loci_dict

    def create_single_experiment_xml(self, experiment_set, data, sample_descriptor_platform_mappings):
        experiment = self.create_subelement_with_attribute(
            experiment_set, "EXPERIMENT", "alias", data, "experiment_alias"
        )
        experiment.set("broker_name", DEFAULT_ENA_BROKER_NAME)
        experiment.set("center_name", self.center_name)
        self.create_subelement(experiment, "title", data)
        self.create_subelement_with_attribute(experiment, "study_ref", "refname", data)
        design_data = data.get("design", {})
        sample_decriptor = design_data.get("sample_descriptor")

        design = SubElement(experiment, "DESIGN")
        if "design_description" in design_data.keys():
            self.create_subelement(design, "design_description", design_data)
        else:
            SubElement(design, "DESIGN_DESCRIPTION")
        self.create_subelement_with_attribute(design, "sample_descriptor", "refname", design_data)

        library_descriptor_data = design_data.get("library_descriptor", {})
        library_descriptor = SubElement(design, "LIBRARY_DESCRIPTOR")
        self.create_subelements(
            library_descriptor,
            ["library_name", "library_strategy", "library_source", "library_selection"],
            library_descriptor_data,
        )

        self.create_library_layout(library_descriptor, library_descriptor_data)

        targeted_loci_dict = OrderedDict()  # {}
        targeted_loci_dict = self.translate_target_gene_insensitiv(sample_decriptor, targeted_loci_dict)

        if len(targeted_loci_dict) > 0:
            targeted_loci = SubElement(library_descriptor, "TARGETED_LOCI")
            self.create_targeted_loci_without_probe_set(targeted_loci, targeted_loci_dict)

        self.create_subelement(library_descriptor, "pooling_strategy", library_descriptor_data)
        self.create_subelement(library_descriptor, "library_construction_protocol", library_descriptor_data)

        platform_data = data.get("platform", {})
        if len(platform_data) > 0:
            sample_descriptor_platform_mappings[sample_decriptor] = platform_data
            platform = SubElement(experiment, "PLATFORM")
            self.create_platform(platform, platform_data)

        experiment_attributes_data = data.get("experiment_attributes", {})
        if len(experiment_attributes_data) > 0:
            experiment_attributes = SubElement(experiment, "EXPERIMENT_ATTRIBUTES")
            self.create_attributes(experiment_attributes, experiment_attributes_data, "experiment")

        experiment_files = data.get("files", {})
        if len(experiment_files):
            self.experiments_contain_files = True
        # return sample_descriptor_platform_mapping

    def create_experiment_xml(self):
        experiment_set = Element("EXPERIMENT_SET")
        sample_descriptor_platform_mappings = {}
        for experiment in self.experiment:
            self.create_single_experiment_xml(experiment_set, experiment, sample_descriptor_platform_mappings)
        return sample_descriptor_platform_mappings, ET.tostring(experiment_set, encoding="utf-8", method="xml")

    @staticmethod
    def calculate_checksum_locally(checksum_method, submission_cloud_upload):
        file_path = f"{settings.S3FS_MOUNT_POINT}{os.path.sep}{submission_cloud_upload.file_upload.file_key}"
        checksum = ""
        if os.path.exists(file_path):
            with open(file_path, 'rb') as f:
                f_read = f.read()
                if checksum_method == "md5":
                    checksum = hashlib.md5(f_read).hexdigest()
                elif checksum_method == "sha256":
                    checksum = hashlib.sha256(f_read).hexdigest()
        return checksum

    def process_filename_attribute(self, file, file_element, broker_submission_id):
        filename = file["filename"]
        file_element.set("filename", f"{broker_submission_id}/{filename}")
        valid_checksum_methods = ["md5", "sha256"]
        checksum_method = file.get("checksum_method", "invalid").lower()
        checksum = ""
        if checksum_method in valid_checksum_methods:
            submission_cloud_upload = self.submission.submissioncloudupload_set.filter(
                file_upload__original_filename=filename).first()
            if submission_cloud_upload:
                if checksum_method == "md5" and submission_cloud_upload.file_upload.md5 is not None and len(
                    submission_cloud_upload.file_upload.md5) > 0:
                    checksum = submission_cloud_upload.file_upload.md5
                elif checksum_method == "sha256" and submission_cloud_upload.file_upload.sha256 is not None and len(
                    submission_cloud_upload.file_upload.sha256) > 0:
                    checksum = submission_cloud_upload.file_upload.sha256
                else:
                    checksum = self.calculate_checksum_locally(checksum_method, submission_cloud_upload)
        file["checksum"] = checksum
        file_element.set("checksum", checksum)
        file["checksum_method"] = checksum_method
        file_element.set("checksum_method", checksum_method)

    def create_run_data_block(self, file_attributes, run, run_root, broker_submission_id=None):
        if "data_block" in run.keys():
            data_block = SubElement(run_root, "DATA_BLOCK")
            files = SubElement(data_block, "FILES")
            for file in run.get("data_block", {}).get("files", []):
                file_element = SubElement(files, "FILE")
                for attrib in file_attributes:
                    if attrib == "filename" and broker_submission_id:
                        self.process_filename_attribute(file, file_element, broker_submission_id)
                    else:
                        file_element.set(attrib, file.get(attrib, "no_attribute_found"))
            return data_block
        else:
            return None

    def get_files_from_experiment(self):
        return [e["files"] for e in self.experiment if "files" in e]

    def create_run_xml(self, broker_submission_id=None):
        run_set = Element("RUN_SET")

        # without checksum attributes
        file_attributes = [
            "filename",
            "filetype",
            # TODO: DASS-2607
            "checksum_method",
            "checksum"
        ]
        for r in self.run:
            # center=wenn gfbio center vom user | broker_name="Wir als GFBio" siehe brokeraccount   | (optional) run_center=wer hat sequenziert, registriert bei ena ?
            run = self.create_subelement_with_attribute(run_set, "RUN", "alias", r, "run_alias")
            run.set("center_name", self.center_name)
            run.set("broker_name", DEFAULT_ENA_BROKER_NAME)
            experiment_ref = self.create_subelement_with_attribute(run, "experiment_ref", "refname", r)
            data_block = self.create_run_data_block(file_attributes, r, run, broker_submission_id)

            run_attributes_data = r.get("run_attributes", [])
            if len(run_attributes_data) > 0:
                run_attributes = SubElement(run, "RUN_ATTRIBUTES")
                self.create_attributes(run_attributes, run_attributes_data, "run")
        return ET.tostring(run_set, encoding="utf-8", method="xml")

    def prepare_submission_data(self, broker_submission_id=None):
        logger.info(msg="Enalizer prepare_submission_data. broker_submission_id=".format(broker_submission_id))
        (
            sample_descriptor_platform_mappings,
            experiment_xml,
        ) = self.create_experiment_xml()
        sample_xml = self.create_sample_xml(sample_descriptor_platform_mappings=sample_descriptor_platform_mappings)

        if len(self.samples_with_checklist_errors):
            self.set_submission_state_to_error()
            # TODO: email curators about sample errors
            send_checklist_mapping_error_notification(self.submission_id, self.samples_with_checklist_errors)

        if len(self.run):
            return {
                "STUDY": ("study.xml", smart_str(self.create_study_xml())),
                "SAMPLE": ("sample.xml", smart_str(sample_xml)),
                "EXPERIMENT": ("experiment.xml", smart_str(experiment_xml)),
                "RUN": (
                    "run.xml",
                    smart_str(self.create_run_xml(broker_submission_id=broker_submission_id)),
                ),
            }
        else:
            return {
                "STUDY": ("study.xml", smart_str(self.create_study_xml())),
                "SAMPLE": ("sample.xml", smart_str(sample_xml)),
                "EXPERIMENT": ("experiment.xml", smart_str(experiment_xml)),
            }

    def prepare_submission_xml_for_sending(self, action="VALIDATE", outgoing_request_id=None):
        return (
            "submission.xml",
            smart_str(
                self.create_submission_xml(
                    action=action,
                    hold_date=self.embargo,
                    outgoing_request_id=outgoing_request_id,
                )
            ),
        )


# END --- ENALIZER  xml for ena -----------------------------------------------


def prepare_study_data_only(submission):
    enalizer = Enalizer(submission=submission, alias_postfix=submission.broker_submission_id)
    return ("study.xml", smart_str(enalizer.create_study_xml()))


def store_single_data_item_as_auditable_text_data(submission, data):
    file_name, file_content = data
    with transaction.atomic():
        text_data = submission.auditabletextdata_set.create(name=file_name, text_data=file_content)
        return text_data


def prepare_ena_data(submission):
    # outgoing_request_id = uuid.uuid4()
    enalizer = Enalizer(submission=submission, alias_postfix=submission.broker_submission_id)
    return enalizer.prepare_submission_data(broker_submission_id=submission.broker_submission_id)


def store_ena_data_as_auditable_text_data(submission, data):
    for d in data:
        filename, filecontent = data[d]
        logger.info(
            msg="store_ena_data_as_auditable_text_data create "
                "AuditableTextData | submission_pk={0} filename={1}"
                "".format(submission.pk, filename)
        )
        with transaction.atomic():
            AuditableTextData.objects.create(name=filename, submission=submission, text_data=filecontent)


# https://github.com/enasequence/schema/blob/master/src/main/resources/uk/ac/ebi/ena/sra/schema/SRA.study.xsd
def send_submission_to_ena(submission, archive_access, ena_submission_data, action="ADD"):
    logger.info(
        msg="send_submission_to_ena submission_pk={} archive_access_pk={} method=POST".format(
            submission.pk, archive_access.pk
        )
    )
    auth_params = {
        "auth": archive_access.authentication_string,
    }

    outgoing_request_id = uuid.uuid4()
    # TODO: this needs refactoring, maybe static method for submission.xml thus the DB is not hit by constructor
    enalizer = Enalizer(submission=submission, alias_postfix=submission.broker_submission_id)
    ena_submission_data["SUBMISSION"] = enalizer.prepare_submission_xml_for_sending(
        action=action,
        outgoing_request_id=outgoing_request_id,
    )

    return logged_requests.post(
        archive_access.url,
        submission=submission,
        request_id=outgoing_request_id,
        return_log_id=True,
        params=auth_params,
        files=ena_submission_data,
        verify=False,
    )


def register_study_at_ena(submission, study_text_data):
    site_config = submission.user.site_configuration
    if site_config is None:
        logger.warning(
            "ena.py | register_study_at_ena | no site_configuration found | submission_id={0}".format(
                submission.broker_submission_id
            )
        )
        return None, None

    request_data = {
        "STUDY": (
            "{0}".format(smart_str(study_text_data.name)),
            "{0}".format(smart_str(study_text_data.text_data)),
        )
    }

    enalizer = Enalizer(submission=submission, alias_postfix=submission.broker_submission_id)
    outgoing_request_id = uuid4()
    request_data["SUBMISSION"] = enalizer.prepare_submission_xml_for_sending(
        action="ADD",
        outgoing_request_id=outgoing_request_id,
    )
    auth_params = {
        "auth": site_config.ena_server.authentication_string,
    }

    return logged_requests.post(
        site_config.ena_server.url,
        submission=submission,
        return_log_id=True,
        params=auth_params,
        files=request_data,
        verify=False,
        request_id=outgoing_request_id,
    )


def release_study_on_ena(submission):
    study_primary_accession = (
        submission.brokerobject_set.filter(type="study")
        .first()
        .persistentidentifier_set.filter(pid_type="PRJ")
        .first()
    )
    site_config = submission.user.site_configuration
    if site_config is None:
        logger.warning(
            "ena.py | release_study_on_ena | no site_configuration found | submission_id={0}".format(
                submission.broker_submission_id
            )
        )
        return None
    if study_primary_accession:
        logger.info(
            "ena.py | release_study_on_ena | primary accession no "
            "found for study | accession_no={0} | submission_id={1}".format(
                study_primary_accession, submission.broker_submission_id
            )
        )

        current_datetime = datetime.datetime.now(timezone("UTC")).isoformat()

        submission_xml = textwrap.dedent(
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<SUBMISSION_SET xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
            ' xsi:noNamespaceSchemaLocation="ftp://ftp.sra.ebi.ac.uk/meta/xsd/sra_1_5/SRA.submission.xsd">'
            "<SUBMISSION"
            ' alias="gfbio:release:{broker_submission_id}:{time_stamp}"'
            ' center_name="GFBIO" broker_name="GFBIO">'
            "<ACTIONS>"
            "<ACTION>"
            '<RELEASE target="{accession_no}"/>'
            "</ACTION>"
            "</ACTIONS>"
            "</SUBMISSION>"
            "</SUBMISSION_SET>".format(
                broker_submission_id=submission.broker_submission_id,
                time_stamp=current_datetime,
                accession_no=study_primary_accession,
            )
        )

        auth_params = {
            "auth": site_config.ena_server.authentication_string,
        }
        data = {"SUBMISSION": ("submission.xml", submission_xml)}

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
            "ena.py | release_study_on_ena | no primary accession no "
            "found for study | submission_id={0}".format(submission.broker_submission_id)
        )
        return None


def parse_ena_submission_response(response_content=""):
    res = {}

    root = ET.fromstring(response_content)
    res["success"] = root.attrib.get("success", "false")
    # res['receipt_date'] = parse(root.attrib.get('receiptDate', '0'))
    res["receipt_date"] = root.attrib.get("receiptDate", "0")
    res["errors"] = [e.text.strip() for e in root.findall(".//ERROR")]
    res["infos"] = [i.text.strip().replace("\n", "") for i in root.findall(".//INFO")]

    xml_study = root.findall(".//STUDY")
    if len(xml_study):
        for x in xml_study:
            attr = x.attrib
            attr["ext_ids"] = [e.attrib for e in x.findall("./EXT_ID")]

        res["study"] = xml_study.pop().attrib

    xml_experiments = root.findall(".//EXPERIMENT")
    if len(xml_experiments):
        res["experiments"] = [x.attrib for x in xml_experiments]

    xml_runs = root.findall(".//RUN")
    if len(xml_runs):
        res["runs"] = [x.attrib for x in xml_runs]

    xml_samples = root.findall(".//SAMPLE")
    if len(xml_samples):
        res["samples"] = []
        for x in xml_samples:
            attr = x.attrib
            attr["ext_ids"] = [e.attrib for e in x.findall("./EXT_ID")]
            res["samples"].append(attr)

    return res


def validate_sample_data(json_data):
    try:
        with open(os.path.join(settings.STATIC_ROOT, STATIC_SAMPLE_SCHEMA_LOCATION)) as schema_file:
            schema = json.load(schema_file)
    except IOError as e:
        return e
    validator = Draft3Validator(schema)
    is_valid = validator.is_valid(json_data)
    if not is_valid:
        return is_valid, [
            "Error(s) regarding field '{0}' because: {1}".format(
                error.relative_path.pop(), error.message.replace("u'", "'")
            )
            if len(error.relative_path) > 0
            else "{0}".format(error.message.replace("u'", "'"))
            for error in validator.iter_errors(json_data)
        ]
    else:
        return True, []


def download_submitted_run_files_to_string_io(site_config, decompressed_io):
    ftp_rc = site_config.ena_ftp
    transmission_report = []
    ftp = FTP(ftp_rc.url)
    transmission_report.append(ftp.login(user=ftp_rc.username, passwd=ftp_rc.password))
    transmission_report.append(ftp.cwd("report"))
    transmission_report.append(ftp.retrlines("LIST"))

    compressed_file = io.StringIO()

    transmission_report.append(ftp.retrbinary("RETR submitted_run_files.txt.gz", compressed_file.write))
    transmission_report.append(ftp.quit())

    compressed_file.seek(0)
    decompressed_io.write(gzip.GzipFile(fileobj=compressed_file, mode="rb").read())
    compressed_file.close()
    return transmission_report


# https://www.ebi.ac.uk/ena/submit/report/swagger-ui.html
def fetch_ena_report(site_configuration, report_type):
    url = "{0}{1}?format=json".format(site_configuration.ena_report_server.url, report_type)
    return logged_requests.get(
        url=url,
        return_log_id=True,
        auth=(
            site_configuration.ena_report_server.username,
            site_configuration.ena_report_server.password,
        ),
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
                        msg="update_embargo_date_in_submissions | "
                            "ENA hold date does not match Submission embargo | "
                            "submission date: {} | "
                            "submission id: {} | "
                            "persistent_identifier_date: {} | "
                            "persistent_identifier_id: {}"
                            "".format(
                            submission.embargo,
                            submission.broker_submission_id,
                            study.hold_date,
                            study.pid,
                        )
                    )


def update_resolver_accessions():
    for report_type in EnaReport.REPORT_TYPES:
        report_key, report_name = report_type
        reports = EnaReport.objects.filter(report_type=report_key)
        if len(reports) == 1:
            logger.info("ena.py | update_resolver_accessions " "| process report of type={0}".format(report_name))
            for report in reports.first().report_data:
                report_dict = report.get("report", {})
                status = report_dict.get("releaseStatus")
                Accession.objects.create_or_delete(identifier=report_dict.get("id"), release_status=status)
                Accession.objects.create_or_delete(identifier=report_dict.get("secondaryId"), release_status=status)
            return True
        else:
            logger.warning(
                "ena.py | update_resolver_accessions "
                "| found {0} occurences for report of type={1} found".format(len(reports), report_name)
            )
            return False


def update_persistent_identifier_report_status():
    for report_type in EnaReport.REPORT_TYPES:
        report_key, report_name = report_type
        reports = EnaReport.objects.filter(report_type=report_key)
        if len(reports) > 0:
            logger.info(
                "ena.py | update_persistent_identifier_report_status "
                "| process report of type={0}".format(report_name)
            )
            for report in reports.first().report_data:
                report_dict = report.get("report", {})
                pri_id = report_dict.get("id")
                sec_id = report_dict.get("secondaryId")
                status = report_dict.get("releaseStatus")
                hold_date = report_dict.get("holdDate")
                hold_date_time = datetime.datetime.now()
                if hold_date:
                    # holdDate from ENA report 2022-03-10T17:17:04
                    # https://www.journaldev.com/23365/python-string-to-datetime-strptime
                    ena_hold_date_format = "%Y-%m-%dT%X"
                    hold_date_time = datetime.datetime.strptime(hold_date, ena_hold_date_format).date()
                ids_to_use = []
                if pri_id:
                    ids_to_use.append(pri_id)
                if sec_id:
                    ids_to_use.append(sec_id)

                for vid in ids_to_use:
                    if status and len(PersistentIdentifier.objects.filter(pid=vid)) > 0:
                        pid = PersistentIdentifier.objects.filter(pid=vid, pid_type="PRJ").first()
                        if not pid:
                            logger.info(
                                "ena.py | update_persistent_identifier_report_status "
                                "| PersistentIdentifier {} with type PRJ not found".format(vid)
                            )
                        elif pid.status != "PUBLIC" and status == "PUBLIC":
                            # notify reporter and close the issue
                            submission = pid.broker_object.submissions.first()
                            logger.info(
                                "ena.py | update_persistent_identifier_report_status "
                                "| executing notify_on_embargo_ended_task and jira_transition_issue_task "
                                "| PersistentIdentifier: {} "
                                "| submission: {}".format(vid, submission.broker_submission_id)
                            )

                            from ..configuration.settings import SUBMISSION_DELAY
                            from ..tasks.jira_tasks.jira_transition_issue import jira_transition_issue_task
                            from ..tasks.jira_tasks.notify_on_embargo_ended import notify_on_embargo_ended_task

                            chain = notify_on_embargo_ended_task.s(submission_id=submission.pk).set(
                                countdown=SUBMISSION_DELAY
                            ) | jira_transition_issue_task.s(submission_id=submission.pk).set(
                                ountdown=SUBMISSION_DELAY
                            )
                            chain()

                        date_to_use = None
                        if hold_date:
                            date_to_use = hold_date_time
                        elif pid:
                            date_to_use = pid.hold_date

                        PersistentIdentifier.objects.filter(pid=vid).update(status=status, hold_date=date_to_use)

                        if hold_date:
                            update_embargo_date_in_submissions(
                                hold_date_time,
                                PersistentIdentifier.objects.filter(pid=vid),
                            )
                        if not date_to_use:
                            logger.info(
                                "ena.py | update_persistent_identifier_report_status "
                                "| no date_to_use could be set for pid: {}".format(vid)
                            )
        else:
            logger.warning(
                "ena.py | update_persistent_identifier_report_status "
                "| found {0} occurences for report of type={1} found".format(len(reports), report_name)
            )
            return False
    return True


def execute_update_accession_objects_chain(name_on_error=""):
    from ..tasks.ena_report_tasks.fetch_ena_reports import fetch_ena_reports_task
    from ..tasks.ena_report_tasks.update_persistent_identifier_report_status import (
        update_persistent_identifier_report_status_task,
    )
    from ..tasks.ena_report_tasks.update_resolver_accessions import update_resolver_accessions_task

    (
        fetch_ena_reports_task.s().set(countdown=SUBMISSION_DELAY)
        | update_resolver_accessions_task.s().set(countdown=SUBMISSION_DELAY)
        | update_persistent_identifier_report_status_task.s().set(countdown=SUBMISSION_DELAY)
    )()

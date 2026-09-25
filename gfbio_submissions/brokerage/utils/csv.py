# -*- coding: utf-8 -*-
import _csv
import csv
import json
import logging
import os
from collections import OrderedDict

import dpath
from gfbio_submissions.brokerage.utils.ena_experiment_definitions_utils import find_correct_platform_and_model
from gfbio_submissions.brokerage.utils.submission_file_opener import create_submission_file_opener
from shortid import ShortId

from gfbio_submissions.brokerage.utils.ena_mixs_column_mapping import ENA_HEADER_MAPPING
from gfbio_submissions.brokerage.utils.ena_submittable_data_handlers import SubmittableDataHandler, SubmittableScientificNameHandler, SubmittableTaxIdHandler
from ..configuration.settings import ATAX, ENA, SUBMISSION_UPLOAD_RETRY_DELAY
from ..utils.csv_format import detect_csv_format, open_csv_reader
from ..utils.ena_mandatory_fields import row_has_sample_title_or_set_accession, sample_accession_value
from ..utils.encodings import sniff_encoding

logger = logging.getLogger(__name__)

sample_core_fields = ["sample_alias", "sample_title", "taxon_id"]

experiment_core_fields = [
    "layout_type",
    "nominal_length",  # if paired
    "library_strategy",
    "library_source",
    "library_selection",
    "library_layout",
    "library_descriptor",
    "sample_descriptor",
    "forward_read_file_name",
    "experiment_alias",
    "platform",
    "design",
    # from react app
    "sequencing_platform",
    "forward_read_file_checksum",
    "reverse_read_file_name",
    "reverse_read_file_checksum",
    "checksum_method",
    "sample_accession",
]

core_fields = sample_core_fields + experiment_core_fields

unit_mapping = {
    "Depth": "m",
    "depth": "m",
    "elevation": "m",
    "altitude": "m",
    "geographic location (altitude)": "m",
    "geographic location (depth)": "m",  # TODO: replace with depth DASS-2700
    "geographic location (elevation)": "m",
    "geographic location (latitude)": "DD",
    "geographic location (longitude)": "DD",
    "Salinity": "psu",
    "salinity": "psu",
    "temperature": "&#186;C",
    "total depth of water column": "m",
}

unit_mapping_keys = unit_mapping.keys()

library_selection_mappings = {
    "5-methylcytidine antibody": "5-methylcytidine antibody",
    "cage": "CAGE",
    "cdna": "cDNA",
    "cdna_oligo_dt": "cDNA_oligo_dT",
    "cdna_randompriming": "cDNA_randomPriming",
    "chip": "ChIP",
    "chip-seq": "ChIP-Seq",
    "dnase": "DNase",
    "hmpr": "HMPR",
    "hybrid selection": "Hybrid Selection",
    "inverse rrna": "Inverse rRNA",
    "inverse rrna selection": "Inverse rRNA selection",
    "mbd2 protein methyl-cpg binding domain": "MBD2 protein methyl-CpG binding " "domain",
    "mda": "MDA",
    "mf": "MF",
    "mnase": "MNase",
    "msll": "MSLL",
    "oligo-dt": "Oligo-dT",
    "other": "other",
    "padlock probes capture method": "padlock probes capture method",
    "pcr": "PCR",
    "polya": "PolyA",
    "race": "RACE",
    "random": "RANDOM",
    "random pcr": "RANDOM PCR",
    "reduced representation": "Reduced Representation",
    "repeat fractionation": "repeat fractionation",
    "restriction digest": "Restriction Digest",
    "rt-pcr": "RT-PCR",
    "size fractionation": "size fractionation",
    "unspecified": "unspecified",
}

library_strategy_mappings = {
    "amplicon": "AMPLICON",
    "atac-seq": "ATAC-seq",
    "bisulfite-seq": "Bisulfite-Seq",
    "chia-pet": "ChIA-PET",
    "chip-seq": "ChIP-Seq",
    "chm-seq": "ChM-Seq",
    "clone": "CLONE",
    "cloneend": "CLONEEND",
    "cts": "CTS",
    "dnase-hypersensitivity": "DNase-Hypersensitivity",
    "est": "EST",
    "faire-seq": "FAIRE-seq",
    "finishing": "FINISHING",
    "fl-cdna": "FL-cDNA",
    "gbs": "GBS",
    "hi-c": "Hi-C",
    "mbd-seq": "MBD-Seq",
    "medip-seq": "MeDIP-Seq",
    "mirna-seq": "miRNA-Seq",
    "mnase-seq": "MNase-Seq",
    "mre-seq": "MRE-Seq",
    "ncrna-seq": "ncRNA-Seq",
    "nome-seq": "NOMe-Seq",
    "other": "OTHER",
    "poolclone": "POOLCLONE",
    "rad-seq": "RAD-Seq",
    "ribo-seq": "Ribo-Seq",
    "rip-seq": "RIP-Seq",
    "rna-seq": "RNA-Seq",
    "selex": "SELEX",
    "snrna-seq": "snRNA-seq",
    "ssrna-seq": "ssRNA-seq",
    "synthetic-long-read": "Synthetic-Long-Read",
    "targeted-capture": "Targeted-Capture",
    "tethered chromatin conformation capture": "Tethered Chromatin Conformation " "Capture",
    "tn-seq": "Tn-Seq",
    "validation": "VALIDATION",
    "wcs": "WCS",
    "wga": "WGA",
    "wgs": "WGS",
    "wxs": "WXS",
}

platform_mappings = {
    "454 gs": "454 GS",
    "454 gs 20": "454 GS 20",
    "454 gs flx": "454 GS FLX",
    "454 gs flx titanium": "454 GS FLX Titanium",
    "454 gs flx+": "454 GS FLX+",
    "454 gs junior": "454 GS Junior",
    "ab 310 genetic analyzer": "AB 310 Genetic Analyzer",
    "ab 3130 genetic analyzer": "AB 3130 Genetic Analyzer",
    "ab 3130xl genetic analyzer": "AB 3130xL Genetic Analyzer",
    "ab 3500 genetic analyzer": "AB 3500 Genetic Analyzer",
    "ab 3500xl genetic analyzer": "AB 3500xL Genetic Analyzer",
    "ab 3730 genetic analyzer": "AB 3730 Genetic Analyzer",
    "ab 3730xl genetic analyzer": "AB 3730xL Genetic Analyzer",
    "ab 5500 genetic analyzer": "AB 5500 Genetic Analyzer",
    "ab 5500xl genetic analyzer": "AB 5500xl Genetic Analyzer",
    "ab 5500xl-w genetic analysis system": "AB 5500xl-W Genetic Analysis System",
    "ab solid 3 plus system": "AB SOLiD 3 Plus System",
    "ab solid 4 system": "AB SOLiD 4 System",
    "ab solid 4hq system": "AB SOLiD 4hq System",
    "ab solid pi system": "AB SOLiD PI System",
    "ab solid system": "AB SOLiD System",
    "ab solid system 2.0": "AB SOLiD System 2.0",
    "ab solid system 3.0": "AB SOLiD System 3.0",
    "bgiseq-50": "BGISEQ-50",
    "bgiseq-500": "BGISEQ-500",
    "complete genomics": "Complete Genomics",
    "dnbseq-g400": "DNBSEQ-G400",
    "dnbseq-g400 fast": "DNBSEQ-G400 FAST",
    "dnbseq-g50": "DNBSEQ-G50",
    "dnbseq-t7": "DNBSEQ-T7",
    "element aviti": "Element AVITI",
    "fastaseq 300": "FASTASeq 300",
    "genapsys sequencer": "Genapsys Sequencer",
    "genius": "GENIUS",
    "genocare 1600": "GenoCare 1600",
    "genolab m": "GenoLab M",
    "gridion": "GridION",
    "gs111": "GS111",
    "helicos heliscope": "Helicos HeliScope",
    "hiseq x five": "HiSeq X Five",
    "hiseq x ten": "HiSeq X Ten",
    "illumina genome analyzer": "Illumina Genome Analyzer",
    "illumina genome analyzer ii": "Illumina Genome Analyzer II",
    "illumina genome analyzer iix": "Illumina Genome Analyzer IIx",
    "illumina hiscansq": "Illumina HiScanSQ",
    "illumina hiseq 1000": "Illumina HiSeq 1000",
    "illumina hiseq 1500": "Illumina HiSeq 1500",
    "illumina hiseq 2000": "Illumina HiSeq 2000",
    "illumina hiseq 2500": "Illumina HiSeq 2500",
    "illumina hiseq 3000": "Illumina HiSeq 3000",
    "illumina hiseq 4000": "Illumina HiSeq 4000",
    "illumina hiseq x": "Illumina HiSeq X",
    "illumina iseq 100": "Illumina iSeq 100",
    "illumina miniseq": "Illumina MiniSeq",
    "illumina miseq": "Illumina MiSeq",
    "illumina novaseq 6000": "Illumina NovaSeq 6000",
    "illumina novaseq x": "Illumina NovaSeq X",
    "ion genestudio s5": "Ion GeneStudio S5",
    "ion genestudio s5 plus": "Ion GeneStudio S5 Plus",
    "ion genestudio s5 prime": "Ion GeneStudio S5 Prime",
    "ion torrent genexus": "Ion Torrent Genexus",
    "ion torrent pgm": "Ion Torrent PGM",
    "ion torrent proton": "Ion Torrent Proton",
    "ion torrent s5": "Ion Torrent S5",
    "ion torrent s5 xl": "Ion Torrent S5 XL",
    "mgiseq-2000rs": "MGISEQ-2000RS",
    "minion": "MinION",
    "nextseq 1000": "NextSeq 1000",
    "nextseq 2000": "NextSeq 2000",
    "nextseq 500": "NextSeq 500",
    "nextseq 550": "NextSeq 550",
    "onso": "Onso",
    "pacbio rs": "PacBio RS",
    "pacbio rs ii": "PacBio RS II",
    "promethion": "PromethION",
    "revio": "Revio",
    "sentosa sq301": "Sentosa SQ301",
    "sequel": "Sequel",
    "sequel ii": "Sequel II",
    "sequel iie": "Sequel IIe",
    "tapestri": "Tapestri",
    "ug 100": "UG 100",
    "unspecified": "unspecified",
}

attribute_value_blacklist = [
    "na",
    "NA",
    "n/a",
    "N/A",
]

ena_header_mapping = ENA_HEADER_MAPPING


def replace_ena_header_attributes(sample_attributes):
    template_attribute_replaced = False
    for s in sample_attributes:
        if s["tag"] in ena_header_mapping:
            s["tag"] = ena_header_mapping[s["tag"]]
            template_attribute_replaced = True
    return template_attribute_replaced


def extract_sample(row, field_names, sample_id):
    for k in row.keys():
        row[k] = row[k].strip()

    sample_attributes = []
    for o in field_names:
        if o not in core_fields and len(row[o]) and row[o] not in attribute_value_blacklist:
            if o in unit_mapping_keys:
                sample_attributes.append(OrderedDict([("tag", o), ("value", row[o]), ("units", unit_mapping[o])]))
            else:
                if str(o).lower() == "environmental package":
                    sample_attributes.append(OrderedDict([("tag", o), ("value", row[o].lower())]))
                else:
                    sample_attributes.append(OrderedDict([("tag", o), ("value", row[o])]))

    try:
        taxon_id = int(row.get("taxon_id", "-1"))
    except ValueError as e:
        taxon_id = -1
    sample = {
        "sample_title": row.get("sample_title", ""),
        "sample_alias": sample_id,
        "sample_description": row.get("sample_description", "").replace('"', ""),
        "taxon_id": taxon_id,
    }
    template_attribute_replaced = False
    if len(sample_attributes):
        template_attribute_replaced = replace_ena_header_attributes(sample_attributes)
        sample["sample_attributes"] = sample_attributes

    return sample, template_attribute_replaced


def _blank_metadata_value(value):
    if value is None:
        return ""
    text = str(value).strip()
    if text in attribute_value_blacklist:
        return ""
    return text


def build_targeted_loci(gene_text, primers):
    """Map target gene and PCR primers the same way as Enalizer.translate_target_gene_insensitiv.

    Known gene: locus_name only. Unknown gene: locus_name "other" and the gene text as description.
    Primers fill description when it is still empty. Gene text and primers together use
    "{gene text}; {primers}".
    """
    from gfbio_submissions.brokerage.utils.ena import locus_attribute_mappings

    gene_text = _blank_metadata_value(gene_text)
    primers = _blank_metadata_value(primers)
    if not gene_text and not primers:
        return None

    locus = {}
    if gene_text:
        mapped_locus = locus_attribute_mappings.get(gene_text.lower())
        if mapped_locus is not None:
            locus["locus_name"] = mapped_locus
        else:
            locus["locus_name"] = "other"
            locus["description"] = gene_text
    if primers and "description" not in locus:
        locus.setdefault("locus_name", "other")
        locus["description"] = primers
    if gene_text and primers:
        locus["description"] = f"{gene_text}; {primers}"
    return locus


def extract_experiment(experiment_id, row, sample_id=None, sample_accession=None):
    try:
        design_description = int(row.get("design_description", "-1"))
    except ValueError as e:
        design_description = -1
    try:
        nominal_length = int(row.get("nominal_length", "-1"))
    except ValueError as e:
        nominal_length = -1
    fixed_platform_value = find_correct_platform_and_model(row.get("sequencing_platform", ""))
    experiment = {
        "experiment_alias": experiment_id,
        "platform": " ".join(fixed_platform_value.split()[1:]),
    }

    library_layout = row.get("library_layout", "").lower()

    if sample_accession:
        dpath.new(experiment, "design/sample_accession", sample_accession)
        targeted_loci = build_targeted_loci(row.get("target gene"), row.get("pcr primers"))
        if targeted_loci:
            dpath.new(experiment, "design/targeted_loci", targeted_loci)
    elif sample_id:
        dpath.new(experiment, "design/sample_descriptor", sample_id)
    dpath.new(
        experiment,
        "design/library_descriptor/library_strategy",
        library_strategy_mappings.get(row.get("library_strategy", "").lower(), ""),
    )
    # For sake of simplicity library_source is converted to upper case since
    # all values in schema are uppercase
    dpath.new(
        experiment,
        "design/library_descriptor/library_source",
        row.get("library_source", "").upper(),
    )
    dpath.new(
        experiment,
        "design/library_descriptor/library_selection",
        library_selection_mappings.get(row.get("library_selection", "").lower(), ""),
    )
    dpath.new(
        experiment,
        "design/library_descriptor/library_layout/layout_type",
        library_layout,
    )

    dpath.new(
        experiment,
        "files/forward_read_file_name",
        row.get("forward_read_file_name", ""),
    )
    dpath.new(
        experiment,
        "files/forward_read_file_checksum",
        row.get("forward_read_file_checksum", ""),
    )

    # TODO: with single layout, only forward_read_file attribute are considered
    #   is it ok to use such a file name for a single ?
    if library_layout != "single":
        dpath.new(
            experiment,
            "files/reverse_read_file_name",
            row.get("reverse_read_file_name", ""),
        )
        dpath.new(
            experiment,
            "files/reverse_read_file_checksum",
            row.get("reverse_read_file_checksum", ""),
        )

    if len(row.get("design_description", "").strip()):
        dpath.new(experiment, "design/design_description", design_description)
    if library_layout == "paired":
        dpath.new(
            experiment,
            "design/library_descriptor/library_layout/nominal_length",
            nominal_length,
        )
    return experiment


# TODO: maybe csv is in a file like implemented or comes as text/string
def parse_molecular_csv(csv_file, submission):
    csv_reader, _csv_format = open_csv_reader(
        csv_file,
        quoting=csv.QUOTE_ALL,
        quotechar='"',
        skipinitialspace=True,
        restkey="extra_columns_found",
        restval="extra_value_found",
    )
    molecular_requirements = {
        # 'study_type': 'Other',
        "samples": [],
        "experiments": [],
    }
    template_attributes_replaced = False
    try:
        field_names = csv_reader.fieldnames
        print("parse_molecular_csv: fieldnames: ", field_names)
        for i in range(0, len(field_names)):
            field_names[i] = field_names[i].strip().lower()

    except _csv.Error as e:
        return molecular_requirements
    short_id = ShortId()
    sample_titles = []
    sample_ids = []
    rows = []
    for row in csv_reader:
        for key, value in row.items():
            if isinstance(value, str):
                row[key] = value.strip()
        rows.append(row)

    titles_with_accession = set()
    for row in rows:
        title = row.get("sample_title") or ""
        if title and sample_accession_value(row.get("sample_accession")):
            titles_with_accession.add(title)

    for row in rows:
        # Rows with neither a title nor an accession are ignored.
        if not row_has_sample_title_or_set_accession(row):
            continue
        title = row.get("sample_title") or ""
        accession = sample_accession_value(row.get("sample_accession"))
        experiment_id = short_id.generate()
        if accession:
            experiment = extract_experiment(experiment_id, row, sample_accession=accession)
        elif title in titles_with_accession:
            # Another row of this title has an accession. Do not create a sample and do not
            # copy that accession onto this row.
            experiment = extract_experiment(experiment_id, row)
        elif title not in sample_titles:
            sample_titles.append(title)
            sample_id = short_id.generate()
            sample_ids.append(sample_id)
            sample, template_attributes_replaced = extract_sample(row, field_names, sample_id)
            molecular_requirements["samples"].append(sample)
            experiment = extract_experiment(experiment_id, row, sample_id)
        else:
            experiment = extract_experiment(experiment_id, row, sample_ids[sample_titles.index(title)])

        molecular_requirements["experiments"].append(experiment)
    if template_attributes_replaced:
        from ..tasks.jira_tasks.add_general_comment_to_issue import add_general_comment_to_issue_task
        add_general_comment_to_issue_task.apply_async(
            kwargs={
                "submission_id": f"{submission.id}",
                "comment": "ENA specific headers int the csv file have been replaced. "
                           "Please check the template that was used",
                "is_internal": True
            },
            countdown=SUBMISSION_UPLOAD_RETRY_DELAY,
        )
    return molecular_requirements


def parse_molecular_csv_with_encoding_detection(path, submission):
    encoding = sniff_encoding(path)
    try:
        with open(path, "r", encoding=encoding, errors="strict") as csv_file:
            return parse_molecular_csv(csv_file, submission)
    except (UnicodeDecodeError, LookupError) as e:
        # The file cannot be decoded as text with the detected encoding. Do not
        # silently mangle the bytes (the original DASS-3527 bug); return empty
        # requirements. The user-facing error is raised by the metadata
        # validation report (see validate_character_encoding_task).
        logger.warning(
            "parse_molecular_csv_with_encoding_detection: could not decode '%s' "
            "as '%s': %s",
            path, encoding, e,
        )
        return {"samples": [], "experiments": []}


def check_submittable_taxon_id(submission):
    """Check if the data in the submission meta file is submittable

    Args:
        submission: The submission object

    Returns:
        status: True if the data is submittable, False otherwise
        messages: A list of error messages
        check_performed: True if the check was performed, False otherwise
    """
    logger.info(
        msg="check_submittable_taxon_id | "
            "process submission={0} | target={1} | release={2}"
            "".format(submission.broker_submission_id, submission.target, submission.release)
    )
    file_opener = create_submission_file_opener(submission)
    submittable_data_handler_class = SubmittableTaxIdHandler if submission.target == ENA else (SubmittableScientificNameHandler if submission.target == ATAX else SubmittableDataHandler)
    submittable_data_handler = submittable_data_handler_class(file_opener)

    status = submittable_data_handler.run_taxons_are_submittable_check(submission)
    return status, submittable_data_handler.messages, True

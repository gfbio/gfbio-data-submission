
import csv

import logging
import os
from collections import OrderedDict

import dpath.util as dpath
from django.utils.encoding import smart_str
from shortid import ShortId

import xml.etree.ElementTree as ET
from xml.etree.ElementTree import Element, ElementTree
from xml.dom import minidom
import xmlschema

from lxml import etree


logger = logging.getLogger(__name__)

specimen_core_fields = [
    'specimen_identifier',
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

attribute_value_blacklist = [
    'na', 'NA', 'n/a', 'N/A',
]

def add_data_set( parent, ns):
    from lxml import etree
    dataset = etree.SubElement(parent, ns + "DataSet")
    return dataset

def add_technical_contacts(parent, ns, user):
    from lxml import etree

    contacts = etree.SubElement(parent, ns + "TechnicalContacts")
    contact = etree.SubElement(contacts, ns + "TechnicalContact")
    name = etree.SubElement(contact, ns + "Name")
    name.text  = user.email

def add_content_contacts(parent, ns, user):
    from lxml import etree

    contacts = etree.SubElement(parent, ns + "ContentContacts")
    contact = etree.SubElement(contacts, ns + "ContentContact")
    name = etree.SubElement(contact, ns + "Name")
    name.text  = user.username

def add_meta_data(parent, ns, user, created):
    from lxml import etree

    metadata = etree.SubElement(parent, ns + "Metadata")
    description = etree.SubElement(metadata, ns + "Description")
    representation = etree.SubElement(description, ns + "Representation", language="EN")
    title = etree.SubElement(representation, ns + "Title")
    title.text = 'TaxonOmics - New approaches to discovering and naming biodiversity'
    uri = etree.SubElement(representation, ns + "URI")
    uri.text = 'https://www.taxon-omics.com/projects'
    revisiondata = etree.SubElement(metadata, ns + "RevisionData")
    creators = etree.SubElement(revisiondata, ns + "Creators")
    creators.text = user.username
    datemodified = etree.SubElement(revisiondata, ns + "DateModified")
    datemodified.text = date_time = created.strftime("%Y-%m-%dT%H:%M:%S")

def add_units(parent, ns):
    from lxml import etree

    units = etree.SubElement(parent, ns + "Units")
    return units

def add_unit( parent, ns):
    from lxml import etree

    unit = etree.SubElement(parent, ns + "Unit")
    return unit


def map_fields(csv_dict, abcd_dict, result_dict=None):
    result_dict = result_dict or {}
    csv_dict = {k.strip().lower(): v for k, v in csv_dict.items()}
    for k, v in csv_dict.items():
        if isinstance(v, dict):
            v = map_fields(v, abcd_dict)
        if k in abcd_dict.keys():
            k = str(abcd_dict[k])
        result_dict[k] = v
    return result_dict


# the csv file is read line by line,
# and the entirety of the rows is added as a key-value list
# to the submission.data requirements as a new entry.
def parse_taxonomic_csv_new(submission, csv_file):
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

    csv_data = []
    csv_data_p = list(csv_reader)
    for rowdict in csv_data_p:
        row = map_fields(rowdict, abcd_mapping)
        csv_data.append(row)

    #  determine the path for the ABCD validation schema file
    path_xsd = os.path.join(
        os.getcwd(),
        'gfbio_submissions/brokerage/schemas/ABCD_2.06.XSD')

    # Load and compile XSD schema
    schema = xmlschema.XMLSchema(path_xsd)

    # Create XML root element
    # root = Element(schema.root.name, attrib=schema.root.attributes)
    # creating XML structure using the lxml  etree module:
    # namespaces:
    xsi = "http://www.w3.org/2001/XMLSchema-instance"
    abcd = "http://www.tdwg.org/schemas/abcd/2.06"
    schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"

    # goal:
    # abcd: DataSets
    # xmlns: xsi = "http://www.w3.org/2001/XMLSchema-instance"
    # xmlns: abcd = "http://www.tdwg.org/schemas/abcd/2.06"
    # xsi: schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"

    ns = {"xsi": xsi, "abcd": abcd}  # {"schemaLocation": schemaLocation}
    abcdns = "{" + abcd + "}"
    root = etree.Element(abcdns+"DataSets", attrib={"{" + xsi + "}schemaLocation": schemaLocation}, nsmap=ns)
    #root = etree.Element("{" + abcd + "}DataSets", attrib={"{" + xsi + "}schemaLocation": schemaLocation}, nsmap=ns)

    # add root of the xml structure and add sub structures in the right order
    dataset = add_data_set(root, abcdns)

    add_technical_contacts(dataset, abcdns, submission.user)
    add_content_contacts(dataset, abcdns, submission.user)
    add_meta_data(dataset, abcdns, submission.user, submission.created)
    units = add_units(dataset, abcdns)

    # Iterate over CSV rows and create XML elements
    for row in csv_data:
        #element = Element(schema.root.name)
        element = root
        for path, value in schema.maps.elements.items():
            if path in row:
                xml_elements = root.findall(path)
                for xml_element in xml_elements:
                    child_element = etree.Element(value.name)
                    child_element.text = row[path]
                    xml_element.append(child_element)
        dataset.append(element)

    xml_file_name = os.path.basename(csv_file)
    xml_file_name = (os.path.splitext(xml_file_name))[0]
    xml_file_name = xml_file_name + '.xml'
    xml_file_name = ''.join(('xml_files/', xml_file_name))

    # Create XML tree and write to file
    tree = ElementTree(root)    #"output.xml"
    tree.write(xml_file_name, encoding="utf-8", xml_declaration=True)

    # Format the XML output
    xml_string = minidom.parseString(ET.tostring(root)).toprettyxml(indent="  ")
    with open(xml_file_name, "w") as file:    #output.xml
        file.write(xml_string)

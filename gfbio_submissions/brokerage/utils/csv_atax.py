
import csv

import logging
import os
import io
from collections import OrderedDict

import dpath.util as dpath
from django.utils.encoding import smart_str
from shortid import ShortId
from django.db import transaction
from gfbio_submissions.brokerage.models import AuditableTextData

import xml.etree.ElementTree as ET
from xml.etree.ElementTree import Element, SubElement

from xml.dom import minidom
import xmlschema


from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path

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

    dataset = SubElement(parent, ns + "DataSet")
    return dataset

def add_technical_contacts(parent, ns, user):

    contacts = SubElement(parent, ns + "TechnicalContacts")
    contact = SubElement(contacts, ns + "TechnicalContact")
    name = SubElement(contact, ns + "Name")
    name.text  = user.email

def add_content_contacts(parent, ns, user):

    contacts = SubElement(parent, ns + "ContentContacts")
    contact = SubElement(contacts, ns + "ContentContact")
    name = SubElement(contact, ns + "Name")
    name.text  = user.username

def add_meta_data(parent, ns, user, created):

    metadata = SubElement(parent, ns + "Metadata")
    description = SubElement(metadata, ns + "Description")
    representation = SubElement(description, ns + "Representation", language="EN")
    title = SubElement(representation, ns + "Title")
    title.text = 'TaxonOmics - New approaches to discovering and naming biodiversity'
    uri = SubElement(representation, ns + "URI")
    uri.text = 'https://www.taxon-omics.com/projects'
    revisiondata = SubElement(metadata, ns + "RevisionData")
    creators = SubElement(revisiondata, ns + "Creators")
    creators.text = user.username
    datemodified = SubElement(revisiondata, ns + "DateModified")
    datemodified.text = date_time = created.strftime("%Y-%m-%dT%H:%M:%S")

def add_units(parent, ns):

    units = SubElement(parent, ns + "Units")
    return units

def add_unit( parent, ns):

    unit = SubElement(parent, ns + "Unit")
    return unit

# the units (lines of the csv file) are added one by one to the xml construct
# to have faster access to the data content, the specimen_attributes are restructured from a list to a dictionary
# the lookup_list  is not used here, it contains the mapped specimen attributes in its order
def add_unit_data(parent, ns, unid, csvdict):

    # the mandatory and non mandatory csv fields from first Vences example, mapped to ABCD terms
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

    #abcd = "http://www.tdwg.org/schemas/abcd/2.06"
    # unit node is created via AddUnit( units)!
    # Following first nodes are necessary for abcd xml structure, here first with fictitious content:
    unitguid = SubElement(parent, ns + "UnitGUID")
    unitguid.text = 'Place here UnitGUID if there'
    sourceinstitutionid = SubElement(parent, ns + "SourceInstitutionID")
    sourceinstitutionid.text = 'Place here SourceInstitutionID'
    sourceid = SubElement(parent, ns + "SourceID")
    sourceid.text = unid[0:2]   #'Place here SourceID'

    # UnitID is given as first element:
    unitid = SubElement(parent, ns + "UnitID")
    unitid.text = unid

    # first structure: Identifications, with with non-mandatory and mandatory fields:
    identifications = SubElement(parent, ns + "Identifications")
    identification = SubElement(identifications, ns + "Identification")
    result = SubElement(identification, ns + "Result")
    taxonidentified = SubElement(result, ns + "TaxonIdentified")
    if csvdict.get('HigherClassification', None) or (csvdict.get('HigherTaxonName', None) and csvdict.get('HigherTaxonRank', None)):
        highertaxa = SubElement(taxonidentified, ns + "HigherTaxa")
        if csvdict.get('HigherTaxonName', None) and csvdict.get('HigherTaxonRank', None):
            highertaxon1 = SubElement(highertaxa, ns + "HigherTaxon")
            if csvdict.get('HigherTaxonName', None):
                highertaxonname = SubElement(highertaxon1, ns + "HigherTaxonName")
                highertaxonname.text = csvdict.get('HigherTaxonName')
            if csvdict.get('HigherTaxonRank', None):
                highertaxonrank = SubElement(highertaxon1, ns + "HigherTaxonRank")
                highertaxonrank.text = 'familia'   #csvdict.get('HigherTaxonRank') is not given correct
        if csvdict.get('HigherClassification', None):
            highertaxon2 = SubElement(highertaxa, ns + "HigherTaxon")
            highertaxonname = SubElement(highertaxon2, ns + "HigherTaxonName")
            highertaxonname.text = csvdict.get('HigherClassification')
            highertaxonrank = SubElement(highertaxon2, ns + "HigherTaxonRank")
            highertaxonrank.text = 'regnum'
    scientificname = SubElement(taxonidentified, ns + "ScientificName")
    fullscientificnamestring1 = SubElement(scientificname, ns + "FullScientificNameString")
    fullscientificnamestring1.text = csvdict.get('FullScientificNameString')  #csvdict['FullScientificNameString']   #'Place here FullScientificNameString'

    # structure: RecordBasis, with with mandatory fields:
    recordbasis = SubElement(parent, ns + "RecordBasis")
    recordbasis.text = csvdict.get('RecordBasis')   #csvdict['RecordBasis']   #''place here fixed vocabulary for RecordBasis ,PreservedSpecimen'

    # structure: SpecimenUnit, with with non-mandatory fields:
    if csvdict.get('PhysicalObjectID', None) or csvdict.get('TypifiedName', None) or csvdict.get('TypeStatus', None):
        specimenunit = SubElement(parent, ns + "SpecimenUnit")
        if csvdict.get('PhysicalObjectID', None):
            accessions = SubElement(specimenunit, ns + "Accessions")
            accessionnumber = SubElement(accessions, ns + "AccessionNumber")
            accessionnumber.text = csvdict.get('PhysicalObjectID')  # Phacidium congener Ces.
        if csvdict.get('TypifiedName', None) or csvdict.get('TypeStatus', None):
            nomenclaturaltypedesignations = SubElement(specimenunit, ns + "NomenclaturalTypeDesignations")
            nomenclaturaltypedesignation = SubElement(nomenclaturaltypedesignations, ns + "NomenclaturalTypeDesignation")
            if csvdict.get('TypifiedName', None):
                typifiedname = SubElement(nomenclaturaltypedesignation, ns + "TypifiedName")
                fullscientificnamestring2 = SubElement(typifiedname, ns + "FullScientificNameString")
                fullscientificnamestring2.text = csvdict.get('TypifiedName')  #Phacidium congener Ces.
            if csvdict.get('TypeStatus', None):
                typestatus = SubElement(nomenclaturaltypedesignation, ns + "TypeStatus")
                typestatus.text = csvdict.get('TypeStatus')

    # structure: Gathering, with with non-mandatory and mandatory fields:
    gathering = SubElement(parent, ns + "Gathering")
    datetime = SubElement(gathering, ns + "DateTime")
    isodatetimebegin = SubElement(datetime, ns + "ISODateTimeBegin")
    isodatetimebegin.text = csvdict.get('IsoDateTimeBegin')
    if csvdict.get('AgentText',None):
        agents = SubElement(gathering, ns + "Agents")
        gatheringagentstext = SubElement(agents, ns + "GatheringAgentsText")
        gatheringagentstext.text = csvdict.get('AgentText')
    localitytext = SubElement(gathering, ns + "LocalityText")
    localitytext.set('language', ''"EN"'')
    localitytext.text = csvdict.get('LocalityText')
    country = SubElement(gathering, ns + "Country")
    name = SubElement(country, ns + "Name")
    name.set('language', ''"EN"'')
    name.text = csvdict.get('Country')
    if csvdict.get('LongitudeDecimal') and csvdict.get('LatitudeDecimal'):
        sitecoordinatesets = SubElement(gathering, ns + "SiteCoordinateSets")
        sitecoordinates = SubElement(sitecoordinatesets, ns + "SiteCoordinates")
        coordinateslatlong = SubElement(sitecoordinates, ns + "CoordinatesLatLong")
        if csvdict.get('LongitudeDecimal'):
            longitudedecimal = SubElement(coordinateslatlong, ns + "LongitudeDecimal")
            longitudedecimal.text = csvdict.get('LongitudeDecimal')
        if csvdict.get('LatitudeDecimal'):
            latitudedecimal = SubElement(coordinateslatlong, ns + "LatitudeDecimal")
            latitudedecimal.text = csvdict.get('LatitudeDecimal')

    # structure: CollectorsFieldNumber, with with non-mandatory fields:
    if csvdict.get('CollectorFieldNumber',None):
        collectorsfieldnumber = SubElement(parent, ns + "CollectorsFieldNumber")
        collectorsfieldnumber.text =csvdict.get('CollectorFieldNumber')

    # structure: Sex, with with non-mandatory fields:
    if csvdict.get('Sex',None):
        sex = SubElement(parent, ns + "Sex")
        sex.text = csvdict.get('Sex')[:1]


def map_fields(csv_dict, abcd_dict, result_dict=None):
    import datetime
    date_string = str()
    year = 1
    month = 1
    day = 1

    time_keys1 = ['date: day']
    time_keys2 = ['date: month']
    time_keys3 = ['date: year']
    time_mapped = ['IsoDateTimeBegin']

    result_dict = result_dict or {}
    csv_dict = {k.strip().lower(): v for k, v in csv_dict.items()}
    for k, v in csv_dict.items():
        if isinstance(v, dict):
            v = map_fields(v, abcd_dict)
        if k in abcd_dict.keys():
            if k in time_keys3:
                year = str(v)
                dtobj = datetime.datetime(int(year),int(month),int(day))
                dtstr = dtobj.strftime("%Y-%m-%d")  # should be a string
                result_dict["IsoDateTimeBegin"] = dtstr
            elif k in time_keys2:
                month = str(v)
            elif k in time_keys1:
                day = str(v)
            k = str(abcd_dict[k])  # key is changed
        if k not in time_mapped:
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
    # read the csv data from file:
    csv_reader = csv.DictReader(
        csv_file,
        quoting=csv.QUOTE_ALL,
        delimiter=delimiter,
        quotechar='"',
        skipinitialspace=True,
        restkey='extra_columns_found',
        restval='extra_value_found',
    )

    # map the csv fields to abcd terms:
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

    ns = {"xsi": xsi, "abcd": abcd}  # namespaces
    ET.register_namespace("abcd","http://www.tdwg.org/schemas/abcd/2.06")
    abcdns = "{" + abcd + "}"   # namespace abcd for creating Elements

    root = Element("{http://www.tdwg.org/schemas/abcd/2.06}DataSets", attrib={"{" + xsi + "}schemaLocation": schemaLocation})
    #root = Element(abcdns + "DataSets", attrib={"{" + xsi + "}schemaLocation": schemaLocation}, nsmap="abcd")

    # create xml structure according abcd rules:
    # add root of the xml structure and add sub structures in the right order
    dataset = add_data_set(root, abcdns)

    # possible, to run all  this in one function:
    add_technical_contacts(dataset, abcdns, submission.user)
    add_content_contacts(dataset, abcdns, submission.user)
    add_meta_data(dataset, abcdns, submission.user, submission.created)
    units = add_units(dataset, abcdns)

    # explicit procedure 'add_unit_data' to fill data records:
    length = len(csv_data)
    for i in range(length):
        unid = csv_data[i]['UnitID']
        unit = add_unit(units, abcdns)
        add_unit_data(unit, abcdns, unid, csv_data[i])

   # write into test directory, remove later on:
    try:
        xml_file_name = os.path.basename(csv_file.name)
        xml_file_name = (os.path.splitext(xml_file_name))[0]
        xml_file_name = xml_file_name + '.xml'
        xml_file_name = ''.join(('xml_files/', xml_file_name))

        # for test purposes only, remove it later!
        with open(os.path.join(_get_test_data_dir_path(), xml_file_name), 'wb') as f:
            tree = ET.ElementTree(root)
            tree.write(f, encoding="utf-8", xml_declaration=True)
            f.close()

        with io.BytesIO() as fbytes:
            tree = ET.ElementTree(root)
            tree.write(fbytes, encoding="utf-8", xml_declaration=True)
            return fbytes


    except:
        return None
    # end explicit procedure


    # new procedure using xpath to fill data records, does not work yet:
    # Iterate over csv rows and create XML elements:

    #for row in csv_data:
        ##element = Element(schema.root.name)
        #element = root
        #for path, value in schema.maps.elements.items():
            #if path in row:
                #xml_elements = root.findall(path)
                #for xml_element in xml_elements:
                    #child_element = etree.Element(value.name)
                    #child_element.text = row[path]
                    #xml_element.append(child_element)
        #dataset.append(element)

    # for test only: create the xml as file in xml test data, if csv_file is in test_data/csv/
    #xml_file_name = os.path.basename(csv_file)
    #xml_file_name = (os.path.splitext(xml_file_name))[0]
    #xml_file_name = xml_file_name + '.xml'
    #xml_file_name = ''.join(('xml_files/', xml_file_name))

    # Create XML tree and write to file
    # tree = ElementTree(root)    #"output.xml"
    #tree.write(xml_file_name, encoding="utf-8", xml_declaration=True)

    # Format the XML output
    #xml_string = minidom.parseString(ET.tostring(root)).toprettyxml(indent="  ")
    #with open(xml_file_name, "w") as file:    #output.xml
    #   file.write(xml_string)


def store_xml_data_as_auditable_text_data(submission, file_name, data):

    filename = file_name
    filecontent = data
    logger.info(
    msg='store_xml_data_as_auditable_text_data create '
        'AuditableTextData | submission_pk={0} filename={1}'
        ''.format(submission.pk, filename)
    )
    with transaction.atomic():
        xmlbytes = AuditableTextData.objects.create(
            name=filename,
            submission=submission,
            text_data=filecontent
        )
        #following gives errors yet, filename has no correct Char field format
        xmlbytes.save()
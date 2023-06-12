
import logging

from django.db import transaction
from gfbio_submissions.brokerage.models import AuditableTextData

from xml.etree.ElementTree import Element, SubElement


logger = logging.getLogger(__name__)

specimen_core_fields = [
    'specimen_identifier',
]

# methods to add necessary abcd nodes:
def add_unit( parent, ns):

    unit = SubElement(parent, ns + "Unit")
    return unit

def add_technical_contacts(parent, ns, user):

    contacts = SubElement(parent, ns + "TechnicalContacts")
    contact = SubElement(contacts, ns + "TechnicalContact")
    name = SubElement(contact, ns + "Name")
    name.text = user.email

def add_content_contacts(parent, ns, user):

    contacts = SubElement(parent, ns + "ContentContacts")
    contact = SubElement(contacts, ns + "ContentContact")
    name = SubElement(contact, ns + "Name")
    name.text = user.username

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

def add_unit(parent, ns):

    unit = SubElement(parent, ns + "Unit")
    return unit

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


def add_data_set(parent, ns):
    dataset = SubElement(parent, ns + "DataSet")
    return dataset

def add_necc_nodes(parent, ns, unid):
    # Following first nodes are necessary for abcd xml structure, here first with fictitious content:
    unitguid = SubElement(parent, ns + "UnitGUID")
    unitguid.text = 'Place here UnitGUID if there'
    sourceinstitutionid = SubElement(parent, ns + "SourceInstitutionID")
    sourceinstitutionid.text = 'Place here SourceInstitutionID'
    sourceid = SubElement(parent, ns + "SourceID")
    sourceid.text = unid[0:2]  # 'Place here SourceID'

def add_unit_id(parent, ns, unid):
    # UnitID is given as first element:
    unitid = SubElement(parent, ns + "UnitID")
    unitid.text = unid

def add_identifications(parent, ns, unid, csvdict):
    # first structure: Identifications, with with non-mandatory and mandatory fields:
    identifications = SubElement(parent, ns + "Identifications")
    identification = SubElement(identifications, ns + "Identification")
    result = SubElement(identification, ns + "Result")
    taxonidentified = SubElement(result, ns + "TaxonIdentified")
    if csvdict.get('HigherClassification', None) or (
            csvdict.get('HigherTaxonName', None) and csvdict.get('HigherTaxonRank', None)):
        highertaxa = SubElement(taxonidentified, ns + "HigherTaxa")
        if csvdict.get('HigherTaxonName', None) and csvdict.get('HigherTaxonRank', None):
            highertaxon1 = SubElement(highertaxa, ns + "HigherTaxon")
            if csvdict.get('HigherTaxonName', None):
                highertaxonname = SubElement(highertaxon1, ns + "HigherTaxonName")
                highertaxonname.text = csvdict.get('HigherTaxonName')
            if csvdict.get('HigherTaxonRank', None):
                highertaxonrank = SubElement(highertaxon1, ns + "HigherTaxonRank")
                highertaxonrank.text = 'familia'  # csvdict.get('HigherTaxonRank') is not given correct
        if csvdict.get('HigherClassification', None):
            highertaxon2 = SubElement(highertaxa, ns + "HigherTaxon")
            highertaxonname = SubElement(highertaxon2, ns + "HigherTaxonName")
            highertaxonname.text = csvdict.get('HigherClassification')
            highertaxonrank = SubElement(highertaxon2, ns + "HigherTaxonRank")
            highertaxonrank.text = 'regnum'
    scientificname = SubElement(taxonidentified, ns + "ScientificName")
    fullscientificnamestring1 = SubElement(scientificname, ns + "FullScientificNameString")
    fullscientificnamestring1.text = csvdict.get(
        'FullScientificNameString')  # csvdict['FullScientificNameString']   #'Place here FullScientificNameString'

def add_record_basis(parent, ns, csvdict):# structure: RecordBasis, with with mandatory fields:
    recordbasis = SubElement(parent, ns + "RecordBasis")
    recordbasis.text = csvdict.get('RecordBasis')   #csvdict['RecordBasis']   #''place here fixed vocabulary for RecordBasis ,PreservedSpecimen'

def add_specimen_unit(parent, ns, csvdict):
    # structure: SpecimenUnit, with with non-mandatory fields:
    if csvdict.get('PhysicalObjectID', None) or csvdict.get('TypifiedName', None) or csvdict.get('TypeStatus', None):
        specimenunit = SubElement(parent, ns + "SpecimenUnit")
        if csvdict.get('PhysicalObjectID', None):
            accessions = SubElement(specimenunit, ns + "Accessions")
            accessionnumber = SubElement(accessions, ns + "AccessionNumber")
            accessionnumber.text = csvdict.get('PhysicalObjectID')  # Phacidium congener Ces.
        if csvdict.get('TypifiedName', None) or csvdict.get('TypeStatus', None):
            nomenclaturaltypedesignations = SubElement(specimenunit, ns + "NomenclaturalTypeDesignations")
            nomenclaturaltypedesignation = SubElement(nomenclaturaltypedesignations,
                                                      ns + "NomenclaturalTypeDesignation")
            if csvdict.get('TypifiedName', None):
                typifiedname = SubElement(nomenclaturaltypedesignation, ns + "TypifiedName")
                fullscientificnamestring2 = SubElement(typifiedname, ns + "FullScientificNameString")
                fullscientificnamestring2.text = csvdict.get('TypifiedName')  # Phacidium congener Ces.
            if csvdict.get('TypeStatus', None):
                typestatus = SubElement(nomenclaturaltypedesignation, ns + "TypeStatus")
                typestatus.text = csvdict.get('TypeStatus')

def add_gathering(parent, ns, csvdict):
    # structure: Gathering, with with non-mandatory and mandatory fields:
    gathering = SubElement(parent, ns + "Gathering")
    datetime = SubElement(gathering, ns + "DateTime")
    isodatetimebegin = SubElement(datetime, ns + "ISODateTimeBegin")
    isodatetimebegin.text = csvdict.get('IsoDateTimeBegin')
    if csvdict.get('AgentText', None):
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

def add_collectors_field_number(parent, ns, csvdict):
    # structure: CollectorsFieldNumber, with with non-mandatory fields:
    if csvdict.get('CollectorFieldNumber', None):
        collectorsfieldnumber = SubElement(parent, ns + "CollectorsFieldNumber")
        collectorsfieldnumber.text = csvdict.get('CollectorFieldNumber')

def add_sex(parent, ns, csvdict):
    # structure: Sex, with with non-mandatory fields:
    if csvdict.get('Sex', None):
        sex = SubElement(parent, ns + "Sex")
        sex.text = csvdict.get('Sex')[:1]


# the units (lines of the csv file) are added one by one to the xml construct
# to have faster access to the data content, the specimen_attributes are restructured from a list to a dictionary
# the lookup_list  is not used here, it contains the mapped specimen attributes in its order
def add_unit_data(parent, ns, unid, csvdict):

    add_necc_nodes(parent, ns, unid)
    add_unit_id(parent, ns, unid)
    add_identifications(parent, ns, unid, csvdict)
    add_record_basis(parent, ns, csvdict)  # structure: RecordBasis, with with mandatory fields:
    add_specimen_unit(parent, ns, csvdict)
    add_gathering(parent, ns, csvdict)
    add_collectors_field_number(parent, ns, csvdict)
    add_sex(parent, ns, csvdict)


def store_atax_data_as_auditable_text_data(submission, file_name, data):

    filename = file_name
    filecontent = data
    logger.info(
    msg='store_atax_data_as_auditable_text_data create '
        'AuditableTextData | submission_pk={0} filename={1}'
        ''.format(submission.pk, filename)
    )
    with transaction.atomic():
        submission.auditabletextdata_set.all().delete()
        textbytes = AuditableTextData.objects.create(
            name=filename,
            submission=submission,
            text_data=filecontent
        )

        textbytes.save()
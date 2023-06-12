import csv
import os
import datetime
import logging
import io


from django.utils.encoding import smart_str

import xml.etree.ElementTree as ET
from xml.etree.ElementTree import Element

import xmlschema

from gfbio_submissions.brokerage.utils.csv_atax import \
    add_unit_data, add_data_set, add_technical_contacts, \
    add_content_contacts, add_meta_data, add_units, add_unit

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path  #remove later

logger = logging.getLogger(__name__)

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

#  ATAXER  base xml for atax -------------------------------------------------------
class Ataxer(object):

    #constructor
    def __init__(self, submission):

        self.atax_submission = submission

        #  determine the path for the ABCD validation schema file
        self.path_xsd = os.path.join(
            os.getcwd(),
            'gfbio_submissions/brokerage/schemas/ABCD_2.06.XSD')

        # Load and compile XSD schema
        self.schema = xmlschema.XMLSchema(self.path_xsd)

        # namespaces:
        self.xsi = "http://www.w3.org/2001/XMLSchema-instance"
        self.abcd = "http://www.tdwg.org/schemas/abcd/2.06"
        self.schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"

        self.ns = {"xsi": self.xsi, "abcd": self.abcd}  # namespaces
        ET.register_namespace("abcd", "http://www.tdwg.org/schemas/abcd/2.06")
        self.abcdns = "{" + self.abcd + "}"  # namespace abcd for creating Elements

        # Create XML root element:
        # root = Element(schema.root.name, attrib=schema.root.attributes)

        self.root = Element("{http://www.tdwg.org/schemas/abcd/2.06}DataSets",
                       attrib={"{" + self.xsi + "}schemaLocation": self.schemaLocation})



    def map_fields(self, csv_dict, abcd_dict, result_dict=None):
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
                v = self.map_fields(v, abcd_dict)
            if k in abcd_dict.keys():
                if k in time_keys3:
                    year = str(v)
                    dtobj = datetime.datetime(int(year), int(month), int(day))
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

    def create_atax_submission_base_xml(self):
        logger.info(
            msg='Ataxer create_submission_xml. currentdate={}'.format(
                datetime.date.today().isoformat()))

        # root = Element(abcdns + "DataSets", attrib={"{" + xsi + "}schemaLocation": schemaLocation}, nsmap="abcd")

        # create xml structure according abcd rules:
        # add root of the xml structure and add sub structures in the right order
        dataset = add_data_set(self.root, self.abcdns)

        # add necessary abcd nodes:
        add_technical_contacts(dataset, self.abcdns, self.atax_submission.user)
        add_content_contacts(dataset, self.abcdns, self.atax_submission.user)
        add_meta_data(dataset, self.abcdns, self.atax_submission.user, self.atax_submission.created)
        units = add_units(dataset, self.abcdns)

        return self.root, units


    def read_and_map_csv(self,  csv_file):
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
            row = self.map_fields(rowdict, abcd_mapping)
            csv_data.append(row)

        return csv_data

    def convert_csv_data_to_xml(self, csv_data, units):
        # explicit procedure 'add_unit_data' to fill data records:
        length = len(csv_data)
        for i in range(length):
            unid = csv_data[i]['UnitID']
            unit = add_unit(units, self.abcdns)
            add_unit_data(unit, self.abcdns, unid, csv_data[i])

    def finish_atax_xml(self, root):
        #test only remove:
        try:
            # write into test directory, remove later on:
            xml_file_name = "specimen_test_Platypelis.csv"  #os.path.basename(csv_file.name)
            xml_file_name = (os.path.splitext(xml_file_name))[0]
            xml_file_name = xml_file_name + '.xml'
            xml_file_name = ''.join(('xml_files/', xml_file_name))

            # for test purposes only, remove it later!
            with open(os.path.join(_get_test_data_dir_path(), xml_file_name), 'wb') as f:
                tree = ET.ElementTree(root)
                tree.write(f, encoding="utf-8", xml_declaration=True)
                f.close()
        except:
            pass
            # return None
        # end test only remove

        try:
            with io.BytesIO() as fbytes:
                tree = ET.ElementTree(root)
                tree.write(fbytes, encoding="utf-8", xml_declaration=True)
                # return fbytes

            return ET.tostring(root, encoding='utf8', method='xml')
        except:
            return None


    # End ATAXER


def create_ataxer(submission):
    ataxer = Ataxer(submission=submission)
    return ataxer


def parse_taxonomic_csv_short(submission, csv_file):

    ataxer = create_ataxer(submission)

    root, units = ataxer.create_atax_submission_base_xml()

    # returns a list
    csv_data = ataxer.read_and_map_csv(csv_file)

    ataxer.convert_csv_data_to_xml(csv_data, units)

    xml_string = ataxer.finish_atax_xml(root)

    return xml_string

